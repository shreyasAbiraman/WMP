import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  Navigation,
  MapPin,
  Users,
  Compass,
  History,
  Lock,
  BotMessageSquare,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/emergency', label: 'Emergency SOS', icon: ShieldAlert, highlight: true },
  { to: '/journey', label: 'Safe Journey', icon: Navigation },
  { to: '/location', label: 'Live Location Map', icon: MapPin },
  { to: '/contacts', label: 'Trusted Contacts', icon: Users },
  { to: '/places', label: 'Nearby Safe Places', icon: Compass },
  { to: '/history', label: 'Incident History', icon: History },
  { to: '/evidence', label: 'Evidence Vault', icon: Lock },
  { to: '/assistant', label: 'AI Safety Assistant', icon: BotMessageSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/privacy', label: 'Privacy & Data', icon: ShieldCheck },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 md:hidden">
          <span className="font-bold text-slate-800 dark:text-slate-100">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/20'
                        : 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${item.highlight ? 'text-inherit' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Helpline quick-reference footer */}
        <div className="p-4 m-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
          <p className="font-bold text-purple-900 dark:text-purple-200 mb-1">National Emergency</p>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
            <span>Police: <strong>112</strong></span>
            <span>Women: <strong>1091</strong></span>
          </div>
        </div>
      </aside>
    </>
  );
};
