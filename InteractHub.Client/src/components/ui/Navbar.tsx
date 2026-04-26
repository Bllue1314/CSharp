import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import Avatar from './Avatar';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount }         = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-blue-500 font-bold text-xl">
          InteractHub
        </Link>

        {/* Search — hidden on mobile */}
        <div className="hidden md:block flex-1 mx-8">
          <SearchBar />
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-blue-500 text-sm font-medium">
            Home
          </Link>
          <Link to="/friends" className="text-gray-600 hover:text-blue-500 text-sm font-medium">
            Friends
          </Link>

          {/* Notifications with unread badge */}
          <Link to="/notifications"
            className="text-gray-600 hover:text-blue-500 text-sm font-medium relative">
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link to={`/profile/${user?.userId}`}>
            <Avatar src={user?.avatarUrl} username={user?.username ?? 'U'} size="sm" />
          </Link>
          <button onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600">
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3">
          <SearchBar />
          <Link to="/" onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-500 font-medium">
            Home
          </Link>
          <Link to="/friends" onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-500 font-medium">
            Friends
          </Link>
          <Link to="/notifications" onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-500 font-medium relative">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link to={`/profile/${user?.userId}`} onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-500 font-medium">
            Profile
          </Link>
          <button onClick={handleLogout} className="text-red-400 text-left font-medium">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;