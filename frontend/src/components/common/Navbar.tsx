import React from 'react';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  bookmarkCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate, bookmarkCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          onClick={() => onNavigate('home')}
          className="text-xl font-extrabold tracking-tight cursor-pointer flex items-center gap-2"
        >
          <span className="bg-rose-600 text-white px-2.5 py-1 rounded-lg text-sm">CAR</span>
          <span>BYTE</span>
        </div>

        <nav className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('cars')}
            className={`text-sm font-medium cursor-pointer transition-colors ${activeTab === 'cars' ? 'text-rose-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
          >
            Explore Cars
          </button>

          {/* Bookmarks Icon with Counter Badge */}
          <button
            onClick={() => onNavigate('bookmarks')}
            className={`relative p-2 cursor-pointer transition-colors ${activeTab === 'bookmarks' ? 'text-rose-400' : 'text-slate-300 hover:text-white'}`}
            title="Bookmarked Cars"
          >
            <svg className="w-6 h-6 fill-current text-rose-500" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Account Profile Icon */}
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 cursor-pointer hover:border-rose-500 transition-all">
            JD
          </div>
        </nav>
      </div>
    </header>
  );
};
