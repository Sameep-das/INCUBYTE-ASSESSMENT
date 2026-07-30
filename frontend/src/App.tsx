import React, { useState, useEffect } from 'react';
import { Car } from './types/car';
import { fetchCars } from './services/api';
import { useBookmarks } from './hooks/useBookmarks';
import { HomePage } from './pages/HomePage';
import { CarsPage } from './pages/CarsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const { bookmarkedCars, toggleBookmark, isBookmarked } = useBookmarks();

  const loadCarsData = async () => {
    const data = await fetchCars();
    setCars(data);
  };

  useEffect(() => {
    loadCarsData();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isAdminPath =
    currentPath === '/api/admin' ||
    currentPath === '/api/admin/' ||
    currentPath === '/admin' ||
    currentPath === '/admin/' ||
    currentPath === '/admin/login';

  if (isAdminPath) {
    return (
      <AdminLoginPage
        onSuccess={() => navigateTo('/admin/dashboard')}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  if (currentPath === '/admin/dashboard') {
    return (
      <AdminDashboardPage
        cars={cars}
        onRefresh={loadCarsData}
        onLogout={() => navigateTo('/')}
      />
    );
  }

  if (currentPath === '/cars') {
    return (
      <CarsPage
        cars={cars}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        bookmarkCount={bookmarkedCars.length}
        onNavigate={(tab) => navigateTo(tab === 'home' ? '/' : tab.startsWith('/') ? tab : `/${tab}`)}
      />
    );
  }

  if (currentPath === '/bookmarks') {
    return (
      <BookmarksPage
        bookmarkedCars={bookmarkedCars}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        onNavigate={(tab) => navigateTo(tab === 'home' ? '/' : tab.startsWith('/') ? tab : `/${tab}`)}
      />
    );
  }

  return (
    <HomePage
      onViewCars={() => navigateTo('/cars')}
    />
  );
};

export default App;
