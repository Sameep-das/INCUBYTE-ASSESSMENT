import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, AdminLoginData } from '../types/auth';
import { adminLoginApi } from '../services/api';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToHome }) => {
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AdminLoginData) => {
    setAuthError(null);
    const isValid = await adminLoginApi(data);
    if (isValid) {
      onSuccess();
    } else {
      setAuthError('Invalid administrator credentials. Please check your name, email, and password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 opacity-90"></div>

      <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBackToHome}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Store
          </button>
          <span className="bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
            Admin Access
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-1">CAR BYTE Admin</h1>
        <p className="text-xs text-slate-400 mb-6">Enter administrator credentials to access fleet management & analytics</p>

        {authError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Administrator Name</label>
            <input
              {...register('name')}
              placeholder="e.g. Admin User"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white text-sm rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="admin@carbyte.in"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white text-sm rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white text-sm rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
            />
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-rose-600/30 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
