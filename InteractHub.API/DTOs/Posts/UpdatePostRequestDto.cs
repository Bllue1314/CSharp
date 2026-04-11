namespace InteractHub.API.DTOs.Posts;
public class CreatePostRequestDto
{
    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public IFormFile? Image { get; set; }
}