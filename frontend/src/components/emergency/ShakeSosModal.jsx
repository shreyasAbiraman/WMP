import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { ShieldAlert, AlertTriangle, X, CheckCircle, PhoneCall, Volume2 } from 'lucide-react';

export const ShakeSosModal = () => {
  const {
    shakeModalOpen,
    countdownSeconds,
    cancelSosCountdown,
    triggerSosImmediately,
    isTestMode,
    testSimulationResult,
    clearTestSimulation,
    activationError,
  } = useEmergency();

  if (!shakeModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shake-sos-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-red-500 text-center space-y-6 animate-scale-up">
        {/* Test Simulation Complete State */}
        {testSimulationResult ? (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800 mb-2">
                TEST MODE VERIFICATION
              </span>
              <h2 id="shake-sos-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
                Shake-to-SOS Verified!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Simulated incident <strong className="text-purple-600 dark:text-purple-400 font-mono">{testSimulationResult.incidentId}</strong> completed successfully.
              </p>
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p>✓ Continuous shake motion successfully detected</p>
                <p>✓ Countdown timer & cancellation verified</p>
                <p>✓ <strong>Zero</strong> SMS alerts dispatched (Safety Safeguard)</p>
                <p>✓ Ready for real emergency activation</p>
              </div>
            </div>

            <button
              onClick={clearTestSimulation}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition shadow-md"
            >
              Close Test Window
            </button>
          </div>
        ) : activationError ? (
          /* Error State with Immediate Police Hotline Options */
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <div>
              <h2 id="shake-sos-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Emergency Dispatch Warning
              </h2>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {activationError}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Use direct emergency phone lines immediately if you are in danger:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href="tel:112"
                className="py-3 px-3 bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 text-sm hover:bg-red-700 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 112</span>
              </a>
              <a
                href="tel:1091"
                className="py-3 px-3 bg-purple-700 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 text-sm hover:bg-purple-800 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 1091</span>
              </a>
            </div>

            <button
              onClick={cancelSosCountdown}
              className="w-full py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        ) : (
          /* Active Countdown State */
          <div className="space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center border-4 border-red-500 animate-pulse">
                <span className="text-4xl font-extrabold text-red-600 dark:text-red-400 font-mono">
                  {countdownSeconds}
                </span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
                <span>EMERGENCY SOS DETECTED</span>
              </div>

              <h2 id="shake-sos-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Phone Shaking Triggered SOS
              </h2>

              {isTestMode ? (
                <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-medium">
                  🧪 <strong>Test Mode Active:</strong> Will verify countdown and trigger without sending SMS or real alerts.
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Emergency alert with your live coordinates will be transmitted to all trusted contacts when the countdown finishes.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={cancelSosCountdown}
                className="w-full py-4 px-6 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-base rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5 text-red-500" />
                <span>CANCEL SOS — I AM SAFE</span>
              </button>

              <button
                onClick={() => triggerSosImmediately('shake_gesture')}
                className="w-full py-2.5 px-4 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
              >
                Trigger Instantly Without Waiting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
