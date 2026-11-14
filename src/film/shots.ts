// The shots of the home page's film, in order. Each shot's clip is cut by tools/film_build.py (the take it uses is
// named in tools/film_shots.json) and its frames are counted in manifest.json; this file says how the shots sit on the
// scroll: how much scroll each takes, how it meets the shot before it, and what is written over it.
import manifest from './manifest.json';

export type ChapterId = 'above' | 'water' | 'canopy' | 'coast' | 'fire' | 'city' | 'roots' | 'return';
/** how a shot meets the one before it: 'join' = its first frame is the previous shot's last (one continuous take),
 *  'fade' = a cross-dissolve over the overlap, 'cloud' = a dissolve through white (cloud, mist, steam) */
export type Into = 'join' | 'fade' | 'cloud';
/** how the picture was made — shown under each caption and in the film's notes */
export type Made = 'map' | 'generated' | 'scene' | 'photo';
export type PhotoKey = 'theatre-front' | 'theatre-foyer' | 'ruins-b' | 'spheres-hall' | 'usure' | 'diablitos';

export interface ShotDef {
  id: string;
  chapter: ChapterId;
  into: Into;
  /** where the caption sits on a wide screen */
  side: 'left' | 'right';
  made: Made;
  /** for made = 'photo': the photograph the clip starts from (credits in photoCredits.ts) */
  photo?: PhotoKey;
  /** a link out of the film for this shot */
  link?: { to: string; label: 'map' | 'wildlife' | 'culture' | 'province' | 'place' | 'wild' };
  /** horizontal focus of the picture when a narrow screen crops it (0 = left edge, 1 = right edge) */
  focus?: number;
  /** scroll per frame relative to the default (1); slower shots can take less scroll */
  pace?: number;
  /** false: a travelling shot between two scenes, played without a caption */
  caption?: false;
}

export const SHOT_DEFS: ShotDef[] = [
  // from the map to the canal the film is one flight: each take was generated from the last frame of the one before
  // (the flight from the map's last frame to a frame six seconds into the waterfall take)
  { id: 'map', chapter: 'above', into: 'fade', side: 'left', made: 'map', link: { to: '/explore', label: 'map' }, pace: 1.5 },
  { id: 'sky', chapter: 'above', into: 'join', side: 'left', made: 'generated', link: { to: '/wildlife?focus=scarlet-macaw', label: 'wildlife' } },
  { id: 'falls', chapter: 'water', into: 'join', side: 'left', made: 'generated', link: { to: '/explore?place=rio-celeste', label: 'place' } },
  { id: 'river', chapter: 'water', into: 'join', side: 'right', made: 'generated' },
  { id: 'zip', chapter: 'canopy', into: 'join', side: 'left', made: 'generated', link: { to: '/explore?place=monteverde', label: 'place' } },
  { id: 'drop', chapter: 'canopy', into: 'join', side: 'right', made: 'generated' },
  { id: 'raft', chapter: 'canopy', into: 'join', side: 'left', made: 'generated', link: { to: '/walk', label: 'wild' } },
  { id: 'float', chapter: 'coast', into: 'join', side: 'left', made: 'scene', link: { to: '/explore?place=tortuguero', label: 'place' } },
  { id: 'beach', chapter: 'coast', into: 'join', side: 'right', made: 'scene', link: { to: '/explore?place=manuel-antonio', label: 'place' } },
  { id: 'inland', chapter: 'fire', into: 'join', side: 'left', made: 'generated', caption: false },
  { id: 'volcano', chapter: 'fire', into: 'join', side: 'left', made: 'scene', link: { to: '/explore?place=arenal', label: 'place' } },
  { id: 'crater', chapter: 'fire', into: 'join', side: 'right', made: 'scene', link: { to: '/explore?place=irazu', label: 'place' } },
  { id: 'theatre', chapter: 'city', into: 'cloud', side: 'left', made: 'photo', photo: 'theatre-front', link: { to: '/provinces/san-jose', label: 'province' } },
  { id: 'doors', chapter: 'city', into: 'join', side: 'right', made: 'generated', caption: false },
  { id: 'foyer', chapter: 'city', into: 'join', side: 'right', made: 'photo', photo: 'theatre-foyer' },
  { id: 'ruins', chapter: 'city', into: 'fade', side: 'left', made: 'photo', photo: 'ruins-b', link: { to: '/provinces/cartago', label: 'province' } },
  { id: 'museum', chapter: 'roots', into: 'fade', side: 'right', made: 'photo', photo: 'spheres-hall' },
  { id: 'house', chapter: 'roots', into: 'fade', side: 'right', made: 'photo', photo: 'usure' },
  { id: 'mask', chapter: 'roots', into: 'fade', side: 'left', made: 'photo', photo: 'diablitos', link: { to: '/culture', label: 'culture' } },
  { id: 'up', chapter: 'return', into: 'join', side: 'left', made: 'generated' },
];

export const CHAPTERS: ChapterId[] = ['above', 'water', 'canopy', 'coast', 'fire', 'city', 'roots', 'return'];

/** scroll (in vh) a frame takes at pace 1, and the overlap (vh) of a dissolve */
export const VH_PER_FRAME = 2;
const OVERLAP: Record<Into, number> = { join: 0, fade: 46, cloud: 64 };

export interface Shot extends ShotDef {
  index: number;
  frames: number;
  /** frames a second of the clip (the speed the film plays itself at) */
  fps: number;
  /** size of the clip in each size set, in bytes */
  bytes: Record<string, number>;
  /** position on the scroll, in vh from the top of the film */
  start: number;
  end: number;
  /** vh shared with the previous shot */
  overlap: number;
}

const counts = (manifest as unknown as { shots: Record<string, { frames: number; fps: number; bytes: Record<string, number> }> }).shots;

/** The shots that have frames, laid end to end (a shot whose clip has not been cut yet is left out). */
export function layout(defs: ShotDef[] = SHOT_DEFS): { shots: Shot[]; total: number } {
  const shots: Shot[] = [];
  let cursor = 0;
  for (const def of defs) {
    const c = counts[def.id];
    if (!c || c.frames < 2) continue;
    const length = Math.round(c.frames * VH_PER_FRAME * (def.pace ?? 1));
    const overlap = shots.length ? Math.min(OVERLAP[def.into], length / 3) : 0;
    const start = cursor - overlap;
    shots.push({ ...def, index: shots.length, frames: c.frames, fps: c.fps, bytes: c.bytes, start, end: start + length, overlap });
    cursor = start + length;
  }
  return { shots, total: cursor };
}

export const FILM = layout();
export type SetName = 'sd' | 'hd';
export const SETS = (manifest as unknown as { sets: Record<SetName, { w: number; h: number }> }).sets;
/** a keyframe every this many frames: the unit the player decodes in */
export const KEYINT = (manifest as unknown as { keyint: number }).keyint;

/** What is on screen at a scroll position (vh): the shot under it and, inside a dissolve, the shot coming in. */
export interface FilmState {
  /** the main shot and the frame in it (fractional) */
  shot: number;
  frame: number;
  /** progress through the main shot, 0–1 */
  p: number;
  /** the incoming shot of a dissolve, its frame and how far it has come in (0–1); -1 when there is none */
  next: number;
  nextFrame: number;
  mix: number;
  /** white veil of a 'cloud' dissolve, 0–1 */
  veil: number;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export function stateAt(pos: number, film = FILM): FilmState {
  const { shots } = film;
  const x = Math.max(0, Math.min(film.total, pos));
  // the main shot is the last one that has started and is past the middle of its dissolve
  let i = 0;
  for (let k = 0; k < shots.length; k++) if (x >= shots[k].start + shots[k].overlap / 2) i = k;
  const s = shots[i];
  const local = (sh: Shot) => Math.max(0, Math.min(1, (x - sh.start) / (sh.end - sh.start)));
  const out: FilmState = { shot: i, frame: local(s) * (s.frames - 1), p: local(s), next: -1, nextFrame: 0, mix: 0, veil: 0 };
  // inside the dissolve into this shot: the previous shot is still under it
  if (s.overlap > 0 && x < s.start + s.overlap && i > 0) {
    const prev = shots[i - 1];
    const k = smooth((x - s.start) / s.overlap);
    out.shot = i - 1; out.frame = local(prev) * (prev.frames - 1); out.p = local(prev);
    out.next = i; out.nextFrame = local(s) * (s.frames - 1); out.mix = k;
    if (s.into === 'cloud') out.veil = Math.sin(Math.PI * Math.min(1, (x - s.start) / s.overlap));
  } else if (i + 1 < shots.length) {
    const n = shots[i + 1];
    if (n.overlap > 0 && x >= n.start) {
      const k = smooth((x - n.start) / n.overlap);
      out.next = i + 1; out.nextFrame = local(n) * (n.frames - 1); out.mix = k;
      if (n.into === 'cloud') out.veil = Math.sin(Math.PI * Math.min(1, (x - n.start) / n.overlap));
    }
  }
  return out;
}

/** The shot whose caption is showing at a position: the incoming shot once a dissolve is past its middle. */
export function captionShot(st: FilmState): number {
  return st.next >= 0 && st.mix >= 0.5 ? st.next : st.shot;
}

export const clipUrl = (base: string, shot: string, set: SetName) => `${base}film/${shot}/${set}.pvf`;
export const posterUrl = (base: string, shot: string) => `${base}film/${shot}/poster.webp`;
