namespace InteractHub.API.Services.Implementations;

using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;

public class PostsService : IPostsService
{
    private readonly AppDbContext _context;
    private readonly IBlobStorageService _blobStorage;
    private readonly INotificationsService _notifications;

    public PostsService(
        AppDbContext context,
        IBlobStorageService blobStorage,
        INotificationsService notifications)
    {
        _context       = context;
        _blobStorage   = blobStorage;
        _notifications = notifications;
    }

    public async Task<List<PostResponseDto>> GetFeedAsync(string userId, int page, int pageSize)
{
    var friendIds = await _context.Friendships
        .Where(f => (f.SenderId == userId || f.ReceiverId == userId)
                 && f.Status == FriendshipStatus.Accepted)
        .Select(f => f.SenderId == userId ? f.ReceiverId : f.SenderId)
        .ToListAsync();

    friendIds.Add(userId);

    var posts = await _context.Posts
        .Where(p => friendIds.Contains(p.UserId) && !p.IsDeleted)
        .OrderByDescending(p => p.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Include(p => p.User)
        .Include(p => p.Likes)
        .Include(p => p.Comments.Where(c => !c.IsDeleted)) // ← add this
        .ToListAsync();

    return posts.Select(p => MapToDto(p, userId)).ToList();
}

    public async Task<PostResponseDto?> GetByIdAsync(int postId, string userId)
{
    var post = await _context.Posts
        .Include(p => p.User)
        .Include(p => p.Likes)
        .Include(p => p.Comments.Where(c => !c.IsDeleted)) // ← add this
        .FirstOrDefaultAsync(p => p.Id == postId && !p.IsDeleted);

    return post == null ? null : MapToDto(post, userId);
}

    public async Task<PostResponseDto> CreateAsync(CreatePostRequestDto dto, string userId)
    {
        string? imageUrl = null;
        if (dto.Image != null)
            imageUrl = await _blobStorage.UploadAsync(dto.Image, "posts");

        var post = new Post
        {
            Content   = dto.Content,
            ImageUrl  = imageUrl,
            UserId    = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Posts.AddAsync(post);
        await _context.SaveChangesAsync();

        // Reload with user info
        await _context.Entry(post).Reference(p => p.User).LoadAsync();
        return MapToDto(post, userId);
    }

    public async Task<PostResponseDto?> UpdateAsync(int postId, UpdatePostRequestDto dto, string userId)
    {
        var post = await _context.Posts
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == postId && !p.IsDeleted);

        if (post == null || post.UserId != userId) return null;

        post.Content   = dto.Content;
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(post, userId);
    }

    public async Task<bool> DeleteAsync(int postId, string userId)
    {
        var post = await _context.Posts
            .FirstOrDefaultAsync(p => p.Id == postId && !p.IsDeleted);

        if (post == null || post.UserId != userId) return false;

        // Soft delete — keeps data in DB but hides it
        post.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleLikeAsync(int postId, string userId)
    {
        var existing = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (existing != null)
        {
            // Unlike
            _context.Likes.Remove(existing);
            await _context.SaveChangesAsync();
            return false;
        }

        // Like
        await _context.Likes.AddAsync(new Like
        {
            PostId    = postId,
            UserId    = userId,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        // Notify post owner (but not if you liked your own post)
        var post = await _context.Posts.FindAsync(postId);
        if (post != null && post.UserId != userId)
            await _notifications.CreateAsync(
                post.UserId,
                NotificationType.Like,
                "Someone liked your post",
                postId);

        return true;
    }

    public async Task<List<CommentResponseDto>> GetCommentsAsync(int postId)
    {
        return await _context.Comments
            .Where(c => c.PostId == postId && !c.IsDeleted)
            .OrderBy(c => c.CreatedAt)
            .Include(c => c.User)
            .Select(c => new CommentResponseDto
            {
                Id        = c.Id,
                Content   = c.Content,
                CreatedAt = c.CreatedAt,
                UserId    = c.UserId,
                Username  = c.User.UserName!,
                AvatarUrl = c.User.AvatarUrl
            })
            .ToListAsync();
    }

    public async Task<CommentResponseDto> AddCommentAsync(
        int postId, CreateCommentRequestDto dto, string userId)
    {
        var comment = new Comment
        {
            Content   = dto.Content,
            PostId    = postId,
            UserId    = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Comments.AddAsync(comment);
        await _context.SaveChangesAsync();
        await _context.Entry(comment).Reference(c => c.User).LoadAsync();

        // Notify post owner
        var post = await _context.Posts.FindAsync(postId);
        if (post != null && post.UserId != userId)
            await _notifications.CreateAsync(
                post.UserId,
                NotificationType.Comment,
                "Someone commented on your post",
                postId);

        return new CommentResponseDto
        {
            Id        = comment.Id,
            Content   = comment.Content,
            CreatedAt = comment.CreatedAt,
            UserId    = comment.UserId,
            Username  = comment.User.UserName!,
            AvatarUrl = comment.User.AvatarUrl
        };
    }

    // ── Private mapper ────────────────────────────────────────────────
    private static PostResponseDto MapToDto(Post p, string currentUserId) => new()
    {
        Id                   = p.Id,
        Content              = p.Content,
        ImageUrl             = p.ImageUrl,
        CreatedAt            = p.CreatedAt,
        UserId               = p.UserId,
        Username             = p.User?.UserName ?? "",
        DisplayName          = p.User?.DisplayName ?? "",
        AvatarUrl            = p.User?.AvatarUrl,
        LikeCount            = p.Likes?.Count ?? 0,
        CommentCount         = p.Comments?.Count ?? 0,
        IsLikedByCurrentUser = p.Likes?.Any(l => l.UserId == currentUserId) ?? false
    };

    public async Task<bool> DeleteCommentAsync(int commentId, string userId)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId && !c.IsDeleted);

        if (comment == null || comment.UserId != userId) return false;

        comment.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReportPostAsync(int postId, ReportPostDto dto, string userId)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null) return false;

        if (!Enum.TryParse<ReportReason>(dto.Reason, true, out var reason))
            reason = ReportReason.Other;

        await _context.PostReports.AddAsync(new PostReport
        {
            PostId      = postId,
            UserId      = userId,
            Reason      = reason,
            Description = dto.Description,
            CreatedAt   = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<string>> GetTrendingHashtagsAsync()
    {
        return await _context.PostHashtags
            .GroupBy(ph => ph.Hashtag.Tag)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => g.Key)
            .ToListAsync();
    }

    public async Task<List<PostResponseDto>> GetUserPostsAsync(
        string userId, string currentUserId, int page, int pageSize)
    {
        var posts = await _context.Posts
            .Where(p => p.UserId == userId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Comments.Where(c => !c.IsDeleted))
            .ToListAsync();

        return posts.Select(p => MapToDto(p, currentUserId)).ToList();
    }
}
