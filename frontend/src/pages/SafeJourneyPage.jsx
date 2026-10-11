import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useEmergency } from '../context/EmergencyContext';
import { MapView } from '../components/map/MapView';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  Navigation,
  CheckCircle,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export const SafeJourneyPage = () => {
  const { currentCoords, requestLocation } = useEmergency();
  const [activeJourney, setActiveJourney] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [destinationName, setDestinationName] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [starting, setStarting] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchJourneyData();
  }, []);

  const fetchJourneyData = async () => {
    setLoading(true);
    try {
      const [journeyRes, contactsRes] = await Promise.allSettled([
        api.get('/journeys/active'),
        api.get('/contacts'),
      ]);

      if (journeyRes.status === 'fulfilled' && journeyRes.value?.success) {
        setActiveJourney(journeyRes.value.data.journey);
      }
      if (contactsRes.status === 'fulfilled' && contactsRes.value?.success) {
        setContacts(contactsRes.value.data.contacts || []);
        setSelectedContactIds(contactsRes.value.data.contacts.map((c) => c._id));
      }
    } catch (err) {
      console.warn('Failed to load journey state:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = async (e) => {
    e.preventDefault();
    if (!destinationName.trim()) return;

    setStarting(true);
    try {
      const coords = await requestLocation();
      const payload = {
        destination: {
          name: destinationName,
          address: destinationAddress,
          latitude: coords?.latitude ? coords.latitude + 0.015 : undefined,
          longitude: coords?.longitude ? coords.longitude + 0.015 : undefined,
        },
        startLocation: coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
            }
          : undefined,
        expectedDurationMinutes: parseInt(durationMinutes, 10),
        checkInIntervalMinutes: parseInt(intervalMinutes, 10),
        selectedContacts: selectedContactIds,
      };

      const res = await api.post('/journeys', payload);
      if (res?.success && res.data?.journey) {
        setActiveJourney(res.data.journey);
        toast.success('Safe Journey started! Check-in reminders activated.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start journey');
    } finally {
      setStarting(false);
    }
  };

  const handleCheckIn = async () => {
    if (!activeJourney?._id) return;
    setCheckingIn(true);
    try {
      const coords = await requestLocation();
      const res = await api.patch(`/journeys/${activeJourney._id}/check-in`, {
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        note: 'Confirmed safe on schedule',
      });
      if (res?.success) {
        setActiveJourney(res.data.journey);
        toast.success('Check-in confirmed! Next interval reset.');
      }
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCompleteJourney = async () => {
    if (!activeJourney?._id) return;
    try {
      const res = await api.patch(`/journeys/${activeJourney._id}/complete`);
      if (res?.success) {
        setActiveJourney(null);
        toast.success('Journey completed! We are glad you reached safely.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete journey');
    }
  };

  const handleCancelJourney = async () => {
    if (!activeJourney?._id) return;
    if (!window.confirm('Are you sure you want to cancel this journey?')) return;
    try {
      const res = await api.patch(`/journeys/${activeJourney._id}/cancel`);
      if (res?.success) {
        setActiveJourney(null);
        toast.info('Journey cancelled.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Navigation className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <span>Safe Journey Mode</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Automated travel monitoring with periodic safety check-ins and escalation alerts.
        </p>
      </div>

      {activeJourney ? (
        /* Active Journey View */
        <div className="space-y-6 animate-fade-in">
          {/* Status Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold uppercase tracking-wider text-xs">
                  JOURNEY IN PROGRESS
                </span>
                <Badge variant="primary" className="bg-purple-950/80 text-white border-0">
                  {activeJourney.journeyId}
                </Badge>
              </div>
              <h2 className="text-xl font-bold">Heading to: {activeJourney.destination.name}</h2>
              <p className="text-xs text-purple-200 mt-1">
                Started {new Date(activeJourney.createdAt).toLocaleTimeString()} • Expected arrival by{' '}
                {new Date(activeJourney.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompleteJourney}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs rounded-xl shadow-md transition active:scale-95"
              >
                I Have Arrived Safely
              </button>
              <button
                onClick={handleCancelJourney}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Check-In Action Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Scheduled Safety Check-In
                </h3>
                <p className="text-xs text-slate-500">
                  Next check-in due:{' '}
                  {activeJourney.nextCheckInDue
                    ? new Date(activeJourney.nextCheckInDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Pending'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{checkingIn ? 'Confirming...' : 'Confirm I Am Safe'}</span>
            </button>
          </div>

          {/* Map Trail */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>Active Route & Destination Map</span>
            </h3>

            <MapView
              userLocation={currentCoords || activeJourney.lastKnownLocation}
              destination={activeJourney.destination}
              trail={activeJourney.routeTrail || []}
              className="h-80 w-full"
            />
          </div>

          {/* Check-in Log */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Check-In History
            </h3>
            <div className="space-y-2">
              {activeJourney.checkInHistory?.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{c.note}</span>
                  <span className="text-slate-400">{new Date(c.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Plan New Journey Form */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
          <form onSubmit={handleStartJourney} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Where are you heading? (Destination Name)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Home, Office, University Campus, Metro Station"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination Address / Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 24 Green Park Road, Near Station Exit 2"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Duration (Minutes)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={15}>15 Minutes (Short trip)</option>
                  <option value={30}>30 Minutes (Standard commute)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={90}>1.5 Hours</option>
                  <option value={120}>2 Hours (Long transit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Check-In Reminder Frequency
                </label>
                <select
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={10}>Every 10 Minutes</option>
                  <option value={15}>Every 15 Minutes (Recommended)</option>
                  <option value={20}>Every 20 Minutes</option>
                  <option value={30}>Every 30 Minutes</option>
                </select>
              </div>
            </div>

            {/* Select Contacts */}
            {contacts.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Contacts to Notify if Check-in is Critically Missed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contacts.map((c) => {
                    const isChecked = selectedContactIds.includes(c._id);
                    return (
                      <label
                        key={c._id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${
                          isChecked
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContactIds([...selectedContactIds, c._id]);
                            } else {
                              setSelectedContactIds(selectedContactIds.filter((id) => id !== c._id));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-[11px] text-slate-400">({c.relationship})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={starting}
              className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-purple-700/20 disabled:opacity-50"
            >
              {starting ? 'Initiating Safe Journey...' : 'Start Monitored Journey'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
