using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace InteractHub.API.Models;
public class Comment
{
    public int Id { get; set; }

    [Required, MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    // FK
    [Required]
    public string UserId { get; set; } = string.Empty;
    public int PostId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Post Post { get; set; } = null!;
}