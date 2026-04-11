namespace InteractHub.API.Services.Interfaces;

public interface IStoriesService
{
    Task<List<StoryResponseDto>> GetActiveStoriesAsync(string userId);
    Task<StoryResponseDto> CreateAsync(CreateStoryRequestDto dto, string userId);
    Task<bool> DeleteAsync(int storyId, string userId);
}