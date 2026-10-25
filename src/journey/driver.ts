// The one scroll system of the homepage. A sticky stage shows the visuals; the chapter sections scroll past it.
// Each frame in which the scroll position changed, the driver computes one number per chapter (its progress 0→1)
// and a continuous "journey time" t = chapter index + progress (0→N). Everything visual is a pure function of t:
// CSS reads it through custom properties (--jt, --p1…--pN), React Three Fiber reads it from `journey` in useFrame.
// Because nothing is time-based, scrolling backwards replays everything in reverse.
import { useEffect, type RefObject } from 'react';
import { STOP_COUNT } from './scenes';

export const CHAPTER_COUNT = STOP_COUNT;

export interface JourneyState {
  /** continuous journey time, 0 … CHAPTER_COUNT */
  t: number;
  /** progress of each chapter, 0 … 1 */
  p: number[];
  /** active chapter, 0-based */
  chapter: number;
  /** pointer offset within the stage, −1 … 1 (smoothed) */
  px: number;
  py: number;
  vw: number;
  vh: number;
  /** reduced motion: layers do not move, only crossfades remain */
  calm: boolean;
  /** scroll velocity estimate (px per frame), for subtle motion blur-free emphasis */
  velocity: number;
}

export const journey: JourneyState = { t: 0, p: new Array(CHAPTER_COUNT).fill(0), chapter: 0, px: 0, py: 0, vw: 1, vh: 1, calm: false, velocity: 0 };

type Listener = (j: JourneyState) => void;
const listeners = new Set<Listener>();
export function onJourney(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function notify() { for (const fn of listeners) fn(journey); }

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Progress 0→1 of `t` across [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Attaches the driver to the journey root. Chapters are the root's descendants with `data-chapter`.
 * Writes --jt and --p1…--p6 on the root and keeps `journey` current.
 */
export function useJourneyDriver(rootRef: RefObject<HTMLElement | null>, calm: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    journey.calm = calm;
    root.style.setProperty('--calm', calm ? '1' : '0');
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
    let tops: number[] = [];
    let lens: number[] = [];
    let rootTop = 0;
    let lastY = -1;
    let raf = 0;
    let pointerRaf = 0;
    let targetPx = 0;
    let targetPy = 0;

    const measure = () => {
      const vh = window.innerHeight;
      journey.vh = vh;
      journey.vw = window.innerWidth;
      rootTop = root.getBoundingClientRect().top + window.scrollY;
      tops = chapters.map((c) => c.getBoundingClientRect().top + window.scrollY - rootTop);
      // a chapter runs from its top to the next chapter's top; the last one ends where the page ends
      lens = chapters.map((c, i) => Math.max(1, i < chapters.length - 1 ? tops[i + 1] - tops[i] : c.offsetHeight - vh));
      lastY = -1;
      update();
    };

    const update = () => {
      raf = 0;
      const y = window.scrollY - rootTop;
      if (y === lastY) return;
      journey.velocity = lastY < 0 ? 0 : y - lastY;
      lastY = y;
      let t = 0;
      let active = 0;
      for (let i = 0; i < chapters.length; i++) {
        const p = clamp01((y - tops[i]) / lens[i]);
        journey.p[i] = p;
        if (y >= tops[i]) { active = i; t = i + p; }
      }
      journey.t = t;
      journey.chapter = active;
      root.style.setProperty('--jt', t.toFixed(4));
      for (let i = 0; i < chapters.length; i++) root.style.setProperty(`--p${i + 1}`, journey.p[i].toFixed(4));
      if (root.dataset.chapter !== String(active + 1)) root.dataset.chapter = String(active + 1);
      notify();
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => measure();

    // pointer parallax: smoothed toward the pointer, only while it is moving
    const tickPointer = () => {
      pointerRaf = 0;
      const k = 0.12;
      const nx = journey.px + (targetPx - journey.px) * k;
      const ny = journey.py + (targetPy - journey.py) * k;
      if (Math.abs(nx - journey.px) < 0.0005 && Math.abs(ny - journey.py) < 0.0005) { journey.px = targetPx; journey.py = targetPy; }
      else { journey.px = nx; journey.py = ny; pointerRaf = requestAnimationFrame(tickPointer); }
      root.style.setProperty('--px', journey.px.toFixed(4));
      root.style.setProperty('--py', journey.py.toFixed(4));
      notify();
    };
    const onPointer = (e: PointerEvent) => {
      if (calm || e.pointerType === 'touch') return;
      targetPx = (e.clientX / journey.vw) * 2 - 1;
      targetPy = (e.clientY / journey.vh) * 2 - 1;
      if (!pointerRaf) pointerRaf = requestAnimationFrame(tickPointer);
    };
    const onLeave = () => { targetPx = 0; targetPy = 0; if (!pointerRaf) pointerRaf = requestAnimationFrame(tickPointer); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    root.addEventListener('pointermove', onPointer, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    ro?.observe(root);
    measure();
    // fonts and images can change the chapter heights after first paint
    const late = window.setTimeout(measure, 600);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      root.removeEventListener('pointermove', onPointer);
      root.removeEventListener('pointerleave', onLeave);
      ro?.disconnect();
      window.clearTimeout(late);
      if (raf) cancelAnimationFrame(raf);
      if (pointerRaf) cancelAnimationFrame(pointerRaf);
      journey.t = 0; journey.chapter = 0; journey.p.fill(0); journey.px = 0; journey.py = 0;
    };
  }, [rootRef, calm]);
}

/** Scrolls so that chapter `index` (0-based) starts at the top of the viewport. */
export function scrollToChapter(root: HTMLElement, index: number, smooth = true) {
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
  const c = chapters[index];
  if (!c) return;
  const top = c.getBoundingClientRect().top + window.scrollY + 2;
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}
