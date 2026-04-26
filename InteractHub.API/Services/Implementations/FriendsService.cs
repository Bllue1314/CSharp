namespace InteractHub.API.Services.Implementations;

using InteractHub.API.Services.Interfaces;

public class FriendsService : IFriendsService
{
    private readonly AppDbContext _context;
    private readonly INotificationsService _notifications;

    public FriendsService(AppDbContext context, INotificationsService notifications)
    {
        _context       = context;
        _notifications = notifications;
    }

    public async Task<List<UserResponseDto>> GetFriendsAsync(string userId)
    {
        var friendships = await _context.Friendships
            .Where(f => (f.SenderId == userId || f.ReceiverId == userId)
                     && f.Status == FriendshipStatus.Accepted)
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .ToListAsync();

        return friendships
            .Select(f => f.SenderId == userId ? f.Receiver : f.Sender)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<List<UserResponseDto>> GetFriendsAsync(string userId)
    {
        var friendships = await _context.Friendships
            .Where(f => (f.SenderId == userId || f.ReceiverId == userId)
                    && f.Status == FriendshipStatus.Accepted)
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .ToListAsync();

        return friendships.Select(f => {
            var friend = f.SenderId == userId ? f.Receiver : f.Sender;
            return new UserResponseDto
            {
                Id          = f.Id.ToString(), // friendship ID for unfriending
                Username    = friend.UserName!,
                DisplayName = friend.DisplayName,
                Bio         = friend.Bio,
                AvatarUrl   = friend.AvatarUrl,
                CreatedAt   = friend.CreatedAt
            };
        }).ToList();
    }

    public async Task<bool> SendRequestAsync(string senderId, string receiverId)
    {
        var existing = await _context.Friendships
            .AnyAsync(f => (f.SenderId == senderId && f.ReceiverId == receiverId)
                        || (f.SenderId == receiverId && f.ReceiverId == senderId));

        if (existing) return false;

        await _context.Friendships.AddAsync(new Friendship
        {
            SenderId   = senderId,
            ReceiverId = receiverId,
            Status     = FriendshipStatus.Pending,
            CreatedAt  = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        await _notifications.CreateAsync(
            receiverId,
            NotificationType.FriendRequest,
            "You have a new friend request");

        return true;
    }

    public async Task<bool> AcceptRequestAsync(int friendshipId, string userId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => f.Id == friendshipId
                                   && f.ReceiverId == userId
                                   && f.Status == FriendshipStatus.Pending);

        if (friendship == null) return false;

        friendship.Status    = FriendshipStatus.Accepted;
        friendship.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _notifications.CreateAsync(
            friendship.SenderId,
            NotificationType.FriendAccepted,
            "Your friend request was accepted");

        return true;
    }

    public async Task<bool> RemoveAsync(int friendshipId, string userId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => f.Id == friendshipId
                                   && (f.SenderId == userId || f.ReceiverId == userId));

        if (friendship == null) return false;

        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();
        return true;
    }

    private static UserResponseDto MapToDto(User u) => new()
    {
        Id          = u.Id,
        Username    = u.UserName!,
        DisplayName = u.DisplayName,
        Bio         = u.Bio,
        AvatarUrl   = u.AvatarUrl,
        CreatedAt   = u.CreatedAt
    };
}