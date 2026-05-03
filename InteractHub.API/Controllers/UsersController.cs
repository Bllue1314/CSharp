namespace InteractHub.API.Controllers;

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

    /// <summary>Search users by username or display name</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(ApiResponse<List<UserResponseDto>>), 200)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var users = await _usersService.SearchAsync(q);
        return Ok(ApiResponse<List<UserResponseDto>>.Ok(users));
    }

    /// <summary>Get current user profile</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await _usersService.GetProfileAsync(userId);
        if (user == null)
            return NotFound(ApiResponse<UserResponseDto>.Fail("User not found"));

        return Ok(ApiResponse<UserResponseDto>.Ok(user));
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

    /// <summary>Delete current user account</summary>
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var success = await _usersService.DeleteAccountAsync(userId);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("User not found"));

        return Ok(ApiResponse<object>.Ok(null!, "Account deleted"));
    }
}