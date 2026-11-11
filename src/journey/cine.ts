// Film clips for the walk's plates. A clip is a short video of the whole plate — generated from the plate itself
// (image-to-video, see docs/HIGGSFIELD_SHOTS.md) — laid exactly over it, so the animals move as filmed animals do
// while the hotspots, the copy and the scroll stay the site's own. A plate without an entry keeps its real-time
// cut-out animation; nothing here is needed for the walk to work.
//
//   loop   plays on repeat while the stop is on stage (generate with the plate as both first and last frame, so the
//          seam is invisible)
//   scrub  is driven by the scroll: the stop's progress is the clip's time (encode with every frame a keyframe —
//          tools/cine_encode.sh scrub), so scrolling back plays it backwards
import type { PlateName } from './Plate';

export interface CineClip {
  /** file stem in public/cine/: <stem>.webm and <stem>.mp4 (both, for Safari) */
  file: string;
  mode: 'loop' | 'scrub';
  /** the clip already shows the plate's animals moving: hide the cut-out animals and let the film carry them */
  replacesAnimals?: boolean;
  /** seconds, for scrub clips */
  duration?: number;
  /** who made it and how, for the credits */
  credit: string;
}

export const CINE: Partial<Record<PlateName, CineClip>> = {
  // forest: { file: 'forest-loop', mode: 'loop', replacesAnimals: true, credit: 'Higgsfield (Seedance 1.5 Pro) from the author\'s plate' },
};
