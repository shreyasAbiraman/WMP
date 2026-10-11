import React from 'react';
import { useFakeCall } from '../../context/FakeCallContext';
import { Phone, PhoneOff, Shield, Volume2 } from 'lucide-react';

export const IncomingCallOverlay = () => {
  const {
    callState,
    callerName,
    callerSubtitle,
    callerAvatar,
    screenTheme,
    acceptCall,
    declineCall,
  } = useFakeCall();

  if (callState !== 'incoming') return null;

  const isDark = screenTheme === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Incoming phone call simulation"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 select-none animate-fade-in ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Header: Discreet simulation banner */}
      <div className="flex flex-col items-center pt-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-white/70">
          <Shield className="w-3 h-3 text-purple-400" />
          <span>Incoming simulated call</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mt-4">
          {callerName}
        </h1>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {callerSubtitle || 'Mobile'}
        </p>
      </div>

      {/* Middle: Avatar with gentle glowing pulse */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-2xl border-4 ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/60'
                : 'bg-white border-slate-200'
            }`}
          >
            <span>{callerAvatar}</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-purple-400 animate-pulse">
          <Volume2 className="w-4 h-4" />
          <span>Incoming call ringing...</span>
        </div>
      </div>

      {/* Bottom Controls: Decline and Accept buttons */}
      <div className="pb-10 max-w-sm w-full mx-auto">
        <div className="flex items-center justify-around gap-6">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={declineCall}
              aria-label="Decline simulated call"
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition transform"
            >
              <PhoneOff className="w-8 h-8 sm:w-9 sm:h-9" />
            </button>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Decline
            </span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={acceptCall}
              aria-label="Accept simulated call"
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 transition transform animate-pulse"
            >
              <Phone className="w-8 h-8 sm:w-9 sm:h-9" />
            </button>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Accept
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
