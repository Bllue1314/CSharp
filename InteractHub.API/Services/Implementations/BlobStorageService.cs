namespace InteractHub.API.Services.Implementations;

using Azure.Storage.Blobs;
using InteractHub.API.Services.Interfaces;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public BlobStorageService(IConfiguration config)
    {
        _blobServiceClient = new BlobServiceClient(
            config["AzureBlobStorage:ConnectionString"]);
        _containerName = config["AzureBlobStorage:ContainerName"]!;
    }

    public async Task<string> UploadAsync(IFormFile file, string folder)
    {
        var container = _blobServiceClient.GetBlobContainerClient(_containerName);
        await container.CreateIfNotExistsAsync();

        // Generate unique filename
        var extension = Path.GetExtension(file.FileName);
        var fileName  = $"{folder}/{Guid.NewGuid()}{extension}";
        var blob      = container.GetBlobClient(fileName);

        using var stream = file.OpenReadStream();
        await blob.UploadAsync(stream, overwrite: true);

        return blob.Uri.ToString();
    }

    public async Task DeleteAsync(string fileUrl)
    {
        var uri      = new Uri(fileUrl);
        var fileName = uri.AbsolutePath.TrimStart('/').Replace($"{_containerName}/", "");
        var blob     = _blobServiceClient
                            .GetBlobContainerClient(_containerName)
                            .GetBlobClient(fileName);

        await blob.DeleteIfExistsAsync();
    }
}