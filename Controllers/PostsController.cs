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
    /// <response code="201">User created successfully</response>
    /// <response code="400">Validation errors or email already exists</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AuthResponseDto>.Fail(
                ModelState.Values.SelectMany(v => v.Errors)
                                 .Select(e => e.ErrorMessage).ToList()));

        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            DisplayName = dto.DisplayName
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(ApiResponse<AuthResponseDto>.Fail(
                result.Errors.Select(e => e.Description).ToList()));

        await _userManager.AddToRoleAsync(user, "User");
        var token = await _tokenService.GenerateTokenAsync(user);

        return StatusCode(201, ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Username = user.UserName!,
            Email = user.Email!,
            DisplayName = user.DisplayName
        }, "Account created successfully"));
    }

    /// <summary>Login with email and password</summary>
    /// <response code="200">Returns JWT token</response>
    /// <response code="401">Invalid credentials</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 401)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AuthResponseDto>.Fail(
                ModelState.Values.SelectMany(v => v.Errors)
                                 .Select(e => e.ErrorMessage).ToList()));

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Invalid email or password"));

        var token = await _tokenService.GenerateTokenAsync(user);

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Username = user.UserName!,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl
        }));
    }
}