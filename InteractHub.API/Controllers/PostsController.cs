using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InteractHub.API.DTOs;
using InteractHub.API.Services.Interfaces;
using InteractHub.API.Helpers;
namespace InteractHub.API.Controllers;

// Controllers/PostsController.cs
[ApiController]
[Route("api/posts")]
[Authorize]
[Produces("application/json")]
public class PostsController : ControllerBase
{
    private readonly IPostsService _postsService;

    public PostsController(IPostsService postsService)
    {
        _postsService = postsService;
    }

    /// <summary>Get paginated post feed</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PostResponseDto>>), 200)]
    public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var posts = await _postsService.GetFeedAsync(userId, page, pageSize);
        return Ok(ApiResponse<List<PostResponseDto>>.Ok(posts));
    }

    /// <summary>Get a single post by ID</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PostResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<PostResponseDto>), 404)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var post = await _postsService.GetByIdAsync(id, userId);
        if (post == null)
            return NotFound(ApiResponse<PostResponseDto>.Fail("Post not found"));

        return Ok(ApiResponse<PostResponseDto>.Ok(post));
    }

    /// <summary>Create a new post</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PostResponseDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<PostResponseDto>), 400)]
    public async Task<IActionResult> Create([FromForm] CreatePostRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PostResponseDto>.Fail(
                ModelState.Values.SelectMany(v => v.Errors)
                                 .Select(e => e.ErrorMessage).ToList()));

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var post = await _postsService.CreateAsync(dto, userId);
        return StatusCode(201, ApiResponse<PostResponseDto>.Ok(post, "Post created"));
    }

    /// <summary>Update an existing post</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PostResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<PostResponseDto>), 403)]
    [ProducesResponseType(typeof(ApiResponse<PostResponseDto>), 404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePostRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _postsService.UpdateAsync(id, dto, userId);
        if (result == null)
            return NotFound(ApiResponse<PostResponseDto>.Fail("Post not found"));

        return Ok(ApiResponse<PostResponseDto>.Ok(result, "Post updated"));
    }

    /// <summary>Delete a post</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var success = await _postsService.DeleteAsync(id, userId);
        if (!success)
            return NotFound(ApiResponse<object>.Fail("Post not found"));

        return Ok(ApiResponse<object>.Ok(null, "Post deleted"));
    }

    /// <summary>Like or unlike a post</summary>
    [HttpPost("{id}/like")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> ToggleLike(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var liked = await _postsService.ToggleLikeAsync(id, userId);
        return Ok(ApiResponse<object>.Ok(null, liked ? "Post liked" : "Post unliked"));
    }

    /// <summary>Get comments for a post</summary>
    [HttpGet("{id}/comments")]
    [ProducesResponseType(typeof(ApiResponse<List<CommentResponseDto>>), 200)]
    public async Task<IActionResult> GetComments(int id)
    {
        var comments = await _postsService.GetCommentsAsync(id);
        return Ok(ApiResponse<List<CommentResponseDto>>.Ok(comments));
    }

    /// <summary>Add a comment to a post</summary>
    [HttpPost("{id}/comments")]
    [ProducesResponseType(typeof(ApiResponse<CommentResponseDto>), 201)]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<CommentResponseDto>.Fail(
                ModelState.Values.SelectMany(v => v.Errors)
                                 .Select(e => e.ErrorMessage).ToList()));

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var comment = await _postsService.AddCommentAsync(id, dto, userId);
        return StatusCode(201, ApiResponse<CommentResponseDto>.Ok(comment, "Comment added"));
    }
}