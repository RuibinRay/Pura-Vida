# Improvement log

What was reviewed, what was wrong, what changed. Newest first. Only things that were actually checked (screenshot, test, measurement) are recorded as fixed.

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
