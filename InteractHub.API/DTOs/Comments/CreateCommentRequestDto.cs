namespace InteractHub.API.DTOs.Comments;
public class CreateCommentRequestDto
{
    [Required, MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
}