export type CarCategory = 'Sedan' | 'SUV' | 'Hatchback' | 'Electric' | 'Sports' | 'Luxury';

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
