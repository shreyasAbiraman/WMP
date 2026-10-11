import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { EmergencyButton } from '../components/common/EmergencyButton';
import { MapView } from '../components/map/MapView';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const EmergencyPage = () => {
  const {
    activeIncident,
    currentCoords,
    gpsStatus,
    countdownActive,
    countdownSeconds,
    resolveActiveIncident,
    triggerSosImmediately,
  } = useEmergency();

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleResolve = async (e) => {
    e.preventDefault();
    setResolving(true);
    try {
      await resolveActiveIncident(resolutionNotes);
      setResolveModalOpen(false);
      setResolutionNotes('');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-600 dark:text-red-400" />
            <span>Emergency SOS System</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immediate emergency response and live location dispatch to your trusted circle.
          </p>
        </div>

        {/* 112 Direct Police Link */}
        <a
          href="tel:112"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Police (112)</span>
        </a>
      </div>

      {/* Main SOS Status Panel */}
      {activeIncident ? (
        /* Active Incident Mode */
        <div className="space-y-6 animate-fade-in">
          {/* Active Banner */}
          <div className="p-6 rounded-3xl bg-red-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span className="font-extrabold uppercase tracking-wider text-xs">
                  ACTIVE SOS EMERGENCY
                </span>
                <Badge variant="emergency" className="bg-red-950 text-white border-0">
                  {activeIncident.incidentId}
                </Badge>
              </div>
              <h2 className="text-xl font-bold">Your Trusted Contacts Have Been Alerted</h2>
              <p className="text-xs text-red-100 mt-1">
                Started at {new Date(activeIncident.createdAt).toLocaleTimeString()} • Keep your device connected while coordinates are actively streaming.
              </p>
            </div>

            <button
              onClick={() => setResolveModalOpen(true)}
              className="px-6 py-3 bg-white text-red-700 hover:bg-red-50 font-extrabold text-sm rounded-2xl shadow-lg transition active:scale-95"
            >
              I Am Safe / Close SOS
            </button>
          </div>

          {/* Real-time Map */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Live Emergency Location Stream</span>
            </h3>

            <MapView
              userLocation={currentCoords || activeIncident.latestLocation}
              trail={activeIncident.locationTrail || []}
              isEmergency={true}
              className="h-80 w-full"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <span>
                Coordinates: {currentCoords ? `${currentCoords.latitude.toFixed(5)}, ${currentCoords.longitude.toFixed(5)}` : 'Waiting for GPS ping...'}
              </span>
              <span>
                GPS Permission: <strong className="capitalize">{gpsStatus}</strong>
              </span>
            </div>
          </div>

          {/* Trusted Contacts Notification Delivery Status */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Contact Dispatch & Acknowledgement Log</span>
            </h3>

            {(!activeIncident.notifications || activeIncident.notifications.length === 0) ? (
              <p className="text-xs text-slate-500 py-3">No contacts were configured prior to triggering SOS.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeIncident.notifications.map((n, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{n.name}</p>
                      <p className="text-slate-400">{n.phone} • via {n.channel.toUpperCase()}</p>
                      {n.status === 'failed' && n.errorMessage && (
                        <p className="text-red-600 dark:text-red-400 text-[11px] mt-0.5">
                          ⚠ Provider error: {n.errorMessage}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        n.status === 'delivered' || n.status === 'sent'
                          ? 'success'
                          : n.status === 'acknowledged'
                          ? 'primary'
                          : n.status === 'failed'
                          ? 'emergency'
                          : 'default'
                      }
                    >
                      {n.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standby Trigger Mode */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center">
            <EmergencyButton size="large" />

            <div className="mt-8 max-w-md text-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                How Emergency SOS Works
              </h2>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>5-second cancel buffer ensures accidental clicks can be dismissed cleanly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Captures high-accuracy GPS coordinates and broadcasts to your emergency contacts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Provides immediate 1-tap calling for national police helpline 112.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Emergency Telephone Numbers reference */}
          <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
            <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200 mb-3">
              Official Indian Emergency Helplines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="tel:112"
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs flex flex-col hover:shadow-sm transition"
              >
                <span className="font-bold text-slate-900 dark:text-white">112 - All Emergencies</span>
                <span className="text-slate-500">Police, Ambulance & Fire</span>
              </a>
              <a
                href="tel:1091"
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs flex flex-col hover:shadow-sm transition"
              >
                <span className="font-bold text-slate-900 dark:text-white">1091 - Women Helpline</span>
                <span className="text-slate-500">24/7 Police Assistance</span>
              </a>
              <a
                href="tel:181"
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs flex flex-col hover:shadow-sm transition"
              >
                <span className="font-bold text-slate-900 dark:text-white">181 - Women in Distress</span>
                <span className="text-slate-500">Crisis Counseling & Relief</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Incident Confirmation Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve & Close SOS Emergency"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirm that you are safe. This will conclude location streaming and mark the incident resolved.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resolution Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Reached home safely, false alarm, in safe company."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {resolving ? 'Resolving...' : 'Confirm I Am Safe'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
