import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ZONES, TRAIL_SPECIES, STICKERS, ENV } from '../src/journey/trail';
import en from '../src/i18n/messages/en';
import es from '../src/i18n/messages/es';
import zh from '../src/i18n/messages/zh';
import { HABITATS } from '../src/content/habitats';

const species = (JSON.parse(fs.readFileSync(path.resolve('src/content/generated/species.json'), 'utf8')) as { species: { id: string; facts: unknown[]; sources: unknown[]; iucn: { category: string } | null; distributionCR?: { en: string } }[] }).species;

describe('the wildlife trail', () => {
  it('has nine zones with unique keys, each on a backdrop of its own on disk at every width, named in the three languages', () => {
    expect(ZONES.length).toBe(9);
    expect(new Set(ZONES.map((z) => z.key)).size).toBe(ZONES.length);
    expect(new Set(ZONES.map((z) => z.env)).size).toBe(ZONES.length);
    for (const z of ZONES) {
      const e = ENV[z.env];
      expect(e, z.env).toBeTruthy();
      for (const w of e.widths) expect(fs.existsSync(path.resolve(`public/zoo/env/${z.env}-${w}.webp`)), `${z.env}-${w}.webp`).toBe(true);
      for (const m of [en, es, zh]) {
        const zone = (m.trail.zones as Record<string, { name: string; lede: string }>)[z.key];
        expect(zone?.name, `${z.key} name`).toBeTruthy();
        expect(zone?.lede, `${z.key} lede`).toBeTruthy();
      }
    }
  });

  it('every animal is one species, with a sticker on disk at every width of its ladder, and a sourced journal entry', () => {
    expect(new Set(TRAIL_SPECIES).size).toBe(TRAIL_SPECIES.length);
    const byId = new Map(species.map((s) => [s.id, s]));
    for (const id of TRAIL_SPECIES) {
      const st = STICKERS[id];
      expect(st, `${id} sticker`).toBeTruthy();
      for (const w of st.widths) expect(fs.existsSync(path.resolve(`public/zoo/${id}-${w}.webp`)), `${id}-${w}.webp`).toBe(true);
      expect(st.baseline).toBeGreaterThan(0.5);
      const sp = byId.get(id);
      expect(sp, `${id} species record`).toBeTruthy();
      expect(sp!.sources.length, `${id} sources`).toBeGreaterThan(0);
      expect(sp!.facts.length, `${id} facts`).toBeGreaterThanOrEqual(2);
      expect(sp!.iucn?.category, `${id} iucn`).toBeTruthy();
      expect(sp!.distributionCR?.en, `${id} where in Costa Rica`).toBeTruthy();
    }
  });

  it('places every animal inside the stage in both layouts, staggered entrances within the first half of the zone', () => {
    for (const z of ZONES) {
      for (const a of z.animals) {
        for (const [x, y, w] of [a.at, a.phone]) {
          expect(x, `${a.id} x`).toBeGreaterThanOrEqual(0);
          expect(y, `${a.id} y`).toBeGreaterThanOrEqual(0);
          expect(x + w, `${a.id} right edge`).toBeLessThanOrEqual(100);
          expect(w, `${a.id} width`).toBeGreaterThanOrEqual(6);
        }
        expect(a.d ?? 0.1).toBeLessThanOrEqual(0.3);
        if (a.dip !== undefined) { expect(a.loop).toBe('swim'); expect(a.dip).toBeGreaterThan(0); expect(a.dip).toBeLessThan(0.6); }
      }
    }
  });

  it('places every animal where the journal\'s sources put it (a habitat place or a habitat verdict for the zone)', () => {
    // each zone names the places / walk stops it stands for; an animal in the zone must have one of them
    const WHERE: Record<string, string[]> = {
      canopy: ['area-arenal', 'area-tortuguero', 'area-corcovado', 'area-cahuita', 'heredia-estacion-biologica-la-selva', 'area-carara', 'area-braulio-carrillo', 'area-manuel-antonio', 'area-santa-rosa', 'stop:opening', 'stop:arenal'],
      cloud: ['area-monteverde', 'stop:monteverde'],
      waterfall: ['area-tenorio', 'stop:rio-celeste', 'stop:opening'],
      volcano: ['peak-irazu', 'peak-poas', 'stop:irazu'],
      gardens: ['city-san-jose', 'stop:coffee', 'stop:cartago'],
      dry: ['area-santa-rosa', 'area-palo-verde', 'area-guanacaste', 'guanacaste-tempisque-river', 'stop:guanacaste'],
      floor: ['area-corcovado', 'area-tortuguero', 'area-santa-rosa', 'limon-barra-del-colorado-refuge', 'stop:corcovado', 'lowland'],
      rivers: ['area-tortuguero', 'limon-barra-del-colorado-refuge', 'area-cano-negro', 'heredia-puerto-viejo-de-sarapiqui', 'limon-gandoca-manzanillo-refuge', 'stop:tortuguero'],
      coast: ['area-manuel-antonio', 'area-marino-ballena', 'stop:close'],
    };
    const byId = new Map(species.map((s) => [s.id, s]));
    for (const z of ZONES) {
      for (const a of z.animals) {
        const sp = byId.get(a.id)!;
        const places = (HABITATS[a.id] ?? []).map((h) => h.at);
        const stops = Object.entries((sp as { stops?: Record<string, { fit: boolean }> }).stops ?? {}).filter(([, v]) => v.fit).map(([k]) => 'stop:' + k);
        const lowland = a.id === 'eyelash-viper'; // the Clodomiro Picado range (sea level to 1,500 m) is in the entry text, not a pin
        const ok = [...places, ...stops, ...(lowland ? ['lowland'] : [])].some((w) => WHERE[z.key].includes(w));
        expect(ok, `${a.id} in ${z.key}: places ${places.join(',')} stops ${stops.join(',')}`).toBe(true);
      }
    }
  });
});
