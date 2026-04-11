namespace InteractHub.API.Services.Interfaces;

public interface INotificationsService
{
    Task<List<NotificationResponseDto>> GetAllAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task MarkAllAsReadAsync(string userId);
    Task CreateAsync(string userId, NotificationType type, string message, int? postId = null);
}