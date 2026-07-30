import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData, INDIAN_STATES } from '../../types/auth';
import { registerUser } from '../../services/api';
import { showErrorToast } from '../../services/errorToast';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: SignupFormData) => {
    try {
      await registerUser(data);
      onSuccess();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to complete signup');
    }
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

        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Create Account</h2>
        <p className="text-sm text-gray-500 mb-6">Sign up to explore available vehicles</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      </div>
    </div>
  );
};
