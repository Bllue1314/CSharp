import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TrendingHashtags = () => {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/posts/trending');
        setHashtags(res.data.data ?? []);
      } catch {
        console.error('Failed to load trending');
      }
    };
    load();
  }, []);

  if (hashtags.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-bold text-gray-800 mb-3">🔥 Trending</h2>
      <div className="flex flex-col gap-2">
        {hashtags.map(tag => (
          <button key={tag}
            onClick={() => navigate(`/search?q=${tag}`)}
            className="text-left text-blue-500 hover:text-blue-600 text-sm font-medium">
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingHashtags;