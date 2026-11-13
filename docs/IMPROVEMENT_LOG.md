# Improvement log

What was reviewed, what was wrong, what changed. Newest first. Only things that were actually checked (screenshot, test, measurement) are recorded as fixed.

## 2026-11-11 — The culture chapter

- **`/culture` said "being written"** → eleven entries in three groups, each written from sources read in the session (`research/culture.json`, `research/log-culture.md`) and from the national-symbols research of the first session, whose legal instruments the entries now show.
- **What the sources did not settle is said, not smoothed**: coffee's arrival is given as 1776 *and* 1779 because two sources differ; the punto guanacasteco is "regarded as" the national dance because no declaration was read; the calypso's heritage status is repeated without a year; the 1785 marimba at Orosi is marked secondary. The lantern parade of 14 September is left out: nothing retrieved supported it. Five such items are listed under `unverified`.
- **The UNESCO dates of the ox-cart tradition were checked at the source**: proclaimed 2005, inscribed 2008 (a Wikipedia article gives only the first).
- **Photographs**: eight from Wikimedia Commons, each credited under the picture, each with an alt text in three languages that says what the photograph shows and no more (the folk-dance picture is not captioned as the punto). No photograph of a Costa Rican marimba or of a chorreador was found under a clear licence, so the marimba is a drawn, playable instrument with synthesized notes and the chorreador is a labelled drawing.
- **The marimba** plays with pointer, touch (a finger dragged across the bars) and keyboard; it is tuned by test (A4 = 440 Hz, fifteen white notes C4–C6).
- **`tools/fetch_food.py` became a fetcher of photo sets** (`--set culture`), so the culture pictures have the same record of author and licence as the dishes; a test checks that the credit shown is the credit of the file used.

### Known weaknesses carried forward
- The chapter leans on Wikipedia (Spanish and English) more than the rest of the site does: the official sites (ICAFE, the Ministry of Culture, SCIJ) were not retrieved. UNESCO and the first session's legal sources are the exceptions.
- There is no recorded music: a visitor can read about calypso and play a scale, not hear Walter Ferguson.
- Swing criollo and the Independence Torch have no picture.

## 2026-11-11 — A passport to fill, a route to draw, the journal by kind

- **The passport listed what was found and nothing else** → it is a collection now: a level, progress overall and per kind, every animal and dish shown grey until met, the places as a count with the last visited, and the next thing to find of each kind with a link to it (`src/ui/Passport.tsx`).
- **A visitor could not plan anything** → a route of up to twelve places, built from the place cards, drawn on the land (draped on the mesh) and on the 2D map with numbered stops, measured leg by leg in straight lines (and labelled as such: these are not road distances), flown with the tour bar, and shared as a link. A shared link is cleaned: only ids of places that exist are kept.
- **The journal was one list of thirty-two** → filters by kind of animal (from each species' taxonomic order), by habitat (the trail's nine zones) and by province, with counts that say what each choice would show; the choice lives in the address, so a filtered journal can be linked.
- **The province filter was nearly empty, and that exposed a hole in the data**: 46 of the 113 landmarks — every park and every peak — had no province, because the research lists several provinces for most of them and the builder kept none. Their place cards had no province link, clicking them did not select a province, and "postcards from a province" left them out. `tools/build_content.mjs` now reads the province of such a place from its coordinates on the map's own outlines (`tools/province_at.mjs`) and marks it `provinceFrom: 'coordinates'`: a reading of the point, not a claim that a park lies in one province.
- **Puntarenas city had lost its province** in the first session's rebuild of `places.json`: the town stands on a sand spit that the simplified coast cuts off. A point just off an outline now takes the nearest province within a few kilometres; a test names the town.

### Known weaknesses carried forward
- A park that spans provinces is filed under the one its centre point falls in (La Amistad under Limón, Rincón de la Vieja's summit under Alajuela). The filter says "the places where the sources put a species", and the note under it says it is not a range map.
- The route's legs are straight lines over mountains and gulfs alike; there is no road network in the data.
- The passport's level is a share of everything on the site; it rewards opening things, not knowing them.

## 2026-11-11 — The table, photographed

- **The dishes were drawings** → photographs of real plates from Wikimedia Commons, each credited where it is shown and in `ASSET_CREDITS.md`. `tools/fetch_food.py` downloads them and records title, author, licence and page; `tools/food_plates.py` cuts the plate out along an outline given by hand (an ellipse, a polygon for the tamal's leaf, a "union" for bread standing above a rim). Nothing is segmented by a model and nothing is generated.
- **A photograph first chosen for gallo pinto was a Nicaraguan one** (its author's description says so; the file name did not). Caught when the credits were regenerated; replaced by a breakfast photographed in Costa Rica, and a test now fails if a source's title or description names another country.
- **A credit can drift from its picture**: the record of sources was written by one tool and the cut-out by another, and an interrupted download left the old author on the new picture. A test now checks that the credit shown is the credit of the file that was cut.
- **Two photographs crop their plate** (olla de carne, rice and beans) → the food is the photograph and the rim round it is drawn in CSS; the note on each says so. One plate photographed at a steep angle (gallo pinto) is evened part of the way toward the round, not all the way, so the food is not stretched.
- **The table** is set by the scroll: each plate comes in from its own side, turning, on a shadow that tightens as it lands; then steam, a lift under the pointer, and a sheet that presents the dish. Under reduced motion the table is simply set.
- **The minimap sat on a plate** → it steps aside on the table stop.
- **On a phone the outer plates were cut by the screen** (the portrait table covers the screen by its height and is wider than it) → the portrait layout keeps to the middle four fifths; a test holds it there.
- **The food page**: the dish on a board with its ingredient icons gathering round it, the preparation as steps that settle in as they scroll into view (CSS scroll-driven animation where the browser has it, plain otherwise), the olla's raw ingredients as a second photograph.

### Known weaknesses carried forward
- The five photographs are by four different people in four different lights; a light grade evens them, it does not make them a set.
- The ingredient icons round the plate are still the drawn stickers: photographs of single ingredients, cut out, would be the next step, and "ingredients falling into the plate" needs them.
- Steam is a texture rising, not a simulation; it does not know which dishes are hot.

## 2026-11-11 — The opening from above, the minimap, the film layer

- **The walk began inside the forest** → it begins above the country: two plates rendered from the 3D map (`tools/aerial_plates.mjs`), pushed into, handed over and dropped through cloud by the first stop's scroll (`Aerial.tsx`, CSS only). The title rides the high view and leaves before the hand-over; the opening's animals can be met once the descent has landed.
- **First attempt crashed the tab**: two tiled cloud layers 140 % of the screen, scaled up to 3.4× with a brightness filter, exhausted the GPU's tile memory in Chrome. The clouds are now screen-sized gradients that only fade and slide.
- **Rendering the plates at 2560 px showed three faults of the map that small screenshots hid**: a moiré grid on the distant sea (ripples aliasing — they now exist only near the camera, in four unaligned directions), dark seams along shared province borders (each wall's top edge fought the land — the walls now start 60 m under it), and clouds that were flat discs from above (now four noise-built cumulus shapes).
- **No sense of where a stop is** → `JourneyMap.tsx`: the provinces, the route through the stops that are places, a marker that travels with the scroll and lights the province it is in.
- **Generated film had nowhere to go** → `cine.ts` + `CineLayer.tsx` (loop or scroll-scrubbed), `tools/cine_encode.sh`, a test that every listed clip exists; `docs/HIGGSFIELD_SHOTS.md` is the shot list.

### Known weaknesses carried forward
- The aerial plates are stills: a visitor who reaches for the country cannot turn it there (the map is one button away).
- In a tall frame the high plate cannot hold the whole country; it opens on the Central Valley.
- The LCP image of the home page is now the high aerial plate (63–124 KB) with the forest base loading behind it; not re-measured with Lighthouse.

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

## 2026-11-13 — the home page becomes a film

- **A frame per file was the wrong unit.** The first cut stored every frame as a WebP: 1,470 frames at 1280×720 came to 135 MB, because generated footage is dense in every frame and still images cannot share anything between frames. AVIF was no smaller. → The shots are H.264 clips in a container that lists every frame's bytes, decoded with WebCodecs: 1,737 frames at 1600×900 in 73 MB.
- **Generated footage shimmers.** A slow glide over water cost as much as a fast flight, because every pixel changes a little in every frame. → A temporal denoise before encoding (`hqdn3d=2:1.5:8:6`) took a quarter off with no visible change.
- **Software decoding was ten times slower than hardware** (110 ms against 10 ms for twelve frames at 1600×900). → The decoder is left to the browser's choice, and its frames are copied to bitmaps at once so a hardware decoder's few output buffers are never held.
- **A group decoded twice evicted itself.** A group that finished while the wanted list was being rebuilt was decoded again, entered the cache twice, and its second eviction closed frames still on screen: only 60 % of frames were exact. → Finished groups are skipped; 100 %.
- **Dissolves need two shots at once.** Stills flashed in every dissolve because the cache held four groups and a dissolve needs five. → Both shots' groups are requested and five are kept.
- **Re-configuring the decoder restarts it** (a fifth of a second). → It is only re-configured when a clip's codec record differs, which for clips cut alike is never.
- **Chosen against:** Seedance 2.5 at 1080p (160 credits a shot: the film would not fit the balance); AI-generated people for the Indigenous shots (the two shots start from real photographs of a Bribri house and a Boruca dancer instead).
