namespace InteractHub.API.Services.Implementations;

using InteractHub.API.Services.Interfaces;

public class UsersService : IUsersService
{
    private readonly AppDbContext _context;
    private readonly IBlobStorageService _blobStorage;

    public UsersService(AppDbContext context, IBlobStorageService blobStorage)
    {
        _context     = context;
        _blobStorage = blobStorage;
    }

    public async Task<UserResponseDto?> GetProfileAsync(string userId)
    {
        var user = await _context.Users
            .Include(u => u.Posts)
            .Include(u => u.SentFriendRequests.Where(f => f.Status == FriendshipStatus.Accepted))
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user == null ? null : MapToDto(user);
    }

    public async Task<UserResponseDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto dto)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new Exception("User not found");

        if (dto.DisplayName != null) user.DisplayName = dto.DisplayName;
        if (dto.Bio != null)         user.Bio         = dto.Bio;

        if (dto.Avatar != null)
        {
            // Delete old avatar if exists
            if (user.AvatarUrl != null)
                await _blobStorage.DeleteAsync(user.AvatarUrl);

            user.AvatarUrl = await _blobStorage.UploadAsync(dto.Avatar, "avatars");
        }

        await _context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task<List<UserResponseDto>> SearchAsync(string query)
    {
        return await _context.Users
            .Where(u => u.UserName!.Contains(query) || u.DisplayName.Contains(query))
            .Take(20)
            .Select(u => MapToDto(u))
            .ToListAsync();
    }

    private static UserResponseDto MapToDto(User u) => new()
    {
        Id          = u.Id,
        Username    = u.UserName!,
        DisplayName = u.DisplayName,
        Bio         = u.Bio,
        AvatarUrl   = u.AvatarUrl,
        CreatedAt   = u.CreatedAt,
        PostCount   = u.Posts?.Count ?? 0,
        FriendCount = u.SentFriendRequests?.Count ?? 0
    };
}