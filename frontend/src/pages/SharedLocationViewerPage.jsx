import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { MapView } from '../components/map/MapView';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import { Shield, MapPin, Clock, PhoneCall } from 'lucide-react';

export const SharedLocationViewerPage = () => {
  const { code } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/location-sessions/shared/${code}`);
        if (res?.success && res.data?.session) {
          setSession(res.data.session);
          // Connect to socket and join session room for live updates
          socketService.connect();
          socketService.joinSession(code);
        }
      } catch (err) {
        setErrorMsg('This location sharing session is expired, invalid, or has been terminated.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    socketService.on('location:update', (data) => {
      if (data.coordinates) {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentLocation: data.coordinates,
            locationTrail: [...(prev.locationTrail || []), data.coordinates],
          };
        });
      }
    });

    socketService.on('location:status', (data) => {
      if (data.isActive === false) {
        setSession((prev) => (prev ? { ...prev, isActive: false } : null));
      }
    });

    return () => {
      socketService.leaveSession(code);
      socketService.off('location:update');
      socketService.off('location:status');
    };
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 max-w-3xl mx-auto flex items-center justify-center">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (errorMsg || !session) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tracking Session Unavailable</h1>
        <p className="text-sm text-slate-500 max-w-sm mt-2">{errorMsg || 'Session expired'}</p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Return to Women Safety Shield
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-950 p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Live Tracking: {session.userId?.fullName || 'User'}
              </h1>
              <Badge variant={session.isActive ? 'success' : 'default'}>
                {session.isActive ? 'Active Stream' : 'Ended'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Shared securely via Women Safety Shield • Session #{session.shareCode}
            </p>
          </div>
        </div>

        <a
          href="tel:112"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 112 (Emergency)</span>
        </a>
      </div>

      {/* Map */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
        <MapView
          userLocation={session.currentLocation}
          trail={session.locationTrail || []}
          className="h-96 w-full"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Last Location Recorded:{' '}
            {session.currentLocation
              ? `${session.currentLocation.latitude.toFixed(5)}, ${session.currentLocation.longitude.toFixed(5)}`
              : 'Waiting for stream...'}
          </span>
          <span>
            Expires: {new Date(session.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
