import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BrainCircuit, 
  Compass, 
  BookHeart, 
  Monitor, 
  Sparkles, 
  UserCircle,
  LogOut,
  Zap
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Check-In', path: '/check-in', icon: CheckSquare },
    { name: 'Mindful Activities', path: '/activities', icon: Sparkles },
    { name: 'Mood Diary', path: '/diary', icon: BookHeart },
    { name: 'Digital Wellbeing', path: '/wellbeing', icon: Monitor },
    { name: 'Growth Roadmap', path: '/roadmap', icon: Compass },
    { name: 'Mitra AI Assistant', path: '/ai-companion', icon: BrainCircuit, badge: 'AI' },
    { name: 'Profile & Settings', path: '/profile', icon: UserCircle },
  ];

  return (
    <aside className="w-72 bg-dark-900/90 border-r border-white/5 text-zinc-300 hidden lg:flex flex-col justify-between backdrop-blur-xl select-none z-20">
      <div>
        {/* Logo */}
        <div className="p-6 pb-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-1">
                MindMitra <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">AI Wellbeing OS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 mt-2">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'M'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name || 'MindMitra User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email || 'user@mindmitra.io'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
