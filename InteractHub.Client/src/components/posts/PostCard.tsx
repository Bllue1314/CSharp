import { useState } from 'react';
import { toggleLike, deletePost } from '../../services/postsService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

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

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const { user }                    = useAuth();
  const [liked, setLiked]           = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount]   = useState(post.likeCount);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    try {
      await toggleLike(post.id);
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch {
      console.error('Failed to toggle like');
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

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
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

      <p className="text-gray-700">{post.content}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post"
          className="rounded-lg max-h-96 object-cover w-full" />
      )}

      <div className="flex gap-4 text-sm text-gray-500 border-t pt-2">
        <button onClick={handleLike}
          className={`flex items-center gap-1 hover:text-blue-500 transition-colors
            ${liked ? 'text-blue-500 font-semibold' : ''}`}>
          {liked ? '❤️' : '🤍'} {likeCount} Likes
        </button>
        <span>💬 {post.commentCount} Comments</span>
      </div>
    </div>
  );
};

export default PostCard;