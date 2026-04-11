namespace InteractHub.API.Services.Implementations;

using InteractHub.API.Services.Interfaces;

public class NotificationsService : INotificationsService
{
    private readonly AppDbContext _context;

    public NotificationsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationResponseDto>> GetAllAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponseDto
            {
                Id        = n.Id,
                Message   = n.Message,
                Type      = n.Type.ToString(),
                IsRead    = n.IsRead,
                CreatedAt = n.CreatedAt,
                PostId    = n.PostId
            })
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        notifications.ForEach(n => n.IsRead = true);
        await _context.SaveChangesAsync();
    }

    public async Task CreateAsync(
        string userId, NotificationType type, string message, int? postId = null)
    {
        await _context.Notifications.AddAsync(new Notification
        {
            UserId    = userId,
            Type      = type,
            Message   = message,
            PostId    = postId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }
}