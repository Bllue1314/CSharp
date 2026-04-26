namespace InteractHub.API.DTOs.Posts;

public class ReportPostDto
{
    [Required]
    public string Reason { get; set; } = string.Empty;
    public string? Description { get; set; }
}