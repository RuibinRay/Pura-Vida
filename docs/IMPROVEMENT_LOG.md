# Improvement log

What was reviewed, what was wrong, what changed. Newest first. Only things that were actually checked (screenshot, test, measurement) are recorded as fixed.

## 2026-11-11 — The map on measured terrain

### Reviewed and changed
- **The relief was drawn, not measured** (ridge lines and Gaussian peaks; the docs called a DEM swap "the single biggest realism win") → a digital elevation model resampled into the map's frame; the mesh, the markers, the labels and the lines all read the same grid. Vertical exaggeration ×5 → ×4 (real slopes are rougher than the drawn ones).
- **Province outlines were Natural Earth 1:10m**, up to a few kilometres off and within 3 % of the official areas → the OpenStreetMap-derived outlines of geoBoundaries (the official division; within 2 %), with the Gulf of Nicoya's islands and the southern tip of Nicoya as their own parts of Puntarenas.
- **Flat-shaded province colours** → satellite imagery (Sentinel-2 cloudless), elevation tints, or the province colours as a tint over the relief; lighting through a normal map of the real slopes, so the day/night control models them.
- **Three rivers and two lakes** → 209 rivers and 15 lakes from OpenStreetMap, draped on the mesh; **protected areas were pins** → 99 polygons as outlines and a wash.
- **A flat blue sea** → the real bathymetry: the shelf, the slope and the Middle America Trench read from the colour.
- **No sky** → a sun that follows the hour, a sky gradient, haze, clouds that gather over the cordilleras, rain, NASA's night lights after dark.
- **The camera cut straight lines** → flights in orbit terms with a rise and a swing; a narrow stage backs off so the whole country fits.
- **A hidden or covered page stepped a capable device down to the 2D map**: the frame-rate watchdog counted the frames a browser does not draw for a background page as a slow GPU. Gaps of most of a second now reset the sample (`src/perf/tier.ts`).
- **`Trail.tsx` and `trail.ts` in one folder** broke the type check and import resolution on a case-insensitive disk (macOS, Windows): `trail.ts` → `trailZones.ts`.
- **Blank white discs on the map** for the fourteen species that arrived with the wildlife trail (they have no cartoon) → `AnimalPicture` falls back to the author's cut-out.
- **R3F copies a `uniforms` prop**: the sea, the sky and the clouds did not follow the light until their materials were built once with the shared uniform objects.

### Measured
- `node tools/map_shots.mjs` (headless Chrome on an Apple M2, 1440×900, DPR 1): 59–60 fps in every state photographed — country view in the three styles, dawn, dusk, night, rain, a selected province, two close views, the lite tier at 390 px. No console errors. 73 tests pass.

### Known weaknesses carried forward
- One machine, one browser: no phone, no Windows GPU, no Safari. The lite tier was photographed, not felt.
- Every page now warms `mesh-lite.json` (643 KB), `water.json` (355 KB) and `dem.png` (179 KB) at idle — more than the old 355 KB mesh. The dense mesh (1.5 MB) and the textures load only with the 3D map.
- Smoke on the active volcanoes was left out: their current state could not be read from an authoritative source in this session (the Smithsonian GVP refuses automated requests), and a plume in the wrong place would be decoration, not geography.
- The clouds are billboards without shadows on the land; the rain is streaks, not weather data.
- The home page's old map stop (`HomeMap.tsx`, not on the walk) compiles against the new parts but was not re-photographed.

## 2026-10-23 — Homepage journey (the "big update")

### Reviewed and changed
- **The homepage was a hero plus a table of contents** → rebuilt as a six-chapter scroll journey over one sticky stage (`docs/HOMEPAGE_REDESIGN.md` has the audit and the direction). Scroll position is the only clock, so every frame is reachable backwards.
- **The procedural forest lost to the owner's photographs** → the opening is now the owner's plate, upscaled 2× with EDSR (crisper fronds and moss than bicubic in a side-by-side) and cut into a base plus two near-frame layers by a saturation × contrast × spatial-prior mask (a MiDaS depth map was tried first and misread the composite: it put the volcano nearest). The layers part and scale as the visitor scrolls; mist and clouds drift; the animals answer the pointer.
- **The title baked into the poster could not be removed cleanly** (Telea and shift-map inpainting both left ghosts; frequency-selective reconstruction too) → the poster became the end card and the social image, where its title is a bookend rather than a repetition.
- **Chapter copy as scrolling sections scrolled off mid-chapter** (a sticky panel can only hold for its parent's height minus its own) → the copy blocks are pinned in the stage and enter/hold/leave as functions of the chapter's progress.
- **The explore page's lively ocean read as blue noise behind the dark home map** → a still dark sea, dimmed neighbour plates, fog tied to the camera distance.
- **The map sat under the chapter copy** → the camera target shifts left on desktop and up on portrait; distance scales with the aspect ratio.
- **The wildlife copy covered the sloth and the capuchin** → centred under the opening of the path; on phones the copy sits at the top so the animals stay reachable.
- **The 16:9 table lost three dishes in portrait** → a 9:16 layout with the dishes stacked, chosen by `matchMedia`.
- **Phone overflow of 42 px** → the fact tiles were wider than their column; `.journey { overflow-x: clip }` (clip, not hidden, so the sticky stage keeps working) and tighter tiles.
- **A class clash** — the journey's `.chapter__text` restyled the provinces page's rows (axe caught the contrast; `pointer-events: none` would have killed their links) → every journey class is namespaced (`jcopy`, `jchapter`, `jspace`).
- **axe:** `label-content-name-mismatch` on dish hotspots (aria-label without the visible kind) → the visible label is the name; index-tab contrast over the WebGL canvas → tabs fully opaque on the home; IUCN tags darkened.
- **Content:** nine species (five new, each with a Pacific-lowland habitat verdict so the plate shows no animal out of place), five dishes, fifteen nature facts — all with status and sources; three new tests on them.
- **Every route was downloading the three.js chunk** (251 KB gz) — Lighthouse's request list for /sources showed it, and `index.html` carried a `modulepreload` for it: the `advancedChunks` group for three was listed before the react group and had captured React's JSX runtime, so every page depended on the three chunk. The Milestone-1 claim that the chunk "loads only on the home and map pages" was therefore wrong; it is true now (react group first, three group second; the preload list no longer includes it).
- **The hero image preload in `index.html` slowed every other route** in the throttled lab (it competed with the text fonts and moved LCP) → removed; the home's own `fetchPriority="high"` carries the hero. The two text fonts are preloaded instead and self-hosted, which took the font-swap layout shift to 0.

### Known weaknesses carried forward
- Lab-only verification: no real-GPU frame rate, no physical touch, no screen reader session.
- The near-frame masks are heuristic; a few leaf tips at the seam belong to the wrong layer and double faintly at full parallax.
- The plates were supplied without a stated licence or origin; the credits say so.
- The map chapter loads the three.js chunk (256 KB gz) when the visitor approaches it; on slow connections the rise can start before the mesh is ready (the dark stage hides it, but it is a wait).
- Chinese names of the five new species and the five dishes are transliterations or descriptive names flagged uncertain in the research.

## 2026-10-23 — Milestone 1 build session

### Fixed after review
- **Province surfaces rendered black** on the first 3D screenshot → the constrained-Delaunay triangles were wound clockwise in the x/z frame, so every normal pointed down. The builder now emits `[a, c, b]`, and `tests/geo.test.ts` asserts an upward normal for all 14k triangles.
- **Map framed from the wrong side and too far** → camera azimuth −0.32 rad (south-west), polar 1.0, target shifted north so the country sits in the middle rather than under Nicaragua's plate.
- **`removeChild` DOMException when the Canvas unmounted on a tier change** (drei `Html` portals) → replaced every `Html` with a DOM overlay driven by a per-frame projector (`src/map/overlay.tsx`). No portals, no React re-renders per frame, labels remain real text.
- **The frame-rate watchdog demoted a forced `?tier=`** → explicit tiers are never demoted (and headless screenshots became reproducible).
- **The intro overlay stayed hidden** when the scene unmounted mid-walk (demotion) → `CameraPath` resets `introPlaying` on unmount.
- **Index tabs were unreadable** (collapsed to 15 px edges) → coloured notebook tabs with vertical labels and a short label set (`nav.tab.*`).
- **2D map labels were unreadable at zoom** → font and marker sizes are computed from the measured SVG pixel width so labels stay ~13 px on screen.
- **Chinese place names mixed traditional characters** (Natural Earth) → a Simplified table in `build_geo.mjs`.
- **Text contrast**: faint ink `#8c9388` failed (2.7:1) on the chapter numbers and source notes → `#616861` (4.8:1); status colours darkened; a contrast test now guards every text pair.
- **Vista**: ridges were straight bands → multi-octave ridgelines; the sea was hidden behind hills → the land now opens to the sea on the left; volcano moved farther and lightened; hill trees and clearing-edge foliage added; canopy shadow blackened the clearing in the morning → the sun stays ≥ 0.7 elevation while behind the viewer, wider shadow frustum, shadow intensity 0.65.
- **Morpho body stood vertical** (a double rotation) → fixed; ambient morphos no longer fly through the camera path.
- **CLS 0.105 on /provinces, 0.316 on a chapter, 0.153 on /sources** (content and map data arrive after first paint) → reserved heights for chapter rows, the chapter header's lede and facts row and the sources list; `main` keeps a 100dvh minimum so the footer never starts inside the first viewport; content and map data are prefetched at idle. All five audited pages now measure CLS 0.
- **Tour captions claimed unsourced facts** (hollow toucan bill, structural blue) → rewritten from the species research only; the morpho's 2022 symbol status added once the law text was found.
- **Species symbol status disagreed between agents** (a stale government page vs the law) → the content builder reconciles species with the symbols law list; the law wins.

- **Two research agents disagreed on the Guanacaste tree decree date** (24 vs 31 August 1959) → the site says "August 1959"; the symbols chapter (M3) must settle it from La Gaceta.

### Known weaknesses carried into Milestone 2
- The still illustration is cropped on phones (landscape SVG with `slice`); a portrait composition is needed.
- The three.js chunk is ~960 KB (≈ 260 KB gz) and loads on the home and map pages; acceptable for now, but a WebGPU/tree-shaking pass or deferring the home scene until after the still has painted for longer would help weak connections.
- Lab performance for the 3D pages cannot be scored in this environment (SwiftShader, 1–5 fps); needs a real-GPU run (see TEST_RESULTS.md).
- The relief is stylised; a DEM swap is the single biggest realism win for the map.
- Provinces' chapter content depends on how much the official sites allowed to be fetched; several official domains (inec.cr, sinac.go.cr, pgrweb.go.cr) blocked automated access, so some figures are from press coverage or secondary sources and are marked approximate.
