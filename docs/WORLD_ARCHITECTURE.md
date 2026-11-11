# World architecture

How the site is put together, for the next session. Last updated 2026-10-23 (Milestone 1 + the homepage journey).

## Stack and shape

- React 19 + TypeScript 7 + Vite 8 (Rolldown). Three.js 0.186 through React Three Fiber 9 and a thin slice of Drei (`OrbitControls`, `Line`). Zustand for state. React Router with a **hash router** (`/#/explore`), which keeps direct links and back/forward working on GitHub Pages without a 404 redirect trick.
- No build-time content: everything is static files. Chunks: `react` (31 KB gz), `index` (29 KB gz), `three` (322 KB gz, loaded only by the home scene and the 3D map), page chunks of 1–11 KB gz, content JSON as separate chunks.
- Fonts self-hosted through Fontsource (Literata, Albert Sans, Caveat; OFL). Chinese falls back to the system CJK stack.

## Routes

`/` home (the six-chapter journey) · `/explore` map · `/provinces` and `/provinces/:id` · `/wildlife` (`?focus=<species id>`) · `/food` (`?focus=<dish id>`) · `/my-costa-rica` · `/sources`. The routes `/flora /nature /history /culture /symbols /conservation /adventure` exist and show an honest "being written, milestone N" page; they are listed in the contents as *in preparation* and are not nav tabs.

## The three state stores

- `settings` — language, motion (auto/calm/full), quality (auto/full/lite/still/text), paused. Persisted under `puravida:settings`.
- `map` — selected/hovered province, active landmark, layers, 2D/3D view, camera goal (`{kind: country|province|point, seq}`); the 3D rig and the 2D SVG both react to the same goal.
- `passport` — discoveries: province stamps (opening a chapter), species and dish stamps (opening an entry from the journey). Persisted under `puravida:passport`.

All storage access goes through `src/save/storage.ts` (try/catch, never load-bearing).

## The tier ladder (src/perf/tier.ts)

`full → lite → still → text`. The auto tier comes from WebGL2 availability, GPU string (software renderers → lite), cores and memory. A frame-rate watchdog inside each Canvas demotes one step after four seconds under 22 fps (never promotes). `?tier=` wins over everything and is never demoted; the settings sheet lets the visitor choose. `?why` prints the status. Every tier keeps the content: the still tier shows the illustrated hero and the 2D map; the text tier shows the keyboard list.

## Geodata pipeline (tools/fetch_geo.py → build_terrain.py → build_geo.mjs) — rebuilt 2026-11-11

Everything is resampled into one local planar frame (`src/map/relief.js`: 1 unit = 1 km, x east, z south, centred on 84.2° W 9.75° N) and every raster covers one square of it (centre −5, 14; half-size 256 km).

1. **Fetch** (`tools/fetch_geo.py`, standard library, cached in `tools/cache/`): Terrain Tiles on AWS at zoom 10 (elevation and bathymetry), Sentinel-2 cloudless 2016 at zoom 10–11, NASA Black Marble, Natural Earth (neighbours, places), geoBoundaries CRI ADM1 (the provinces, OpenStreetMap-derived), and three Overpass queries (rivers, lakes, protected areas).
2. **Rasters** (`tools/build_terrain.py`, numpy + Pillow): `dem.png` (1024 px, 500 m cells, 8 bits, square-root encoded: h = (v/255)² × 3900 m), `normal-2048/1024.webp` (object-space normals of the 250 m relief with the ×4 exaggeration baked in), `sat-4096/2048.webp` and `relief-2048/1024.webp` (alpha = land, cut clean along Costa Rica's own coast), `bathy.png` (sea depth), `night-1024.webp`, `terrain.json` (the encodings and the measured summits).
3. **Vectors** (`tools/build_geo.mjs`): the province outlines are simplified as one topology (25,984 → 9,473 points; shared borders stay shared), each part is triangulated with **cdt2d** over a hexagonal interior grid — 1.5 km for `mesh.json` (35,816 vertices, 60,349 triangles), 3 km for `mesh-lite.json` — with the named summits added as vertices, and every vertex takes its height from `dem.png`. Rivers are joined by name and touching ends, ranked (the principal rivers, or ≥ 55 km: rank 1; ≥ 22 km: rank 2) and simplified; lakes ≥ 0.6 km² and the protected areas are assembled from OSM relations into closed rings.

Measured: the province areas match the official ones within 2 % (total 51,104 km² vs IGN 2021 51,179.92 km²; the old Natural Earth outlines were within 3 %). Lake Arenal comes out at 85.8 km².

## 3D map (src/map)

- `relief.js` — the projection and the elevation lookup shared by the builder, the tests and the app. `installDem` hands it the grid; `setSurfaceSampler` lets the app answer `surfaceY` from the mesh that is actually drawn (`terrain.ts` builds a bucket grid over its triangles), so markers, labels and lines stand on the surface.
- `geo.ts` — `loadMapData()` loads the outlines, the places, the water, the grid and the lighter mesh on every page; `loadDenseMesh()` and `loadParks()` are asked for by the 3D map only.
- `Province` — one geometry per part with planar UVs into the shared textures, lit through the object-space normal map; three styles (satellite, elevation tints, province colours as a tint over the relief); the wash of the protected areas is a canvas texture every land material reads; the province's rivers and park outlines are draped on the mesh and live inside its group, so they rise with it. Hover lifts 0.22, selection lifts 1.6, tints it and dims the others.
- `Ocean` — coloured by the real depth (shelf, slope, trench), small waves and a sun glint near the camera. `ContextLand` — Nicaragua and Panama as a flat plate in the same paint, normal-mapped, held back. `Atmosphere` — the sun of the chosen hour (equinox at 9.9° N: east at six, just south of overhead at noon), the sky gradient, haze, the weather's overcast; `SkyDome` (sun disc, stars), `Clouds` (billboards whose odds follow the measured relief, drifting west-south-west with the trades, fading as the camera closes in), `Rain`. NASA's night imagery is the land's emissive map and comes up as the day goes.
- Labels are **DOM**, not sprites and not drei `Html`: `overlay.tsx` registers anchors and a `Projector` writes screen positions every frame.
- `CameraRig` — OrbitControls with limits; a flight to a goal is interpolated in orbit terms (target, log-distance, tilt, bearing) with a rise on long hops and a few degrees of swing on arrival; arrow keys/+/−/Home; a zoom-level bucket (`far/mid/near`) that controls label density and the smaller rivers.
- Shader materials that read the shared light uniforms (`ATMO`) are built with `useShader`, not `<shaderMaterial uniforms>`: R3F copies a uniforms prop and the link would be cut.
- `Map2D` — the same topology as an SVG with the same state.
- Tiers: `lite` uses the lighter mesh, 2048/1024 textures, no shadows, clouds or rain. Reduced motion keeps the clouds but stops their drift, drops the rain and makes camera moves instant.

## The homepage journey (src/journey)

One scroll system. `driver.ts` keeps a mutable `journey` object (t = chapter + progress, 0…6; one progress per chapter; smoothed pointer offset) and writes `--jt`, `--p1…--p6`, `--px/--py`, `--calm` and `data-chapter` on the `.journey` root each frame the scroll position changed. Six empty spacers (`.jspace--N`, 185–260 vh each) give the scroll length; a `position: sticky` stage holds everything the visitor sees:

- **Visuals** — `HeroPlate` (chapters 1–2: the opening plate as 2.5D layers: base, near-left, near-right, mist, clouds, light shafts, an SVG morpho on a motion path; hotspots on the toucans, sloth and macaws), `HomeMap` (chapter 3: the relief mesh in its own Canvas with a scroll-driven camera, a dark sea, dimmed neighbours, DOM labels through the Projector; hover and click on provinces; the dive-then-navigate on click; `Map2D` replaces it below the `lite` tier), `WildlifePlate` (chapter 4: the illustrated plate with five hotspots that open `SpeciesEntry` in a Sheet), `FlavorsTable` (chapter 5: an SVG table with landscape and portrait layouts, five SVG dishes, hotspots that open `FoodEntry`), `ClosingPlate` (chapter 6: the poster with a sunset grade).
- **Copy** — `.jchapter--N` blocks pinned in the stage (not scrolling sections): they enter, hold and leave as pure functions of `--pN`, so they are never scrolled off mid-chapter and scrolling back replays them.
- **CSS does the motion.** Every transform and opacity is a `calc()` of the custom properties (see `src/styles/journey.css`); `--m = 1 − --calm` multiplies every displacement, so reduced motion keeps only the crossfades. Time-based animations (mist drift, flapping, hotspot rings) are declared only under `prefers-reduced-motion: no-preference`.
- **Loading** — the hero base is preloaded from `index.html`; the three.js chunk is imported when the visitor approaches chapter 3 (`reach > 1.2`); later plates mount as the visitor approaches them.

Plates come from `tools/hero_assets.py` (responsive WebP sets, near-frame cut-outs, mist textures, the social card) and are described by `src/journey/plates.generated.json`.
## Content (src/content)

`research/*.json` (agents' sourced output, with fetch logs: provinces, country, species, species-coast, foods, nature-facts) → `tools/build_content.mjs` → `src/content/generated/*.json` (provinces, landmarks, species, foods, country facts, sources). The builder normalises coordinates to lon/lat, validates statuses (a composite status such as `confirmed (en); uncertain (zh)` keeps its first word), drops anything outside Costa Rica, merges the species' symbol status with the symbols law list, carries each coastal species' habitat-fit verdict, and writes one source registry with "used for" tags. Pages render only fields that exist; nothing is padded.
