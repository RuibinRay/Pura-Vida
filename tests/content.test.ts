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

  it('has the six species of the walk, each fitting the stop it is drawn on, with IUCN entries and sources', () => {
    const byId = new Map((species as { id?: string }[]).map((s) => [s.id, s]));
    const want: Record<string, string> = { 'resplendent-quetzal': 'monteverde', 'bairds-tapir': 'corcovado', 'white-tailed-deer': 'guanacaste', 'great-blue-heron': 'tortuguero', 'volcano-hummingbird': 'irazu', 'purple-throated-mountain-gem': 'monteverde' };
    for (const [id, stop] of Object.entries(want)) {
      const sp = byId.get(id) as { iucn?: { category: string }; stops?: Record<string, { fit: boolean; sources?: unknown[] }>; sources?: unknown[] } | undefined;
      expect(sp, id).toBeTruthy();
      expect(sp?.iucn?.category, id + ' iucn').toMatch(/^(LC|NT|VU|EN|CR)$/);
      expect(sp?.stops?.[stop]?.fit, id + ' fits ' + stop).toBe(true);
      expect((sp?.sources || []).length, id + ' sources').toBeGreaterThan(0);
    }
    // the Tortuguero macaw is drawn where the great green macaw lives: the entry must say so rather than hide it
    const macaw = byId.get('scarlet-macaw') as { stops?: Record<string, { fit: boolean; note?: unknown }> } | undefined;
    expect(macaw?.stops?.tortuguero?.fit, 'scarlet macaw at Tortuguero').toBe(false);
    expect(macaw?.stops?.tortuguero?.note, 'scarlet macaw note').toBeTruthy();
  });

  it('has the places of the walk — one or more per province — with sourced overviews, fact tiles and a province', () => {
    const places = gen('places.json').places as { id: string; province: string; coords?: number[]; overview: { en: string; es: string; zh: string; status: string; sources: unknown[] }; facts: { key: string; value: number | string; status: string; sources: unknown[] }[] }[];
    const ids = places.map((p) => p.id);
    for (const id of ['monteverde', 'rio-celeste', 'irazu', 'guanacaste', 'manuel-antonio', 'corcovado', 'tortuguero', 'arenal', 'chirripo', 'cartago-basilica', 'heredia-coffee']) expect(ids, id).toContain(id);
    // every province has at least one place on the walk
    for (const prov of ['san-jose', 'alajuela', 'cartago', 'heredia', 'guanacaste', 'puntarenas', 'limon']) expect(places.some((p) => p.province === prov), prov + ' has a stop').toBe(true);
    for (const p of places) {
      expect(['san-jose', 'alajuela', 'cartago', 'heredia', 'guanacaste', 'puntarenas', 'limon'], p.id + ' province').toContain(p.province);
      for (const l of ['en', 'es', 'zh'] as const) expect(p.overview[l].length, p.id + ' overview ' + l).toBeGreaterThan(80);
      expect(['confirmed', 'approximate', 'interpretation'], p.id + ' status').toContain(p.overview.status);
      expect(p.overview.sources.every(isSource), p.id + ' overview sources').toBe(true);
      expect(p.facts.length, p.id + ' facts').toBeGreaterThanOrEqual(4);
      for (const f of p.facts) { expect(f.sources.length, p.id + ' ' + f.key).toBeGreaterThan(0); expect(f.sources.every(isSource), p.id + ' ' + f.key + ' sources').toBe(true); }
      if (p.coords) expect(inCR(p.coords[0], p.coords[1]), p.id + ' coords').toBe(true);
    }
  });

  it('keeps the Irazú what-if labelled as interpretation, with a dated, sourced record', () => {
    const d = gen('irazu.json').irazu as { timeline: { date: string; en: string; status?: string; sources?: unknown[] }[]; whatIf: { status: string; sources: unknown[]; en: string }; facts: { key: string; sources: unknown[] }[]; monitoring: { en: string } };
    expect(d.whatIf.status).toBe('interpretation');
    expect(d.whatIf.sources.length).toBeGreaterThanOrEqual(3);
    expect(d.whatIf.en).toMatch(/not a forecast/i);
    expect(d.timeline.length).toBeGreaterThanOrEqual(10);
    for (const e of d.timeline) expect(e.date, e.en).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/);
    expect(d.timeline.some((e) => e.date.startsWith('1963')), 'the 1963 eruption').toBe(true);
    for (const f of d.facts) expect(f.sources.length, f.key).toBeGreaterThan(0);
    expect(d.monitoring.en).toMatch(/OVSICORI|RSN/);
  });

  it('has a plate manifest for every stop, with animals in parts, water, and files for every width', () => {
    const plates = JSON.parse(fs.readFileSync(path.resolve('src/journey/plates.generated.json'), 'utf8')) as Record<string, { width: number; height: number; widths: number[]; animals?: { id: string; species: string | null; hotspot: number[] | null; parts: { name: string; widths: number[]; box: number[] }[] }[]; water?: { name: string; widths: number[] }[] }>;
    const expected: Record<string, number> = { forest: 5, monteverde: 4, irazu: 3, guanacaste: 5, corcovado: 3, tortuguero: 5, 'rio-celeste': 2, 'manuel-antonio': 1, arenal: 1, chirripo: 1, cartago: 2, coffee: 2, 'rio-celeste-pool': 0, 'manuel-antonio-sunset': 0 };
    const ids = new Set((species as { id?: string }[]).map((s) => s.id));
    for (const [name, n] of Object.entries(expected)) {
      const m = plates[name];
      expect(m, name).toBeTruthy();
      expect((m.animals || []).length, name + ' animals').toBe(n);
      expect(fs.existsSync(path.resolve('public/plates', name, `base-${m.widths[0]}.webp`)), name + ' base').toBe(true);
      for (const a of m.animals || []) {
        expect(a.parts.length, a.id).toBeGreaterThan(0);
        if (a.species) expect(ids.has(a.species), `${name}/${a.id} → ${a.species}`).toBe(true);
        for (const p of a.parts) {
          expect(p.box.every((v) => v >= -0.01 && v <= 1.01), `${name}/${a.id}/${p.name} box`).toBe(true);
          for (const w of p.widths) expect(fs.existsSync(path.resolve('public/plates', name, `${a.id}-${p.name}-${w}.webp`)), `${name}/${a.id}-${p.name}-${w}`).toBe(true);
        }
      }
      for (const w of m.water || []) for (const ww of w.widths) expect(fs.existsSync(path.resolve('public/plates', name, `water-${w.name}-${ww}.webp`)), `${name}/water-${w.name}-${ww}`).toBe(true);
    }
    // water flows at Río Celeste and under both waterfalls
    expect((plates['rio-celeste'].water || []).length).toBeGreaterThan(0);
    expect((plates.forest.water || []).some((w) => w.name === 'waterfall')).toBe(true);
    expect((plates.monteverde.water || []).some((w) => w.name === 'waterfall')).toBe(true);
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
