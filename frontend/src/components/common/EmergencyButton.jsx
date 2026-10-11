import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';

export const EmergencyButton = ({ size = 'large', className = '' }) => {
  const {
    activeIncident,
    countdownActive,
    countdownSeconds,
    startSosCountdown,
    cancelSosCountdown,
    triggerSosImmediately,
  } = useEmergency();

  if (activeIncident) {
    return (
      <a
        href="/emergency"
        className={`relative inline-flex items-center justify-center font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-full shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all transform active:scale-95 animate-pulse ${
          size === 'large' ? 'px-8 py-5 text-xl' : 'px-5 py-2.5 text-sm'
        } ${className}`}
      >
        <span className="w-3 h-3 rounded-full bg-white animate-ping mr-2.5" />
        ACTIVE SOS INCIDENT ({activeIncident.incidentId})
      </a>
    );
  }

  if (countdownActive) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-red-500/10 border-2 border-red-500 rounded-3xl animate-pulse">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
          <AlertCircle className="w-6 h-6 animate-bounce" />
          <span>ACTIVATING EMERGENCY IN {countdownSeconds}s</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cancelSosCountdown}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition shadow-sm"
          >
            <X className="w-4 h-4 text-slate-500" />
            Cancel SOS
          </button>
          <button
            onClick={() => triggerSosImmediately('sos_button')}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md"
          >
            Trigger Instantly
          </button>
        </div>
      </div>
    );
  }

  if (size === 'compact') {
    return (
      <button
        onClick={startSosCountdown}
        aria-label="Trigger Emergency SOS"
        className={`flex items-center gap-2 px-4 py-2 font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition ${className}`}
      >
        <ShieldAlert className="w-5 h-5" />
        <span>SOS</span>
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={startSosCountdown}
        aria-label="Activate Emergency SOS"
        className="group relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white font-extrabold shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 active:scale-95 transition-all transform duration-200 focus:outline-none focus:ring-4 focus:ring-red-400/50"
      >
        <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 group-hover:scale-110 transition-transform duration-300" />
        <div className="flex flex-col items-center justify-center z-10 select-none">
          <ShieldAlert className="w-12 h-12 sm:w-14 sm:h-14 mb-1 text-white animate-pulse" />
          <span className="text-2xl sm:text-3xl tracking-wider">SOS</span>
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase opacity-90">
            Emergency
          </span>
        </div>
      </button>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>5s countdown safety buffer</span>
        <span>•</span>
        <button
          onClick={() => triggerSosImmediately('manual_panic')}
          className="text-red-600 dark:text-red-400 hover:underline font-semibold"
        >
          Instant SOS (Skip timer)
        </button>
      </div>
    </div>
  );
};
