import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { reliefKm, elevationToY, PLINTH, project, unproject } from '../src/map/relief.js';

const geo = (f: string) => JSON.parse(fs.readFileSync(path.resolve('public/geo', f), 'utf8'));

describe('geodata', () => {
  const mesh = geo('mesh.json') as { provinces: { id: string; iso: string; areaKm2: number; parts: { coco?: boolean; positions: number[]; indices: number[]; ringCount: number }[] }[] };
  const topo = geo('costa-rica.topo.json') as { objects: { provinces: { geometries: { id: string; properties: { iso: string; name: { en: string; es: string; zh: string } } }[] } } };

  it('has the seven provinces with ISO 3166-2 codes', () => {
    const isos = mesh.provinces.map((p) => p.iso).sort();
    expect(isos).toEqual(['CR-A', 'CR-C', 'CR-G', 'CR-H', 'CR-L', 'CR-P', 'CR-SJ']);
    expect(topo.objects.provinces.geometries).toHaveLength(7);
    for (const g of topo.objects.provinces.geometries) expect(g.properties.name.zh).toMatch(/省$/);
  });

  it('matches the official areas within 3 % (IGN 2021 total 51,179.92 km²)', () => {
    const total = mesh.provinces.reduce((s, p) => s + p.areaKm2, 0);
    expect(Math.abs(total - 51179.92) / 51179.92).toBeLessThan(0.03);
    const official: Record<string, number> = { 'san-jose': 4966, alajuela: 9757, cartago: 3125, heredia: 2657, guanacaste: 10141, puntarenas: 11266, limon: 9189 };
    for (const p of mesh.provinces) expect(Math.abs(p.areaKm2 - official[p.id]) / official[p.id], p.id).toBeLessThan(0.03);
  });

  it('triangulates every part with upward-facing triangles inside the land', () => {
    let tris = 0;
    for (const p of mesh.provinces) for (const part of p.parts) {
      const P = part.positions, I = part.indices;
      expect(I.length % 3).toBe(0);
      for (let t = 0; t < I.length; t += 3) {
        const [a, b, c] = [I[t], I[t + 1], I[t + 2]];
        const ax = P[a * 3], az = P[a * 3 + 2], bx = P[b * 3], bz = P[b * 3 + 2], cx = P[c * 3], cz = P[c * 3 + 2];
        // normal y of (b-a)×(c-a) must be positive (points up)
        const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        expect(ny, `${p.id} triangle ${t / 3}`).toBeGreaterThan(0);
        tris++;
      }
      for (let i = 1; i < P.length; i += 3) { expect(P[i]).toBeGreaterThanOrEqual(PLINTH); expect(P[i]).toBeLessThanOrEqual(elevationToY(3.95)); }
    }
    expect(tris).toBeGreaterThan(10000);
  });

  it('keeps Isla del Coco as a separate Puntarenas part', () => {
    const punt = mesh.provinces.find((p) => p.id === 'puntarenas')!;
    expect(punt.parts.filter((p) => p.coco)).toHaveLength(1);
  });
});

describe('stylised relief', () => {
  it('peaks at the real summits and stays low at the coast', () => {
    expect(reliefKm(-83.489, 9.484)).toBeGreaterThan(3.3); // Chirripó (3,820 m)
    expect(reliefKm(-83.852, 9.979)).toBeGreaterThan(2.8); // Irazú (3,432 m)
    expect(reliefKm(-84.703, 10.463)).toBeGreaterThan(1.4); // Arenal (1,670 m)
    expect(reliefKm(-83.033, 10.0)).toBeLessThan(0.2); // Limón city
    expect(reliefKm(-85.83, 10.3)).toBeLessThan(0.2); // Tamarindo coast
  });
  it('projects and unprojects consistently', () => {
    const [x, z] = project(-84.0, 9.9);
    const [lon, lat] = unproject(x, z);
    expect(lon).toBeCloseTo(-84.0, 6);
    expect(lat).toBeCloseTo(9.9, 6);
  });
});
