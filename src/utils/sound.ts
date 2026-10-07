/**
 * Web Audio API synthesized chimes & alarms for desktop notifications and task events
 */

let audioCtx: AudioContext | null = null;
let activeAlarmTimeouts: number[] = [];
let activeAlarmOscillators: OscillatorNode[] = [];

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function stopAlarmSound(): void {
  // Clear any scheduled pulses
  activeAlarmTimeouts.forEach((t) => clearTimeout(t));
  activeAlarmTimeouts = [];

  // Stop any active oscillators immediately
  activeAlarmOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // already stopped
    }
  });
  activeAlarmOscillators = [];
}

export function playCompleteSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    // Pleasant two-tone ascending chord: E5 -> G#5
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch {
    // Ignore audio error if not permitted
  }
}

export function playReminderSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Pleasant double chime: A5 -> D6
    const freqs = [880, 1174.66];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const startTime = now + idx * 0.15;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  } catch {
    // Ignore audio error
  }
}

/**
 * Robust Audible Alarm with repeating pulse sequence for scheduled time & due alerts
 */
export function playAlarmSound(cycles = 4): void {
  try {
    stopAlarmSound();
    const ctx = getAudioContext();
    if (!ctx) return;

    const pulseIntervalMs = 700; // time between pulses
    for (let c = 0; c < cycles; c++) {
      const timeoutId = window.setTimeout(() => {
        try {
          if (!ctx || ctx.state === "closed") return;
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }

          const now = ctx.currentTime;
          // Dual beep in each pulse: High alert tone G5 (784Hz) -> High C6 (1046.5Hz)
          const tones = [
            { freq: 880, start: 0, dur: 0.12 },
            { freq: 1174.66, start: 0.14, dur: 0.18 },
          ];

          tones.forEach(({ freq, start, dur }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "triangle"; // slightly richer harmonic presence than pure sine for alarm
            osc.frequency.setValueAtTime(freq, now + start);

            gain.gain.setValueAtTime(0.001, now + start);
            gain.gain.linearRampToValueAtTime(0.28, now + start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + start);
            osc.stop(now + start + dur + 0.02);

            activeAlarmOscillators.push(osc);
            osc.onended = () => {
              activeAlarmOscillators = activeAlarmOscillators.filter((o) => o !== osc);
            };
          });
        } catch {
          // ignore error
        }
      }, c * pulseIntervalMs);

      activeAlarmTimeouts.push(timeoutId);
    }
  } catch {
    // ignore audio error
  }
}

/**
 * System Startup / ON Due Date Wake-up alert chime (3 ascending bright bells)
 */
export function playSystemOnSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5 -> E5 -> G5 -> C6
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const start = now + idx * 0.12;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.42);
    });
  } catch {
    // ignore audio error
  }
}

