import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import {
  Settings,
  Moon,
  Sun,
  Smartphone,
  Shield,
  KeyRound,
  Trash2,
  Bell,
  Clock,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Info,
  Volume2,
  FlaskConical,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { shakeSensor, startSosCountdown } = useEmergency();

  // Preferences state
  const [shakeEnabled, setShakeEnabled] = useState(user?.preferences?.shakeDetectionEnabled ?? false);
  const [shakeSensitivity, setShakeSensitivity] = useState(user?.preferences?.shakeSensitivityLevel ?? 'medium');
  const [shakeTestMode, setShakeTestMode] = useState(user?.preferences?.shakeTestMode ?? false);
  const [volumeButtonEnabled, setVolumeButtonEnabled] = useState(false); // strictly false on web
  const [countdownSecs, setCountdownSecs] = useState(user?.preferences?.countdownDurationSeconds ?? 5);

  // Volume Button native info modal
  const [volumeModalOpen, setVolumeModalOpen] = useState(false);

  // Change Password state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Delete account modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSavePreferences = async (overrides = {}) => {
    const payload = {
      shakeDetectionEnabled: overrides.shakeEnabled !== undefined ? overrides.shakeEnabled : shakeEnabled,
      shakeSensitivityLevel: overrides.shakeSensitivity || shakeSensitivity,
      shakeTestMode: overrides.shakeTestMode !== undefined ? overrides.shakeTestMode : shakeTestMode,
      volumeButtonSosEnabled: false, // always false on web platform
      countdownDurationSeconds: Number(overrides.countdownSecs !== undefined ? overrides.countdownSecs : countdownSecs),
    };

    try {
      const res = await api.patch('/users/me', { preferences: payload });
      if (res?.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success('Preferences updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update preferences: ' + (err.message || 'Server error'));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPass(true);
    try {
      const res = await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res?.success) {
        toast.success('Password updated successfully');
        setPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/users/me');
      toast.success('Account and all associated records permanently erased.');
      logout();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure emergency triggers, accessibility theme, and security controls.
        </p>
      </div>

      {/* Theme Settings */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Interface Theme</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">Choose your preferred visual presentation.</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Settings },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  theme === t.id
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Emergency Activation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span>Quick Emergency Activation</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rapid physical shortcuts to initiate the SOS workflow covertly or under duress.
            </p>
          </div>

          {/* Current Activation Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                shakeEnabled
                  ? shakeTestMode
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {shakeEnabled
                ? shakeTestMode
                  ? '🧪 Shake: Test Mode Active'
                  : '✓ Shake SOS: Armed & Live'
                : 'Shake SOS: Disabled'}
            </span>
          </div>
        </div>

        {/* Sensor & Hardware Diagnostics Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Hardware Sensor Status:</span>
              <span className="font-normal text-slate-500">
                {shakeSensor.isSupported
                  ? shakeSensor.permissionState === 'granted'
                    ? 'Device motion sensor granted & listening'
                    : 'Permission requested / pending'
                  : 'Device motion sensor unavailable on this browser/hardware'}
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              Motion access is used strictly in-memory to detect continuous rapid shaking patterns.
            </p>
          </div>

          {shakeSensor.isSupported && shakeSensor.permissionState !== 'granted' && (
            <button
              type="button"
              onClick={() => shakeSensor.requestPermission()}
              className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm transition flex-shrink-0"
            >
              Request Sensor Access
            </button>
          )}
        </div>

        {/* 1. Shake-to-SOS Toggle */}
        <div className="space-y-4 pt-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Shake-to-Activate SOS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Motion Sensors
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Repeatedly shake your phone back and forth in quick succession (minimum 4 deliberate movements within 2 seconds) to activate emergency countdown.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={shakeEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setShakeEnabled(val);
                  handleSavePreferences({ shakeEnabled: val });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
          </div>

          {/* Shake Sensitivity Selector */}
          {shakeEnabled && (
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Shake Sensitivity Level</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'low', label: 'Low', desc: 'Vigorous shaking (resistant to accidental triggers)' },
                  { id: 'medium', label: 'Medium', desc: 'Balanced single-handed phone shake (recommended)' },
                  { id: 'high', label: 'High', desc: 'Lighter continuous shaking' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setShakeSensitivity(s.id);
                      handleSavePreferences({ shakeSensitivity: s.id });
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      shakeSensitivity === s.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className={`text-[10px] mt-1 line-clamp-2 ${shakeSensitivity === s.id ? 'text-purple-100' : 'text-slate-400'}`}>
                      {s.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Test Mode Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Shake-to-SOS Safe Test Mode
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Safe Verification
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Allows you to practice and test the shake gesture safely. The full countdown and confirmation screen will appear, but <strong>NO real SMS alerts or emergency dispatch</strong> will be sent to your contacts.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={shakeTestMode}
                onChange={(e) => {
                  const val = e.target.checked;
                  setShakeTestMode(val);
                  handleSavePreferences({ shakeTestMode: val });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
            </label>
          </div>
        </div>

        {/* 2. Volume Button SOS (Platform Honesty) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Volume Button SOS (3-Second Hold)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  Unavailable on Web Browser
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Continuous physical volume button hold requires native Android Accessibility or Foreground service permissions. Web browser sandboxing prevents web applications from intercepting hardware audio buttons.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVolumeModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 rounded-xl hover:bg-purple-100 transition flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Platform Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Countdown Buffer Slider */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>SOS Cancellation Countdown Buffer</span>
            </span>
            <span className="font-bold text-purple-600">{countdownSecs} seconds</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={countdownSecs}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCountdownSecs(val);
              handleSavePreferences({ countdownSecs: val });
            }}
            className="w-full accent-purple-600"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Allows a {countdownSecs}-second window to cancel accidental activations before emergency alerts are dispatched.
          </p>
        </div>
      </div>

      {/* Security & Account Protection */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-purple-600" />
          <span>Account Security</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Update Password</p>
            <p className="text-[11px] text-slate-400">Keep your login credentials secure and updated.</p>
          </div>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 rounded-xl hover:bg-purple-100 transition"
          >
            Change Password
          </button>
        </div>

        {/* Delete Account */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Permanently Delete Account</p>
            <p className="text-[11px] text-slate-400">
              Permanently purges your profile, contacts, journeys, and evidence vault from our databases.
            </p>
          </div>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Account Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changingPass}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Permanent Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            This action is irreversible. All your profile information, emergency contacts, recorded incidents, and evidence vault files will be permanently erased from our servers immediately.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Keep My Account
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {deleting ? 'Erasing Data...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Volume Button Platform Details Modal */}
      <Modal
        isOpen={volumeModalOpen}
        onClose={() => setVolumeModalOpen(false)}
        title="Volume Button SOS: Technical Architecture"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Platform Security Notice</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Standard web browsers and PWAs are sandboxed and cannot intercept physical hardware volume rocker keys or detect 3-second long presses. The Women Safety Shield web application deliberately avoids misleading key workarounds.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Requirements for Native Android Companion App:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <li>Android Accessibility Service or MediaSession key event filter</li>
              <li>Continuous 3000ms duration timer on <code className="font-mono text-purple-600">KEYCODE_VOLUME_DOWN</code></li>
              <li>Instant cancellation on key-up before the 3-second threshold</li>
              <li>Filter OS auto-repeat keypress events</li>
              <li>Android 14+ foreground service restrictions compliance</li>
              <li>Direct REST call to <code className="font-mono text-purple-600">POST /api/v1/emergencies</code> with <code className="font-mono text-purple-600">incidentType: "volume_button"</code></li>
            </ul>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            <p><strong>iOS Platform Limitation:</strong> Apple prohibits universal background interception of volume keys by third-party applications.</p>
            <p>Complete Kotlin native service blueprint is documented in <span className="font-mono text-purple-600">docs/NATIVE_VOLUME_BUTTON_SOS.md</span>.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setVolumeModalOpen(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition"
            >
              Understood
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
