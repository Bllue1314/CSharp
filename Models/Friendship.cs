using System;

public enum FriendshipStatus { Pending, Accepted, Rejected, Blocked }

public class Friendship
{
    public int Id { get; set; }
    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // FK
    [Required]
    public string SenderId { get; set; } = string.Empty;
    [Required]
    public string ReceiverId { get; set; } = string.Empty;

    // Navigation
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
}