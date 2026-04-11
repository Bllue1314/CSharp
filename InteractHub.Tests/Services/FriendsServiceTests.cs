namespace InteractHub.Tests.Services;

/// <summary>
/// Unit tests for FriendsService covering requests, acceptance, and removal
/// </summary>
public class FriendsServiceTests
{
    private readonly Mock<INotificationsService> _notificationsMock;

    public FriendsServiceTests()
    {
        _notificationsMock = new Mock<INotificationsService>();
    }

    private FriendsService CreateService(AppDbContext context) =>
        new FriendsService(context, _notificationsMock.Object);

    /// <summary>Sending a friend request to a new user should succeed</summary>
    [Fact]
    public async Task SendRequestAsync_NewRequest_ReturnsTrue()
    {
        // Arrange
        var context  = TestDbContextFactory.Create();
        var sender   = TestDbContextFactory.SeedUser(context, "sender-1");
        var receiver = TestDbContextFactory.SeedUser(context, "receiver-1");
        var service  = CreateService(context);

        // Act
        var result = await service.SendRequestAsync(sender.Id, receiver.Id);

        // Assert
        result.Should().BeTrue();
        context.Friendships.Should().HaveCount(1);
    }

    /// <summary>Sending a duplicate friend request should fail</summary>
    [Fact]
    public async Task SendRequestAsync_DuplicateRequest_ReturnsFalse()
    {
        // Arrange
        var context  = TestDbContextFactory.Create();
        var sender   = TestDbContextFactory.SeedUser(context, "sender-1");
        var receiver = TestDbContextFactory.SeedUser(context, "receiver-1");
        var service  = CreateService(context);

        // Act
        await service.SendRequestAsync(sender.Id, receiver.Id); // first
        var result = await service.SendRequestAsync(sender.Id, receiver.Id); // duplicate

        // Assert
        result.Should().BeFalse();
        context.Friendships.Should().HaveCount(1); // still only one
    }

    /// <summary>Accepting a valid pending request should update status</summary>
    [Fact]
    public async Task AcceptRequestAsync_ValidRequest_ReturnsTrue()
    {
        // Arrange
        var context  = TestDbContextFactory.Create();
        var sender   = TestDbContextFactory.SeedUser(context, "sender-1");
        var receiver = TestDbContextFactory.SeedUser(context, "receiver-1");
        var service  = CreateService(context);

        await service.SendRequestAsync(sender.Id, receiver.Id);
        var friendship = await context.Friendships.FirstAsync();

        // Act
        var result = await service.AcceptRequestAsync(friendship.Id, receiver.Id);

        // Assert
        result.Should().BeTrue();
        friendship.Status.Should().Be(FriendshipStatus.Accepted);
    }

    /// <summary>Accepting a request as the wrong user should fail</summary>
    [Fact]
    public async Task AcceptRequestAsync_WrongUser_ReturnsFalse()
    {
        // Arrange
        var context   = TestDbContextFactory.Create();
        var sender    = TestDbContextFactory.SeedUser(context, "sender-1");
        var receiver  = TestDbContextFactory.SeedUser(context, "receiver-1");
        var wrongUser = TestDbContextFactory.SeedUser(context, "wrong-1");
        var service   = CreateService(context);

        await service.SendRequestAsync(sender.Id, receiver.Id);
        var friendship = await context.Friendships.FirstAsync();

        // Act
        var result = await service.AcceptRequestAsync(friendship.Id, wrongUser.Id);

        // Assert
        result.Should().BeFalse();
    }

    /// <summary>Removing a friendship should delete it from database</summary>
    [Fact]
    public async Task RemoveAsync_ExistingFriendship_ReturnsTrueAndDeletes()
    {
        // Arrange
        var context  = TestDbContextFactory.Create();
        var sender   = TestDbContextFactory.SeedUser(context, "sender-1");
        var receiver = TestDbContextFactory.SeedUser(context, "receiver-1");
        var service  = CreateService(context);

        await service.SendRequestAsync(sender.Id, receiver.Id);
        var friendship = await context.Friendships.FirstAsync();

        // Act
        var result = await service.RemoveAsync(friendship.Id, sender.Id);

        // Assert
        result.Should().BeTrue();
        context.Friendships.Should().BeEmpty();
    }
}