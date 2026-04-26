import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import TrendingHashtags from '../components/ui/TrendingHashtags';

const MainLayout = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <TrendingHashtags />
      </aside>
    </div>
  </div>
);

export default MainLayout;