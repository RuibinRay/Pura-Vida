// "Where I come from" — the author's own words and photographs.
// Nothing here is written on the author's behalf. Fill a field and it appears; empty fields stay hidden
// on the public site and show as marked placeholders only with ?draft in the URL.
import type { Localized } from '../i18n';

export interface PersonalPhoto {
  src: string; // put files in public/personal/ and reference them as 'personal/<file>.webp'
  alt: Localized;
  caption?: Localized;
}
export interface PersonalEntry {
  title: Localized;
  text: Localized;
}

export const PERSONAL = {
  introduction: { en: '', es: '', zh: '' } as Localized,
  photos: [] as PersonalPhoto[],
  favourites: [] as PersonalEntry[],
  stories: [] as PersonalEntry[],
  recommend: [] as PersonalEntry[],
  experiences: [] as PersonalEntry[],
  memories: [] as PersonalEntry[],
};
