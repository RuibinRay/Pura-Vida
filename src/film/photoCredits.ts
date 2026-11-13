// The photographs some shots of the film start from, with author and licence as recorded from Wikimedia Commons by
// tools/film_photos.py (photoSources.json). Only the photographs the film actually uses are listed.
import sources from './photoSources.json';
import { SHOT_DEFS, type PhotoKey } from './shots';

export interface PhotoCredit {
  key: PhotoKey;
  /** the file's name on Commons, without the extension */
  title: string;
  page: string;
  author: string;
  licence: string;
  licenceUrl: string;
}

type Raw = { file: string; page: string; author: string; licence: string; licenceUrl: string };
const RAW = sources as unknown as Record<string, Raw>;
// Commons writes some author fields with stray brackets ("Mariordo ((Mario Roberto Durán Ortiz)"): tidy them
const tidy = (s: string) => s.replace(/\(\s*\(/g, '(').replace(/\(\s+/g, '(').replace(/\s+/g, ' ').trim();

const used = SHOT_DEFS.map((s) => s.photo).filter((k): k is PhotoKey => !!k);

export const PHOTO_CREDITS: PhotoCredit[] = used.filter((k) => RAW[k]).map((key) => ({
  key,
  title: RAW[key].file.replace(/\.\w+$/, ''),
  page: RAW[key].page,
  author: tidy(RAW[key].author),
  licence: RAW[key].licence,
  licenceUrl: RAW[key].licenceUrl,
}));

export const photoCredit = (key: PhotoKey): PhotoCredit | undefined => PHOTO_CREDITS.find((c) => c.key === key);

/** What the captions that are new to the site were checked against (retrieved 13 November 2026). */
export const FILM_SOURCES: { title: string; publisher: string; url: string; supports: string }[] = [
  { title: 'Precolumbian Chiefdom Settlements with Stone Spheres of the Diquís', publisher: 'UNESCO World Heritage Centre', url: 'https://whc.unesco.org/en/list/1453/', supports: 'Four sites in the Diquís delta, AD 500–1500; spheres 0.7–2.57 m; meaning unknown' },
  { title: 'Indigenous peoples of Costa Rica', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Indigenous_peoples_of_Costa_Rica', supports: 'Eight peoples; the Bribri the most populous, in Talamanca' },
  { title: 'Boruca', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Boruca', supports: 'Painted balsa masks; the yearly Danza de los Diablitos and what it depicts' },
];
