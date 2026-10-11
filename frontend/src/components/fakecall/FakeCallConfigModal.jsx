import React from 'react';
import { useFakeCall, CALL_PRESETS } from '../../context/FakeCallContext';
import { Modal } from '../common/Modal';
import {
  PhoneCall,
  Clock,
  Volume2,
  Vibrate,
  User,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';

export const FakeCallConfigModal = () => {
  const {
    isConfigModalOpen,
    closeConfigModal,
    callerName,
    setCallerName,
    callerRelation,
    setCallerRelation,
    callerSubtitle,
    setCallerSubtitle,
    callerAvatar,
    setCallerAvatar,
    delaySeconds,
    setDelaySeconds,
    ringtone,
    setRingtone,
    vibrationEnabled,
    setVibrationEnabled,
    screenTheme,
    setScreenTheme,
    applyPreset,
    startScheduledCall,
  } = useFakeCall();

  const handleLaunch = () => {
    startScheduledCall(delaySeconds);
  };

  const AVATARS = ['👩', '💼', '👱‍♀️', '🩺', '👮‍♀️', '🚗', '👤'];

  return (
    <Modal
      isOpen={isConfigModalOpen}
      onClose={closeConfigModal}
      title="Simulate Fake Incoming Call"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Trigger a realistic in-app incoming phone call to discreetly exit awkward or uncomfortable encounters.
        </p>

        {/* Quick Identity Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Quick Caller Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CALL_PRESETS.map((preset) => {
              const isSelected = callerName === preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-2xl">{preset.avatar}</span>
                  <span className="text-xs truncate w-full">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Caller Details Customization */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Caller Display Name
            </label>
            <input
              type="text"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              placeholder="e.g. Mom, Boss, Friend"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Relationship
              </label>
              <select
                value={callerRelation}
                onChange={(e) => setCallerRelation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="family">Family</option>
                <option value="work">Work / Employer</option>
                <option value="friend">Friend</option>
                <option value="custom">Other / Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={callerSubtitle}
                onChange={(e) => setCallerSubtitle(e.target.value)}
                placeholder="Mobile"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Avatar Icon Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Caller Avatar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setCallerAvatar(av)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border transition ${
                    callerAvatar === av
                      ? 'border-purple-600 bg-purple-100 dark:bg-purple-950 scale-110 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Delay Scheduling */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Simulated Call Delay</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 0, label: 'Instant' },
              { val: 10, label: '10 sec' },
              { val: 30, label: '30 sec' },
              { val: 60, label: '60 sec' },
            ].map((d) => (
              <button
                key={d.val}
                type="button"
                onClick={() => setDelaySeconds(d.val)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition text-center ${
                  delaySeconds === d.val
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Vibration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Ringtone</span>
            </label>
            <select
              value={ringtone}
              onChange={(e) => setRingtone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="marimba">Marimba (Warm Chime)</option>
              <option value="modern">Modern Chime</option>
              <option value="classic">Classic Bell</option>
              <option value="silent">Silent (Vibrate Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-purple-600" />
              <span>Call Screen Appearance</span>
            </label>
            <select
              value={screenTheme}
              onChange={(e) => setScreenTheme(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="dark">Dark (Sleek Phone Style)</option>
              <option value="light">Light (Clean Minimal)</option>
            </select>
          </div>
        </div>

        {/* Vibration Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Device Vibration</p>
              <p className="text-[11px] text-slate-400">Vibrates on supported mobile devices</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={(e) => setVibrationEnabled(e.target.checked)}
            className="w-4 h-4 accent-purple-600 rounded"
          />
        </div>

        {/* Safety Disclaimer */}
        <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-800 dark:text-purple-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 text-purple-600 mt-0.5" />
          <span>
            <strong>Simulated In-App Call:</strong> This provides an authentic visual and audio simulation inside your app. It does NOT make real telephone network calls, create emergency incidents, or contact outside parties.
          </span>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeConfigModal}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            className="px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{delaySeconds === 0 ? 'Trigger Call Now' : `Schedule Call (${delaySeconds}s)`}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
