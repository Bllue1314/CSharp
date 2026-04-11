namespace InteractHub.API.Models;
public class Post
{
    public int Id { get; set; }

    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Foreign Key
    [Required]
    public string UserId { get; set; } = string.Empty;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
    public ICollection<PostReport> PostReports { get; set; } = new List<PostReport>();
}