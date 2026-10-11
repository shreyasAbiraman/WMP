import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';
import { Wifi, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ConnectionStatus = () => {
  const [apiOnline, setApiOnline] = useState(null);
  const [socketOnline, setSocketOnline] = useState(socketService.connected);
  const [dbConnected, setDbConnected] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res?.success && res.data?.status === 'healthy') {
          setApiOnline(true);
          setDbConnected(res.data.database?.connected ?? true);
        } else {
          setApiOnline(false);
        }
      } catch (err) {
        setApiOnline(false);
        setDbConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Poll health every 30s

    const handleConnect = () => setSocketOnline(true);
    const handleDisconnect = () => setSocketOnline(false);

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      clearInterval(interval);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
          }`}
        />
        <span className="text-slate-600 dark:text-slate-300">
          API: {apiOnline === null ? 'Checking...' : apiOnline ? 'Connected' : 'Offline'}
        </span>
      </div>

      <span className="text-slate-300 dark:text-slate-600">|</span>

      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            socketOnline ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
        <span className="text-slate-600 dark:text-slate-300">
          Realtime: {socketOnline ? 'Live' : 'Standby'}
        </span>
      </div>
    </div>
  );
};
