import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LAYOUTS } from '../src/journey/FlavorsTable';

const read = (f: string) => JSON.parse(fs.readFileSync(path.resolve(f), 'utf8'));
const foods = read('src/content/generated/foods.json').foods as { id: string }[];
const photos = read('src/content/foodPhotos.generated.json') as Record<string, { widths: number[]; title: string; author: string; licence: string; licenceUrl: string; page: string; plate: string }>;
const sources = read('tools/food/sources.json') as Record<string, { title: string; author: string; licence: string; description: string }>;
const OPEN = /^(CC0|Public domain|CC BY(-SA)? \d\.\d)$/;

describe('the photographs of the dishes', () => {
  it('gives every dish a photograph with its files', () => {
    for (const f of foods) {
      const p = photos[f.id];
      expect(p, f.id).toBeDefined();
      expect(p.plate).toMatch(/^(own|drawn|drawn-bowl|none)$/);
      for (const w of p.widths) expect(fs.existsSync(`public/food/${f.id}-${w}.webp`), `${f.id}-${w}`).toBe(true);
    }
  });
  it('credits every photograph: an author, an open licence, the page it came from', () => {
    for (const [id, p] of Object.entries(photos)) {
      expect(p.author.length, id).toBeGreaterThan(1);
      expect(p.licence, id).toMatch(OPEN);
      expect(p.page, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      if (!/^(CC0|Public domain)$/.test(p.licence)) expect(p.licenceUrl, id).toMatch(/^https?:\/\/creativecommons\.org\//);
      // the credit shown is the credit of the file that was cut (the two are written by different tools)
      expect(sources[id].title, id).toBe('File:' + p.title);
      expect(sources[id].author, id).toBe(p.author);
    }
  });
  it('shows no dish of another country as a Costa Rican one', () => {
    for (const [id, s] of Object.entries(sources)) expect(`${s.title} ${s.description}`, id).not.toMatch(/nicarag|panam|colombia|mexic|cuba/i);
  });
  it('sets the same five dishes on the table in both orientations, inside it', () => {
    const ids = foods.map((f) => f.id).sort();
    for (const [name, l] of Object.entries(LAYOUTS)) {
      expect(l.dishes.map((d) => d.id).sort(), name).toEqual(ids);
      for (const d of l.dishes) {
        // a phone shows only the middle of the portrait table (it covers the screen by height): keep a tenth clear each side
        const margin = name === 'portrait' ? l.w * 0.1 : 0;
        expect(d.x - d.d / 2, `${name} ${d.id} left`).toBeGreaterThanOrEqual(margin);
        expect(d.x + d.d / 2, `${name} ${d.id} right`).toBeLessThanOrEqual(l.w - margin);
        expect(d.y - d.d / 2, `${name} ${d.id} top`).toBeGreaterThanOrEqual(0);
        expect(d.y + d.d / 2, `${name} ${d.id} bottom`).toBeLessThanOrEqual(l.h);
      }
      // no two plates overlap by more than a rim
      for (let i = 0; i < l.dishes.length; i++) for (let j = i + 1; j < l.dishes.length; j++) {
        const a = l.dishes[i], b = l.dishes[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y), `${name} ${a.id}/${b.id}`).toBeGreaterThan((a.d + b.d) / 2 * 0.86);
      }
    }
  });
});
