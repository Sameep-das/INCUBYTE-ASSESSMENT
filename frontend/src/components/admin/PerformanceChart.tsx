import React from 'react';
import { Car } from '../../types/car';
import { DashboardStats } from '../../services/api';

interface ChartProps {
  cars: Car[];
  stats: DashboardStats;
}

export const PerformanceChart: React.FC<ChartProps> = ({ cars, stats }) => {
  const manufacturerSales = stats.salesByMake
    .filter((item) => item.ordersCount > 0)
    .sort((a, b) => b.ordersCount - a.ordersCount);
  const topModels = stats.topModels
    .filter((item) => item.ordersCount > 0)
    .sort((a, b) => b.ordersCount - a.ordersCount)
    .slice(0, 10);
  const maxMakeSales = Math.max(...manufacturerSales.map((item) => item.ordersCount), 1);
  const maxModelSales = Math.max(...topModels.map((item) => item.ordersCount), 1);
  const totalSales = stats.salesByMake.reduce((total, item) => total + item.ordersCount, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sales Performance</h2>
          <p className="text-xs text-gray-500">Manufacturer demand and top 10 model sales from completed purchases</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full">
          {totalSales} Units Sold
        </span>
      </div>

      {totalSales === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-2xl py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">No completed sales yet</p>
          <p className="text-xs text-gray-500 mt-1">Purchases will appear here as soon as customers buy vehicles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Manufacturer vs Sales</h3>
              <span className="text-[11px] font-semibold text-gray-500">{manufacturerSales.length} makes</span>
            </div>

            <div className="space-y-3">
              {manufacturerSales.map((item) => {
                const percentage = Math.max(Math.round((item.ordersCount / maxMakeSales) * 100), 4);

                return (
                  <div key={item.make}>
                    <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                      <span>{item.make}</span>
                      <span>{item.ordersCount} sold</span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Sales vs Models</h3>
              <span className="text-[11px] font-semibold text-gray-500">Top {topModels.length || Math.min(cars.length, 10)}</span>
            </div>

            <div className="h-64 border-l border-b border-gray-200 flex items-end gap-3 px-2 pt-4">
              {topModels.map((item) => {
                const matchingCar = cars.find((car) => car.model === item.model);
                const height = Math.max((item.ordersCount / maxModelSales) * 100, 8);

                return (
                  <div key={item.model} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">{item.ordersCount}</span>
                    <div
                      className="w-full max-w-12 bg-indigo-600 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                      title={`${matchingCar?.manufacturer ? `${matchingCar.manufacturer} ` : ''}${item.model}: ${item.ordersCount} sold`}
                    />
                    <span className="h-10 text-[10px] leading-tight text-gray-500 text-center line-clamp-2">
                      {item.model}
                    </span>
                  </div>
                );
              })}
              {topModels.length === 0 && (
                <div className="w-full self-center text-center text-xs text-gray-500">
                  Top models will appear after purchases.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
