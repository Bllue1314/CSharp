namespace InteractHub.API.Services.Interfaces;

public interface IUsersService
{
    Task<UserResponseDto?> GetProfileAsync(string userId);
    Task<UserResponseDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto dto);
    Task<List<UserResponseDto>> SearchAsync(string query);
    Task<bool> DeleteAccountAsync(string userId);
}