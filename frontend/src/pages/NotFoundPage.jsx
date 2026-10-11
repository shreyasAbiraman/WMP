import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-charcoal-950">
      <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
        The safety screen you requested does not exist or may have been relocated.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-6 py-2.5 bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:bg-purple-800 transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
