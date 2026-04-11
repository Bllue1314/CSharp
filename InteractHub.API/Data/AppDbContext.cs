namespace InteractHub.API.Data;
public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Hashtag> Hashtags => Set<Hashtag>();
    public DbSet<PostHashtag> PostHashtags => Set<PostHashtag>();
    public DbSet<PostReport> PostReports => Set<PostReport>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // MUST call this for Identity tables

    builder.Entity<Comment>()
        .HasOne(c => c.User)
        .WithMany(u => u.Comments)
        .HasForeignKey(c => c.UserId)
        .OnDelete(DeleteBehavior.Restrict);  // prevent cycle

    builder.Entity<Like>()
        .HasOne(l => l.User)
        .WithMany(u => u.Likes)
        .HasForeignKey(l => l.UserId)
        .OnDelete(DeleteBehavior.Restrict);  // prevent cycle

    builder.Entity<PostReport>()
        .HasOne(r => r.User)
        .WithMany(u => u.PostReports)
        .HasForeignKey(r => r.UserId)
        .OnDelete(DeleteBehavior.Restrict);  // prevent cycle

    builder.Entity<Notification>()
        .HasOne(n => n.User)
        .WithMany(u => u.Notifications)
        .HasForeignKey(n => n.UserId)
        .OnDelete(DeleteBehavior.Restrict);  // prevent cycle

        // ── PostHashtag composite PK ──────────────────────────────────
        builder.Entity<PostHashtag>()
            .HasKey(ph => new { ph.PostId, ph.HashtagId });

        // ── Like: one user can like a post only once ──────────────────
        builder.Entity<Like>()
            .HasIndex(l => new { l.UserId, l.PostId })
            .IsUnique();

        // ── Hashtag: tag name must be unique ──────────────────────────
        builder.Entity<Hashtag>()
            .HasIndex(h => h.Tag)
            .IsUnique();

        // ── Friendship: prevent duplicate pairs ───────────────────────
        builder.Entity<Friendship>()
            .HasIndex(f => new { f.SenderId, f.ReceiverId })
            .IsUnique();

        // ── Friendship self-referencing FK (avoid cascade cycles) ─────
        builder.Entity<Friendship>()
            .HasOne(f => f.Sender)
            .WithMany(u => u.SentFriendRequests)
            .HasForeignKey(f => f.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Friendship>()
            .HasOne(f => f.Receiver)
            .WithMany(u => u.ReceivedFriendRequests)
            .HasForeignKey(f => f.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Seed roles ────────────────────────────────────────────────
        builder.Entity<IdentityRole>().HasData(
            new IdentityRole { Id = "1", Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Id = "2", Name = "User",  NormalizedName = "USER"  }
        );

        // ── Seed hashtags ─────────────────────────────────────────────
        builder.Entity<Hashtag>().HasData(
            new Hashtag { Id = 1, Tag = "dotnet" },
            new Hashtag { Id = 2, Tag = "csharp" },
            new Hashtag { Id = 3, Tag = "webdev" }
        );
    }
}