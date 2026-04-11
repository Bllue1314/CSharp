using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace InteractHub.API.Models;
public class Like
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK
    [Required]
    public string UserId { get; set; } = string.Empty;
    public int PostId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Post Post { get; set; } = null!;
}