import { z } from 'zod';
import { CAR_CATEGORIES } from './car';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
] as const;

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must be less than 20 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Use uppercase, lowercase, number, and special character',
    ),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{10}$/.test(val), {
      message: 'Phone number must be 10 digits',
    }),
  city: z.string().min(2, 'City name is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  state: z.string().min(1, 'Please select a state'),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const userLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(20, 'Password must be less than 20 characters'),
});

export type UserLoginData = z.infer<typeof userLoginSchema>;

export const adminLoginSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;

export const carFormSchema = z.object({
  model: z.string().min(1, 'Model name is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  category: z.enum(CAR_CATEGORIES),
  quantity: z.number().min(0, 'Quantity must be at least 0'),
  price: z.number().min(100, 'Price must be realistic'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
});

export type CarFormData = z.infer<typeof carFormSchema>;
