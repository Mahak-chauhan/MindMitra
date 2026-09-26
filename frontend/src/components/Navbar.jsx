import React, { useContext, useState } from 'react';
import { Bell, Search, Sparkles, Menu, X, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Map route names
  const pageTitles = {
    '/': 'Dashboard Overview',
    '/check-in': 'Daily Wellness Check-In',
    '/activities': 'Mindful Activities & Breathing',
    '/diary': 'Personal Mood Diary',
    '/wellbeing': 'Digital Wellbeing Insights',
    '/roadmap': 'Growth & Habit Roadmap',
    '/ai-companion': 'Mitra AI Companion',
    '/profile': 'User Profile & Settings',
  };

  const currentTitle = pageTitles[location.pathname] || 'MindMitra';

  return (
    <header className="h-16 bg-dark-900/60 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 backdrop-blur-md sticky top-0 z-30">
      {/* Page Title / Location */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          <h2 className="text-base font-semibold text-zinc-100 font-display tracking-wide">{currentTitle}</h2>
          <p className="text-[11px] text-zinc-500 hidden sm:block">Personalized AI Insights & Wellbeing Sync</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick AI Companion Button */}
        <Link
          to="/ai-companion"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Mitra AI</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-white/10">
          <Link
            to="/profile"
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-bold text-xs flex items-center justify-center shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-zinc-200 hidden md:block">{user?.name || 'User'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
