import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';

const MainLayout = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Outlet />
    </main>
  </div>
);

export default MainLayout;