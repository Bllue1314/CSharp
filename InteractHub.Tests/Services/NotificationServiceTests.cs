namespace InteractHub.Tests.Services;

public class NotificationServiceTests
{
    private NotificationsService CreateService(AppDbContext context) =>
        new NotificationsService(context);

    [Fact]
    public async Task GetAllAsync_ReturnsOnlyCurrentUsersNotifications()
    {
        var context = TestDbContextFactory.Create();
        var user1   = TestDbContextFactory.SeedUser(context, "user-1");
        var user2   = TestDbContextFactory.SeedUser(context, "user-2");
        var service = CreateService(context);

        await service.CreateAsync(user1.Id, NotificationType.Like, "You got a like");
        await service.CreateAsync(user2.Id, NotificationType.Like, "Other user notification");

        var result = await service.GetAllAsync(user1.Id);

        result.Should().HaveCount(1);
        result.First().Message.Should().Be("You got a like");
    }

    [Fact]
    public async Task MarkAsReadAsync_ValidNotification_ReturnsTrue()
    {
        var context      = TestDbContextFactory.Create();
        var user         = TestDbContextFactory.SeedUser(context, "user-1");
        var service      = CreateService(context);

        await service.CreateAsync(user.Id, NotificationType.Comment, "New comment");
        var notification = await context.Notifications.FirstAsync();

        var result = await service.MarkAsReadAsync(notification.Id, user.Id);

        result.Should().BeTrue();
        notification.IsRead.Should().BeTrue();
    }

    [Fact]
    public async Task MarkAllAsReadAsync_MarksAllUnread()
    {
        var context = TestDbContextFactory.Create();
        var user    = TestDbContextFactory.SeedUser(context, "user-1");
        var service = CreateService(context);

        await service.CreateAsync(user.Id, NotificationType.Like,    "Like 1");
        await service.CreateAsync(user.Id, NotificationType.Comment, "Comment 1");
        await service.CreateAsync(user.Id, NotificationType.Like,    "Like 2");

        await service.MarkAllAsReadAsync(user.Id);

        var allRead = await context.Notifications.AllAsync(n => n.IsRead);
        allRead.Should().BeTrue();
    }

    [Fact]
    public async Task MarkAsReadAsync_WrongUser_ReturnsFalse()
    {
        var context = TestDbContextFactory.Create();
        var user1   = TestDbContextFactory.SeedUser(context, "user-1");
        var user2   = TestDbContextFactory.SeedUser(context, "user-2");
        var service = CreateService(context);

        await service.CreateAsync(user1.Id, NotificationType.Like, "Like notification");
        var notification = await context.Notifications.FirstAsync();

        var result = await service.MarkAsReadAsync(notification.Id, user2.Id);

        result.Should().BeFalse();
    }
}