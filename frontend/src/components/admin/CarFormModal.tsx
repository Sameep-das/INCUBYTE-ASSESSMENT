import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carFormSchema, CarFormData } from '../../types/auth';
import { Car } from '../../types/car';

interface CarFormModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (carData: Omit<Car, 'id'> & { id?: string }) => Promise<void>;
}

export const CarFormModal: React.FC<CarFormModalProps> = ({ car, isOpen, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      model: '',
      manufacturer: '',
      category: 'Sedan',
      quantity: 5,
      price: 1200000,
      year: new Date().getFullYear(),
      marketShare: 10,
      monthlySales: 100,
    },
  });

  useEffect(() => {
    if (car) {
      reset({
        model: car.model,
        manufacturer: car.manufacturer,
        category: car.category,
        quantity: car.quantity,
        price: car.price,
        year: car.year,
        marketShare: car.marketShare || 10,
        monthlySales: car.monthlySales || 100,
      });
    } else {
      reset({
        model: '',
        manufacturer: '',
        category: 'Sedan',
        quantity: 5,
        price: 1200000,
        year: new Date().getFullYear(),
        marketShare: 10,
        monthlySales: 100,
      });
    }
  }, [car, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: CarFormData) => {
    await onSave({
      ...(car ? { id: car.id } : {}),
      ...data,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
          {car ? 'Update Vehicle' : 'Add New Vehicle'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {car ? 'Modify details for existing vehicle entry' : 'Add a new vehicle to dealership inventory'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Manufacturer</label>
              <input
                {...register('manufacturer')}
                placeholder="e.g. Porsche"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {errors.manufacturer && <p className="text-xs text-rose-500 mt-1">{errors.manufacturer.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Model Name</label>
              <input
                {...register('model')}
                placeholder="e.g. 911 GT3"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {errors.model && <p className="text-xs text-rose-500 mt-1">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Electric">Electric</option>
                <option value="Sports">Sports</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Year</label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {errors.year && <p className="text-xs text-rose-500 mt-1">{errors.year.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price (₹)</label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stock Quantity</label>
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Market Share (%)</label>
              <input
                type="number"
                step="0.1"
                {...register('marketShare', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Monthly Sales</label>
              <input
                type="number"
                {...register('monthlySales', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/25 mt-4 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : car ? 'Update Vehicle' : 'Save Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
};
