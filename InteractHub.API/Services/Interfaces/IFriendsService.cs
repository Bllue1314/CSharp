// Services/Interfaces/IFriendsService.cs
namespace InteractHub.API.Services.Interfaces;

public interface IFriendsService
{
    Task<List<UserResponseDto>> GetFriendsAsync(string userId);
    Task<List<UserResponseDto>> GetPendingRequestsAsync(string userId);
    Task<bool> SendRequestAsync(string senderId, string receiverId);
    Task<bool> AcceptRequestAsync(int friendshipId, string userId);
    Task<bool> RemoveAsync(int friendshipId, string userId);
}