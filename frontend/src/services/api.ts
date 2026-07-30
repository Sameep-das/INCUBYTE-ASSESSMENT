import { AdminLoginData, SignupFormData } from '../types/auth';
import { Car, CarCategory } from '../types/car';

type BackendCarCategory =
  | 'SUV'
  | 'HATCHBACK'
  | 'SEDAN'
  | 'CONVERTIBLE'
  | 'COUPE'
  | 'WAGON'
  | 'VAN'
  | 'JEEP'
  | 'MUV';

interface BackendCar {
  carId: string;
  carModel: string;
  carMake: string;
  quantity: number;
  price: string;
  category: BackendCarCategory;
  yearOfManufacturing: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string | unknown[];
  data?: T;
  accessToken?: string;
  userName?: string;
  userEmail?: string;
}

export interface DashboardStats {
  salesByMake: Array<{
    make: string;
    ordersCount: number;
    totalRevenue: number;
  }>;
  topModels: Array<{
    model: string;
    ordersCount: number;
  }>;
}

interface FilterOptionsResponse {
  categories: BackendCarCategory[];
  makes: string[];
}

const ADMIN_TOKEN_KEY = 'admin_access_token';
const USER_TOKEN_KEY = 'user_access_token';
const DEFAULT_SIGNUP_PASSWORD = import.meta.env.VITE_DEFAULT_SIGNUP_PASSWORD || 'Password@123';

const categoryToDisplay: Record<BackendCarCategory, CarCategory> = {
  SUV: 'SUV',
  HATCHBACK: 'Hatchback',
  SEDAN: 'Sedan',
  CONVERTIBLE: 'Convertible',
  COUPE: 'Coupe',
  WAGON: 'Wagon',
  VAN: 'Van',
  JEEP: 'Jeep',
  MUV: 'Muv',
};

const categoryToBackend: Record<CarCategory, BackendCarCategory> = {
  SUV: 'SUV',
  Hatchback: 'HATCHBACK',
  Sedan: 'SEDAN',
  Convertible: 'CONVERTIBLE',
  Coupe: 'COUPE',
  Wagon: 'WAGON',
  Van: 'VAN',
  Jeep: 'JEEP',
  Muv: 'MUV',
};

const toNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeMessage = (message: unknown) => {
  if (Array.isArray(message)) {
    return message
      .map((item) => {
        if (item && typeof item === 'object' && 'message' in item) {
          return String((item as { message: unknown }).message);
        }
        return String(item);
      })
      .join(', ');
  }

  return typeof message === 'string' ? message : 'Request failed';
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    throw new Error(normalizeMessage(body.message));
  }

  return body;
};

const authHeaders = (token: string | null) => {
  if (!token) {
    throw new Error('Please sign up before purchasing a vehicle.');
  }

  return { Authorization: `Bearer ${token}` };
};

const adminHeaders = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) {
    throw new Error('Please sign in as admin first.');
  }

  return { Authorization: `Bearer ${token}` };
};

const mapCarFromBackend = (car: BackendCar, stats?: DashboardStats): Car => {
  const monthlySales = stats?.topModels.find((item) => item.model === car.carModel)?.ordersCount ?? 0;
  const makeSales = stats?.salesByMake.find((item) => item.make === car.carMake)?.ordersCount ?? 0;
  const totalMakeSales = stats?.salesByMake.reduce((total, item) => total + item.ordersCount, 0) ?? 0;

  return {
    id: car.carId,
    model: car.carModel,
    manufacturer: car.carMake,
    category: categoryToDisplay[car.category] ?? 'Sedan',
    quantity: car.quantity,
    price: toNumber(car.price),
    year: car.yearOfManufacturing ?? new Date().getFullYear(),
    marketShare: totalMakeSales > 0 ? Number(((makeSales / totalMakeSales) * 100).toFixed(1)) : 0,
    monthlySales,
  };
};

const mapCarToBackend = (car: Omit<Car, 'id'> & { id?: string }) => ({
  carModel: car.model,
  carMake: car.manufacturer,
  quantity: car.quantity,
  price: car.price,
  category: categoryToBackend[car.category],
  yearOfManufacturing: car.year,
});

export const fetchCars = async () => {
  const response = await request<BackendCar[]>('/api/cars');
  return (response.data ?? []).map((car) => mapCarFromBackend(car));
};

export const fetchAdminCars = async (stats?: DashboardStats) => {
  const response = await request<BackendCar[]>('/api/admin/cars', {
    headers: adminHeaders(),
  });
  return (response.data ?? []).map((car) => mapCarFromBackend(car, stats));
};

export const fetchCarFilterOptions = async () => {
  const response = await request<FilterOptionsResponse>('/api/cars/filters');
  return {
    categories: (response.data?.categories ?? []).map((category) => categoryToDisplay[category]),
    manufacturers: response.data?.makes ?? [],
  };
};

export const fetchAdminDashboardStats = async () => {
  const response = await request<DashboardStats>('/api/admin/stats/dashboard', {
    headers: adminHeaders(),
  });

  return response.data ?? { salesByMake: [], topModels: [] };
};

export const registerUser = async (data: SignupFormData) => {
  const response = await request<never>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: data.name,
      email: data.email,
      password: DEFAULT_SIGNUP_PASSWORD,
      city: data.city,
      pinCode: data.pincode,
      state: data.state,
      phone: data.phone,
    }),
  });

  if (response.accessToken) {
    localStorage.setItem(USER_TOKEN_KEY, response.accessToken);
  }

  return response;
};

export const adminLoginApi = async (data: AdminLoginData) => {
  const response = await request<{ accessToken: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const token = response.data?.accessToken;

  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return true;
  }

  return false;
};

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const saveCarApi = async (car: Omit<Car, 'id'> & { id?: string }) => {
  const payload = mapCarToBackend(car);
  const response = await request<BackendCar | { carId: string }>(
    car.id ? `/api/admin/cars/${car.id}` : '/api/admin/cars',
    {
      method: car.id ? 'PUT' : 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(payload),
    },
  );

  return response.data;
};

export const deleteCarApi = async (id: string) => {
  const response = await request<{ carId: string }>(`/api/admin/cars/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });

  return response.data;
};

export const purchaseCarApi = async (id: string) => {
  const response = await request(`/api/cars/${id}/purchase`, {
    method: 'POST',
    headers: authHeaders(localStorage.getItem(USER_TOKEN_KEY)),
  });

  return response.data;
};
