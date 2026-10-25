// Cartoon stickers of the site's 15 species, one React component each (docs/ART_STYLE.md → "Stickers").
// Each component returns a <g> drawn in a 0..200 canvas; AnimalSvg wraps one in an <svg>.
import type { CSSProperties, JSX } from 'react';
import { KeelBilledToucan } from './keel-billed-toucan';
import { BrownThroatedThreeToedSloth } from './brown-throated-three-toed-sloth';
import { BlueMorpho } from './blue-morpho';
import { ClayColoredThrush } from './clay-colored-thrush';
import { WhiteFacedCapuchin } from './white-faced-capuchin';
import { ScarletMacaw } from './scarlet-macaw';
import { RedEyedTreeFrog } from './red-eyed-tree-frog';
import { CentralAmericanAgouti } from './central-american-agouti';
import { GreenIguana } from './green-iguana';
import { ResplendentQuetzal } from './resplendent-quetzal';
import { BairdsTapir } from './bairds-tapir';
import { WhiteTailedDeer } from './white-tailed-deer';
import { GreatBlueHeron } from './great-blue-heron';
import { VolcanoHummingbird } from './volcano-hummingbird';
import { PurpleThroatedMountainGem } from './purple-throated-mountain-gem';

export const ANIMAL_ART: Record<string, () => JSX.Element> = {
  'keel-billed-toucan': KeelBilledToucan,
  'brown-throated-three-toed-sloth': BrownThroatedThreeToedSloth,
  'blue-morpho': BlueMorpho,
  'clay-colored-thrush': ClayColoredThrush,
  'white-faced-capuchin': WhiteFacedCapuchin,
  'scarlet-macaw': ScarletMacaw,
  'red-eyed-tree-frog': RedEyedTreeFrog,
  'central-american-agouti': CentralAmericanAgouti,
  'green-iguana': GreenIguana,
  'resplendent-quetzal': ResplendentQuetzal,
  'bairds-tapir': BairdsTapir,
  'white-tailed-deer': WhiteTailedDeer,
  'great-blue-heron': GreatBlueHeron,
  'volcano-hummingbird': VolcanoHummingbird,
  'purple-throated-mountain-gem': PurpleThroatedMountainGem,
};

export const ANIMAL_IDS = Object.keys(ANIMAL_ART);

/** One species sticker in its own <svg>. With a `title` it is an image for assistive tech; without, it is decorative. */
export function AnimalSvg({ species, size = 120, title, className, style }: { species: string; size?: number | string; title?: string; className?: string; style?: CSSProperties }) {
  const Art = ANIMAL_ART[species];
  if (!Art) return null;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} className={className} style={style} focusable="false">
      <Art />
    </svg>
  );
}

export {
  KeelBilledToucan, BrownThroatedThreeToedSloth, BlueMorpho, ClayColoredThrush, WhiteFacedCapuchin, ScarletMacaw,
  RedEyedTreeFrog, CentralAmericanAgouti, GreenIguana, ResplendentQuetzal, BairdsTapir, WhiteTailedDeer, GreatBlueHeron,
  VolcanoHummingbird, PurpleThroatedMountainGem,
};
