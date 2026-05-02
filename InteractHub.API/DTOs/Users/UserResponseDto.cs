// DTOs/Users/UserResponseDto.cs
public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PostCount { get; set; }
    public int FriendCount { get; set; }
    public string? FriendUserId { get; set; } // ← add this
}