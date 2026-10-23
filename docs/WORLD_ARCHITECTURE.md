# World architecture

How the site is put together, for the next session. Last updated 2026-10-23 (Milestone 1).

## Stack and shape

- React 19 + TypeScript 7 + Vite 8 (Rolldown). Three.js 0.186 through React Three Fiber 9 and a thin slice of Drei (`OrbitControls`, `Line`). Zustand for state. React Router with a **hash router** (`/#/explore`), which keeps direct links and back/forward working on GitHub Pages without a 404 redirect trick.
- No build-time content: everything is static files. Chunks: `react` (31 KB gz), `index` (29 KB gz), `three` (322 KB gz, loaded only by the home scene and the 3D map), page chunks of 1–11 KB gz, content JSON as separate chunks.
- Fonts self-hosted through Fontsource (Literata, Albert Sans, Caveat; OFL). Chinese falls back to the system CJK stack.

## Routes

`/` home · `/explore` map · `/provinces` and `/provinces/:id` · `/wildlife` · `/my-costa-rica` · `/sources`. The routes `/flora /nature /history /culture /symbols /conservation /adventure` exist and show an honest "being written, milestone N" page; they are listed in the contents as *in preparation* and are not nav tabs.

## The three state stores

- `settings` — language, motion (auto/calm/full), quality (auto/full/lite/still/text), time-of-day mode, intro seen, paused. Persisted under `puravida:settings`.
- `map` — selected/hovered province, active landmark, layers, 2D/3D view, camera goal (`{kind: country|province|point, seq}`); the 3D rig and the 2D SVG both react to the same goal.
- `passport` — discoveries (province stamps). Persisted under `puravida:passport`.

All storage access goes through `src/save/storage.ts` (try/catch, never load-bearing).

## The tier ladder (src/perf/tier.ts)

`full → lite → still → text`. The auto tier comes from WebGL2 availability, GPU string (software renderers → lite), cores and memory. A frame-rate watchdog inside each Canvas demotes one step after four seconds under 22 fps (never promotes). `?tier=` wins over everything and is never demoted; the settings sheet lets the visitor choose. `?why` prints the status. Every tier keeps the content: the still tier shows the illustrated hero and the 2D map; the text tier shows the keyboard list.

## Geodata pipeline (tools/build_geo.mjs)

1. Natural Earth 1:10m admin-1 (provinces), admin-0 (Nicaragua, Panama for context), lakes, rivers, populated places — public domain, cached in `tools/cache/`.
2. `topojson-server` builds one topology (quantised 1e5) so provinces share borders exactly; arcs used by two provinces are *internal borders*, arcs used by one are *coast / national border*.
3. Each province polygon is triangulated with **cdt2d** (constrained Delaunay) after a hexagonal Steiner grid (3 km) is dropped inside it — crisp coastline, smooth interior. Triangles are emitted with upward normals (a test checks every triangle).
4. Heights come from `src/map/relief.js`, shared by the tool and the app: a **stylised** relief — ridge polylines for the four cordilleras, Gaussian peaks at named summits, the Valle Central plateau, 40 m of value noise — ×5 vertical exaggeration on a 0.35 km plinth. It is a museum raised-relief model, not a DEM; swap `reliefKm` for a DEM sampler when a licensed heightmap is available (SRTM tile for lon −86…−82.5, lat 8…11.3).
5. Outputs: `public/geo/costa-rica.topo.json` (47 KB), `mesh.json` (355 KB, 8.4k vertices, 14.2k triangles), `places.json`. Isla del Coco is kept as its own part of Puntarenas and drawn ×7 in an inset.

Measured: the mesh areas match the official province areas within 3 % (total 51,167 km² vs IGN 2021 51,179.92 km²).

## 3D map (src/map)

- `Province` — one BufferGeometry per part plus a wall geometry down to the plinth; vertex colours tint highlands; hover lifts 0.5, selection lifts 1.6 and dims the others.
- `Borders` (Line2 segments), `SelectedOutline` (gold), `Ocean` (small shader with ripples and aerial perspective; plain material in lite), `NeighborPlates`, `LandmarkMarkers` (cones for peaks, "trees" for protected areas, dots for cities; scaled by camera distance).
- Labels are **DOM**, not sprites and not drei `Html`: `overlay.tsx` registers anchors and a `Projector` writes screen positions every frame. This removed a `removeChild` crash that drei's portal produced when the Canvas unmounted on a tier change.
- `CameraRig` — OrbitControls with limits, target clamped to the country, a 1.15 s eased glide to the goal, arrow keys/+/−/Home on the stage element, a zoom-level bucket (`far/mid/near`) that controls label density.
- `Map2D` — the same topology as an SVG with the same state; viewBox animates to the goal; provinces are focusable buttons; label sizes are computed from the measured pixel width.

## Home scene (src/scenes/home)

- `FrameDriver` keeps a shared mutable `frame` (elapsed, day state, wind) so dozens of components read one object per frame.
- Vegetation is instanced (`CanopyTrees`, `Palms`, `Understory` planes with canvas-drawn leaf textures) with a wind vertex-shader patch (`shared/wind.ts`).
- Creatures are procedural meshes: keel-billed toucan on a branch (hover: head turn, bill opens), three-toed sloth (hover: looks at you), morphos on Lissajous paths (two hero morphos are pointer targets → `/wildlife`), distant birds.
- The vista: a ground mesh that drops to a valley and rises to hills on the right, three ridge silhouettes with aerial perspective, a clickable volcano (→ `/explore`) with a cloud ring, a sea plane with a sun glint, a sky dome with sun glow and stars.
- `CameraPath` — the 13-second walk in along a Catmull-Rom curve (calm mode: 1.2 s), pointer parallax, touch drag, four tour stops. `?intro=0.3` freezes the walk for inspection.
- `daycycle.ts` — phase 0..1 → sky/sun/ambient colours, sun direction (rises behind the viewer, sets over the Pacific), night factor (stars, fireflies).

## Content (src/content)

`research/*.json` (agents' sourced output, with fetch logs) → `tools/build_content.mjs` → `src/content/generated/*.json`. The builder normalises coordinates to lon/lat, validates statuses, drops anything outside Costa Rica, merges the species' symbol status with the symbols law list, and writes one source registry with "used for" tags. The province chapter page renders only fields that exist; nothing is padded.
