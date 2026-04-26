import { usePosts } from '../../hooks/usePosts';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

const PostFeed = () => {
  const { posts, isLoading, error, hasMore, loadMore, addPost, removePost } = usePosts();

  return (
    <div className="flex flex-col gap-4">
      <CreatePostForm onPostCreated={addPost} />

      {error && <p className="text-red-500 text-center">{error}</p>}

      {posts.map(post => (
        <PostCard key={post.id} post={post} onDelete={removePost} />
      ))}

      {isLoading && <Spinner />}

      {!isLoading && hasMore && (
        <Button variant="secondary" onClick={loadMore} className="w-full">
          Load More
        </Button>
      )}

      {!isLoading && posts.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No posts yet. Be the first to post!
        </p>
      )}
    </div>
  );
};

export default PostFeed;