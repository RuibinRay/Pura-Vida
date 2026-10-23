// Procedural forest ambience with the Web Audio API: filtered noise for wind and distant rain,
// a band-passed trickle for a stream, and slow modulation. Synthesized — not a field recording —
// so there is nothing to license and nothing that pretends to be a real bird.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];

function noiseBuffer(ac: AudioContext, seconds = 4) {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) {
    // pink-ish noise (Paul Kellet's economy filter)
    const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046;
    b1 = 0.963 * b1 + w * 0.2965164;
    b2 = 0.57 * b2 + w * 1.0526913;
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
  }
  return buf;
}

export async function startAmbience(): Promise<boolean> {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      const buf = noiseBuffer(ctx);
      // wind through the canopy
      const wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
      const windLP = ctx.createBiquadFilter(); windLP.type = 'lowpass'; windLP.frequency.value = 420; windLP.Q.value = 0.6;
      const windG = ctx.createGain(); windG.gain.value = 0.9;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lfoG = ctx.createGain(); lfoG.gain.value = 240;
      lfo.connect(lfoG).connect(windLP.frequency);
      wind.connect(windLP).connect(windG).connect(master);
      // a stream nearby
      const stream = ctx.createBufferSource(); stream.buffer = buf; stream.loop = true; stream.playbackRate.value = 1.7;
      const streamBP = ctx.createBiquadFilter(); streamBP.type = 'bandpass'; streamBP.frequency.value = 2600; streamBP.Q.value = 0.8;
      const streamG = ctx.createGain(); streamG.gain.value = 0.22;
      stream.connect(streamBP).connect(streamG).connect(master);
      // distant rain / leaf patter
      const rain = ctx.createBufferSource(); rain.buffer = buf; rain.loop = true; rain.playbackRate.value = 0.8;
      const rainHP = ctx.createBiquadFilter(); rainHP.type = 'highpass'; rainHP.frequency.value = 5000;
      const rainG = ctx.createGain(); rainG.gain.value = 0.1;
      const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.023;
      const lfo2G = ctx.createGain(); lfo2G.gain.value = 0.07;
      lfo2.connect(lfo2G).connect(rainG.gain);
      rain.connect(rainHP).connect(rainG).connect(master);
      wind.start(); stream.start(); rain.start(); lfo.start(); lfo2.start();
      nodes = [wind, stream, rain, lfo, lfo2];
    }
    if (ctx.state === 'suspended') await ctx.resume();
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);
    return true;
  } catch {
    return false;
  }
}

export function stopAmbience() {
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
  void nodes;
}

export function ambienceAvailable() {
  return typeof window !== 'undefined' && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
}
