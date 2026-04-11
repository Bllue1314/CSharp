namespace InteractHub.API.Services.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadAsync(IFormFile file, string folder);
    Task DeleteAsync(string fileUrl);
}