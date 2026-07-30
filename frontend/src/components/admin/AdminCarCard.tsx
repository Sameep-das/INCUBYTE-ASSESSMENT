import React from 'react';
import { Car } from '../../types/car';

interface AdminCarCardProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
}

export const AdminCarCard: React.FC<AdminCarCardProps> = ({ car, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-rose-600">
              {car.manufacturer}
            </span>
            <h3 className="text-lg font-bold text-slate-900">{car.model}</h3>
          </div>
          <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md">
            {car.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 my-4 bg-slate-50 p-3 rounded-xl">
          <div>Year: <strong className="text-gray-900">{car.year}</strong></div>
          <div>Stock: <strong className="text-gray-900">{car.quantity}</strong></div>
          <div>Price: <strong className="text-gray-900">₹{car.price.toLocaleString('en-IN')}</strong></div>
          <div>Share: <strong className="text-gray-900">{car.marketShare}%</strong></div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onEdit(car)}
          className="flex-1 py-2 text-xs font-semibold text-slate-700 border border-gray-300 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
        >
          Update
        </button>
        <button
          onClick={() => onDelete(car.id)}
          className="flex-1 py-2 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
