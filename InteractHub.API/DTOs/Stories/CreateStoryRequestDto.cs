namespace InteractHub.API.DTOs.Stories;
public class CreateStoryRequestDto
{
    [MaxLength(500)]
    public string? TextContent { get; set; }

    public IFormFile? Image { get; set; }
}