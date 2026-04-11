namespace InteractHub.Tests.Helpers;

public static class TestDbContextFactory
{
    /// <summary>
    /// Creates a fresh in-memory database for each test
    /// so tests don't interfere with each other
    /// </summary>
    public static AppDbContext Create(string dbName = "TestDb")
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName + Guid.NewGuid()) // unique per test
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    /// <summary>
    /// Seeds a test user into the context
    /// </summary>
    public static User SeedUser(AppDbContext context, string id = "user-1")
    {
        var user = new User
        {
            Id          = id,
            UserName    = $"testuser_{id}",
            Email       = $"test_{id}@example.com",
            DisplayName = "Test User"
        };
        context.Users.Add(user);
        context.SaveChanges();
        return user;
    }

    /// <summary>
    /// Seeds a test post into the context
    /// </summary>
    public static Post SeedPost(AppDbContext context, string userId, int id = 1)
    {
        var post = new Post
        {
            Id        = id,
            Content   = "Test post content",
            UserId    = userId,
            CreatedAt = DateTime.UtcNow
        };
        context.Posts.Add(post);
        context.SaveChanges();
        return post;
    }
}