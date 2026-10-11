import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import { useShakeToSOS } from '../hooks/useShakeToSOS';
import { toast } from 'sonner';

const EmergencyContext = createContext(null);

export const EmergencyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeIncident, setActiveIncident] = useState(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [countdownTriggerType, setCountdownTriggerType] = useState('sos_button');
  const [shakeModalOpen, setShakeModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unavailable'
  const [testSimulationResult, setTestSimulationResult] = useState(null);
  const [activationError, setActivationError] = useState(null);

  const timerRef = useRef(null);
  const watchIdRef = useRef(null);

  const isTestMode = user?.preferences?.shakeTestMode ?? false;
  const shakeEnabled = user?.preferences?.shakeDetectionEnabled ?? false;
  const shakeSensitivityLevel = user?.preferences?.shakeSensitivityLevel ?? 'medium';

  // Check for active incident on authentication
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveIncident(null);
      return;
    }

    const checkActive = async () => {
      try {
        const res = await api.get('/emergencies/active');
        if (res?.success && res.data?.incident) {
          setActiveIncident(res.data.incident);
          startLocationTracking(res.data.incident._id);
        }
      } catch (err) {
        console.warn('Active incident check failed:', err.message);
      }
    };

    checkActive();

    // Socket listeners for real-time alerts
    socketService.on('emergency:created', (incident) => {
      setActiveIncident(incident);
      toast.error('Emergency SOS is currently ACTIVE!', { duration: 6000 });
    });

    socketService.on('emergency:status', (data) => {
      if (data.status === 'resolved') {
        setActiveIncident(null);
        stopLocationTracking();
        toast.success('Emergency incident marked as resolved.');
      }
    });

    socketService.on('contact:acknowledged', (ack) => {
      toast.info(`Contact ${ack.contactName} acknowledged your emergency alert!`);
      setActiveIncident((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          acknowledgements: [...(prev.acknowledgements || []), ack],
        };
      });
    });

    return () => {
      socketService.off('emergency:created');
      socketService.off('emergency:status');
      socketService.off('contact:acknowledged');
      stopLocationTracking();
    };
  }, [isAuthenticated]);

  // Request browser geolocation once to determine status
  const requestLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGpsStatus('unavailable');
        resolve(null);
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          setCurrentCoords(coords);
          setGpsStatus('granted');
          setIsLocating(false);
          resolve(coords);
        },
        (err) => {
          setIsLocating(false);
          if (err.code === err.PERMISSION_DENIED) {
            setGpsStatus('denied');
          } else {
            setGpsStatus('unavailable');
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });
  };

  const startLocationTracking = (incidentDbId) => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setCurrentCoords(coords);

        // Send throttled trail updates to backend
        if (incidentDbId) {
          try {
            await api.post(`/emergencies/${incidentDbId}/location`, coords);
          } catch (e) {}
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const executeEmergencyActivation = async (triggerType) => {
    // If in test mode, simulate activation without sending alerts
    if (isTestMode) {
      setCountdownActive(false);
      setTestSimulationResult({
        incidentId: `TEST-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        simulatedAt: new Date().toISOString(),
      });
      toast.info('Test Mode: Simulated SOS triggered safely. No SMS or emergency alerts dispatched.', {
        duration: 5000,
      });
      return;
    }

    toast.loading('Activating Emergency SOS...', { id: 'sos-act' });
    setActivationError(null);
    try {
      const coords = await requestLocation();
      const payload = {
        incidentType: triggerType || 'sos_button',
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        accuracy: coords?.accuracy,
      };

      const res = await api.post('/emergencies', payload);
      if (res?.success && res.data?.incident) {
        setActiveIncident(res.data.incident);
        startLocationTracking(res.data.incident._id);
        setShakeModalOpen(false);
        toast.success(`Emergency SOS activated! (Incident #${res.data.incident.incidentId})`, { id: 'sos-act' });
      }
    } catch (err) {
      setActivationError(err.message || 'Unable to connect to emergency dispatch.');
      toast.error(`SOS activation failed: ${err.message}`, { id: 'sos-act' });
    }
  };

  // Handle countdown trigger
  useEffect(() => {
    if (countdownActive) {
      if (countdownSeconds > 0) {
        timerRef.current = setTimeout(() => {
          setCountdownSeconds((sec) => sec - 1);
        }, 1000);
      } else {
        // Countdown reached 0 -> execute emergency
        setCountdownActive(false);
        executeEmergencyActivation(countdownTriggerType);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdownActive, countdownSeconds, countdownTriggerType, isTestMode]);

  const startSosCountdown = (triggerType = 'sos_button', isShake = false) => {
    if (activeIncident) {
      toast.info('An emergency incident is already active.');
      return;
    }
    const defaultCountdown = user?.preferences?.countdownDurationSeconds ?? 5;
    if (defaultCountdown <= 0 && !isShake) {
      triggerSosImmediately(triggerType);
      return;
    }
    setCountdownTriggerType(triggerType);
    setCountdownSeconds(defaultCountdown > 0 ? defaultCountdown : 3);
    setCountdownActive(true);
    setActivationError(null);
    setTestSimulationResult(null);
    if (isShake) {
      setShakeModalOpen(true);
    }
  };

  const cancelSosCountdown = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCountdownActive(false);
    setShakeModalOpen(false);
    setActivationError(null);
    setTestSimulationResult(null);
    const defaultCountdown = user?.preferences?.countdownDurationSeconds ?? 5;
    setCountdownSeconds(defaultCountdown);
    toast.info('Emergency SOS countdown cancelled. You are safe.');
  };

  const triggerSosImmediately = (triggerType = 'sos_button') => {
    setCountdownActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    executeEmergencyActivation(triggerType);
  };

  const clearTestSimulation = () => {
    setTestSimulationResult(null);
    setShakeModalOpen(false);
  };

  const resolveActiveIncident = async (resolutionNotes) => {
    if (!activeIncident?._id) return;
    try {
      const res = await api.patch(`/emergencies/${activeIncident._id}/resolve`, {
        resolutionNotes: resolutionNotes || 'Resolved safely by user',
      });
      if (res?.success) {
        setActiveIncident(null);
        stopLocationTracking();
        toast.success('Incident closed safely.');
      }
    } catch (err) {
      toast.error(`Failed to resolve incident: ${err.message}`);
    }
  };

  // Shake gesture callback
  const handleShakeDetected = useCallback(() => {
    if (activeIncident || countdownActive) return; // Prevent duplicate active alerts

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (e) {}

    startSosCountdown('shake_gesture', true);
  }, [activeIncident, countdownActive]);

  const shakeSensor = useShakeToSOS({
    enabled: isAuthenticated && shakeEnabled,
    sensitivity: shakeSensitivityLevel,
    onShake: handleShakeDetected,
  });

  return (
    <EmergencyContext.Provider
      value={{
        activeIncident,
        countdownActive,
        countdownSeconds,
        countdownTriggerType,
        shakeModalOpen,
        isTestMode,
        testSimulationResult,
        activationError,
        isLocating,
        currentCoords,
        gpsStatus,
        shakeSensor,
        requestLocation,
        startSosCountdown,
        cancelSosCountdown,
        triggerSosImmediately,
        clearTestSimulation,
        resolveActiveIncident,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
