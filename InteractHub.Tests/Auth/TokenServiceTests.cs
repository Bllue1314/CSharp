namespace InteractHub.Tests.Services;

/// <summary>
/// Unit tests for NotificationsService
/// </summary>
public class NotificationsServiceTests
{
    private NotificationsService CreateService(AppDbContext context) =>
        new NotificationsService(context);

    /// <summary>Getting notifications returns only current user's notifications</summary>
    [Fact]
    public async Task GetAllAsync_ReturnsOnlyCurrentUsersNotifications()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var user1   = TestDbContextFactory.SeedUser(context, "user-1");
        var user2   = TestDbContextFactory.SeedUser(context, "user-2");
        var service = CreateService(context);

        await service.CreateAsync(user1.Id, NotificationType.Like, "You got a like");
        await service.CreateAsync(user2.Id, NotificationType.Like, "Other user notification");

        // Act
        var result = await service.GetAllAsync(user1.Id);

        // Assert
        result.Should().HaveCount(1);
        result.First().Message.Should().Be("You got a like");
    }

    /// <summary>Marking a notification as read should update IsRead</summary>
    [Fact]
    public async Task MarkAsReadAsync_ValidNotification_ReturnsTrue()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var user    = TestDbContextFactory.SeedUser(context, "user-1");
        var service = CreateService(context);

        await service.CreateAsync(user.Id, NotificationType.Comment, "New comment");
        var notification = await context.Notifications.FirstAsync();

        // Act
        var result = await service.MarkAsReadAsync(notification.Id, user.Id);

        // Assert
        result.Should().BeTrue();
        notification.IsRead.Should().BeTrue();
    }

    /// <summary>Marking all notifications should update all unread ones</summary>
    [Fact]
    public async Task MarkAllAsReadAsync_MarksAllUnread()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var user    = TestDbContextFactory.SeedUser(context, "user-1");
        var service = CreateService(context);

        await service.CreateAsync(user.Id, NotificationType.Like,    "Like 1");
        await service.CreateAsync(user.Id, NotificationType.Comment, "Comment 1");
        await service.CreateAsync(user.Id, NotificationType.Like,    "Like 2");

        // Act
        await service.MarkAllAsReadAsync(user.Id);

        // Assert
        var allRead = await context.Notifications
            .AllAsync(n => n.IsRead);
        allRead.Should().BeTrue();
    }

    /// <summary>Marking a notification belonging to another user should fail</summary>
    [Fact]
    public async Task MarkAsReadAsync_WrongUser_ReturnsFalse()
    {
        // Arrange
        var context   = TestDbContextFactory.Create();
        var user1     = TestDbContextFactory.SeedUser(context, "user-1");
        var user2     = TestDbContextFactory.SeedUser(context, "user-2");
        var service   = CreateService(context);

        await service.CreateAsync(user1.Id, NotificationType.Like, "Like notification");
        var notification = await context.Notifications.FirstAsync();

        // Act
        var result = await service.MarkAsReadAsync(notification.Id, user2.Id);

        // Assert
        result.Should().BeFalse();
    }
}