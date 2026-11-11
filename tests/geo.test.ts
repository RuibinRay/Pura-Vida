import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { reliefKm, stylisedKmAtXZ, installDem, hasDem, elevationToY, PLINTH, EXTENT, project, unproject } from '../src/map/relief.js';
import { buildSurfaceIndex, drapeLines, sunAt } from '../src/map/terrain';

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
    expect(tris).toBeGreaterThan(40000);
  });

  it('keeps Isla del Coco as a separate Puntarenas part', () => {
    const punt = mesh.provinces.find((p) => p.id === 'puntarenas')!;
    expect(punt.parts.filter((p) => p.coco)).toHaveLength(1);
  });
});

describe('measured relief', () => {
  const png = PNG.sync.read(fs.readFileSync(path.resolve('public/geo/dem.png')));
  const grid = new Uint8Array(png.width * png.height);
  for (let i = 0; i < grid.length; i++) grid[i] = png.data[i * 4];
  const terrain = geo('terrain.json') as { extent: typeof EXTENT; dem: { size: number; maxMetres: number }; verticalExaggeration: number; summitsMetres: Record<string, number> };

  it('ships the elevation grid the builder and the app agree on', () => {
    expect(png.width).toBe(terrain.dem.size);
    expect(terrain.extent).toEqual(EXTENT);
    installDem({ size: png.width, data: grid, maxMetres: terrain.dem.maxMetres });
    expect(hasDem()).toBe(true);
  });
  it('stands at the measured heights of the summits and at sea level on the coasts', () => {
    // 500 m cells average a summit down a little; the source cells are recorded in terrain.json
    expect(reliefKm(-83.4886, 9.4842)).toBeGreaterThan(3.55); // Cerro Chirripó (3,820 m)
    expect(reliefKm(-83.852, 9.979)).toBeGreaterThan(3.2); // Irazú (3,432 m)
    expect(reliefKm(-84.7033, 10.4626)).toBeGreaterThan(1.4); // Arenal (1,670 m)
    expect(reliefKm(-83.033, 10.0)).toBeLessThan(0.05); // Limón city
    expect(reliefKm(-85.83, 10.3)).toBeLessThan(0.08); // Tamarindo coast
    expect(reliefKm(-84.09, 9.93)).toBeGreaterThan(1.0); // San José, on the Central Valley floor (1,170 m)
    expect(reliefKm(-84.09, 9.93)).toBeLessThan(1.35);
    expect(terrain.summitsMetres.chirripo).toBeGreaterThan(3700);
    expect(terrain.summitsMetres.irazu).toBeGreaterThan(3350);
    expect(reliefKm(-86.5, 9.0)).toBe(0); // open Pacific
  });
  it('gave the mesh those heights', () => {
    const mesh = geo('mesh.json') as { provinces: { id: 'san-jose'; parts: { coco?: boolean; positions: number[]; indices: number[] }[] }[] };
    const surface = buildSurfaceIndex(mesh.provinces);
    const [x, z] = project(-83.4886, 9.4842);
    const hit = surface.sample(x, z);
    expect(hit).not.toBeNull();
    expect(hit!.y).toBeGreaterThan(elevationToY(3.5));
    expect(surface.ids[hit!.province]).toMatch(/limon|san-jose|cartago/); // Chirripó stands where the three provinces meet
    const [sx, sz] = project(-86.5, 9.0);
    expect(surface.sample(sx, sz)).toBeNull();
    // a line across the Central Valley is draped on the land and sorted by province
    const draped = drapeLines(surface, [[-842000, 99000, -839000, 99000]]);
    const total = [...draped.byProvince.values()].reduce((n, a) => n + a.length, 0);
    expect(total).toBeGreaterThan(6 * 20);
    expect(draped.sea).toHaveLength(0);
  });
  it('keeps the stylised model as the fallback', () => {
    const [x, z] = project(-83.489, 9.484);
    expect(stylisedKmAtXZ(x, z)).toBeGreaterThan(3.3);
  });
  it('projects and unprojects consistently', () => {
    const [x, z] = project(-84.0, 9.9);
    const [lon, lat] = unproject(x, z);
    expect(lon).toBeCloseTo(-84.0, 6);
    expect(lat).toBeCloseTo(9.9, 6);
  });
});

describe('water and protected areas (OpenStreetMap)', () => {
  const water = geo('water.json') as { rivers: { n: string; r: number; km: number; p: number[] }[]; lakes: { n: string; km2: number; p: number[] }[] };
  const parks = geo('parks.json') as { areas: { n: string; kind: string; km2: number; c: [number, number]; rings: number[][] }[] };
  const inCountry = (lon: number, lat: number) => lon > -86.2 && lon < -82.3 && lat > 7.9 && lat < 11.4;

  it('has the principal rivers, inside the country', () => {
    const names = new Set(water.rivers.filter((r) => r.r === 1).map((r) => r.n));
    for (const n of ['Río Tempisque', 'Río Reventazón', 'Río Pacuare', 'Río San Carlos', 'Río Sarapiquí', 'Río General', 'Río Grande de Térraba', 'Río Grande de Tárcoles']) expect(names.has(n), n).toBe(true);
    for (const r of water.rivers.filter((q) => q.n !== 'Río San Juan')) for (let i = 0; i < r.p.length; i += 2) expect(inCountry(r.p[i] / 1e4, r.p[i + 1] / 1e4), r.n).toBe(true);
  });
  it('has Lake Arenal at its real size (about 85 km²)', () => {
    const arenal = water.lakes.find((l) => /Arenal/.test(l.n));
    expect(arenal).toBeDefined();
    expect(arenal!.km2).toBeGreaterThan(75);
    expect(arenal!.km2).toBeLessThan(95);
  });
  it('has the national parks as closed outlines where they are', () => {
    const np = parks.areas.filter((p) => p.kind === 'park');
    expect(np.length).toBeGreaterThanOrEqual(25);
    const at = (re: RegExp) => parks.areas.find((p) => re.test(p.n))!;
    // Corcovado on the Osa Peninsula, Tortuguero on the northern Caribbean, Santa Rosa in the north-west
    expect(at(/Corcovado/).c[0]).toBeLessThan(-83.3); expect(at(/Corcovado/).c[1]).toBeLessThan(8.8);
    expect(at(/Tortuguero/).c[0]).toBeGreaterThan(-83.8); expect(at(/Tortuguero/).c[1]).toBeGreaterThan(10.3);
    expect(at(/Santa Rosa/).c[0]).toBeLessThan(-85.4); expect(at(/Santa Rosa/).c[1]).toBeGreaterThan(10.7);
    for (const p of parks.areas) for (const ring of p.rings) {
      expect(ring.length).toBeGreaterThanOrEqual(8);
      expect(ring[0]).toBe(ring[ring.length - 2]); expect(ring[1]).toBe(ring[ring.length - 1]);
    }
  });
});

describe('the sun of the day/night control', () => {
  it('rises in the east, stands high at noon a little to the south, sets in the west', () => {
    const dawn = sunAt(6.5), noon = sunAt(12), dusk = sunAt(17.5), night = sunAt(23);
    expect(dawn.sun.x).toBeGreaterThan(0.9); // east = +x
    expect(dusk.sun.x).toBeLessThan(-0.9);
    expect(noon.sun.y).toBeGreaterThan(0.97);
    expect(noon.sun.z).toBeGreaterThan(0); // south = +z: the country lies north of the equator
    expect(noon.day).toBe(1);
    expect(night.day).toBe(0);
    expect(dawn.golden).toBeGreaterThan(0.5);
    expect(noon.golden).toBe(0);
  });
});
