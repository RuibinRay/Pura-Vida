import { create } from 'zustand';
import { useSettings, type QualityPref } from '../state/settings';

export type Tier = 'full' | 'lite' | 'still' | 'text';
const ORDER: Tier[] = ['full', 'lite', 'still', 'text'];

interface Probe {
  webgl2: boolean;
  gpu: string;
  cores: number;
  memory: number | null;
  software: boolean;
}

let probe: Probe | null = null;
export function probeDevice(): Probe {
  if (probe) return probe;
  let webgl2 = false;
  let gpu = 'unknown';
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl) {
      webgl2 = !!c.getContext('webgl2');
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webgl2 = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const software = /swiftshader|llvmpipe|software|mesa offscreen|basic render/i.test(gpu);
  probe = { webgl2, gpu, cores: navigator.hardwareConcurrency || 0, memory: nav.deviceMemory ?? null, software };
  return probe;
}

export function autoTier(): { tier: Tier; reason: string } {
  const p = probeDevice();
  if (!p.webgl2) return { tier: 'still', reason: 'no WebGL2' };
  if (p.software) return { tier: 'lite', reason: 'software GPU' };
  if (p.cores && p.cores <= 2) return { tier: 'lite', reason: '≤ 2 CPU cores' };
  if (p.memory !== null && p.memory <= 2) return { tier: 'lite', reason: '≤ 2 GB memory' };
  return { tier: 'full', reason: 'capable device' };
}

function urlTier(): Tier | null {
  const q = new URLSearchParams(window.location.search).get('tier') || new URLSearchParams(window.location.hash.split('?')[1] || '').get('tier');
  return q && (ORDER as string[]).includes(q) ? (q as Tier) : null;
}

interface TierState {
  tier: Tier;
  reason: string;
  demotions: number;
  fps: number;
  dpr: number;
  recompute: () => void;
  demote: (why: string) => void;
  reportFps: (fps: number) => void;
  setDpr: (dpr: number) => void;
}

function resolve(quality: QualityPref, demotions: number): { tier: Tier; reason: string } {
  const forced = urlTier();
  let base: { tier: Tier; reason: string };
  if (forced) base = { tier: forced, reason: '?tier=' + forced };
  else if (quality !== 'auto') base = { tier: quality, reason: 'your setting' };
  else base = autoTier();
  if (demotions > 0 && base.tier !== 'text') {
    const idx = Math.min(ORDER.length - 2, ORDER.indexOf(base.tier) + demotions);
    return { tier: ORDER[idx], reason: base.reason + ' → stepped down (' + demotions + ') after low frame rate' };
  }
  return base;
}

export const useTier = create<TierState>((set, get) => ({
  ...resolve(useSettings.getState().quality, 0),
  demotions: 0,
  fps: 0,
  dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
  recompute: () => set({ ...resolve(useSettings.getState().quality, get().demotions) }),
  demote: () => {
    if (urlTier()) return; // an explicit ?tier= wins over the watchdog
    const demotions = get().demotions + 1;
    set({ demotions, ...resolve(useSettings.getState().quality, demotions) });
  },
  reportFps: (fps) => set({ fps }),
  setDpr: (dpr) => set({ dpr }),
}));

useSettings.subscribe((s, prev) => {
  if (s.quality !== prev.quality) useTier.setState({ demotions: 0, ...resolve(s.quality, 0) });
});

/** Frame-rate watchdog: after a warm-up, sustained low fps steps the tier down once (never up). */
export function makeFpsWatchdog(onDemote: () => void) {
  let frames = 0;
  let last = performance.now();
  let lowSince: number | null = null;
  const start = performance.now();
  let lastReport = start;
  return () => {
    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      const fps = (frames * 1000) / (now - last);
      frames = 0;
      last = now;
      useTier.getState().reportFps(Math.round(fps));
      if (now - start < 4000) return; // warm-up
      if (fps < 22) {
        if (lowSince === null) lowSince = now;
        else if (now - lowSince > 4000 && now - lastReport > 8000) {
          lastReport = now;
          lowSince = null;
          onDemote();
        }
      } else lowSince = null;
    }
  };
}

export function whyStatus(): Record<string, string | number | boolean | null> {
  const p = probeDevice();
  const t = useTier.getState();
  const s = useSettings.getState();
  return {
    tier: t.tier,
    reason: t.reason,
    fps: t.fps,
    dpr: t.dpr,
    gpu: p.gpu,
    webgl2: p.webgl2,
    cores: p.cores,
    memoryGB: p.memory,
    reducedMotionOS: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    motionSetting: s.motion,
    qualitySetting: s.quality,
    paused: s.paused,
    lang: s.lang,
    build: __BUILD_ID__,
  };
}
