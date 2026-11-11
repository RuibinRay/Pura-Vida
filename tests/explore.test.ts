import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { classOf, provincesOf, ANIMAL_CLASSES } from '../src/content/taxa';
import { distanceKm, routeLegs, routeFromParam, routeToParam, ROUTE_MAX } from '../src/state/route';
import { passportLevel } from '../src/ui/Passport';
import { HABITATS } from '../src/content/habitats';
import type { Landmark, Species } from '../src/content/types';

const gen = (f: string) => JSON.parse(fs.readFileSync(path.resolve('src/content/generated', f), 'utf8'));
const species = gen('species.json').species as Species[];
const landmarks = gen('landmarks.json').landmarks as Landmark[];
const byId = new Map(landmarks.map((l) => [l.id, l]));

describe('wildlife by kind and province', () => {
  it('knows the kind of every species of the journal from its order', () => {
    for (const sp of species) expect(classOf(sp), `${sp.id} (${sp.order})`).not.toBeNull();
    const kind = (id: string) => classOf(species.find((s) => s.id === id)!);
    expect(kind('jaguar')).toBe('mammal');
    expect(kind('humpback-whale')).toBe('mammal'); // a cetacean: "Artiodactyla (infraorder Cetacea)"
    expect(kind('resplendent-quetzal')).toBe('bird');
    expect(kind('olive-ridley-sea-turtle')).toBe('reptile');
    expect(kind('red-eyed-tree-frog')).toBe('amphibian');
    expect(kind('blue-morpho')).toBe('insect');
    // every filter has something to show
    for (const k of ANIMAL_CLASSES) expect(species.some((s) => classOf(s) === k), k).toBe(true);
  });
  it('reads a species\' provinces from its sourced places', () => {
    for (const id of Object.keys(HABITATS)) for (const p of provincesOf(id, byId)) expect(p).toMatch(/^(san-jose|alajuela|cartago|heredia|guanacaste|puntarenas|limon)$/);
    // the manatee is a Caribbean animal: its places are in Limón and nowhere on the Pacific side
    const manatee = provincesOf('west-indian-manatee', byId);
    expect(manatee).toContain('limon');
    expect(manatee).not.toContain('guanacaste');
  });
});

describe('the travel route', () => {
  it('measures straight-line distance on the sphere', () => {
    // San José (9.93 N, 84.08 W) to Limón (10.00 N, 83.03 W): about 115 km
    expect(distanceKm([-84.08, 9.93], [-83.03, 10.0])).toBeGreaterThan(110);
    expect(distanceKm([-84.08, 9.93], [-83.03, 10.0])).toBeLessThan(120);
    expect(distanceKm([-84, 10], [-84, 10])).toBe(0);
    const legs = routeLegs([[-84.08, 9.93], [-83.03, 10.0], [-84.08, 9.93]]);
    expect(legs).toHaveLength(2);
    expect(legs[0]).toBeCloseTo(legs[1], 6);
  });
  it('round-trips through a link and refuses what is not a place id', () => {
    const ids = ['peak-arenal', 'area-corcovado', 'city-san-jose'];
    expect(routeFromParam(routeToParam(ids))).toEqual(ids);
    expect(routeFromParam('peak-arenal,peak-arenal,<script>,../x,')).toEqual(['peak-arenal']);
    expect(routeFromParam(null)).toEqual([]);
    expect(routeFromParam(Array.from({ length: 40 }, (_, i) => 'p' + i + 'x').join(','))).toHaveLength(ROUTE_MAX);
    for (const id of ids) expect(byId.has(id), id).toBe(true);
  });
});

describe('the passport', () => {
  it('names a level from the share found', () => {
    expect(passportLevel(0, 157)).toBe(0);
    expect(passportLevel(15, 157)).toBe(0);
    expect(passportLevel(16, 157)).toBe(1);
    expect(passportLevel(60, 157)).toBe(2);
    expect(passportLevel(157, 157)).toBe(3);
    expect(passportLevel(3, 0)).toBe(0);
  });
});

describe('the province of a place', () => {
  const prov = (id: string) => byId.get(id)?.province;
  it('is known for every landmark, read from its coordinates where the research named none', () => {
    for (const l of landmarks) expect(l.province, l.id).toMatch(/^(san-jose|alajuela|cartago|heredia|guanacaste|puntarenas|limon)$/);
    expect(landmarks.filter((l) => l.provinceFrom === 'coordinates').length).toBeGreaterThan(30);
  });
  it('puts the well-known places where they are', () => {
    expect(prov('peak-arenal')).toBe('alajuela');
    expect(prov('peak-irazu')).toBe('cartago');
    expect(prov('area-corcovado')).toBe('puntarenas'); // the Osa Peninsula
    expect(prov('area-tortuguero')).toBe('limon');
    expect(prov('area-santa-rosa')).toBe('guanacaste');
    expect(prov('area-isla-del-coco')).toBe('puntarenas'); // 500 km out, and still a district of Puntarenas
    expect(prov('city-puntarenas')).toBe('puntarenas'); // on its sand spit, beside the simplified coast
    expect(['limon', 'san-jose', 'cartago']).toContain(prov('peak-chirripo')); // where the three meet
  });
  it('gives the wildlife filter something in every province', () => {
    for (const p of ['san-jose', 'alajuela', 'cartago', 'heredia', 'guanacaste', 'puntarenas', 'limon'] as const) {
      expect(species.filter((s) => provincesOf(s.id, byId).includes(p)).length, p).toBeGreaterThan(0);
    }
  });
});
