import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useEmergency } from '../context/EmergencyContext';
import { MapView } from '../components/map/MapView';
import { Badge } from '../components/common/Badge';
import {
  MapPin,
  Share2,
  Copy,
  Check,
  StopCircle,
  Play,
  Shield,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export const LiveLocationPage = () => {
  const { currentCoords, requestLocation, gpsStatus } = useEmergency();
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const res = await api.get('/location-sessions/active');
      if (res?.success && res.data?.session) {
        setActiveSession(res.data.session);
      }
    } catch (err) {
      console.warn('Location session check failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSharing = async () => {
    setStarting(true);
    try {
      const coords = await requestLocation();
      const res = await api.post('/location-sessions', {
        title: 'Live Safety Tracking',
        durationMinutes: 60,
        initialCoordinates: coords || undefined,
      });

      if (res?.success && res.data?.session) {
        setActiveSession(res.data.session);
        toast.success('Live location sharing is now active!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start sharing');
    } finally {
      setStarting(false);
    }
  };

  const handleStopSharing = async () => {
    if (!activeSession?._id) return;
    try {
      const res = await api.patch(`/location-sessions/${activeSession._id}/stop`);
      if (res?.success) {
        setActiveSession(null);
        toast.info('Live location sharing ended.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to stop session');
    }
  };

  const copyShareLink = () => {
    if (!activeSession?.shareCode) return;
    const url = `${window.location.origin}/shared-location/${activeSession.shareCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Secure tracking link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Live Location Sharing</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate a private, time-limited live tracking session for trusted contacts.
          </p>
        </div>

        {activeSession ? (
          <button
            onClick={handleStopSharing}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <StopCircle className="w-4 h-4" />
            <span>Stop Sharing</span>
          </button>
        ) : (
          <button
            onClick={handleStartSharing}
            disabled={starting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{starting ? 'Starting...' : 'Start Live Sharing'}</span>
          </button>
        )}
      </div>

      {/* Share Session Card if Active */}
      {activeSession && (
        <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-blue-900 dark:text-blue-200">Session Active (Code: {activeSession.shareCode})</strong>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Expires at {new Date(activeSession.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Only people with this secret link can view your live map.
            </p>
          </div>

          <button
            onClick={copyShareLink}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold rounded-xl shadow-sm hover:bg-blue-100 dark:hover:bg-blue-950 flex items-center gap-1.5 transition flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link' : 'Copy Secret Link'}</span>
          </button>
        </div>
      )}

      {/* Interactive Map */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
        <MapView
          userLocation={currentCoords || activeSession?.currentLocation}
          trail={activeSession?.locationTrail || []}
          className="h-96 w-full"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <span>
            Current GPS:{' '}
            {currentCoords
              ? `Lat ${currentCoords.latitude.toFixed(5)}, Lon ${currentCoords.longitude.toFixed(5)} (±${Math.round(currentCoords.accuracy || 10)}m)`
              : 'Acquiring GPS fix...'}
          </span>
          <span>
            Status: <strong className="capitalize">{gpsStatus}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
