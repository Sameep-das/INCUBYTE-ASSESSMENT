import React, { useState } from 'react';
import { AnimatedBackground } from '../components/home/AnimatedBackground';
import { SignupModal } from '../components/home/SignupModal';
import { UserSession } from '../services/api';

interface HomePageProps {
  onViewCars: () => void;
  onAuthSuccess: (user: UserSession | null) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onViewCars, onAuthSuccess }) => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col justify-between">
      {/* Dynamic Animated Technical Sketch Overlay Background */}
      <AnimatedBackground />

      {/* Top Banner Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-black tracking-widest flex items-center gap-2 cursor-pointer" onClick={onViewCars}>
          <span className="bg-rose-600 px-2 py-1 rounded text-lg">CAR</span> BYTE
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className={`relative z-10 max-w-4xl mx-auto px-6 text-center transition-all duration-300 ${isSignupOpen ? 'filter blur-md pointer-events-none' : ''}`}>
        <span className="inline-block bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
          Next-Gen Precision Engineering
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Discover & Acquire Exceptional Vehicles.
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Browse our curated inventory of premier Indian automobiles, SUV, and electric vehicles. Experience seamless digital acquisition.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onViewCars}
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-all shadow-xl hover:shadow-2xl active:scale-95 text-base cursor-pointer"
          >
            View Cars
          </button>
          <button
            onClick={() => setIsSignupOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-500 transition-all shadow-xl hover:shadow-rose-600/30 active:scale-95 text-base cursor-pointer"
          >
            Sign Up Now
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-slate-600">
        © {new Date().getFullYear()} CAR BYTE Automotive Network. All rights reserved.
      </footer>

      {/* Blurred Background Signup Modal */}
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSuccess={(user) => {
          onAuthSuccess(user);
          setIsSignupOpen(false);
          onViewCars();
        }}
      />
    </div>
  );
};
