// One picture for a species wherever the site needs a small portrait: the cartoon drawn for it, or — for the species
// that arrived with the wildlife trail and have no cartoon — the author's own cut-out. Never an empty frame.
import type { CSSProperties } from 'react';
import { ANIMAL_ART, AnimalSvg } from '../art/animals';
import { STICKERS, stickerSrc } from '../journey/trailZones';

export function hasAnimalPicture(species: string) {
  return !!ANIMAL_ART[species] || !!STICKERS[species];
}

/** The smallest built width of a sticker that still covers `px` CSS pixels on a 2× screen. */
export function stickerFor(species: string, px: number): string | null {
  const s = STICKERS[species];
  if (!s) return null;
  const w = s.widths.find((v) => v >= px * 2) ?? s.widths[s.widths.length - 1];
  return stickerSrc(species, w);
}

export function AnimalPicture({ species, size = 120, title, className, style }: { species: string; size?: number; title?: string; className?: string; style?: CSSProperties }) {
  if (ANIMAL_ART[species]) return <AnimalSvg species={species} size={size} title={title} className={className} style={style} />;
  const src = stickerFor(species, size);
  if (!src) return null;
  return <img src={src} width={size} height={size} alt={title ?? ''} aria-hidden={title ? undefined : true} className={className} style={{ objectFit: 'contain', ...style }} loading="lazy" decoding="async" />;
}
