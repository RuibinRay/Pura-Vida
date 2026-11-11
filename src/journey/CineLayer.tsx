// A film clip laid over a plate (see cine.ts). It loads only when its stop is near, plays only while its stop is on
// stage and the visitor allows motion, and stays out of the way otherwise: the still plate is always underneath.
import { useEffect, useRef, useState } from 'react';
import type { CineClip } from './cine';
import { onJourney, journey } from './driver';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'cine/';

export function CineLayer({ clip, index, near, current }: { clip: CineClip; /** 1-based stop number */ index: number; near: boolean; current: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // loop: play on stage, pause off it
  useEffect(() => {
    const v = ref.current;
    if (!v || clip.mode !== 'loop') return;
    if (current) v.play().catch(() => undefined); else v.pause();
  }, [current, clip.mode, ready]);

  // scrub: the stop's progress is the clip's time
  useEffect(() => {
    const v = ref.current;
    if (!v || clip.mode !== 'scrub' || !ready) return;
    const dur = clip.duration || v.duration || 0;
    if (!dur) return;
    let raf = 0;
    let want = 0;
    const seek = () => { raf = 0; if (Math.abs(v.currentTime - want) > 0.02) v.currentTime = want; };
    const update = () => { want = Math.min(dur - 0.04, Math.max(0, journey.p[index - 1] * dur)); if (!raf) raf = requestAnimationFrame(seek); };
    update();
    const off = onJourney(update);
    return () => { off(); if (raf) cancelAnimationFrame(raf); };
  }, [clip, index, ready]);

  if (!near) return null;
  return (
    <video ref={ref} className={'plate__cine' + (ready ? ' is-ready' : '')} muted playsInline loop={clip.mode === 'loop'} preload="auto" aria-hidden="true" tabIndex={-1} disablePictureInPicture onLoadedData={() => setReady(true)}>
      <source src={`${BASE}${clip.file}.webm`} type="video/webm" />
      <source src={`${BASE}${clip.file}.mp4`} type="video/mp4" />
    </video>
  );
}
