namespace InteractHub.API.Services.Implementations;

using InteractHub.API.Services.Interfaces;

public class StoriesService : IStoriesService
{
    private readonly AppDbContext _context;
    private readonly IBlobStorageService _blobStorage;

    public StoriesService(AppDbContext context, IBlobStorageService blobStorage)
    {
        _context     = context;
        _blobStorage = blobStorage;
    }

    public async Task<List<StoryResponseDto>> GetActiveStoriesAsync(string userId)
    {
        var friendIds = await _context.Friendships
            .Where(f => (f.SenderId == userId || f.ReceiverId == userId)
                     && f.Status == FriendshipStatus.Accepted)
            .Select(f => f.SenderId == userId ? f.ReceiverId : f.SenderId)
            .ToListAsync();

        friendIds.Add(userId);

        return await _context.Stories
            .Where(s => friendIds.Contains(s.UserId) && s.ExpiresAt > DateTime.UtcNow)
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new StoryResponseDto
            {
                Id          = s.Id,
                ImageUrl    = s.ImageUrl,
                TextContent = s.TextContent,
                CreatedAt   = s.CreatedAt,
                ExpiresAt   = s.ExpiresAt,
                UserId      = s.UserId,
                Username    = s.User.UserName!,
                AvatarUrl   = s.User.AvatarUrl
            })
            .ToListAsync();
    }

    public async Task<StoryResponseDto> CreateAsync(CreateStoryRequestDto dto, string userId)
    {
        string? imageUrl = null;
        if (dto.Image != null)
            imageUrl = await _blobStorage.UploadAsync(dto.Image, "stories");

        var story = new Story
        {
            TextContent = dto.TextContent,
            ImageUrl    = imageUrl,
            UserId      = userId,
            CreatedAt   = DateTime.UtcNow,
            ExpiresAt   = DateTime.UtcNow.AddHours(24)
        };

        await _context.Stories.AddAsync(story);
        await _context.SaveChangesAsync();
        await _context.Entry(story).Reference(s => s.User).LoadAsync();

        return new StoryResponseDto
        {
            Id          = story.Id,
            ImageUrl    = story.ImageUrl,
            TextContent = story.TextContent,
            CreatedAt   = story.CreatedAt,
            ExpiresAt   = story.ExpiresAt,
            UserId      = story.UserId,
            Username    = story.User.UserName!,
            AvatarUrl   = story.User.AvatarUrl
        };
    }

    public async Task<bool> DeleteAsync(int storyId, string userId)
    {
        var story = await _context.Stories
            .FirstOrDefaultAsync(s => s.Id == storyId && s.UserId == userId);

        if (story == null) return false;

        if (story.ImageUrl != null)
            await _blobStorage.DeleteAsync(story.ImageUrl);

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync();
        return true;
    }
}