namespace InteractHub.API.Services.Interfaces;

public interface IPostsService
{
    Task<List<PostResponseDto>> GetFeedAsync(string userId, int page, int pageSize);
    Task<PostResponseDto?> GetByIdAsync(int postId, string userId);
    Task<PostResponseDto> CreateAsync(CreatePostRequestDto dto, string userId);
    Task<PostResponseDto?> UpdateAsync(int postId, UpdatePostRequestDto dto, string userId);
    Task<bool> DeleteAsync(int postId, string userId);
    Task<bool> ToggleLikeAsync(int postId, string userId);
    Task<List<CommentResponseDto>> GetCommentsAsync(int postId);
    Task<CommentResponseDto> AddCommentAsync(int postId, CreateCommentRequestDto dto, string userId);
    Task<bool> DeleteCommentAsync(int commentId, string userId);
    Task<bool> ReportPostAsync(int postId, ReportPostDto dto, string userId);
    Task<List<string>> GetTrendingHashtagsAsync();
}