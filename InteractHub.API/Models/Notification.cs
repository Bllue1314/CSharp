public enum NotificationType { Like, Comment, FriendRequest, FriendAccepted, Mention }

public class Notification
{
    public int Id { get; set; }
    public NotificationType Type { get; set; }

    [Required, MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK — who receives it
    [Required]
    public string UserId { get; set; } = string.Empty;

    // Optional: link back to the post/comment that triggered it
    public int? PostId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Post? Post { get; set; }
}