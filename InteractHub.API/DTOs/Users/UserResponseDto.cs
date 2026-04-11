using System.ComponentModel.DataAnnotations;
namespace InteractHub.API.DTOs.Users;
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
}