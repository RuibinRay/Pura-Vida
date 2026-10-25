import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STOPS } from '../src/journey/scenes';

const plates = JSON.parse(fs.readFileSync(path.resolve('src/journey/plates.generated.json'), 'utf8')) as Record<string, { animals?: { id: string; kind: string; hotspot: number[] | null }[] }>;

describe('the stops of the walk', () => {
  it('each scene stop names a plate that exists, with unique keys', () => {
    const keys = STOPS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const s of STOPS) if (s.kind === 'scene' || s.kind === 'close') expect(plates[s.plate as string], s.key).toBeTruthy();
  });

  it('facing and flight overrides name animals of that plate; fliers are birds in flight or butterflies', () => {
    for (const s of STOPS) {
      if (!s.plate) continue;
      const animals = plates[s.plate].animals || [];
      const ids = new Set(animals.map((a) => a.id));
      for (const id of Object.keys(s.facing || {})) expect(ids.has(id), `${s.key} facing ${id}`).toBe(true);
      for (const [id, [dx, dy]] of Object.entries(s.fly || {})) {
        expect(ids.has(id), `${s.key} fly ${id}`).toBe(true);
        const kind = animals.find((a) => a.id === id)?.kind;
        expect(['macaw', 'morpho', 'hummingbird'], `${s.key} fly ${id} is a ${kind}`).toContain(kind);
        // a flight crosses a real distance but stays inside the plate (in vw over the whole stop)
        expect(Math.abs(dx) + Math.abs(dy), `${s.key} fly ${id} length`).toBeGreaterThanOrEqual(8);
        expect(Math.abs(dx), `${s.key} fly ${id} dx`).toBeLessThanOrEqual(34);
        expect(Math.abs(dy), `${s.key} fly ${id} dy`).toBeLessThanOrEqual(16);
      }
    }
  });

  it('every macaw drawn in flight crosses its stop', () => {
    for (const s of STOPS) {
      if (!s.plate) continue;
      for (const a of plates[s.plate].animals || []) if (a.kind === 'macaw') expect(s.fly?.[a.id], `${s.key} ${a.id}`).toBeTruthy();
    }
  });
});
