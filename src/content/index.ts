// Educational content lives in src/content/generated/*.json, produced by tools/build_content.mjs from the
// sourced research in research/*.json. Rendering components only read these typed structures.
import { useEffect, useState } from 'react';
import type { Food, IrazuDossier, Landmark, Place, ProvinceContent, Species, Source, Status } from './types';
import type { Localized } from '../i18n';

export interface CountryFact {
  key: string;
  label: Localized;
  value: number | string;
  unit?: string;
  year?: number | null;
  status: Status;
  text?: Localized;
  sources: Source[];
}
export interface UnescoSite {
  id: string;
  name: Localized;
  inscribed: number[];
  criteria?: string;
  type?: string;
  provinces?: string[];
  coords?: [number, number];
  text?: Localized;
  url?: string;
  sources?: Source[];
}
export interface SourceEntry {
  url: string;
  title: string;
  publisher?: string;
  published?: string | null;
  retrieved: string;
  usedFor: string[];
}
export interface Content {
  provinces: ProvinceContent[];
  landmarks: Landmark[];
  species: Species[];
  foods: Food[];
  places: Place[];
  country: CountryFact[];
  unesco: UnescoSite[];
  sources: SourceEntry[];
  unverified: { claim: string; reason: string; from: string }[];
  retrieved: string;
}

let promise: Promise<Content> | null = null;
export function loadContent(): Promise<Content> {
  if (!promise) {
    promise = Promise.all([
      import('./generated/provinces.json'),
      import('./generated/landmarks.json'),
      import('./generated/species.json'),
      import('./generated/country.json'),
      import('./generated/sources.json'),
      import('./generated/foods.json'),
      import('./generated/places.json'),
    ]).then(([p, l, s, c, src, fd, pls]) => {
      const prov = p.default as unknown as { provinces: ProvinceContent[] };
      const lm = l.default as unknown as { landmarks: Landmark[] };
      const sp = s.default as unknown as { species: Species[]; unesco: UnescoSite[] };
      const co = c.default as unknown as { facts: CountryFact[] };
      const so = src.default as unknown as { sources: SourceEntry[]; unverified: Content['unverified']; retrieved: string };
      const fo = fd.default as unknown as { foods: Food[] };
      const pc = pls.default as unknown as { places: Place[] };
      return { provinces: prov.provinces, landmarks: lm.landmarks, species: sp.species, foods: fo.foods, places: pc.places, unesco: sp.unesco, country: co.facts, sources: so.sources, unverified: so.unverified, retrieved: so.retrieved };
    });
  }
  return promise;
}

let cached: Content | null = null;
export function useContent(): Content | null {
  const [content, setContent] = useState<Content | null>(cached);
  useEffect(() => {
    if (cached) return;
    let alive = true;
    loadContent().then((c) => { cached = c; if (alive) setContent(c); });
    return () => { alive = false; };
  }, []);
  return content;
}

/** The Irazú dossier loads with the eruption panel only. */
let irazuPromise: Promise<IrazuDossier | null> | null = null;
export function loadIrazu(): Promise<IrazuDossier | null> {
  if (!irazuPromise) irazuPromise = import('./generated/irazu.json').then((m) => (m.default as unknown as { irazu: IrazuDossier | null }).irazu);
  return irazuPromise;
}
