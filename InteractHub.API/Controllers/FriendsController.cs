using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InteractHub.API.DTOs;
using InteractHub.API.Services.Interfaces;
using InteractHub.API.Helpers;
namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/friends")]
[Authorize]
[Produces("application/json")]
public class FriendsController : ControllerBase
{
    private readonly IFriendsService _friendsService;

    public FriendsController(IFriendsService friendsService)
    {
        _friendsService = friendsService;
    }

    /// <summary>Get current user's friend list</summary>
    [HttpGet]
    public async Task<IActionResult> GetFriends()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var friends = await _friendsService.GetFriendsAsync(userId);
        return Ok(ApiResponse<List<UserResponseDto>>.Ok(friends));
    }

    /// <summary>Get pending friend requests</summary>
    [HttpGet("requests")]
    public async Task<IActionResult> GetRequests()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var requests = await _friendsService.GetPendingRequestsAsync(userId);
        return Ok(ApiResponse<List<UserResponseDto>>.Ok(requests));
    }

    /// <summary>Send a friend request</summary>
    [HttpPost("{targetUserId}")]
    public async Task<IActionResult> SendRequest(string targetUserId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var success = await _friendsService.SendRequestAsync(userId, targetUserId);
        if (!success)
            return BadRequest(ApiResponse<object>.Fail("Could not send friend request"));

        return Ok(ApiResponse<object>.Ok(null, "Friend request sent"));
    }

    /// <summary>Accept a friend request</summary>
    [HttpPut("{friendshipId}/accept")]
    public async Task<IActionResult> AcceptRequest(int friendshipId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var success = await _friendsService.AcceptRequestAsync(friendshipId, userId);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("Request not found"));

        return Ok(ApiResponse<object>.Ok(null, "Friend request accepted"));
    }

    /// <summary>Reject or remove a friend</summary>
    [HttpDelete("{friendshipId}")]
    public async Task<IActionResult> RemoveFriend(int friendshipId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var success = await _friendsService.RemoveAsync(friendshipId, userId);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("Friendship not found"));

        return Ok(ApiResponse<object>.Ok(null, "Removed successfully"));
    }
}