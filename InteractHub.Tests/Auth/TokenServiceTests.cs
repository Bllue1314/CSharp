namespace InteractHub.Tests.Auth;

public class TokenServiceTests
{
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<UserManager<User>> _userManagerMock;

    public TokenServiceTests()
    {
        _configMock = new Mock<IConfiguration>();
        _configMock.Setup(c => c["JwtSettings:SecretKey"])
                   .Returns("SuperSecretTestKeyThatIsLongEnough123!");
        _configMock.Setup(c => c["JwtSettings:Issuer"])
                   .Returns("InteractHub.API");
        _configMock.Setup(c => c["JwtSettings:Audience"])
                   .Returns("InteractHub.Client");
        _configMock.Setup(c => c["JwtSettings:ExpirationInDays"])
                   .Returns("7");

        var store = new Mock<IUserStore<User>>();
        _userManagerMock = new Mock<UserManager<User>>(
            store.Object, null, null, null, null, null, null, null, null);
    }

    /// <summary>Token generation for valid user should return non-empty string</summary>
    [Fact]
    public async Task GenerateTokenAsync_ValidUser_ReturnsToken()
    {
        var user = new User
        {
            Id          = "user-1",
            UserName    = "testuser",
            Email       = "test@example.com",
            DisplayName = "Test User"
        };

        _userManagerMock
            .Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "User" });

        var service = new TokenService(_userManagerMock.Object, _configMock.Object);

        var token = await service.GenerateTokenAsync(user);

        token.Should().NotBeNullOrEmpty();
        token.Split('.').Should().HaveCount(3);
    }

    /// <summary>Token should contain correct user claims</summary>
    [Fact]
    public async Task GenerateTokenAsync_ContainsCorrectClaims()
    {
        var user = new User
        {
            Id          = "user-123",
            UserName    = "claimuser",
            Email       = "claim@example.com",
            DisplayName = "Claim User"
        };

        _userManagerMock
            .Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Admin" });

        var service = new TokenService(_userManagerMock.Object, _configMock.Object);

        var token   = await service.GenerateTokenAsync(user);
        var handler = new JwtSecurityTokenHandler();
        var jwt     = handler.ReadJwtToken(token);

        jwt.Claims.Should().Contain(c =>
            c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            && c.Value == "user-123");

        jwt.Claims.Should().Contain(c =>
            c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            && c.Value == "Admin");
    }

    /// <summary>Token should expire after configured days</summary>
    [Fact]
    public async Task GenerateTokenAsync_TokenExpiresAfterConfiguredDays()
    {
        var user = new User
        {
            Id          = "user-1",
            UserName    = "testuser",
            Email       = "test@example.com",
            DisplayName = "Test User"
        };

        _userManagerMock
            .Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync(new List<string>());

        var service = new TokenService(_userManagerMock.Object, _configMock.Object);

        var token   = await service.GenerateTokenAsync(user);
        var handler = new JwtSecurityTokenHandler();
        var jwt     = handler.ReadJwtToken(token);

        jwt.ValidTo.Should().BeCloseTo(DateTime.UtcNow.AddDays(7), TimeSpan.FromMinutes(1));
    }
}