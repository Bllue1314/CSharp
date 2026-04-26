import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { lazy, Suspense } from 'react';
import Spinner from './components/ui/Spinner';

// Lazy load all pages
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/auth/RegisterPage'));
const HomePage         = lazy(() => import('./pages/HomePage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const FriendsPage      = lazy(() => import('./pages/FriendsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SearchPage       = lazy(() => import('./pages/SearchPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/"              element={<HomePage />} />
            <Route path="/profile/:id"   element={<ProfilePage />} />
            <Route path="/friends"       element={<FriendsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/search"        element={<SearchPage />} />
            <Route path="/stories" element={<StoriesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  </BrowserRouter>
);

export default App;