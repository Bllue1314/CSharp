import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import TrendingHashtags from '../components/ui/TrendingHashtags';

const MainLayout = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Left spacer — only on large screens */}
        <div className="hidden lg:block w-64 flex-shrink-0" />

        {/* Main content — always centered */}
        <main className="flex-1 max-w-2xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <TrendingHashtags />
        </aside>
      </div>
    </div>
  </div>
);

export default MainLayout;