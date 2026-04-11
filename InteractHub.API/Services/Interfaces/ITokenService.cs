namespace InteractHub.API.Services.Interfaces;

public interface ITokenService
{
    Task<string> GenerateTokenAsync(User user);
}