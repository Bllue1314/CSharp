namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;

    public AuthController(UserManager<User> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    /// <summary>Register a new user account</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AuthResponseDto>.Fail(
                ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage).ToList()));

        // Check if email already exists
        if (await _userManager.FindByEmailAsync(dto.Email) != null)
            return BadRequest(ApiResponse<AuthResponseDto>.Fail("Email already in use"));

        var user = new User
        {
            UserName    = dto.Username,
            Email       = dto.Email,
            DisplayName = dto.DisplayName
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(ApiResponse<AuthResponseDto>.Fail(
                result.Errors.Select(e => e.Description).ToList()));

        // Assign default role
        await _userManager.AddToRoleAsync(user, "User");

        var token = await _tokenService.GenerateTokenAsync(user);

        return StatusCode(201, ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token       = token,
            UserId      = user.Id,
            Username    = user.UserName!,
            Email       = user.Email!,
            DisplayName = user.DisplayName
        }, "Account created successfully"));
    }

    /// <summary>Login and receive a JWT token</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 401)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AuthResponseDto>.Fail(
                ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage).ToList()));

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Invalid email or password"));

        var token = await _tokenService.GenerateTokenAsync(user);

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token       = token,
            UserId      = user.Id,
            Username    = user.UserName!,
            Email       = user.Email!,
            DisplayName = user.DisplayName,
            AvatarUrl   = user.AvatarUrl
        }));
    }

    /// <summary>Get current authenticated user info</summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(ApiResponse<AuthResponseDto>.Fail("User not found"));

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            UserId      = user.Id,
            Username    = user.UserName!,
            Email       = user.Email!,
            DisplayName = user.DisplayName,
            AvatarUrl   = user.AvatarUrl
        }));
    }
}