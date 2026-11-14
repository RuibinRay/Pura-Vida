// Drives the film from the scroll: every animation frame it reads how far the page has scrolled through the film,
// eases towards it, draws the frame (blending two neighbours while moving, dissolving between shots) and moves the
// captions. Nothing here re-renders React per frame: the canvas and the caption styles are written directly, and
// React only hears when the shot on screen changes.
import { useEffect, useRef, type RefObject } from 'react';
import { FILM, KEYINT, captionShot, stateAt, type FilmState } from './shots';
import { FrameStore, pickSet, type Picture } from './frames';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const clamp01 = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t);
const smooth = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };

export interface PlayerApi {
  /** scroll so that a shot is on screen (its caption in view) */
  goTo: (shot: number, smoothScroll: boolean) => void;
  /** where the film is, 0–1 */
  progress: () => number;
}

export interface PlayerOptions {
  root: RefObject<HTMLElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  /** the caption elements, one per shot, in shot order */
  captions: RefObject<(HTMLElement | null)[]>;
  /** stills instead of frames, and no easing (reduced motion, the still tier) */
  still: boolean;
  /** one size set down (the lite tier) */
  lite: boolean;
  /** the film is playing itself: scroll on at film speed */
  playing: boolean;
  onShot: (shot: number) => void;
  onEnd: () => void;
}

/** Caption opacity over a shot: in after the dissolve, out before the next one. The first shot's caption is there
 *  from the start, the last shot's stays to the end. */
export function captionAlpha(index: number, count: number, p: number): number {
  const fadeIn = index === 0 ? 1 : smooth((p - 0.16) / 0.12);
  const fadeOut = index === count - 1 ? 1 : index === 0 ? 1 - smooth((p - 0.46) / 0.16) : 1 - smooth((p - 0.8) / 0.12);
  return Math.min(fadeIn, fadeOut);
}

export function usePlayer(opts: PlayerOptions): RefObject<PlayerApi | null> {
  const api = useRef<PlayerApi | null>(null);
  const live = useRef(opts);
  live.current = opts;
  const { still, lite } = opts;

  useEffect(() => {
    const root = live.current.root.current;
    const canvas = live.current.canvas.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const { shots, total } = FILM;
    const store = new FrameStore(BASE, pickSet(lite), shots, KEYINT, still);
    let raf = 0;
    let pos = -1; // vh along the film; -1 = not placed yet
    let last = performance.now();
    let idleFor = 0;
    let drawnKey = '';
    let shown = -1;
    let cw = 0, ch = 0;
    let dir = 1;
    // development only: how often the frame asked for was there (tools/film_scrub.mjs reads this)
    const stats = import.meta.env.DEV ? ((window as unknown as { __filmStats?: Record<string, unknown> }).__filmStats = { exact: 0, near: 0, still: 0, moving: store.moving, where: {} as Record<string, number>, set: '', rate: 0, loadingShown: 0 }) as { exact: number; near: number; still: number; moving: boolean; where: Record<string, number>; set: string; rate: number; loadingShown: number } : null;

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(dpr, 2560 / Math.max(1, r.width));
      const w = Math.max(2, Math.round(r.width * scale));
      const h = Math.max(2, Math.round(r.height * scale));
      if (w !== cw || h !== ch) { cw = canvas.width = w; ch = canvas.height = h; drawnKey = ''; }
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    const range = () => Math.max(1, root.offsetHeight - window.innerHeight);
    const target = () => clamp01(-root.getBoundingClientRect().top / range()) * total;

    const cover = (pic: Picture, alpha: number, focus: number) => {
      if (!pic.w || !pic.h) return;
      const s = Math.max(cw / pic.w, ch / pic.h);
      const dw = pic.w * s, dh = pic.h * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(pic.img, (cw - dw) * focus, (ch - dh) / 2, dw, dh);
    };

    // whether the main picture is waiting for its clip (a still stands in), and since when
    let mainWaiting = false;
    let waitingSince = 0;
    let loadingShown = false;
    let loadShown = -1;

    /** Draws one shot at a (fractional) frame; false when nothing of it has arrived yet. */
    const drawShot = (index: number, frame: number, alpha: number, settle: number): boolean => {
      const shot = shots[index];
      const focus = shot.focus ?? 0.5;
      const f0 = Math.floor(frame);
      const f1 = Math.min(shot.frames - 1, f0 + 1);
      // at rest the picture settles on one whole frame, so a stopped film is never a double exposure
      let frac = frame - f0;
      const whole = frac < 0.5 ? 0 : 1;
      frac = frac + (whole - frac) * settle;
      if (frac > 0.02 && frac < 0.98 && store.has(index, f0) && store.has(index, f1)) {
        const a = store.nearest(index, f0)!, b = store.nearest(index, f1)!;
        cover(a, alpha, focus);
        cover(b, alpha * frac, focus);
        if (stats) stats.exact++;
        return true;
      }
      let hit = store.nearest(index, frac < 0.5 ? f0 : f1);
      // the first frames of a shot that continues the one before it: until they are decoded, the last frame of
      // that shot is the same picture, and better than a still from the middle of this one
      if (hit && hit.still && store.moving && shot.into === 'join' && index > 0 && f0 < KEYINT * 2) {
        const prev = store.nearest(index - 1, shots[index - 1].frames - 1);
        if (prev && !prev.still) hit = prev;
      }
      if (alpha === 1) mainWaiting = store.moving && (!hit || hit.still);
      if (!hit) return false;
      if (stats) { if (hit.exact) stats.exact++; else if (hit.still) { stats.still++; stats.where[shot.id + ':' + Math.floor(f0 / KEYINT)] = (stats.where[shot.id + ':' + Math.floor(f0 / KEYINT)] || 0) + 1; } else stats.near++; }
      cover(hit, alpha, focus);
      return true;
    };

    const draw = (st: FilmState, settle: number) => {
      ctx.globalAlpha = 1;
      const ok = drawShot(st.shot, st.frame, 1, settle);
      if (!ok) { ctx.fillStyle = '#0d1f1a'; ctx.fillRect(0, 0, cw, ch); }
      if (st.next >= 0 && st.mix > 0.004) drawShot(st.next, st.nextFrame, st.mix, settle);
      if (st.veil > 0.004) { ctx.globalAlpha = st.veil * 0.94; ctx.fillStyle = '#f4f1e8'; ctx.fillRect(0, 0, cw, ch); }
      ctx.globalAlpha = 1;
    };

    const writeCaptions = (x: number) => {
      const els = live.current.captions.current;
      if (!els) return;
      for (let i = 0; i < shots.length; i++) {
        const el = els[i];
        if (!el) continue;
        const s = shots[i];
        const p = (x - s.start) / (s.end - s.start);
        const a = p < -0.02 || p > 1.02 ? 0 : captionAlpha(i, shots.length, p);
        const q = Math.round(a * 100) / 100;
        if (el.dataset.a !== String(q)) {
          el.dataset.a = String(q);
          el.style.opacity = String(q);
          el.style.setProperty('--rise', ((1 - q) * 14).toFixed(1) + 'px');
          const on = q > 0.05;
          el.style.visibility = on ? 'visible' : 'hidden';
          if (on) el.removeAttribute('inert'); else el.setAttribute('inert', '');
        }
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(80, now - last);
      last = now;
      const o = live.current;
      if (o.playing) {
        // film speed: the clips' own frame rate
        const vhPerSec = (shots[Math.max(0, shown)]?.fps ?? 12) * (total / shots.reduce((n, s) => n + s.frames, 0));
        window.scrollBy(0, (vhPerSec / 100) * window.innerHeight * (dt / 1000));
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) o.onEnd();
      }
      const want = target();
      if (pos < 0 || still) pos = want;
      else {
        const before = pos;
        pos += (want - pos) * (1 - Math.exp(-dt / 105));
        if (Math.abs(want - pos) < 0.015) pos = want;
        if (pos !== before) dir = pos > before ? 1 : -1;
      }
      const moving = Math.abs(want - pos) > 0.015;
      idleFor = moving ? 0 : idleFor + dt;
      const settle = still ? 1 : smooth((idleFor - 60) / 240);
      const st = stateAt(pos);
      // the store follows the shot that carries the picture; the one ahead of it is fetched as "what comes next"
      const lead = st.next >= 0 && st.mix > 0.5;
      // while the film is being carried a long way (a jump from the rail), the shots flying past are not fetched
      if (Math.abs(want - pos) < 160) store.seek(lead ? st.next : st.shot, lead ? st.nextFrame : st.frame, dir, st.next < 0 ? undefined : lead ? [st.shot, st.frame] : [st.next, st.nextFrame]);
      const key = `${pos.toFixed(3)}|${settle.toFixed(2)}|${store.version}|${cw}x${ch}`;
      if (key !== drawnKey) {
        drawnKey = key;
        draw(st, settle);
        writeCaptions(pos);
        root.style.setProperty('--film-p', (pos / total).toFixed(4));
      }
      const cap = captionShot(st);
      if (cap !== shown) { shown = cap; o.onShot(cap); }
      // the loading line: only when the picture has been waiting for its clip for a moment (no flicker on a fast
      // connection), with how much of the shot's clip has arrived
      if (mainWaiting) { if (!waitingSince) waitingSince = now; } else waitingSince = 0;
      const showLoading = mainWaiting && now - waitingSince > 350;
      if (showLoading !== loadingShown) {
        loadingShown = showLoading;
        if (showLoading) root.dataset.loading = ''; else delete root.dataset.loading;
      }
      if (showLoading) {
        const f = Math.round(store.loaded(lead ? st.next : st.shot) * 100) / 100;
        if (f !== loadShown) { loadShown = f; root.style.setProperty('--film-load', String(f)); }
      }
      if (stats) { stats.set = store.currentSet; stats.rate = Math.round(store.rate); stats.loadingShown = (stats.loadingShown || 0) + (showLoading ? 1 : 0); }
    };
    raf = requestAnimationFrame(tick);

    api.current = {
      goTo: (shot, smoothScroll) => {
        const s = shots[Math.max(0, Math.min(shots.length - 1, shot))];
        // a little way in, where the caption is up; the first shot starts at the very top
        const at = s.index === 0 ? 0 : s.start + s.overlap + (s.end - s.start - s.overlap) * 0.3;
        const top = root.getBoundingClientRect().top + window.scrollY + (at / total) * range();
        window.scrollTo({ top, behavior: smoothScroll ? 'smooth' : 'auto' });
      },
      progress: () => (pos < 0 ? 0 : pos / total),
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      store.dispose();
      api.current = null;
    };
  }, [still, lite]);

  return api;
}
