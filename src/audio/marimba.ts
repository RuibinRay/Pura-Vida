// A marimba note from the Web Audio API: a sine at the pitch, a quieter partial two octaves above it (a marimba bar
// is tuned so its first overtone sits there) and a short wooden knock, all dying away within a second.
// Synthesized — not a recording of an instrument.
let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Equal-tempered frequency of a MIDI note (69 = A4 = 440 Hz). */
export const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** Strikes one bar. `when` is a delay in seconds (for a run of notes). Returns false when audio is unavailable. */
export function strike(midi: number, when = 0, gain = 0.5): boolean {
  const ac = context();
  if (!ac) return false;
  const t0 = ac.currentTime + when;
  const f = midiToHz(midi);
  const out = ac.createGain();
  out.gain.value = gain;
  out.connect(ac.destination);
  const voice = (freq: number, level: number, decay: number, type: OscillatorType = 'sine') => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(level, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
    osc.connect(g).connect(out);
    osc.start(t0);
    osc.stop(t0 + decay + 0.05);
  };
  voice(f, 0.9, 0.9);          // the bar
  voice(f * 4, 0.22, 0.28);    // its tuned overtone
  voice(f * 9.2, 0.06, 0.07, 'triangle'); // the knock of the mallet
  return true;
}
