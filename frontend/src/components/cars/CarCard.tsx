import React from 'react';
import { Car } from '../../types/car';

interface CarCardProps {
  car: Car;
  isBookmarked: boolean;
  onToggleBookmark: (car: Car) => void;
  onPurchase: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isBookmarked,
  onToggleBookmark,
  onPurchase,
}) => {
  const isOutOfStock = car.quantity <= 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Bookmark Hover Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark(car);
        }}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 transform hover:scale-110 cursor-pointer ${' '}
          ${isBookmarked ? 'bg-rose-500 text-white opacity-100 shadow-md' : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 shadow-md hover:bg-white'}`}
        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Car'}
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      {/* Car Thumbnail Visual Placeholder */}
      <div className="h-44 bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-slate-800 opacity-90"></div>
        <div className="text-center z-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-400 block mb-1">
            {car.manufacturer}
          </span>
          <h3 className="text-xl font-bold text-white tracking-wide">{car.model}</h3>
        </div>
        <span className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10">
          {car.category}
        </span>
      </div>

      {/* Details Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
            <span>Manufacturing Year</span>
            <span className="text-gray-900 font-semibold">{car.year}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
            <span>Stock Available</span>
            <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isOutOfStock ? 'Out of Stock' : `${car.quantity} Units`}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
            <span className="text-xs text-gray-500">Price</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{car.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Purchase Action Button */}
        <button
          onClick={() => onPurchase(car)}
          disabled={isOutOfStock}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${' '}
            ${isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-slate-900 text-white hover:bg-rose-600 shadow-md hover:shadow-lg active:scale-98'}`}
        >
          {isOutOfStock ? 'Unavailable' : 'Purchase Vehicle'}
        </button>
      </div>
    </div>
  );
};
