namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/stories")]
[Authorize]
[Produces("application/json")]
public class StoriesController : ControllerBase
{
    private readonly IStoriesService _storiesService;

    public StoriesController(IStoriesService storiesService)
    {
        _storiesService = storiesService;
    }

    /// <summary>Get active stories from friends</summary>
    [HttpGet]
    public async Task<IActionResult> GetStories()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var stories = await _storiesService.GetActiveStoriesAsync(userId);
        return Ok(ApiResponse<List<StoryResponseDto>>.Ok(stories));
    }

    /// <summary>Create a new story</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateStoryRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var story = await _storiesService.CreateAsync(dto, userId);
        return StatusCode(201, ApiResponse<StoryResponseDto>.Ok(story, "Story created"));
    }

    /// <summary>Delete a story</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var success = await _storiesService.DeleteAsync(id, userId);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("Story not found"));

        return Ok(ApiResponse<object>.Ok(null!, "Story deleted"));
    }
}