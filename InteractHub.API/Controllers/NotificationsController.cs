namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationsService _notificationsService;

    public NotificationsController(INotificationsService notificationsService)
    {
        _notificationsService = notificationsService;
    }

    /// <summary>Get all notifications for current user</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var notifications = await _notificationsService.GetAllAsync(userId);
        return Ok(ApiResponse<List<NotificationResponseDto>>.Ok(notifications));
    }

    /// <summary>Mark a notification as read</summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var success = await _notificationsService.MarkAsReadAsync(id, userId);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("Notification not found"));

        return Ok(ApiResponse<object>.Ok(null, "Marked as read"));
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _notificationsService.MarkAllAsReadAsync(userId);
        return Ok(ApiResponse<object>.Ok(null, "All notifications marked as read"));
    }
}