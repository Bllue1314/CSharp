import { useState, useEffect } from 'react';
import { getFeed } from '../services/postsService';

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

export const usePosts = () => {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);

  const loadPosts = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const res = await getFeed(pageNum);
      if (pageNum === 1) {
        setPosts(res.data);
      } else {
        setPosts(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === 10);
    } catch {
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPosts(1); }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const addPost  = (post: Post) => setPosts(prev => [post, ...prev]);
  const removePost = (id: number) => setPosts(prev => prev.filter(p => p.id !== id));

  return { posts, isLoading, error, hasMore, loadMore, addPost, removePost };
};