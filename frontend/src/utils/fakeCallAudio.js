/**
 * Web Audio API synthesized ringtone generator.
 * Eliminates external MP3 dependencies, license problems, and broken audio paths.
 */

let audioCtx = null;
let ringtoneInterval = null;
let activeOscillators = [];

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a note at a given frequency, duration, and gain
 */
function playTone(freq, duration = 0.2, type = 'sine', startTime = 0, gainVal = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gainNode.gain.setValueAtTime(gainVal, ctx.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);

    activeOscillators.push(osc);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Plays a single cycle of the selected ringtone style
 */
function playRingtoneCycle(style) {
  if (style === 'silent') return;

  if (style === 'classic') {
    // US Phone Dual-Tone Multi-Frequency ring (440Hz + 480Hz)
    playTone(440, 1.6, 'sine', 0, 0.1);
    playTone(480, 1.6, 'sine', 0, 0.1);
  } else if (style === 'modern') {
    // Elegant modern smartphone chime sequence
    playTone(523.25, 0.25, 'triangle', 0, 0.15); // C5
    playTone(659.25, 0.25, 'triangle', 0.2, 0.15); // E5
    playTone(783.99, 0.35, 'triangle', 0.4, 0.15); // G5
    playTone(1046.5, 0.5, 'triangle', 0.65, 0.18); // C6
  } else {
    // 'marimba' (default) - familiar melodic chime pattern
    playTone(659.25, 0.18, 'sine', 0, 0.15); // E5
    playTone(587.33, 0.18, 'sine', 0.15, 0.15); // D5
    playTone(739.99, 0.22, 'sine', 0.3, 0.15); // F#5
    playTone(830.61, 0.22, 'sine', 0.48, 0.15); // G#5
    playTone(587.33, 0.18, 'sine', 0.8, 0.15); // D5
    playTone(659.25, 0.35, 'sine', 1.0, 0.18); // E5
  }
}

/**
 * Starts looping the ringtone
 */
export function startRingtoneLoop(style = 'marimba') {
  stopRingtoneLoop();
  if (style === 'silent') return;

  const cycleDuration = style === 'classic' ? 3500 : 2500;
  playRingtoneCycle(style);

  ringtoneInterval = setInterval(() => {
    playRingtoneCycle(style);
  }, cycleDuration);
}

/**
 * Stops all active oscillators and clears ringtone interval
 */
export function stopRingtoneLoop() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }

  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {}
  });
  activeOscillators = [];
}
