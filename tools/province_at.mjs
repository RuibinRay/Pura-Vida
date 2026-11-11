// Which province a point lies in, from the province outlines (public/geo/costa-rica.topo.json, OpenStreetMap-derived).
// A point just off the simplified coast — a town on a sand spit, a marine park, a headland — takes the province of
// the nearest outline within `reachKm`; farther out it has none.
import fs from 'node:fs';
import * as topojsonClient from 'topojson-client';

function pointInRing(x, y, ring) { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside; } return inside; }

/** @param {{ id: string, geometry: { type: string, coordinates: any } }[]} features province features in lon/lat */
export function provinceLocator(features, reachKm = 12) {
  const provinces = features.map((f) => ({ id: f.id ?? f.properties?.id, polys: (f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]) }));
  return (lon, lat) => {
    for (const p of provinces) for (const poly of p.polys) if (pointInRing(lon, lat, poly[0]) && !poly.slice(1).some((h) => pointInRing(lon, lat, h))) return p.id;
    // not inside any outline: the nearest outline point, if it is close
    const kx = 111.32 * Math.cos((lat * Math.PI) / 180), ky = 110.57;
    let best = null, bd = reachKm * reachKm;
    for (const p of provinces) for (const poly of p.polys) for (const [x, y] of poly[0]) { const d = ((x - lon) * kx) ** 2 + ((y - lat) * ky) ** 2; if (d < bd) { bd = d; best = p.id; } }
    return best;
  };
}

/** The locator for the committed outlines. */
export function provinceLocatorFromFile(topoPath, reachKm) {
  const topo = JSON.parse(fs.readFileSync(topoPath, 'utf8'));
  return provinceLocator(topojsonClient.feature(topo, topo.objects.provinces).features, reachKm);
}
