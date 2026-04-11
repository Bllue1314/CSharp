[ApiController]
[Route("api/users")]
[Authorize]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public UsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    /// <summary>Get a user's public profile</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), 404)]
    public async Task<IActionResult> GetProfile(string id)
    {
        var user = await _usersService.GetProfileAsync(id);
        if (user == null)
            return NotFound(ApiResponse<UserResponseDto>.Fail("User not found"));

        return Ok(ApiResponse<UserResponseDto>.Ok(user));
    }

    /// <summary>Update the current user's profile</summary>
    [HttpPut("me")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), 200)]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var updated = await _usersService.UpdateProfileAsync(userId, dto);
        return Ok(ApiResponse<UserResponseDto>.Ok(updated, "Profile updated"));
    }

    /// <summary>Search users by username or display name</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(ApiResponse<List<UserResponseDto>>), 200)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var users = await _usersService.SearchAsync(q);
        return Ok(ApiResponse<List<UserResponseDto>>.Ok(users));
    }
}