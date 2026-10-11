import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserPlus,
  MapPin,
  Bell,
  ArrowRight,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { requestLocation, gpsStatus } = useEmergency();
  const [step, setStep] = useState(1);
  const [contactData, setContactData] = useState({
    name: '',
    relationship: 'parent',
    phoneNumber: '',
    preferredNotifyMethod: 'sms',
  });
  const [savingContact, setSavingContact] = useState(false);

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.phoneNumber) return;
    setSavingContact(true);
    try {
      await api.post('/contacts', contactData);
      toast.success('Trusted contact added successfully!');
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to save contact');
    } finally {
      setSavingContact(false);
    }
  };

  const handleGrantLocation = async () => {
    const coords = await requestLocation();
    if (coords) {
      toast.success('GPS permission granted successfully!');
    } else {
      toast.info('Location permission skipped or denied. You can enable it anytime.');
    }
    setStep(3);
  };

  const handleFinishOnboarding = async () => {
    toast.success('Setup complete! Your safety shield is primed and active.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step > s
                    ? 'bg-emerald-500 text-white'
                    : step === s
                    ? 'bg-purple-700 text-white ring-4 ring-purple-100 dark:ring-purple-900/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full ${
                    step > s ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Add Primary Trusted Contact */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Primary Emergency Contact</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This person will receive your live GPS coordinate link during an SOS emergency.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mom, Dad, Priya"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship
                  </label>
                  <select
                    value={contactData.relationship}
                    onChange={(e) => setContactData({ ...contactData, relationship: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="spouse">Spouse / Partner</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="guardian">Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={contactData.phoneNumber}
                    onChange={(e) => setContactData({ ...contactData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl transition shadow-md shadow-purple-700/20 disabled:opacity-50"
                >
                  {savingContact ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Location Permission */}
        {step === 2 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Enable Real-Time Location</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2">
              Why we ask: During an emergency or safe journey, your browser shares coordinates strictly with your authorized contacts. We never publicly track you or log coordinates when idle.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleGrantLocation}
                className="w-full sm:w-auto px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl transition shadow-md shadow-purple-700/20"
              >
                Allow Location Access
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
              >
                Decide Later
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Readiness Summary */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Safety Shield is Ready</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2">
              You can trigger SOS emergencies at any time via the prominent button or secret shake gesture, track journeys, and find nearby police stations.
            </p>

            <div className="mt-8">
              <button
                onClick={handleFinishOnboarding}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-base rounded-2xl transition shadow-xl shadow-purple-700/25 flex items-center gap-2 mx-auto"
              >
                <span>Enter Safety Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
