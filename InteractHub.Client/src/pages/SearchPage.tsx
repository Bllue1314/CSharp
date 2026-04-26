import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import FriendCard from '../components/friends/FriendCard';
import Spinner from '../components/ui/Spinner';

interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

const SearchPage = () => {
  const [searchParams]            = useSearchParams();
  const query                     = searchParams.get('q') ?? '';
  const [results, setResults]     = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const search = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data);
      } catch {
        console.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    };
    search();
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-800">
        Search results for "{query}"
      </h1>
      {isLoading && <Spinner />}
      {!isLoading && results.length === 0 && query && (
        <p className="text-center text-gray-500">No users found</p>
      )}
      <div className="flex flex-col gap-3">
        {results.map(user => (
          <FriendCard key={user.id} user={user} showAddButton />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;