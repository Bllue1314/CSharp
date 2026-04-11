namespace InteractHub.API.Services.Implementations;

using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

public class TokenService : ITokenService
{
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _config;

    public TokenService(UserManager<User> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    public async Task<string> GenerateTokenAsync(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        // Claims = data embedded inside the token
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name,           user.UserName!),
            new(ClaimTypes.Email,          user.Email!),
            new("displayName",             user.DisplayName),
        };

        // Add each role as a separate claim
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var key   = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddDays(
                        int.Parse(_config["JwtSettings:ExpirationInDays"]!));

        var token = new JwtSecurityToken(
            issuer:             _config["JwtSettings:Issuer"],
            audience:           _config["JwtSettings:Audience"],
            claims:             claims,
            expires:            expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}