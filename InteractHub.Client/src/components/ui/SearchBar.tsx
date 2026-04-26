import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect } from 'react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery    = useDebounce(query, 500);
  const navigate          = useNavigate();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`);
    }
  }, [debouncedQuery]);

  return (
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search users..."
      className="border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
    />
  );
};

export default SearchBar;