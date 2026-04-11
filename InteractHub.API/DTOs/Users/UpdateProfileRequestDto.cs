namespace InteractHub.API.DTOs.Users;
public class UpdateProfileRequestDto
{
    [MaxLength(100)]
    public string? DisplayName { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }

    public IFormFile? Avatar { get; set; }
}