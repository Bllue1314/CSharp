namespace InteractHub.Tests.Services;

/// <summary>
/// Unit tests for PostsService covering CRUD, likes, and comments
/// </summary>
public class PostsServiceTests
{
    private readonly Mock<IBlobStorageService> _blobStorageMock;
    private readonly Mock<INotificationsService> _notificationsMock;

    public PostsServiceTests()
    {
        _blobStorageMock    = new Mock<IBlobStorageService>();
        _notificationsMock  = new Mock<INotificationsService>();
    }

    private PostsService CreateService(AppDbContext context) =>
        new PostsService(context, _blobStorageMock.Object, _notificationsMock.Object);

    // ── Create Post ───────────────────────────────────────────────────

    /// <summary>Creating a post with valid data should succeed</summary>
    [Fact]
    public async Task CreateAsync_ValidData_ReturnsPostResponseDto()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var user    = TestDbContextFactory.SeedUser(context);
        var service = CreateService(context);
        var dto     = new CreatePostRequestDto { Content = "Hello world!" };

        // Act
        var result = await service.CreateAsync(dto, user.Id);

        // Assert
        result.Should().NotBeNull();
        result.Content.Should().Be("Hello world!");
        result.UserId.Should().Be(user.Id);
    }

    /// <summary>Creating a post should persist it to the database</summary>
    [Fact]
    public async Task CreateAsync_ValidData_SavesPostToDatabase()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var user    = TestDbContextFactory.SeedUser(context);
        var service = CreateService(context);
        var dto     = new CreatePostRequestDto { Content = "Saved post" };

        // Act
        await service.CreateAsync(dto, user.Id);

        // Assert
        var savedPost = await context.Posts.FirstOrDefaultAsync();
        savedPost.Should().NotBeNull();
        savedPost!.Content.Should().Be("Saved post");
    }

    // ── Get Post ──────────────────────────────────────────────────────

    /// <summary>Getting a post that exists should return it</summary>
    [Fact]
    public async Task GetByIdAsync_ExistingPost_ReturnsPost()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var user    = TestDbContextFactory.SeedUser(context);
        var post    = TestDbContextFactory.SeedPost(context, user.Id);
        var service = CreateService(context);

        // Act
        var result = await service.GetByIdAsync(post.Id, user.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(post.Id);
    }

    /// <summary>Getting a post that doesn't exist should return null</summary>
    [Fact]
    public async Task GetByIdAsync_NonExistentPost_ReturnsNull()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var service = CreateService(context);

        // Act
        var result = await service.GetByIdAsync(999, "user-1");

        // Assert
        result.Should().BeNull();
    }

    // ── Delete Post ───────────────────────────────────────────────────

    /// <summary>Deleting own post should soft-delete it</summary>
    [Fact]
    public async Task DeleteAsync_OwnPost_ReturnsTrueAndSoftDeletes()
    {
        // Arrange
        var context = TestDbContextFactory.Create();
        var user    = TestDbContextFactory.SeedUser(context);
        var post    = TestDbContextFactory.SeedPost(context, user.Id);
        var service = CreateService(context);

        // Act
        var result = await service.DeleteAsync(post.Id, user.Id);

        // Assert
        result.Should().BeTrue();
        var deletedPost = await context.Posts.FindAsync(post.Id);
        deletedPost!.IsDeleted.Should().BeTrue();
    }

    /// <summary>Deleting another user's post should fail</summary>
    [Fact]
    public async Task DeleteAsync_OtherUsersPost_ReturnsFalse()
    {
        // Arrange
        var context    = TestDbContextFactory.Create();
        var owner      = TestDbContextFactory.SeedUser(context, "owner-1");
        var otherUser  = TestDbContextFactory.SeedUser(context, "other-1");
        var post       = TestDbContextFactory.SeedPost(context, owner.Id);
        var service    = CreateService(context);

        // Act
        var result = await service.DeleteAsync(post.Id, otherUser.Id);

        // Assert
        result.Should().BeFalse();
    }

    // ── Toggle Like ───────────────────────────────────────────────────

    /// <summary>Liking a post should return true and send notification</summary>
    [Fact]
    public async Task ToggleLikeAsync_NewLike_ReturnsTrueAndNotifies()
    {
        // Arrange
        var context  = TestDbContextFactory.Create();
        var owner    = TestDbContextFactory.SeedUser(context, "owner-1");
        var liker    = TestDbContextFactory.SeedUser(context, "liker-1");
        var post     = TestDbContextFactory.SeedPost(context, owner.Id);
        var service  = CreateService(context);

        // Act
        var result = await service.ToggleLikeAsync(post.Id, liker.Id);

        // Assert
        result.Should().BeTrue();
        _notificationsMock.Verify(
            n => n.CreateAsync(owner.Id, NotificationType.Like, It.IsAny<string>(), post.Id),
            Times.Once);
    }
}