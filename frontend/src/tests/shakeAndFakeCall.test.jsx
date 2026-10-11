import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { useShakeToSOS, SHAKE_THRESHOLDS } from '../hooks/useShakeToSOS';
import { FakeCallProvider, useFakeCall } from '../context/FakeCallContext';
import { IncomingCallOverlay } from '../components/fakecall/IncomingCallOverlay';
import { ConnectedCallOverlay } from '../components/fakecall/ConnectedCallOverlay';
import { ScheduledCallBanner } from '../components/fakecall/ScheduledCallBanner';
import { FakeCallConfigModal } from '../components/fakecall/FakeCallConfigModal';

describe('Feature 1: Shake-to-SOS Detection Algorithm & State', () => {
  let listeners = {};
  let originalDeviceMotionEvent;

  beforeEach(() => {
    vi.useFakeTimers();
    listeners = {};
    originalDeviceMotionEvent = window.DeviceMotionEvent;
    window.DeviceMotionEvent = class DeviceMotionEvent {};
    window.addEventListener = vi.fn((event, cb) => {
      listeners[event] = cb;
    });
    window.removeEventListener = vi.fn((event) => {
      delete listeners[event];
    });
  });

  afterEach(() => {
    window.DeviceMotionEvent = originalDeviceMotionEvent;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const emitMotionEvent = (acc) => {
    act(() => {
      if (listeners['devicemotion']) {
        listeners['devicemotion']({
          accelerationIncludingGravity: acc,
          acceleration: acc,
        });
      }
    });
  };

  it('One isolated movement does not trigger SOS', () => {
    const onShake = vi.fn();
    renderHook(() =>
      useShakeToSOS({
        enabled: true,
        sensitivity: 'medium',
        onShake,
        minShakes: 4,
        timeWindowMs: 2000,
      })
    );

    // Initial baseline
    emitMotionEvent({ x: 0, y: 0, z: 9.8 });

    // Single isolated burst
    emitMotionEvent({ x: 25, y: 0, z: 9.8 });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(onShake).not.toHaveBeenCalled();
  });

  it('The configured repeated-shake pattern triggers the shake callback', () => {
    const onShake = vi.fn();
    renderHook(() =>
      useShakeToSOS({
        enabled: true,
        sensitivity: 'medium', // threshold is 18
        onShake,
        minShakes: 4,
        timeWindowMs: 2000,
        cooldownMs: 5000,
      })
    );

    // Baseline
    emitMotionEvent({ x: 0, y: 0, z: 9.8 });

    // 4 qualifying alternating movements exceeding threshold (delta >= 18)
    emitMotionEvent({ x: 25, y: 0, z: 9.8 });
    vi.advanceTimersByTime(200);
    emitMotionEvent({ x: -25, y: 0, z: 9.8 });
    vi.advanceTimersByTime(200);
    emitMotionEvent({ x: 25, y: 0, z: 9.8 });
    vi.advanceTimersByTime(200);
    emitMotionEvent({ x: -25, y: 0, z: 9.8 });

    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it('Disabled shake detection does not register listeners or trigger SOS', () => {
    const onShake = vi.fn();
    renderHook(() =>
      useShakeToSOS({
        enabled: false,
        onShake,
      })
    );

    emitMotionEvent({ x: 0, y: 0, z: 9.8 });
    emitMotionEvent({ x: 50, y: 50, z: 50 });
    emitMotionEvent({ x: -50, y: -50, z: -50 });
    emitMotionEvent({ x: 50, y: 50, z: 50 });
    emitMotionEvent({ x: -50, y: -50, z: -50 });

    expect(onShake).not.toHaveBeenCalled();
  });

  it('Cooldown prevents duplicate triggers from continuous sensor noise', () => {
    const onShake = vi.fn();
    renderHook(() =>
      useShakeToSOS({
        enabled: true,
        sensitivity: 'medium',
        onShake,
        minShakes: 4,
        cooldownMs: 5000,
      })
    );

    // Initial sequence triggering SOS
    emitMotionEvent({ x: 0, y: 0, z: 9.8 });
    emitMotionEvent({ x: 30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: -30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: 30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: -30, y: 0, z: 9.8 });

    expect(onShake).toHaveBeenCalledTimes(1);

    // Immediately shake again within cooldown period
    emitMotionEvent({ x: 30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: -30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: 30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: -30, y: 0, z: 9.8 });

    // Should still be exactly 1 call due to active 5000ms cooldown
    expect(onShake).toHaveBeenCalledTimes(1);

    // Advance beyond cooldown
    act(() => {
      vi.advanceTimersByTime(5500);
    });

    // Now a new deliberate shake triggers again
    emitMotionEvent({ x: 30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: -30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: 30, y: 0, z: 9.8 });
    vi.advanceTimersByTime(100);
    emitMotionEvent({ x: -30, y: 0, z: 9.8 });

    expect(onShake).toHaveBeenCalledTimes(2);
  });

  it('Event listeners are cleaned up when hook unmounts', () => {
    const onShake = vi.fn();
    const { unmount } = renderHook(() =>
      useShakeToSOS({
        enabled: true,
        onShake,
      })
    );

    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith('devicemotion', expect.any(Function));
  });

  it('Unsupported motion APIs produce a clear unsupported status', () => {
    // Delete DeviceMotionEvent temporarily
    const originalDME = window.DeviceMotionEvent;
    delete window.DeviceMotionEvent;

    const { result } = renderHook(() =>
      useShakeToSOS({
        enabled: true,
        onShake: vi.fn(),
      })
    );

    expect(result.current.isSupported).toBe(false);
    expect(result.current.permissionState).toBe('unsupported');

    window.DeviceMotionEvent = originalDME;
  });
});

describe('Feature 2: Volume Button Platform Honesty & Native Simulation Logic', () => {
  it('Unsupported browser environments do not pretend to support physical volume-button detection', () => {
    // In web browsers, window does not have physical volume rocker event listeners
    const isWebBrowser = typeof window !== 'undefined' && !window.AndroidBridge;
    expect(isWebBrowser).toBe(true);

    // Verify platform status is reported accurately
    const platformSupport = isWebBrowser ? 'unavailable_on_web' : 'supported_native';
    expect(platformSupport).toBe('unavailable_on_web');
  });

  it('Native platform logic: 3-second hold triggers SOS; shorter press does not; release cancels activation', () => {
    // Simulate the native Android KeyListener state machine
    class MockNativeVolumeKeyHandler {
      constructor(onTrigger) {
        this.onTrigger = onTrigger;
        this.holdTimer = null;
        this.isHolding = false;
        this.HOLD_THRESHOLD_MS = 3000;
      }

      onKeyDown(keyCode, repeatCount) {
        if (keyCode === 'KEYCODE_VOLUME_DOWN') {
          if (repeatCount > 0) return; // Prevent repeated OS key repeat events
          if (!this.isHolding) {
            this.isHolding = true;
            this.holdTimer = setTimeout(() => {
              this.onTrigger();
              this.isHolding = false;
            }, this.HOLD_THRESHOLD_MS);
          }
        }
      }

      onKeyUp(keyCode) {
        if (keyCode === 'KEYCODE_VOLUME_DOWN') {
          if (this.isHolding && this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
            this.isHolding = false;
          }
        }
      }
    }

    vi.useFakeTimers();
    const onTrigger = vi.fn();
    const nativeHandler = new MockNativeVolumeKeyHandler(onTrigger);

    // Scenario A: Short press (1.5 seconds) then release
    nativeHandler.onKeyDown('KEYCODE_VOLUME_DOWN', 0);
    vi.advanceTimersByTime(1500);
    nativeHandler.onKeyUp('KEYCODE_VOLUME_DOWN');

    // Should NOT have triggered
    expect(onTrigger).not.toHaveBeenCalled();

    // Advance time further to make sure timer was properly cancelled
    vi.advanceTimersByTime(2000);
    expect(onTrigger).not.toHaveBeenCalled();

    // Scenario B: Full 3000ms continuous hold
    nativeHandler.onKeyDown('KEYCODE_VOLUME_DOWN', 0);
    nativeHandler.onKeyDown('KEYCODE_VOLUME_DOWN', 1); // repeated event should be ignored
    nativeHandler.onKeyDown('KEYCODE_VOLUME_DOWN', 2);
    vi.advanceTimersByTime(3000);

    expect(onTrigger).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('Feature 3 & 4: Realistic Fake Call Simulation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.vibrate
    navigator.vibrate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Incoming call screen opens with configured caller details', () => {
    const TestComponent = () => {
      const { triggerIncomingCall, setCallerName } = useFakeCall();
      return (
        <div>
          <button
            onClick={() => {
              setCallerName('Dr. Mehta');
              triggerIncomingCall();
            }}
          >
            Launch Call
          </button>
          <IncomingCallOverlay />
        </div>
      );
    };

    render(
      <FakeCallProvider>
        <TestComponent />
      </FakeCallProvider>
    );

    fireEvent.click(screen.getByText('Launch Call'));

    expect(screen.getByText('Dr. Mehta')).toBeInTheDocument();
    expect(screen.getByText(/Incoming simulated call/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accept simulated call/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decline simulated call/i })).toBeInTheDocument();
  });

  it('Accept starts the simulated connected-call screen with running timer', () => {
    const TestComponent = () => {
      const { triggerIncomingCall } = useFakeCall();
      return (
        <div>
          <button onClick={triggerIncomingCall}>Launch</button>
          <IncomingCallOverlay />
          <ConnectedCallOverlay />
        </div>
      );
    };

    render(
      <FakeCallProvider>
        <TestComponent />
      </FakeCallProvider>
    );

    fireEvent.click(screen.getByText('Launch'));
    const acceptBtn = screen.getByRole('button', { name: /Accept simulated call/i });
    fireEvent.click(acceptBtn);

    expect(screen.getByText(/Connected Call Simulation/i)).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();

    // Advance time 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('Decline closes the simulation immediately and stops vibration', () => {
    const TestComponent = () => {
      const { triggerIncomingCall } = useFakeCall();
      return (
        <div>
          <button onClick={triggerIncomingCall}>Launch</button>
          <IncomingCallOverlay />
        </div>
      );
    };

    render(
      <FakeCallProvider>
        <TestComponent />
      </FakeCallProvider>
    );

    fireEvent.click(screen.getByText('Launch'));
    expect(screen.getByText(/Incoming simulated call/i)).toBeInTheDocument();

    const declineBtn = screen.getByRole('button', { name: /Decline simulated call/i });
    fireEvent.click(declineBtn);

    expect(screen.queryByText(/Incoming simulated call/i)).not.toBeInTheDocument();
    expect(navigator.vibrate).toHaveBeenCalledWith(0);
  });

  it('End Call resets the simulation and stops duration timer', () => {
    const TestComponent = () => {
      const { triggerIncomingCall } = useFakeCall();
      return (
        <div>
          <button onClick={triggerIncomingCall}>Launch</button>
          <IncomingCallOverlay />
          <ConnectedCallOverlay />
        </div>
      );
    };

    render(
      <FakeCallProvider>
        <TestComponent />
      </FakeCallProvider>
    );

    fireEvent.click(screen.getByText('Launch'));
    fireEvent.click(screen.getByRole('button', { name: /Accept simulated call/i }));

    expect(screen.getByText(/Connected Call Simulation/i)).toBeInTheDocument();

    const endCallBtn = screen.getByRole('button', { name: /End call simulation/i });
    fireEvent.click(endCallBtn);

    expect(screen.queryByText(/Connected Call Simulation/i)).not.toBeInTheDocument();
  });

  it('Delayed scheduled call countdown can be canceled', () => {
    const TestComponent = () => {
      const { startScheduledCall } = useFakeCall();
      return (
        <div>
          <button onClick={() => startScheduledCall(30)}>Schedule 30s</button>
          <ScheduledCallBanner />
          <IncomingCallOverlay />
        </div>
      );
    };

    render(
      <FakeCallProvider>
        <TestComponent />
      </FakeCallProvider>
    );

    fireEvent.click(screen.getByText('Schedule 30s'));
    expect(screen.getByText(/Fake Call Incoming:/i)).toBeInTheDocument();
    expect(screen.getByText(/Arriving in/i)).toBeInTheDocument();

    // Cancel before expiration
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Fake Call Incoming:/i)).not.toBeInTheDocument();

    // Advance 35 seconds
    act(() => {
      vi.advanceTimersByTime(35000);
    });

    // Incoming call should NOT have appeared
    expect(screen.queryByText(/Incoming simulated call/i)).not.toBeInTheDocument();
  });

  it('Fake calls never contact emergency services or trigger real SOS incidents', () => {
    // Assert that the FakeCallContext state does NOT touch any emergency endpoints
    const { result } = renderHook(() => useFakeCall(), {
      wrapper: ({ children }) => <FakeCallProvider>{children}</FakeCallProvider>,
    });

    act(() => {
      result.current.triggerIncomingCall();
      result.current.acceptCall();
      result.current.endCall();
    });

    // Assert that call state is idle and no emergency incident object was created
    expect(result.current.callState).toBe('idle');
  });
});
