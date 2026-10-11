import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'emergency':
        return ShieldAlert;
      case 'journey':
        return Navigation;
      default:
        return Bell;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Notifications & Alerts</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time logs of system security, journey alerts, and emergency dispatch events.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 rounded-xl hover:bg-purple-100 transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="You are completely up to date. Safety notifications will appear here."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n._id}
                className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      n.type === 'emergency'
                        ? 'bg-red-100 text-red-600 dark:bg-red-950/60'
                        : 'bg-purple-100 text-purple-600 dark:bg-purple-950/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {n.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Badge variant={n.type === 'emergency' ? 'emergency' : 'default'} className="text-[10px] capitalize">
                  {n.type}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
