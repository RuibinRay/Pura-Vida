import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { midiToHz } from '../src/audio/marimba';
import { BARS } from '../src/ui/Marimba';
import { CULTURE_ALT } from '../src/content/culturePhotos';
import type { CultureEntry, Landmark } from '../src/content/types';

const read = (f: string) => JSON.parse(fs.readFileSync(path.resolve(f), 'utf8'));
const culture = read('src/content/generated/culture.json').culture as CultureEntry[];
const landmarks = new Set((read('src/content/generated/landmarks.json').landmarks as Landmark[]).map((l) => l.id));
const photos = read('src/content/culturePhotos.generated.json') as Record<string, { widths: number[]; author: string; licence: string; licenceUrl: string; page: string; title: string }>;
const photoSources = read('tools/culture/sources.json') as Record<string, { title: string; author: string; description: string }>;
const research = read('research/culture.json') as { entries: { id: string }[]; unverified: { claim: string; reason: string }[] };

describe('the culture chapter', () => {
  it('has every researched entry, in the three groups, each with text in two languages and a source', () => {
    expect(culture.map((c) => c.id).sort()).toEqual(research.entries.map((e) => e.id).sort());
    for (const g of ['music', 'traditions', 'coffee']) expect(culture.some((c) => c.group === g), g).toBe(true);
    for (const c of culture) {
      expect(c.name.en && c.name.es && c.name.zh, c.id).toBeTruthy();
      expect(c.text.en.length, c.id).toBeGreaterThan(80);
      expect((c.text.es || '').length, c.id).toBeGreaterThan(80);
      expect(c.sources.length, c.id).toBeGreaterThan(0);
      for (const s of c.sources) { expect(s.url, c.id).toMatch(/^https?:\/\//); expect(s.retrieved, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/); }
      for (const f of c.facts) expect(f.label.en && f.label.es && f.label.zh, `${c.id} fact ${f.value}`).toBeTruthy();
    }
  });
  it('points only at places that are on the map', () => {
    for (const c of culture) for (const id of c.places) expect(landmarks.has(id), `${c.id} → ${id}`).toBe(true);
  });
  it('carries the declaring instrument of the national symbols it is about', () => {
    const sym = (id: string) => culture.find((c) => c.id === id)!.symbols;
    expect(sym('marimba')[0]).toMatchObject({ id: 'marimba', year: 1996 });
    expect(sym('boyeo-carreta').map((s) => s.id).sort()).toEqual(['boyeo', 'carreta']);
    expect(sym('coffee-history')[0].year).toBe(2020);
    for (const c of culture) for (const s of c.symbols) expect(s.instrument, `${c.id} ${s.id}`).toBeTruthy();
  });
  it('says what it could not verify', () => {
    expect(research.unverified.length).toBeGreaterThan(3);
    for (const u of research.unverified) { expect(u.claim.length).toBeGreaterThan(10); expect(u.reason.length).toBeGreaterThan(10); }
  });
  it('credits every photograph and describes it in three languages', () => {
    for (const [id, p] of Object.entries(photos)) {
      expect(culture.some((c) => c.id === id), id).toBe(true);
      expect(p.author.length, id).toBeGreaterThan(1);
      expect(p.licence, id).toMatch(/^(CC0|Public domain|CC BY(-SA)? \d\.\d)$/);
      expect(p.page, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(photoSources[id].title, id).toBe('File:' + p.title);
      expect(photoSources[id].author, id).toBe(p.author);
      const alt = CULTURE_ALT[id];
      expect(alt?.en && alt.es && alt.zh, id).toBeTruthy();
      for (const w of p.widths) expect(fs.existsSync(`public/culture/${id}-${w}.webp`), `${id}-${w}`).toBe(true);
    }
  });
});

describe('the marimba', () => {
  it('is tuned: fifteen white notes from C4 to C6, A4 at 440 Hz', () => {
    expect(BARS).toHaveLength(15);
    expect(BARS[0]).toMatchObject({ name: 'C4', midi: 60 });
    expect(BARS[14]).toMatchObject({ name: 'C6', midi: 84 });
    expect(BARS.map((b) => b.midi)).toEqual([60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84]);
    expect(midiToHz(69)).toBe(440);
    expect(midiToHz(60)).toBeCloseTo(261.63, 1);
    expect(midiToHz(81)).toBeCloseTo(880, 6);
  });
});
