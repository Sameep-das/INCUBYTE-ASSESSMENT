export const CAR_CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Coupe', 'Wagon', 'Van', 'Jeep', 'Muv'] as const;

export type CarCategory = typeof CAR_CATEGORIES[number];

export interface Car {
  id: string;
  model: string;
  manufacturer: string;
  category: CarCategory;
  quantity: number;
  price: number;
  year: number;
  imageUrl?: string;
  marketShare: number; // For admin analytics chart (%)
  monthlySales: number; // Units sold this month
}

export interface FilterState {
  search: string;
  category: string;
  manufacturer: string;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'year-desc' | 'popularity';
}
