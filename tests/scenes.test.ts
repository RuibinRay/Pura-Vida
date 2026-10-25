import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STOPS } from '../src/journey/scenes';

const plates = JSON.parse(fs.readFileSync(path.resolve('src/journey/plates.generated.json'), 'utf8')) as Record<string, { clean?: boolean; animals?: { id: string; kind: string; hotspot: number[] | null; parts: { name: string }[]; hop?: number[]; anim?: string }[]; layers: { name: string }[] }>;

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

  it('every animal that moves as a whole is cut out whole (a body part), so its head never leaves its body', () => {
    // the kinds Scene.tsx gives a perch/stand loop to: a loop on a head-only cut-out rotates the head off a body
    // that stays painted in the plate (the toucan of 2026-10-24)
    const whole = ['toucan', 'thrush', 'quetzal', 'deer', 'tapir', 'heron', 'frog'];
    for (const s of STOPS) {
      if (!s.plate) continue;
      for (const a of plates[s.plate].animals || []) if (whole.includes(a.kind)) expect(a.parts.some((p) => p.name === 'body'), `${s.key} ${a.id} has no body part`).toBe(true);
    }
  });

  it('every stop with wind has the two foliage frame layers that sway', () => {
    for (const s of STOPS) {
      if (!s.plate || !s.wind) continue;
      const names = plates[s.plate].layers.map((l) => l.name);
      expect(names, s.key).toContain('near-left');
      expect(names, s.key).toContain('near-right');
    }
  });

  it('every macaw drawn in flight crosses its stop', () => {
    for (const s of STOPS) {
      if (!s.plate) continue;
      for (const a of plates[s.plate].animals || []) if (a.kind === 'macaw') expect(s.fly?.[a.id], `${s.key} ${a.id}`).toBeTruthy();
    }
  });

  it('a plate built on the author\'s clean scene says so, and its perched birds hop along their perch', () => {
    // the specs that name a clean image (the same scene with the animals erased, 2026-10-25)
    const clean = Object.keys(plates).filter((id) => { const p = path.resolve(`tools/plates/${id}.json`); if (!fs.existsSync(p)) return false; const sp = JSON.parse(fs.readFileSync(p, 'utf8')); return !!sp.clean || (!!sp.paste && !sp.animals); });
    expect(clean.sort()).toEqual(['arenal', 'cartago', 'chirripo', 'coffee', 'corcovado', 'forest', 'guanacaste', 'manuel-antonio', 'rio-celeste']);
    for (const id of clean) {
      expect(plates[id].clean, `${id} manifest`).toBe(true);
      for (const a of plates[id].animals || []) {
        if (a.kind === 'toucan' || a.kind === 'thrush') {
          expect(a.hop, `${id} ${a.id} hop`).toBeTruthy();
          const [dx, dy] = a.hop as number[];
          // a hop is a few percent of the bird's own box, never a leap
          expect(Math.abs(dx) + Math.abs(dy), `${id} ${a.id} hop length`).toBeGreaterThan(0.02);
          expect(Math.abs(dx), `${id} ${a.id} hop dx`).toBeLessThan(0.2);
        }
      }
    }
    // a plate whose base still has the animals inpainted away never claims a clean base
    for (const id of Object.keys(plates)) if (!clean.includes(id)) expect(plates[id].clean, id).toBeFalsy();
  });

  it('walking animals name a ground animal of their plate and move a short way', () => {
    for (const s of STOPS) {
      for (const [id, [dx, dy]] of Object.entries(s.walk || {})) {
        const a = (plates[s.plate as string].animals || []).find((x) => x.id === id);
        expect(a, `${s.key} walk ${id}`).toBeTruthy();
        expect(['turtle', 'deer', 'tapir', 'sloth', 'iguana', 'agouti'], `${s.key} walk ${id} is a ${a?.kind}`).toContain(a?.kind);
        expect(Math.abs(dx) + Math.abs(dy), `${s.key} walk ${id} length`).toBeGreaterThan(0.5);
        expect(Math.abs(dx) + Math.abs(dy), `${s.key} walk ${id} length`).toBeLessThan(8);
      }
    }
  });
});
