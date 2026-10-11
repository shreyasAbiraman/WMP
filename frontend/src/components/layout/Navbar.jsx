import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ConnectionStatus } from '../common/ConnectionStatus';
import { EmergencyButton } from '../common/EmergencyButton';
import { useFakeCall } from '../../context/FakeCallContext';
import {
  Shield,
  Sun,
  Moon,
  Bell,
  PhoneCall,
  PhoneIncoming,
  User,
  LogOut,
  Menu,
} from 'lucide-react';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openConfigModal } = useFakeCall();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-purple-900/20 group-hover:scale-105 transition transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Women Safety <span className="text-purple-600 dark:text-purple-400">Shield</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
                Personal Protection & SOS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Realtime Connection Badge (Hidden on small mobile) */}
        <div className="hidden lg:flex items-center">
          <ConnectionStatus />
        </div>

        {/* Right: Quick Emergency Dial, SOS, Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick 112 Telephone Dialer */}
          <a
            href="tel:112"
            title="Immediate Police / Emergency Call"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/60 border border-red-300 dark:border-red-800 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
            <span className="hidden sm:inline">Police:</span> 112
          </a>

          {/* Quick Fake Call Simulation Trigger */}
          {isAuthenticated && (
            <button
              onClick={openConfigModal}
              title="Simulate Fake Call"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
            >
              <PhoneIncoming className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Fake Call</span>
            </button>
          )}

          {/* Compact SOS Button in Navbar */}
          {isAuthenticated && (
            <EmergencyButton size="compact" />
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Link */}
          {isAuthenticated && (
            <Link
              to="/notifications"
              aria-label="View alerts and notifications"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            >
              <Bell className="w-5 h-5" />
            </Link>
          )}

          {/* User Profile / Auth buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{user?.fullName?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition shadow-sm"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
