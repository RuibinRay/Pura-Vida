# Improvement log

What was reviewed, what was wrong, what changed. Newest first. Only things that were actually checked (screenshot, test, measurement) are recorded as fixed.

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
