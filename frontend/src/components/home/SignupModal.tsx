import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData, INDIAN_STATES, userLoginSchema, UserLoginData } from '../../types/auth';
import { loginUser, registerUser, UserSession } from '../../services/api';
import { showErrorToast } from '../../services/errorToast';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserSession | null) => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const loginForm = useForm<UserLoginData>({
    resolver: zodResolver(userLoginSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = signupForm;

  if (!isOpen) return null;

  const switchMode = (nextMode: 'signup' | 'login') => {
    setMode(nextMode);
    signupForm.clearErrors();
    loginForm.clearErrors();
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      await registerUser(data);
      onSuccess({
        name: data.name,
        email: data.email,
      });
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to complete signup');
    }
  };

  const onLoginSubmit = async (data: UserLoginData) => {
    try {
      const user = await loginUser(data);
      onSuccess(user);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {mode === 'signup' ? 'Sign up to explore available vehicles' : 'Sign in with your email and password'}
        </p>

        <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Login
          </button>
        </div>

        {mode === 'signup' ? (
        <form onSubmit={handleSubmit(onSignupSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
            <input
              {...register('name')}
              placeholder="John Doe"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Password@123"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
            />
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number (Optional)</label>
            <input
              {...register('phone')}
              placeholder="9876543210"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
            />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* City & PIN Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">City</label>
              <input
                {...register('city')}
                placeholder="Mumbai"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
              />
              {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">PIN Code</label>
              <input
                {...register('pincode')}
                placeholder="400001"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
              />
              {errors.pincode && <p className="text-xs text-rose-500 mt-1">{errors.pincode.message}</p>}
            </div>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">State</label>
            <select
              {...register('state')}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all bg-white"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/25 mt-4 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Registering...' : 'Complete Signup'}
          </button>
        </form>
        ) : (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              {...loginForm.register('email')}
              placeholder="john@example.com"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
            />
            {loginForm.formState.errors.email && (
              <p className="text-xs text-rose-500 mt-1">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              {...loginForm.register('password')}
              placeholder="Password@123"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
            />
            {loginForm.formState.errors.password && (
              <p className="text-xs text-rose-500 mt-1">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginForm.formState.isSubmitting}
            className="w-full py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/25 mt-4 disabled:opacity-50 cursor-pointer"
          >
            {loginForm.formState.isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};
