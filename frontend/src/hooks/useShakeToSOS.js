import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Sensitivity presets (delta acceleration threshold in m/s²)
 * Low: Requires very vigorous deliberate shaking (resistant to accidental triggers)
 * Medium: Balanced for typical one-handed phone shaking
 * High: Sensitive, triggers on lighter repeated shakes
 */
export const SHAKE_THRESHOLDS = {
  low: 25,
  medium: 18,
  high: 12,
};

/**
 * Custom hook to detect continuous phone shaking using DeviceMotionEvent.
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Whether detection is active
 * @param {'low'|'medium'|'high'} [options.sensitivity='medium'] - Preset sensitivity
 * @param {number} [options.customThreshold] - Optional explicit threshold override
 * @param {Function} options.onShake - Callback invoked when shake pattern is detected
 * @param {number} [options.minShakes=4] - Minimum qualifying directional reversals needed
 * @param {number} [options.timeWindowMs=2000] - Window within which qualifying movements must occur
 * @param {number} [options.cooldownMs=5000] - Inactivity buffer after a trigger to prevent repeated activations
 */
export function useShakeToSOS({
  enabled = false,
  sensitivity = 'medium',
  customThreshold,
  onShake,
  minShakes = 4,
  timeWindowMs = 2000,
  cooldownMs = 5000,
}) {
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [isListening, setIsListening] = useState(false);
  const [lastDetectedAt, setLastDetectedAt] = useState(null);

  const lastCoordsRef = useRef({ x: null, y: null, z: null, time: 0 });
  const shakeTimestampsRef = useRef([]);
  const lastTriggerTimeRef = useRef(0);
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  // Determine sensor availability
  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setIsSupported(false);
      setPermissionState('unsupported');
    } else if (typeof DeviceMotionEvent.requestPermission !== 'function') {
      // Browsers like Chrome on Android don't require explicit requestPermission()
      setPermissionState('granted');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setPermissionState('unsupported');
      return false;
    }

    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
          return true;
        } else {
          setPermissionState('denied');
          return false;
        }
      } catch (err) {
        console.warn('Motion permission request failed:', err);
        setPermissionState('denied');
        return false;
      }
    }

    setPermissionState('granted');
    return true;
  }, []);

  // Compute effective threshold
  const threshold = customThreshold || SHAKE_THRESHOLDS[sensitivity] || SHAKE_THRESHOLDS.medium;

  useEffect(() => {
    if (!enabled || !isSupported || permissionState === 'denied' || permissionState === 'unsupported') {
      setIsListening(false);
      shakeTimestampsRef.current = [];
      return;
    }

    let isCleanedUp = false;

    const handleMotion = (event) => {
      if (isCleanedUp) return;

      // Ignore motion when user is typing into text inputs, textareas, or dropdowns
      const activeElement = document.activeElement;
      if (activeElement) {
        const tag = activeElement.tagName?.toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || activeElement.isContentEditable) {
          return;
        }
      }

      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const now = Date.now();
      const last = lastCoordsRef.current;

      if (last.x !== null) {
        const deltaX = Math.abs(acc.x - last.x);
        const deltaY = Math.abs(acc.y - last.y);
        const deltaZ = Math.abs(acc.z - last.z);
        const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

        // Check if movement exceeds threshold
        if (delta >= threshold) {
          // Discard shake timestamps that fall outside the sliding window
          const cutoff = now - timeWindowMs;
          shakeTimestampsRef.current = shakeTimestampsRef.current.filter((t) => t > cutoff);
          shakeTimestampsRef.current.push(now);

          // Check if deliberate continuous shake threshold is reached
          if (shakeTimestampsRef.current.length >= minShakes) {
            // Enforce cooldown to prevent duplicate activations
            if (now - lastTriggerTimeRef.current >= cooldownMs) {
              lastTriggerTimeRef.current = now;
              shakeTimestampsRef.current = [];
              setLastDetectedAt(now);

              if (typeof onShakeRef.current === 'function') {
                onShakeRef.current();
              }
            }
          }
        }
      }

      lastCoordsRef.current = {
        x: acc.x,
        y: acc.y,
        z: acc.z,
        time: now,
      };
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });
    setIsListening(true);

    return () => {
      isCleanedUp = true;
      window.removeEventListener('devicemotion', handleMotion);
      setIsListening(false);
      shakeTimestampsRef.current = [];
      lastCoordsRef.current = { x: null, y: null, z: null, time: 0 };
    };
  }, [enabled, isSupported, permissionState, threshold, minShakes, timeWindowMs, cooldownMs]);

  return {
    isSupported,
    permissionState,
    isListening,
    threshold,
    lastDetectedAt,
    requestPermission,
  };
}
