import React from 'react';
import { FilterState, CarCategory } from '../../types/car';

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  categories: CarCategory[];
  manufacturers: string[];
}

export const ZomatoFilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  categories,
  manufacturers,
}) => {
  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search model or brand..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        {/* Zomato Style Pills */}
        {/* Filter: In Stock Pill */}
        <button
          onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${' '}
            ${filters.inStockOnly ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
        >
          <span className={`w-2 h-2 rounded-full ${filters.inStockOnly ? 'bg-rose-500' : 'bg-gray-400'}`}></span>
          In Stock Only
        </button>

        {/* Category Pill Dropdown */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border appearance-none pr-8 cursor-pointer transition-all ${' '}
              ${filters.category ? 'bg-rose-50 border-rose-500 text-rose-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-500">▼</span>
        </div>

        {/* Manufacturer Dropdown */}
        <div className="relative">
          <select
            value={filters.manufacturer}
            onChange={(e) => onChange({ ...filters, manufacturer: e.target.value })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border appearance-none pr-8 cursor-pointer transition-all ${' '}
              ${filters.manufacturer ? 'bg-rose-50 border-rose-500 text-rose-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            <option value="">All Brands</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-500">▼</span>
        </div>

        {/* Sort Pill Dropdown */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 appearance-none pr-8 cursor-pointer transition-all"
          >
            <option value="popularity">Sort by: Market Share</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Latest Year</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-500">▼</span>
        </div>

        {/* Reset Filters */}
        {(filters.search || filters.category || filters.manufacturer || filters.inStockOnly) && (
          <button
            onClick={() => onChange({ search: '', category: '', manufacturer: '', maxPrice: 500000, inStockOnly: false, sortBy: 'popularity' })}
            className="text-xs text-rose-600 font-medium hover:underline ml-auto cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};
