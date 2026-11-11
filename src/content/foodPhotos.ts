// The photographs of the dishes: plates cut out of Wikimedia Commons pictures by tools/food_plates.py, each with its
// author and licence (tools/food/sources.json). A dish without an entry falls back to the drawn sticker.
import photos from './foodPhotos.generated.json';

export interface FoodPhoto {
  widths: number[];
  /** width / height of an uncut picture ("photo"); the cut-out plates are square */
  aspect?: number;
  title: string;
  author: string;
  licence: string;
  licenceUrl: string;
  page: string;
  /** own: the photographed plate itself · drawn / drawn-bowl: the food is the photograph, the rim around it is drawn
   *  (the picture crops its plate) · none: no plate (the tamal on its leaf) · photo: an uncut picture */
  plate: 'own' | 'drawn' | 'drawn-bowl' | 'none' | 'photo';
  note: string;
}

export const FOOD_PHOTOS = photos as Record<string, FoodPhoto>;
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'food/';
export const foodPhotoSrc = (id: string, w: number) => `${BASE}${id}-${w}.webp`;
export const foodPhotoSrcSet = (id: string) => (FOOD_PHOTOS[id]?.widths ?? []).map((w) => `${foodPhotoSrc(id, w)} ${w}w`).join(', ');
