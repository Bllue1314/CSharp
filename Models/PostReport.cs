using System;

public enum ReportReason { Spam, Harassment, HateSpeech, FakeNews, Other }

public class PostReport
{
    public int Id { get; set; }
    public ReportReason Reason { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsResolved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK
    [Required]
    public string UserId { get; set; } = string.Empty;
    public int PostId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Post Post { get; set; } = null!;
}