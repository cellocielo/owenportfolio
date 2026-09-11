// Synthesized Web Audio tennis string sound effects (zero external files required)
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
}

export function toggleAudioMute(enabled?: boolean): boolean {
  if (enabled !== undefined) {
    soundEnabled = enabled;
  } else {
    soundEnabled = !soundEnabled;
  }
  return soundEnabled;
}

export function getAudioStatus(): boolean {
  return soundEnabled;
}

export function playTennisPop(frequency = 520, decay = 0.15) {
  if (!soundEnabled || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Sweet spot impact: short percussive snap + hollow string tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency * 1.4, now);
    osc.frequency.exponentialRampToValueAtTime(frequency, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.7, now + decay);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + decay);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + decay);
  } catch {
    // Gracefully handle any browser audio policies
  }
}
