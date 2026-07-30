import React from 'react';
import { Car } from '../../types/car';

interface ChartProps {
  cars: Car[];
}

export const PerformanceChart: React.FC<ChartProps> = ({ cars }) => {
  const maxSales = Math.max(...cars.map((c) => c.monthlySales || 100), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Market Performance & Demand</h2>
          <p className="text-xs text-gray-500">Units sold and current market dominance per model</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full">
          Live Data
        </span>
      </div>

      <div className="space-y-4">
        {cars.map((car) => {
          const percentage = Math.round((car.monthlySales / maxSales) * 100);
          return (
            <div key={car.id} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-700">
                <span>{car.manufacturer} {car.model}</span>
                <span>{car.monthlySales} units sold ({car.marketShare}% share)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
