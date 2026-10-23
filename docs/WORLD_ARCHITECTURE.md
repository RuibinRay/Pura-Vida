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

## The homepage journey (src/journey)

One scroll system. `driver.ts` keeps a mutable `journey` object (t = chapter + progress, 0…6; one progress per chapter; smoothed pointer offset) and writes `--jt`, `--p1…--p6`, `--px/--py`, `--calm` and `data-chapter` on the `.journey` root each frame the scroll position changed. Six empty spacers (`.jspace--N`, 185–260 vh each) give the scroll length; a `position: sticky` stage holds everything the visitor sees:

- **Visuals** — `HeroPlate` (chapters 1–2: the opening plate as 2.5D layers: base, near-left, near-right, mist, clouds, light shafts, an SVG morpho on a motion path; hotspots on the toucans, sloth and macaws), `HomeMap` (chapter 3: the relief mesh in its own Canvas with a scroll-driven camera, a dark sea, dimmed neighbours, DOM labels through the Projector; hover and click on provinces; the dive-then-navigate on click; `Map2D` replaces it below the `lite` tier), `WildlifePlate` (chapter 4: the illustrated plate with five hotspots that open `SpeciesEntry` in a Sheet), `FlavorsTable` (chapter 5: an SVG table with landscape and portrait layouts, five SVG dishes, hotspots that open `FoodEntry`), `ClosingPlate` (chapter 6: the poster with a sunset grade).
- **Copy** — `.jchapter--N` blocks pinned in the stage (not scrolling sections): they enter, hold and leave as pure functions of `--pN`, so they are never scrolled off mid-chapter and scrolling back replays them.
- **CSS does the motion.** Every transform and opacity is a `calc()` of the custom properties (see `src/styles/journey.css`); `--m = 1 − --calm` multiplies every displacement, so reduced motion keeps only the crossfades. Time-based animations (mist drift, flapping, hotspot rings) are declared only under `prefers-reduced-motion: no-preference`.
- **Loading** — the hero base is preloaded from `index.html`; the three.js chunk is imported when the visitor approaches chapter 3 (`reach > 1.2`); later plates mount as the visitor approaches them.

Plates come from `tools/hero_assets.py` (responsive WebP sets, near-frame cut-outs, mist textures, the social card) and are described by `src/journey/plates.generated.json`.
## Content (src/content)

`research/*.json` (agents' sourced output, with fetch logs: provinces, country, species, species-coast, foods, nature-facts) → `tools/build_content.mjs` → `src/content/generated/*.json` (provinces, landmarks, species, foods, country facts, sources). The builder normalises coordinates to lon/lat, validates statuses (a composite status such as `confirmed (en); uncertain (zh)` keeps its first word), drops anything outside Costa Rica, merges the species' symbol status with the symbols law list, carries each coastal species' habitat-fit verdict, and writes one source registry with "used for" tags. Pages render only fields that exist; nothing is padded.
