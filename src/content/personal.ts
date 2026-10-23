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

export interface PersonalLinks {
  /** the author's own site (public) */
  website?: string;
  /** the repository of this site */
  github?: string;
  /** a contact address; left empty until the author chooses to publish one */
  email?: string;
}

export const PERSONAL = {
  links: { website: 'https://ruibinray.github.io', github: 'https://github.com/RuibinRay/Pura-Vida', email: '' } as PersonalLinks,
  introduction: { en: '', es: '', zh: '' } as Localized,
  photos: [] as PersonalPhoto[],
  favourites: [] as PersonalEntry[],
  stories: [] as PersonalEntry[],
  recommend: [] as PersonalEntry[],
  experiences: [] as PersonalEntry[],
  memories: [] as PersonalEntry[],
};
