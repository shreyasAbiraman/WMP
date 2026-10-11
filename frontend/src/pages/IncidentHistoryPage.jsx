import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import {
  History,
  ShieldAlert,
  Calendar,
  MapPin,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export const IncidentHistoryPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? '/emergencies' : `/emergencies?status=${statusFilter}`;
      const res = await api.get(url);
      if (res?.success) {
        setIncidents(res.data.incidents || []);
      }
    } catch (err) {
      toast.error('Failed to load incident history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Incident History & Timeline</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit trail of past emergency activations, GPS coordinates, and contact alerts.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Incidents</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={History}
          title="No incident logs found"
          description="You have no recorded emergency incidents matching this criteria."
        />
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <Link
              key={inc._id}
              to={`/history/${inc._id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-center justify-between group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {inc.incidentId}
                  </span>
                  <Badge variant={inc.status === 'active' ? 'emergency' : 'success'}>
                    {inc.status}
                  </Badge>
                  <span className="text-xs text-slate-400 capitalize">
                    {inc.incidentType.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>{new Date(inc.createdAt).toLocaleString()}</span>
                  </span>
                  {inc.latestLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>
                        Lat: {inc.latestLocation.latitude?.toFixed(4)}, Lon: {inc.latestLocation.longitude?.toFixed(4)}
                      </span>
                    </span>
                  )}
                  <span>
                    Contacts Alerted: <strong>{inc.notifications?.length || 0}</strong>
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition transform" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
