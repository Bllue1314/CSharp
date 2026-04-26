import { useState } from 'react';
import { toggleLike, deletePost, getComments, addComment, sharePost, reportPost } from '../../services/postsService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import api from '../../services/api';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const { user }                        = useAuth();
  const [liked, setLiked]               = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount]       = useState(post.likeCount);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments]   = useState(false);
  const [newComment, setNewComment]     = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReport = async () => {
    const reason = prompt('Reason for report:\n1. Spam\n2. Harassment\n3. HateSpeech\n4. FakeNews\n5. Other\n\nEnter reason:');
        if (!reason) return;
        try {
            await reportPost(post.id, reason);
            setReported(true);
            alert('Post reported successfully');
        } catch {
            console.error('Failed to report');
        }
    };

    const handleShare = async () => {
        if (!confirm('Share this post to your feed?')) return;
        try {
            setSharing(true);
            await sharePost(post.content);
            alert('Post shared!');
        } catch {
            console.error('Failed to share');
        } finally {
            setSharing(false);
        }
    };

  const handleLike = async () => {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    try {
      await toggleLike(post.id);
    } catch {
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      onDelete(post.id);
    } catch {
      console.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && !commentsLoaded) {
      try {
        setLoadingComments(true);
        const res = await getComments(post.id);
        setComments(res.data);
        setCommentCount(res.data.length);
        setCommentsLoaded(true);
      } catch {
        console.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(prev => !prev);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await addComment(post.id, newComment);
      setComments(prev => [...prev, res.data]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
    } catch {
      console.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={post.avatarUrl} username={post.username} />
          <div>
            <p className="font-semibold text-gray-800">{post.displayName}</p>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {user?.userId === post.userId && (
          <button onClick={handleDelete} disabled={isDeleting}
            className="text-red-400 hover:text-red-600 text-sm">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-700">{post.content}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post"
          className="rounded-lg max-h-96 object-cover w-full" />
      )}

      {/* Actions */}
      <div className="flex gap-4 text-sm text-gray-500 border-t pt-2">
        <button onClick={handleLike}
          className={`flex items-center gap-1 hover:text-blue-500 transition-colors
            ${liked ? 'text-blue-500 font-semibold' : ''}`}>
          {liked ? '❤️' : '🤍'} {likeCount} Likes
        </button>
        <button onClick={handleToggleComments}
          className="flex items-center gap-1 hover:text-blue-500 transition-colors">
          💬 {commentCount} Comments
        </button>
        <button onClick={handleShare} disabled={sharing}
            className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            🔁 {sharing ? 'Sharing...' : 'Share'}
        </button>
        {!reported && user?.userId !== post.userId && (
            <button onClick={handleReport}
                className="flex items-center gap-1 hover:text-red-500 transition-colors ml-auto">
                🚩 Report
            </button>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="flex flex-col gap-3 border-t pt-3">
          {/* Comment input */}
          <div className="flex gap-2">
            <Avatar src={user?.avatarUrl} username={user?.username ?? 'U'} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment || !newComment.trim()}
                className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm disabled:opacity-50">
                {submittingComment ? '...' : 'Send'}
              </button>
            </div>
          </div>

          {/* Comments list */}
          {loadingComments && (
            <p className="text-center text-gray-400 text-sm">Loading comments...</p>
          )}

          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2">
              <Avatar src={comment.avatarUrl} username={comment.username} size="sm" />
              <div className="bg-gray-100 rounded-xl px-3 py-2 flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-700">{comment.username}</p>
                  {user?.userId === comment.userId && (
                    <button
                      onClick={async () => {
                        try {
                          console.log('Deleting comment:', comment.id, 'from post:', post.id);
                          const res = await api.delete(`/posts/${post.id}/comments/${comment.id}`);
                          console.log('Delete response:', res.status);
                          setComments(prev => prev.filter(c => c.id !== comment.id));
                          setCommentCount(prev => prev - 1);
                        } catch (err: any) {
                          console.error('Failed to delete comment:',
                            err.response?.status,
                            err.response?.data);
                        }
                      }}
                      className="text-red-400 hover:text-red-600 text-xs">
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
            </div>
          ))}

          {!loadingComments && comments.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              No comments yet. Be the first!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;