import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  Compass,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const MobileNav = () => {
  const { activeIncident, startSosCountdown } = useEmergency();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center text-[10px] font-medium transition ${
            isActive ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/journey"
        className={({ isActive }) =>
          `flex flex-col items-center text-[10px] font-medium transition ${
            isActive ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Navigation className="w-5 h-5 mb-0.5" />
        <span>Journey</span>
      </NavLink>

      {/* Floating Center SOS Button */}
      <button
        onClick={startSosCountdown}
        aria-label="Activate Emergency SOS"
        className={`-mt-6 w-14 h-14 rounded-full flex flex-col items-center justify-center font-extrabold text-white shadow-xl transform active:scale-90 transition ${
          activeIncident
            ? 'bg-red-600 ring-4 ring-red-400/50 animate-bounce'
            : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/40'
        }`}
      >
        <ShieldAlert className="w-6 h-6" />
        <span className="text-[9px] uppercase tracking-wider -mt-0.5">SOS</span>
      </button>

      <NavLink
        to="/places"
        className={({ isActive }) =>
          `flex flex-col items-center text-[10px] font-medium transition ${
            isActive ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span>Places</span>
      </NavLink>

      <NavLink
        to="/contacts"
        className={({ isActive }) =>
          `flex flex-col items-center text-[10px] font-medium transition ${
            isActive ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span>Contacts</span>
      </NavLink>
    </div>
  );
};
