import { Car } from '../types/car';
import { SignupFormData, AdminLoginData } from '../types/auth';

const API_BASE_URL = '/api';

const INITIAL_CARS: Car[] = [
  {
    id: '1',
    model: 'Nexon EV',
    manufacturer: 'Tata Motors',
    category: 'Electric',
    quantity: 6,
    price: 1449000,
    year: 2024,
    marketShare: 24.5,
    monthlySales: 3850,
  },
  {
    id: '2',
    model: 'Thar Roxx',
    manufacturer: 'Mahindra',
    category: 'SUV',
    quantity: 4,
    price: 1299000,
    year: 2024,
    marketShare: 18.2,
    monthlySales: 4200,
  },
  {
    id: '3',
    model: 'Creta',
    manufacturer: 'Hyundai',
    category: 'SUV',
    quantity: 12,
    price: 1099000,
    year: 2024,
    marketShare: 25.0,
    monthlySales: 16500,
  },
  {
    id: '4',
    model: 'Swift',
    manufacturer: 'Maruti Suzuki',
    category: 'Hatchback',
    quantity: 15,
    price: 649000,
    year: 2024,
    marketShare: 28.0,
    monthlySales: 18200,
  },
  {
    id: '5',
    model: 'XUV700',
    manufacturer: 'Mahindra',
    category: 'SUV',
    quantity: 5,
    price: 1399000,
    year: 2024,
    marketShare: 16.5,
    monthlySales: 6100,
  },
  {
    id: '6',
    model: 'Fortuner',
    manufacturer: 'Toyota',
    category: 'SUV',
    quantity: 3,
    price: 3343000,
    year: 2024,
    marketShare: 14.2,
    monthlySales: 3100,
  },
  {
    id: '7',
    model: 'Slavia',
    manufacturer: 'Skoda',
    category: 'Sedan',
    quantity: 8,
    price: 1163000,
    year: 2024,
    marketShare: 8.5,
    monthlySales: 1950,
  },
  {
    id: '8',
    model: '3 Series Gran Limousine',
    manufacturer: 'BMW',
    category: 'Luxury',
    quantity: 2,
    price: 6060000,
    year: 2024,
    marketShare: 6.0,
    monthlySales: 480,
  },
];

export const fetchCars = async (): Promise<Car[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cars`);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    localStorage.setItem('cars_data', JSON.stringify(data));
    return data;
  } catch {
    const stored = localStorage.getItem('cars_data');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('cars_data', JSON.stringify(INITIAL_CARS));
    return INITIAL_CARS;
  }
};

export const registerUser = async (data: SignupFormData): Promise<{ success: boolean; user?: unknown }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  } catch {
    console.log('Fallback posting to register:', data);
    return { success: true, user: { ...data, id: 'usr_' + Date.now() } };
  }
};

export const adminLoginApi = async (credentials: AdminLoginData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.ok;
  } catch {
    return Boolean(credentials.name && credentials.email && credentials.password && credentials.password.length >= 6);
  }
};

export const saveCarApi = async (car: Omit<Car, 'id'> & { id?: string }): Promise<Car> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });
    if (!response.ok) throw new Error('Failed to save car via API');
    const saved = await response.json();
    
    // Sync with local storage
    const existing = await fetchCars();
    const updated = car.id ? existing.map(c => c.id === car.id ? saved : c) : [...existing, saved];
    localStorage.setItem('cars_data', JSON.stringify(updated));
    return saved;
  } catch {
    const existing = await fetchCars();
    let updatedCars: Car[];
    let targetCar: Car;

    if (car.id) {
      targetCar = car as Car;
      updatedCars = existing.map((c) => (c.id === car.id ? targetCar : c));
    } else {
      targetCar = { ...car, id: 'car_' + Date.now(), marketShare: car.marketShare || 5.0, monthlySales: car.monthlySales || 100 };
      updatedCars = [...existing, targetCar];
    }
    localStorage.setItem('cars_data', JSON.stringify(updatedCars));
    return targetCar;
  }
};

export const deleteCarApi = async (carId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete car via API');
  } catch {
    // Fallback
  }
  const existing = await fetchCars();
  const filtered = existing.filter((c) => c.id !== carId);
  localStorage.setItem('cars_data', JSON.stringify(filtered));
  return true;
};
