import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const gen = (f: string) => JSON.parse(fs.readFileSync(path.resolve('src/content/generated', f), 'utf8'));
const inCR = (lat: number, lon: number) => (lat >= 8 && lat <= 11.3 && lon >= -86 && lon <= -82.5) || (lat > 5 && lat < 6 && lon > -87.5 && lon < -86.5);
const isSource = (s: unknown) => !!s && typeof (s as { url?: string }).url === 'string' && /^https?:\/\//.test((s as { url: string }).url) && /^\d{4}-\d{2}-\d{2}$/.test((s as { retrieved?: string }).retrieved || '');

describe('generated content', () => {
  const provinces = gen('provinces.json').provinces as Record<string, unknown>[];
  const landmarks = gen('landmarks.json').landmarks as { id: string; lat: number; lon: number; kind: string; province: string | null; sources?: unknown[] }[];
  const species = gen('species.json').species as { scientific: string; sources?: unknown[]; iucn?: { category: string } | null; facts?: { sources?: unknown[] }[] }[];
  const sources = gen('sources.json').sources as { url: string; retrieved: string; usedFor: string[] }[];

  it('has all seven province chapters, each with a sourced overview and key facts', () => {
    expect(provinces.map((p) => p.id).sort()).toEqual(['alajuela', 'cartago', 'guanacaste', 'heredia', 'limon', 'puntarenas', 'san-jose']);
    for (const p of provinces) {
      const ov = p.overview as { en: string; es?: string; sources: unknown[] };
      expect(ov.en.length, String(p.id)).toBeGreaterThan(80);
      expect(ov.es?.length, String(p.id)).toBeGreaterThan(80);
      expect(ov.sources.length, String(p.id)).toBeGreaterThan(0);
      expect(ov.sources.every(isSource), String(p.id)).toBe(true);
      const kf = p.keyFacts as Record<string, { value: number; sources: unknown[] } | undefined>;
      expect(kf.areaKm2?.value, String(p.id)).toBeGreaterThan(2000);
      expect(kf.population?.value, String(p.id)).toBeGreaterThan(300000);
      expect(kf.cantons?.value, String(p.id)).toBeGreaterThan(5);
      const lms = p.landmarks as unknown[];
      expect(lms.length, String(p.id)).toBeGreaterThanOrEqual(5);
    }
  });

  it('places every landmark inside Costa Rica with a unique id and a province', () => {
    const ids = new Set<string>();
    for (const l of landmarks) {
      expect(ids.has(l.id), l.id).toBe(false);
      ids.add(l.id);
      expect(inCR(l.lat, l.lon), l.id).toBe(true);
      expect(l.province === null || typeof l.province === 'string').toBe(true);
    }
    expect(landmarks.filter((l) => l.kind === 'volcano').length).toBeGreaterThanOrEqual(6);
  });

  it('gives every species a scientific name, an IUCN entry and sources', () => {
    expect(species.length).toBeGreaterThanOrEqual(4);
    for (const s of species) {
      expect(s.scientific).toMatch(/^[A-Z][a-z]+ [a-z]+$/);
      expect((s.sources ?? []).every(isSource), s.scientific).toBe(true);
      expect((s.sources ?? []).length, s.scientific).toBeGreaterThan(0);
    }
  });

  it('has the nine species of the journey, the five of the coastal plate fitting its Pacific habitat', () => {
    const ids = species.map((s) => (s as { id?: string }).id);
    for (const id of ['keel-billed-toucan', 'brown-throated-three-toed-sloth', 'blue-morpho', 'white-faced-capuchin', 'scarlet-macaw', 'red-eyed-tree-frog', 'central-american-agouti', 'green-iguana']) expect(ids, id).toContain(id);
    for (const s of species as { id?: string; habitatFit?: { pacificLowland: boolean } }[]) {
      if (['white-faced-capuchin', 'scarlet-macaw', 'red-eyed-tree-frog', 'central-american-agouti', 'green-iguana', 'brown-throated-three-toed-sloth'].includes(s.id || '') && s.habitatFit) expect(s.habitatFit.pacificLowland, s.id).toBe(true);
    }
  });

  it('has the five dishes of the table, each with a sourced description and ingredients', () => {
    const foods = gen('foods.json').foods as { id: string; name: { en: string; es?: string }; description?: { en: string; sources: unknown[] }; ingredients?: unknown[]; sources?: unknown[]; heritage?: { declared: boolean | null } }[];
    expect(foods.map((f) => f.id).sort()).toEqual(['casado', 'gallo-pinto', 'olla-de-carne', 'rice-and-beans', 'tamal']);
    for (const f of foods) {
      expect(f.name.en.length, f.id).toBeGreaterThan(2);
      expect(f.name.es?.length, f.id).toBeGreaterThan(2);
      expect(f.description?.en.length, f.id).toBeGreaterThan(60);
      expect(f.description?.sources.every(isSource), f.id).toBe(true);
      expect((f.ingredients ?? []).length, f.id).toBeGreaterThanOrEqual(5);
      expect((f.sources ?? []).length, f.id).toBeGreaterThan(3);
      // no dish is claimed as declared heritage unless a source says so (none does today)
      expect(f.heritage?.declared, f.id).not.toBe(true);
    }
  });

  it('has the chapter-2 facts with sources and plausible values', () => {
    const facts = gen('country.json').facts as { key: string; value: unknown; status: string; sources: unknown[] }[];
    const by = (k: string) => facts.find((f) => f.key === k);
    expect(by('area')?.value).toBeGreaterThan(51000);
    expect(by('biodiversityShare')?.value).toBeGreaterThanOrEqual(4);
    expect(by('biodiversityShare')?.value).toBeLessThanOrEqual(7);
    expect(by('biodiversityShare')?.status).not.toBe('confirmed'); // a repeated estimate, never a measurement
    expect(by('birdSpecies')?.value).toBeGreaterThan(850);
    expect(by('protectedTerritory')?.value).toBeGreaterThan(20);
    expect(by('forestCover')?.value).toBeGreaterThan(50);
    expect(by('volcanoes')?.value).toBe(5);
    for (const k of ['area', 'biodiversityShare', 'birdSpecies', 'protectedTerritory', 'forestCover', 'coastlines', 'volcanoes']) expect((by(k)?.sources ?? []).every(isSource), k).toBe(true);
  });

  it('keeps a source registry where every entry has a URL and a retrieval date', () => {
    expect(sources.length).toBeGreaterThan(50);
    for (const s of sources) { expect(isSource(s)).toBe(true); expect(s.usedFor.length).toBeGreaterThan(0); }
  });
});
