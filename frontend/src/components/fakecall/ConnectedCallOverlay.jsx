import React from 'react';
import { useFakeCall } from '../../context/FakeCallContext';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid,
  Shield,
  User,
} from 'lucide-react';

export const ConnectedCallOverlay = () => {
  const {
    callState,
    callerName,
    callerAvatar,
    screenTheme,
    callDurationSeconds,
    isMuted,
    isSpeaker,
    setIsMuted,
    setIsSpeaker,
    endCall,
  } = useFakeCall();

  if (callState !== 'connected') return null;

  const isDark = screenTheme === 'dark';

  // Format call duration into MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Active connected phone call simulation"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 select-none animate-fade-in ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Section: Caller & Call Timer */}
      <div className="flex flex-col items-center pt-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Shield className="w-3 h-3" />
          <span>Connected Call Simulation</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mt-3">
          {callerName}
        </h1>

        <div className="text-sm font-mono font-bold tracking-widest text-emerald-400">
          {formatTime(callDurationSeconds)}
        </div>
      </div>

      {/* Middle Section: Avatar */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div
          className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 ${
            isDark
              ? 'bg-slate-800/80 border-slate-700/60'
              : 'bg-white border-slate-200'
          }`}
        >
          <span>{callerAvatar}</span>
        </div>
        <p className={`text-xs mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Simulated Audio Active • Speak naturally to exit situation
        </p>
      </div>

      {/* Mock Calling Controls Grid */}
      <div className="pb-8 max-w-sm w-full mx-auto space-y-8">
        <div className="grid grid-cols-3 gap-6 text-center">
          {/* Mute Toggle */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition ${
                isMuted
                  ? 'bg-red-600 text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isMuted ? 'Muted' : 'Mute'}
            </span>
          </div>

          {/* Keypad Mock */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              aria-label="Keypad"
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition ${
                isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
              }`}
            >
              <Grid className="w-6 h-6" />
            </button>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Keypad
            </span>
          </div>

          {/* Speaker Toggle */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setIsSpeaker((s) => !s)}
              aria-label={isSpeaker ? 'Speaker off' : 'Speaker on'}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition ${
                isSpeaker
                  ? 'bg-purple-600 text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
              }`}
            >
              {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isSpeaker ? 'Speaker On' : 'Speaker'}
            </span>
          </div>
        </div>

        {/* End Call Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={endCall}
            aria-label="End call simulation"
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition transform"
          >
            <PhoneOff className="w-8 h-8 sm:w-9 sm:h-9" />
          </button>
          <span className={`text-xs font-bold mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            End Call
          </span>
        </div>
      </div>
    </div>
  );
};
