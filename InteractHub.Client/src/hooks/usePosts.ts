import { useState, useEffect, useRef } from 'react';
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

// Simple module-level cache
const postsCache = new Map<number, Post[]>();

export const usePosts = () => {
  const [posts, setPosts]         = useState<Post[]>(postsCache.get(1) ?? []);
  const [isLoading, setIsLoading] = useState(postsCache.size === 0);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const isFetching                = useRef(false);

  const loadPosts = async (pageNum = 1) => {
    if (isFetching.current) return;

    // Return cached data if available
    if (pageNum === 1 && postsCache.has(1)) {
      setPosts(postsCache.get(1)!);
      setIsLoading(false);
      return;
    }

    try {
      isFetching.current = true;
      setIsLoading(true);
      const res = await getFeed(pageNum);

      if (pageNum === 1) {
        postsCache.set(1, res.data);  // cache first page
        setPosts(res.data);
      } else {
        setPosts(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === 10);
    } catch {
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => { loadPosts(1); }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const addPost = (post: Post) => {
    postsCache.delete(1); // invalidate cache
    setPosts(prev => [post, ...prev]);
  };

  const removePost = (id: number) => {
    postsCache.delete(1); // invalidate cache
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return { posts, isLoading, error, hasMore, loadMore, addPost, removePost };
};