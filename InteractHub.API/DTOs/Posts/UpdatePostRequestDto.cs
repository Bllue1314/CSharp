namespace InteractHub.API.DTOs.Posts;

public class UpdatePostRequestDto
{
    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}