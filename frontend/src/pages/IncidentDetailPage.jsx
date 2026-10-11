import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { MapView } from '../components/map/MapView';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export const IncidentDetailPage = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await api.get(`/emergencies/${id}`);
        if (res?.success) {
          setIncident(res.data.incident);
        }
      } catch (err) {
        toast.error('Failed to load incident detail');
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-slate-500 text-sm">Incident not found or unauthorized.</p>
        <Link to="/history" className="text-purple-600 hover:underline font-semibold mt-2 inline-block">
          ← Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Incident History</span>
      </Link>

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Incident {incident.incidentId}
            </h1>
            <Badge variant={incident.status === 'active' ? 'emergency' : 'success'}>
              {incident.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Trigger type: <strong className="capitalize">{incident.incidentType.replace('_', ' ')}</strong> • Created: {new Date(incident.createdAt).toLocaleString()}
          </p>
        </div>

        {incident.resolvedAt && (
          <div className="text-right text-xs text-slate-500">
            <span>Resolved at:</span>
            <p className="font-bold text-emerald-600">
              {new Date(incident.resolvedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Location Map */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span>Recorded Incident Location & Movement Trail</span>
        </h3>

        <MapView
          userLocation={incident.latestLocation}
          trail={incident.locationTrail || []}
          isEmergency={true}
          className="h-80 w-full"
        />
      </div>

      {/* Notifications & Acknowledgements Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Alerts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Contacts Dispatched</span>
          </h3>
          <div className="space-y-2">
            {(!incident.notifications || incident.notifications.length === 0) ? (
              <p className="text-xs text-slate-400">No contacts were configured.</p>
            ) : (
              incident.notifications.map((n, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{n.name}</span>
                    <p className="text-slate-400 text-[11px]">{n.phone}</p>
                  </div>
                  <Badge variant={n.status === 'delivered' || n.status === 'sent' ? 'success' : 'default'}>
                    {n.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolution Notes & Timeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Resolution Notes</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            {incident.resolutionNotes || 'No notes were provided upon incident closure.'}
          </p>

          {incident.acknowledgements && incident.acknowledgements.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Acknowledgements
              </h4>
              {incident.acknowledgements.map((ack, i) => (
                <div key={i} className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <strong>{ack.contactName}</strong> acknowledged at {new Date(ack.acknowledgedAt).toLocaleTimeString()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
