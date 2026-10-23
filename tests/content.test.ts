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

  it('keeps a source registry where every entry has a URL and a retrieval date', () => {
    expect(sources.length).toBeGreaterThan(50);
    for (const s of sources) { expect(isSource(s)).toBe(true); expect(s.usedFor.length).toBeGreaterThan(0); }
  });
});
