import React, { useState, useEffect } from 'react';
import { Car, CarCategory } from './types/car';
import {
  DashboardStats,
  fetchAdminCars,
  fetchAdminDashboardStats,
  fetchCarFilterOptions,
  fetchCars,
  getStoredUser,
  logoutAdmin,
  logoutUser,
  purchaseCarApi,
  UserSession,
} from './services/api';
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
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({ salesByMake: [], topModels: [] });
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => getStoredUser());
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
      setDashboardStats(stats);
      setCars(data);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to load admin dashboard');
      setDashboardStats({ salesByMake: [], topModels: [] });
      setCars([]);
    }
  };

  const handlePurchase = async (car: Car) => {
    try {
      await purchaseCarApi(car.id);
      alert(`Purchased ${car.manufacturer} ${car.model} successfully!`);
      await loadCarsData();
      if (currentPath === '/admin/dashboard') {
        await refreshAdminDashboard();
      }
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to purchase vehicle');
    }
  };

  const handleUserLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to logout');
    } finally {
      setCurrentUser(null);
      navigateTo('/');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to logout admin');
    } finally {
      setDashboardStats({ salesByMake: [], topModels: [] });
      navigateTo('/');
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

  useEffect(() => {
    if (currentPath === '/admin/dashboard') {
      refreshAdminDashboard();
      return;
    }

    if (currentPath === '/cars' || currentPath === '/bookmarks' || currentPath === '/') {
      loadCarsData();
    }
  }, [currentPath]);

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
          stats={dashboardStats}
          onRefresh={refreshAdminDashboard}
          onLogout={handleAdminLogout}
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
          user={currentUser}
          onLogout={handleUserLogout}
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
          user={currentUser}
          onLogout={handleUserLogout}
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
        onAuthSuccess={(user) => setCurrentUser(user ?? getStoredUser())}
      />
    </>
  );
};

export default App;
