using System;

public class Story
{
    public int Id { get; set; }

    public string? ImageUrl { get; set; }

    [MaxLength(500)]
    public string? TextContent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
    public bool IsActive => DateTime.UtcNow < ExpiresAt;

    // FK
    [Required]
    public string UserId { get; set; } = string.Empty;

    // Navigation
    public User User { get; set; } = null!;
}