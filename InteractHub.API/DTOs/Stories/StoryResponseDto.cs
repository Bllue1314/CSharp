namespace InteractHub.API.DTOs.Stories;
public class StoryResponseDto
{
    public int Id { get; set; }
    public string? ImageUrl { get; set; }
    public string? TextContent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}