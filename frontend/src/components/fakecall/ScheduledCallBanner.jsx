import React from 'react';
import { useFakeCall } from '../../context/FakeCallContext';
import { PhoneCall, Clock, X } from 'lucide-react';

export const ScheduledCallBanner = () => {
  const { callState, scheduledSecondsLeft, cancelScheduledCall, callerName } = useFakeCall();

  if (callState !== 'scheduled') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md bg-slate-900/95 dark:bg-purple-950/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center justify-between gap-3 animate-slide-down"
    >
      <div className="flex items-center gap-3 truncate">
        <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 flex-shrink-0 animate-pulse">
          <Clock className="w-4 h-4" />
        </div>
        <div className="truncate">
          <p className="text-xs font-bold leading-tight truncate">
            Fake Call Incoming: {callerName}
          </p>
          <p className="text-[11px] text-purple-300">
            Arriving in <strong className="font-mono text-white text-xs">{scheduledSecondsLeft}s</strong> (Keep app open)
          </p>
        </div>
      </div>

      <button
        onClick={cancelScheduledCall}
        className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center gap-1 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
        <span>Cancel</span>
      </button>
    </div>
  );
};
