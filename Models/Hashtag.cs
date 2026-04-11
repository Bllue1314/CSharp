using System;
public class Hashtag
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Tag { get; set; } = string.Empty; // e.g. "dotnet"

    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
}

// Models/PostHashtag.cs  (explicit join entity)
public class PostHashtag
{
    public int PostId { get; set; }
    public int HashtagId { get; set; }

    public Post Post { get; set; } = null!;
    public Hashtag Hashtag { get; set; } = null!;
}