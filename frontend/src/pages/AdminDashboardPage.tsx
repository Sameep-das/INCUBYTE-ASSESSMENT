import React, { useState } from 'react';
import { Car } from '../types/car';
import { AdminCarCard } from '../components/admin/AdminCarCard';
import { PerformanceChart } from '../components/admin/PerformanceChart';
import { CarFormModal } from '../components/admin/CarFormModal';
import { deleteCarApi, saveCarApi } from '../services/api';
import { showErrorToast } from '../services/errorToast';

interface AdminDashboardProps {
  cars: Car[];
  onRefresh: () => void;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ cars, onRefresh, onLogout }) => {
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle entry?')) {
      try {
        await deleteCarApi(id);
        onRefresh();
      } catch (error) {
        showErrorToast(error instanceof Error ? error.message : 'Failed to delete vehicle');
      }
    }
  };

  const handleSaveCar = async (carData: Omit<Car, 'id'> & { id?: string }) => {
    try {
      await saveCarApi(carData);
      onRefresh();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to save vehicle');
    }
  };

  const handleOpenAddModal = () => {
    setEditingCar(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (car: Car) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <header className="bg-slate-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="bg-rose-600 text-xs font-bold px-2 py-1 rounded">ADMIN</span>
          <h1 className="font-bold text-lg tracking-wide">Control Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            + Add Vehicle
          </button>
          <button
            onClick={onLogout}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Logout Session
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Market Analytics Chart */}
        <PerformanceChart cars={cars} />

        {/* Inventory Cards Management */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Vehicle Management ({cars.length})</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <AdminCarCard
              key={car.id}
              car={car}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </main>

      <CarFormModal
        car={editingCar}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCar}
      />
    </div>
  );
};
