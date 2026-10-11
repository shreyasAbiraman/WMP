import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { startRingtoneLoop, stopRingtoneLoop } from '../utils/fakeCallAudio';
import { toast } from 'sonner';

const FakeCallContext = createContext(null);

export const CALL_PRESETS = [
  {
    id: 'mom',
    name: 'Mom',
    relation: 'family',
    subtitle: 'Mobile',
    avatar: '👩',
  },
  {
    id: 'boss',
    name: 'Office / Manager',
    relation: 'work',
    subtitle: 'Work Direct',
    avatar: '💼',
  },
  {
    id: 'friend',
    name: 'Priya (Friend)',
    relation: 'friend',
    subtitle: 'Mobile',
    avatar: '👱‍♀️',
  },
  {
    id: 'doctor',
    name: 'Dr. Mehta Clinic',
    relation: 'custom',
    subtitle: 'Consultation Desk',
    avatar: '🩺',
  },
];

export const FakeCallProvider = ({ children }) => {
  // 'idle' | 'scheduled' | 'incoming' | 'connected'
  const [callState, setCallState] = useState('idle');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Configuration state
  const [callerName, setCallerName] = useState('Mom');
  const [callerRelation, setCallerRelation] = useState('family');
  const [callerSubtitle, setCallerSubtitle] = useState('Mobile');
  const [callerAvatar, setCallerAvatar] = useState('👩');
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [ringtone, setRingtone] = useState('marimba');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [screenTheme, setScreenTheme] = useState('dark');

  // Scheduling state
  const [scheduledSecondsLeft, setScheduledSecondsLeft] = useState(0);

  // Active connected call timer & mock audio toggles
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const scheduleTimerRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const callDurationTimerRef = useRef(null);

  // Stop vibration helper
  const stopVibration = useCallback(() => {
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch (e) {}
  }, []);

  // Start rhythmic vibration helper
  const startVibration = useCallback(() => {
    stopVibration();
    if (!vibrationEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;

    try {
      navigator.vibrate([400, 300, 400, 300, 500, 800]);
      vibrationIntervalRef.current = setInterval(() => {
        try {
          navigator.vibrate([400, 300, 400, 300, 500, 800]);
        } catch (e) {}
      }, 2700);
    } catch (e) {}
  }, [vibrationEnabled, stopVibration]);

  // Clean up all resources when call ends or unmounts
  const cleanupAllSimulationResources = useCallback(() => {
    if (scheduleTimerRef.current) {
      clearInterval(scheduleTimerRef.current);
      scheduleTimerRef.current = null;
    }
    if (callDurationTimerRef.current) {
      clearInterval(callDurationTimerRef.current);
      callDurationTimerRef.current = null;
    }
    stopRingtoneLoop();
    stopVibration();
  }, [stopVibration]);

  useEffect(() => {
    return () => {
      cleanupAllSimulationResources();
    };
  }, [cleanupAllSimulationResources]);

  // Trigger the incoming simulated call immediately
  const triggerIncomingCall = useCallback(() => {
    cleanupAllSimulationResources();
    setCallState('incoming');
    setIsConfigModalOpen(false);

    // Audio & vibration
    startRingtoneLoop(ringtone);
    startVibration();
  }, [cleanupAllSimulationResources, ringtone, startVibration]);

  // Handle scheduling countdown
  const startScheduledCall = useCallback(
    (seconds) => {
      cleanupAllSimulationResources();
      if (seconds <= 0) {
        triggerIncomingCall();
        return;
      }

      setScheduledSecondsLeft(seconds);
      setCallState('scheduled');
      setIsConfigModalOpen(false);
      toast.info(`Fake call scheduled in ${seconds} seconds`, { duration: 4000 });

      scheduleTimerRef.current = setInterval(() => {
        setScheduledSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(scheduleTimerRef.current);
            scheduleTimerRef.current = null;
            triggerIncomingCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [cleanupAllSimulationResources, triggerIncomingCall]
  );

  const cancelScheduledCall = useCallback(() => {
    cleanupAllSimulationResources();
    setCallState('idle');
    setScheduledSecondsLeft(0);
    toast.info('Scheduled fake call cancelled.');
  }, [cleanupAllSimulationResources]);

  // Accept incoming call
  const acceptCall = useCallback(() => {
    stopRingtoneLoop();
    stopVibration();
    setCallState('connected');
    setCallDurationSeconds(0);
    setIsMuted(false);
    setIsSpeaker(false);

    callDurationTimerRef.current = setInterval(() => {
      setCallDurationSeconds((sec) => sec + 1);
    }, 1000);
  }, [stopVibration]);

  // Decline incoming call
  const declineCall = useCallback(() => {
    cleanupAllSimulationResources();
    setCallState('idle');
    toast.info('Call dismissed.');
  }, [cleanupAllSimulationResources]);

  // End active connected call
  const endCall = useCallback(() => {
    cleanupAllSimulationResources();
    setCallState('idle');
    setCallDurationSeconds(0);
    toast.info('Fake call ended.');
  }, [cleanupAllSimulationResources]);

  // Apply a preset identity
  const applyPreset = (presetId) => {
    const preset = CALL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCallerName(preset.name);
      setCallerRelation(preset.relation);
      setCallerSubtitle(preset.subtitle);
      setCallerAvatar(preset.avatar);
    }
  };

  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  return (
    <FakeCallContext.Provider
      value={{
        callState,
        isConfigModalOpen,
        callerName,
        callerRelation,
        callerSubtitle,
        callerAvatar,
        delaySeconds,
        ringtone,
        vibrationEnabled,
        screenTheme,
        scheduledSecondsLeft,
        callDurationSeconds,
        isMuted,
        isSpeaker,
        setCallerName,
        setCallerRelation,
        setCallerSubtitle,
        setCallerAvatar,
        setDelaySeconds,
        setRingtone,
        setVibrationEnabled,
        setScreenTheme,
        setIsMuted,
        setIsSpeaker,
        applyPreset,
        openConfigModal,
        closeConfigModal,
        startScheduledCall,
        cancelScheduledCall,
        triggerIncomingCall,
        acceptCall,
        declineCall,
        endCall,
      }}
    >
      {children}
    </FakeCallContext.Provider>
  );
};

export const useFakeCall = () => {
  const context = useContext(FakeCallContext);
  if (!context) {
    throw new Error('useFakeCall must be used within a FakeCallProvider');
  }
  return context;
};
