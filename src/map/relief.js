// Shared by the offline geodata builder (tools/build_geo.mjs) and the app.
// Plain JavaScript on purpose: Node imports it without a build step.
//
// PROJECTION — a local planar frame centred on Costa Rica. One scene unit = 1 km.
//   x grows east, z grows south (so north is "away from the viewer" in Three.js), y is up.
//
// RELIEF — STYLISED, NOT MEASURED. Costa Rica's four cordilleras and its named peaks are placed
// at real coordinates with real summit elevations (see src/content/peaks.ts for the sourced
// list), and the land between them is interpolated with smooth ridges and bumps. It reads like
// a museum raised-relief model, not a digital elevation model. Swap `reliefKm` for a DEM
// sampler when a licensed heightmap is available (see docs/WORLD_ARCHITECTURE.md).

export const LON0 = -84.2;
export const LAT0 = 9.75;
const KM_PER_DEG_LAT = 110.57;
const KM_PER_DEG_LON = 111.32 * Math.cos((LAT0 * Math.PI) / 180);

/** Vertical exaggeration applied to the stylised relief (×). */
export const VERTICAL_EXAGGERATION = 5;
/** Height of the land plate above the ocean surface (km, scene units). */
export const PLINTH = 0.35;
/** Depth of the plate's side wall below the ocean surface (km, scene units). */
export const PLINTH_DEPTH = 2.5;

/** @param {number} lon @param {number} lat @returns {[number, number]} [x, z] in km */
export function project(lon, lat) {
  return [(lon - LON0) * KM_PER_DEG_LON, -(lat - LAT0) * KM_PER_DEG_LAT];
}

/** @param {number} x @param {number} z @returns {[number, number]} [lon, lat] */
export function unproject(x, z) {
  return [x / KM_PER_DEG_LON + LON0, -z / KM_PER_DEG_LAT + LAT0];
}

/** Scene height (y) for a real elevation in km. */
export function elevationToY(elevKm) {
  return PLINTH + elevKm * VERTICAL_EXAGGERATION;
}

// ---- stylised relief definition -------------------------------------------------------------
// Ridges: polylines of [lon, lat, crestKm]; `sigma` = half-width of the ridge in km.
// Peaks: [lon, lat, summitKm, sigmaKm]. Plateaus: elliptical Gaussians.

const RIDGES = [
  // Cordillera de Guanacaste (Orosí → Rincón de la Vieja → Miravalles → Tenorio)
  { sigma: 7, pts: [[-85.47, 10.98, 1.55], [-85.34, 10.83, 1.8], [-85.15, 10.75, 1.9], [-85.02, 10.67, 1.75], [-84.95, 10.58, 1.0]] },
  // Cordillera de Tilarán (Tilarán → Monteverde highlands → Zarcero hills, joining the Central)
  { sigma: 8, pts: [[-84.97, 10.47, 0.9], [-84.8, 10.31, 1.7], [-84.62, 10.17, 1.5], [-84.45, 10.22, 1.9]] },
  // Cordillera Central (Platanar → Poás → Barva → Irazú → Turrialba)
  { sigma: 10, pts: [[-84.45, 10.22, 1.9], [-84.37, 10.3, 2.1], [-84.233, 10.2, 2.55], [-84.1, 10.135, 2.75], [-83.852, 9.979, 3.2], [-83.767, 10.025, 3.1], [-83.6, 10.0, 1.4]] },
  // Cordillera de Talamanca (Cerro de la Muerte → Chirripó → Kamuk → Panama)
  { sigma: 14, pts: [[-83.95, 9.65, 2.4], [-83.755, 9.555, 3.3], [-83.489, 9.484, 3.7], [-83.35, 9.4, 3.3], [-83.05, 9.27, 3.4], [-82.85, 9.1, 2.9], [-82.68, 8.95, 2.4]] },
  // Fila Costeña / Fila Brunqueña (Pacific coastal range, south)
  { sigma: 6, pts: [[-83.9, 9.3, 0.8], [-83.6, 9.05, 1.0], [-83.35, 8.8, 1.1], [-83.1, 8.6, 0.8]] },
  // Osa Peninsula hills
  { sigma: 6, pts: [[-83.65, 8.58, 0.55], [-83.45, 8.5, 0.7]] },
  // Nicoya Peninsula hills
  { sigma: 8, pts: [[-85.6, 10.3, 0.5], [-85.35, 10.08, 0.85], [-85.2, 9.9, 0.7], [-85.0, 9.72, 0.4]] },
  // Montes del Aguacate (between Alajuela and the Pacific slope)
  { sigma: 6, pts: [[-84.5, 10.0, 0.9], [-84.38, 10.05, 1.1]] },
  // Talamanca Caribbean foothills (Fila Matama)
  { sigma: 10, pts: [[-83.5, 9.85, 1.0], [-83.3, 9.7, 1.2], [-83.1, 9.5, 1.1]] },
];

const PEAKS = [
  [-84.703, 10.463, 1.67, 3.0], // Arenal — isolated cone
  [-84.69, 10.44, 1.14, 2.0], // Cerro Chato
  [-84.17, 9.88, 2.43, 4.0], // Cerros de Escazú
  [-83.98, 9.88, 1.85, 3.0], // Cerro de la Carpintera
  [-87.07, 5.53, 0.575, 1.5], // Cerro Iglesias, Isla del Coco
];

const PLATEAUS = [
  { lon: -84.05, lat: 9.95, h: 1.1, sx: 28, sz: 12 }, // Valle Central
  { lon: -85.3, lat: 10.5, h: 0.08, sx: 60, sz: 40 }, // Guanacaste lowlands (barely above sea level)
];

function dist2ToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az;
  const l2 = abx * abx + abz * abz;
  let t = l2 === 0 ? 0 : ((px - ax) * abx + (pz - az) * abz) / l2;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (ax + t * abx), dz = pz - (az + t * abz);
  return [dx * dx + dz * dz, t];
}

// Tiny deterministic value noise so plains are not dead flat (amplitude 40 m).
function hash2(ix, iz) {
  let h = (ix * 374761393 + iz * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function valueNoise(x, z, wavelength) {
  const fx = x / wavelength, fz = z / wavelength;
  const ix = Math.floor(fx), iz = Math.floor(fz);
  const tx = fx - ix, tz = fz - iz;
  const sx = tx * tx * (3 - 2 * tx), sz = tz * tz * (3 - 2 * tz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return (a * (1 - sx) + b * sx) * (1 - sz) + (c * (1 - sx) + d * sx) * sz;
}

// Pre-project the definition once.
const RIDGES_XZ = RIDGES.map((r) => ({ sigma2: 2 * r.sigma * r.sigma, pts: r.pts.map(([lon, lat, h]) => [...project(lon, lat), h]) }));
const PEAKS_XZ = PEAKS.map(([lon, lat, h, s]) => [...project(lon, lat), h, 2 * s * s]);
const PLATEAUS_XZ = PLATEAUS.map((p) => ({ xz: project(p.lon, p.lat), h: p.h, sx2: 2 * p.sx * p.sx, sz2: 2 * p.sz * p.sz }));

/** Stylised elevation in kilometres at a scene point (x, z). Always ≥ 0. */
export function reliefKmAtXZ(x, z) {
  let h = 0;
  for (const r of RIDGES_XZ) {
    const p = r.pts;
    for (let i = 0; i < p.length - 1; i++) {
      const [d2, t] = dist2ToSegment(x, z, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]);
      const crest = p[i][2] * (1 - t) + p[i + 1][2] * t;
      const v = crest * Math.exp(-d2 / r.sigma2);
      if (v > h) h = v;
    }
  }
  for (const [px, pz, ph, s2] of PEAKS_XZ) {
    const dx = x - px, dz = z - pz;
    const v = ph * Math.exp(-(dx * dx + dz * dz) / s2);
    if (v > h) h = v;
  }
  for (const pl of PLATEAUS_XZ) {
    const dx = x - pl.xz[0], dz = z - pl.xz[1];
    const v = pl.h * Math.exp(-(dx * dx) / pl.sx2 - (dz * dz) / pl.sz2);
    if (v > h) h = v;
  }
  h += 0.04 * valueNoise(x, z, 25) * (1 + 2 * Math.min(h, 1));
  return Math.max(0, h);
}

/** Stylised elevation in kilometres at a geographic point. */
export function reliefKm(lon, lat) {
  const [x, z] = project(lon, lat);
  return reliefKmAtXZ(x, z);
}

/** Scene y for a geographic point on the land surface. */
export function surfaceY(lon, lat) {
  return elevationToY(reliefKm(lon, lat));
}
