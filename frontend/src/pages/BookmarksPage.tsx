import React from 'react';
import { Car } from '../types/car';
import { CarCard } from '../components/cars/CarCard';
import { Navbar } from '../components/common/Navbar';
import { UserSession } from '../services/api';

interface BookmarksPageProps {
  bookmarkedCars: Car[];
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (car: Car) => void;
  onPurchase: (car: Car) => void;
  onNavigate: (tab: string) => void;
  user: UserSession | null;
  onLogout: () => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  bookmarkedCars,
  isBookmarked,
  onToggleBookmark,
  onPurchase,
  onNavigate,
  user,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab="bookmarks" onNavigate={onNavigate} bookmarkCount={bookmarkedCars.length} user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bookmarked Vehicles ({bookmarkedCars.length})
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Your saved vehicles for quick reference</p>
          </div>
        </div>

        {bookmarkedCars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 mt-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Bookmarks Yet</h3>
            <p className="text-xs text-gray-500 mb-6">Explore the vehicle catalogue and bookmark your favorite models.</p>
            <button
              onClick={() => onNavigate('cars')}
              className="px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-rose-600 transition-all cursor-pointer"
            >
              Explore Vehicles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isBookmarked={isBookmarked(car.id)}
                onToggleBookmark={onToggleBookmark}
                onPurchase={onPurchase}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
