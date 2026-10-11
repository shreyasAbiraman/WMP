import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { useFakeCall } from '../context/FakeCallContext';
import { api } from '../services/api';
import { EmergencyButton } from '../components/common/EmergencyButton';
import { Badge } from '../components/common/Badge';
import {
  ShieldAlert,
  Navigation,
  MapPin,
  Users,
  Compass,
  History,
  PhoneCall,
  PhoneIncoming,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { currentCoords, gpsStatus, activeIncident, requestLocation } = useEmergency();
  const { openConfigModal, triggerIncomingCall } = useFakeCall();

  const [contactsCount, setContactsCount] = useState(0);
  const [activeJourney, setActiveJourney] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [contactsRes, journeyRes, incidentsRes] = await Promise.allSettled([
          api.get('/contacts'),
          api.get('/journeys/active'),
          api.get('/emergencies?limit=3'),
        ]);

        if (contactsRes.status === 'fulfilled' && contactsRes.value?.success) {
          setContactsCount(contactsRes.value.data.contacts.length);
        }
        if (journeyRes.status === 'fulfilled' && journeyRes.value?.success) {
          setActiveJourney(journeyRes.value.data.journey);
        }
        if (incidentsRes.status === 'fulfilled' && incidentsRes.value?.success) {
          setRecentIncidents(incidentsRes.value.data.incidents || []);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, []);

  const readinessScore = (contactsCount > 0 ? 50 : 0) + (gpsStatus === 'granted' ? 50 : 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome & Readiness Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Shield Active & Armed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.fullName || 'Guardian'}
            </h1>
            <p className="text-sm text-purple-200 mt-1 max-w-xl">
              Your personal safety system is standing by. Live emergency alerts, journey tracking, and nearby help are always 1-tap away.
            </p>
          </div>

          {/* Emergency Calling 112 Card */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="tel:112"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call Police 112</span>
            </a>
            <a
              href="tel:1091"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Women Helpline 1091</span>
            </a>
          </div>
        </div>
      </div>

      {/* Primary SOS Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prominent SOS Button Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
            Emergency Trigger
          </span>
          <EmergencyButton size="large" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-xs">
            Instantly alerts your {contactsCount} trusted contact{contactsCount === 1 ? '' : 's'} with your live location link.
          </p>
        </div>

        {/* Readiness & Current Status Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contacts Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Trusted Contacts
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {contactsCount} configured
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className={contactsCount > 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                {contactsCount > 0 ? '✓ Ready to receive SOS' : '⚠ Add at least 1 contact'}
              </span>
              <Link to="/contacts" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                Manage →
              </Link>
            </div>
          </div>

          {/* GPS Location Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Location Status
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {gpsStatus === 'granted' ? 'GPS Active' : 'Permission Required'}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {currentCoords
                  ? `Lat: ${currentCoords.latitude.toFixed(3)}, Lng: ${currentCoords.longitude.toFixed(3)}`
                  : 'Coordinates pending'}
              </span>
              {gpsStatus !== 'granted' && (
                <button
                  onClick={requestLocation}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Enable GPS →
                </button>
              )}
            </div>
          </div>

          {/* Safe Journey Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between sm:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Safe Journey Monitor
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {activeJourney
                    ? `En route to: ${activeJourney.destination.name}`
                    : 'No active journey in progress'}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <Navigation className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {activeJourney
                  ? `Expected arrival: ${new Date(activeJourney.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Start a journey to enable check-in countdown'}
              </span>
              <Link to="/journey" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                {activeJourney ? 'View Journey Trail →' : 'Plan Safe Journey →'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Quick Safety Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/emergency"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SOS System</span>
          </Link>

          <Link
            to="/journey"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Safe Journey</span>
          </Link>

          <Link
            to="/location"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Share GPS</span>
          </Link>

          <Link
            to="/contacts"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Contacts</span>
          </Link>

          <Link
            to="/places"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Safe Places</span>
          </Link>

          <Link
            to="/history"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Incident Log</span>
          </Link>

          <button
            type="button"
            onClick={openConfigModal}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <PhoneIncoming className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Fake Call</span>
          </button>
        </div>
      </div>

      {/* Safety Tips & Recent Incidents Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Safety Tips */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-300 font-bold text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Safety Best Practices</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span><strong>Device Shake SOS:</strong> Turn on shake detection in Settings so you can trigger an alert covertly without looking at the screen.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span><strong>Late-night travel:</strong> Start a Safe Journey with a 10-minute check-in interval before getting into any cab or auto.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span><strong>Direct police intervention:</strong> Tap the 112 button above anytime you require immediate law enforcement dispatch.</span>
            </li>
          </ul>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Incident History</h3>
            <Link to="/history" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
              View all
            </Link>
          </div>

          {recentIncidents.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
              No recent emergency incidents. Stay safe!
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentIncidents.map((inc) => (
                <div
                  key={inc._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {inc.incidentId}
                    </span>
                    <p className="text-slate-400 text-[10px]">
                      {new Date(inc.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={inc.status === 'active' ? 'emergency' : 'success'}>
                    {inc.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
