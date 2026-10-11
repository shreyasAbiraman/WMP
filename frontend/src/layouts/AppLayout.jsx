import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { useEmergency } from '../context/EmergencyContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { ShakeSosModal } from '../components/emergency/ShakeSosModal';
import { FakeCallManager } from '../components/fakecall/FakeCallManager';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeIncident } = useEmergency();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Persistent Active Emergency Banner if an SOS is currently active */}
      {activeIncident && (
        <aside
          aria-label="Active emergency incident notice"
          className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md animate-pulse z-30"
        >
          <div className="flex items-center gap-2 max-w-xl truncate">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>
              EMERGENCY ACTIVE: Incident #{activeIncident.incidentId} is sharing live coordinates with trusted contacts.
            </span>
          </div>
          <Link
            to="/emergency"
            className="flex items-center gap-1 px-3 py-1 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 transition ml-2 flex-shrink-0"
          >
            Manage SOS <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </aside>
      )}

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <MobileNav />
      <ShakeSosModal />
      <FakeCallManager />
    </div>
  );
};
