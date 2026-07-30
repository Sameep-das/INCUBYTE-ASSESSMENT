import React, { useState, useMemo } from 'react';
import { Car, FilterState, CarCategory } from '../types/car';
import { CarCard } from '../components/cars/CarCard';
import { ZomatoFilterBar } from '../components/cars/ZomatoFilterBar';
import { Navbar } from '../components/common/Navbar';
import { UserSession } from '../services/api';

interface CarsPageProps {
  cars: Car[];
  categories: CarCategory[];
  manufacturers: string[];
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (car: Car) => void;
  onPurchase: (car: Car) => void;
  bookmarkCount: number;
  onNavigate: (tab: string) => void;
  user: UserSession | null;
  onLogout: () => void;
}

export const CarsPage: React.FC<CarsPageProps> = ({
  cars,
  categories,
  manufacturers,
  isBookmarked,
  onToggleBookmark,
  onPurchase,
  bookmarkCount,
  onNavigate,
  user,
  onLogout,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    manufacturer: '',
    maxPrice: 500000,
    inStockOnly: false,
    sortBy: 'popularity',
  });

  const filteredCars = useMemo(() => {
    return cars
      .filter((car) => {
        const matchesSearch = car.model.toLowerCase().includes(filters.search.toLowerCase()) ||
                              car.manufacturer.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = !filters.category || car.category === filters.category;
        const matchesManufacturer = !filters.manufacturer || car.manufacturer === filters.manufacturer;
        const matchesStock = !filters.inStockOnly || car.quantity > 0;
        return matchesSearch && matchesCategory && matchesManufacturer && matchesStock;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'year-desc') return b.year - a.year;
        return (b.marketShare || 0) - (a.marketShare || 0);
      });
  }, [cars, filters]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab="cars" onNavigate={onNavigate} bookmarkCount={bookmarkCount} user={user} onLogout={onLogout} />
      <ZomatoFilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        manufacturers={manufacturers}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Available Inventory ({filteredCars.length})
          </h1>
        </div>

        {filteredCars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 mt-4">
            <p className="text-gray-500 font-medium text-base">No cars match your selected filters.</p>
            <button
              onClick={() => setFilters({ search: '', category: '', manufacturer: '', maxPrice: 500000, inStockOnly: false, sortBy: 'popularity' })}
              className="mt-3 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
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
