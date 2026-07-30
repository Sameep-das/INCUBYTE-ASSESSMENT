import React, { useState, useEffect } from 'react';
import { Car, CarCategory } from './types/car';
import { fetchAdminCars, fetchAdminDashboardStats, fetchCarFilterOptions, fetchCars, logoutAdmin, purchaseCarApi } from './services/api';
import { useBookmarks } from './hooks/useBookmarks';
import { HomePage } from './pages/HomePage';
import { CarsPage } from './pages/CarsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ErrorToastHost } from './components/common/ErrorToastHost';
import { showErrorToast } from './services/errorToast';

export const App: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ categories: CarCategory[]; manufacturers: string[] }>({
    categories: [],
    manufacturers: [],
  });
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const { bookmarkedCars, toggleBookmark, isBookmarked } = useBookmarks();

  const loadCarsData = async () => {
    try {
      const [data, options] = await Promise.all([fetchCars(), fetchCarFilterOptions()]);
      setCars(data);
      setFilterOptions(options);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to load cars');
      setCars([]);
    }
  };

  const refreshAdminDashboard = async () => {
    try {
      const stats = await fetchAdminDashboardStats();
      const data = await fetchAdminCars(stats);
      setCars(data);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to load admin dashboard');
      setCars([]);
    }
  };

  const handlePurchase = async (car: Car) => {
    try {
      await purchaseCarApi(car.id);
      alert(`Purchased ${car.manufacturer} ${car.model} successfully!`);
      await loadCarsData();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to purchase vehicle');
    }
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
      <>
        <ErrorToastHost />
        <AdminLoginPage
          onSuccess={() => navigateTo('/admin/dashboard')}
          onBackToHome={() => navigateTo('/')}
        />
      </>
    );
  }

  if (currentPath === '/admin/dashboard') {
    return (
      <>
        <ErrorToastHost />
        <AdminDashboardPage
          cars={cars}
          onRefresh={refreshAdminDashboard}
          onLogout={() => {
            logoutAdmin();
            navigateTo('/');
          }}
        />
      </>
    );
  }

  if (currentPath === '/cars') {
    return (
      <>
        <ErrorToastHost />
        <CarsPage
          cars={cars}
          categories={filterOptions.categories}
          manufacturers={filterOptions.manufacturers}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          onPurchase={handlePurchase}
          bookmarkCount={bookmarkedCars.length}
          onNavigate={(tab) => navigateTo(tab === 'home' ? '/' : tab.startsWith('/') ? tab : `/${tab}`)}
        />
      </>
    );
  }

  if (currentPath === '/bookmarks') {
    return (
      <>
        <ErrorToastHost />
        <BookmarksPage
          bookmarkedCars={bookmarkedCars}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          onPurchase={handlePurchase}
          onNavigate={(tab) => navigateTo(tab === 'home' ? '/' : tab.startsWith('/') ? tab : `/${tab}`)}
        />
      </>
    );
  }

  return (
    <>
      <ErrorToastHost />
      <HomePage
        onViewCars={() => navigateTo('/cars')}
      />
    </>
  );
};

export default App;
