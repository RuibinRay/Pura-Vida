# Feature progress

Status words: **built** = implemented and exercised in the headless browser; **built, unverified on device** = implemented, but the check this session could do is not representative (software GPU); **partial**; **planned (M2–M5)**.

## The walk — nine stops, moving animals, flowing water, the Irazú what-if (2026-10-23 evening → 2026-10-24)

| Feature | Status | Notes |
|---|---|---|
| Nine-stop walk (Discover → Monteverde → Río Celeste → Irazú → Guanacaste → Flavors → Corcovado → Tortuguero → Manuel Antonio) | done | `src/journey/scenes.ts`, `Scene.tsx`; one driver, `--pn`/`--i` per stop. The relief map was a tenth stop (between Irazú and Guanacaste) and was taken out on 2026-10-24: a dark map screen between two photographic plates broke the walk, and the owner had said to prefer smooth transitions over the map if it was not good. It is one click away (chapter 1, every stop's province link, the closing chips, /explore) and one line to restore. |
| Walk-through transitions (arrive large, push in, mist/warm wash at the boundary) | done | CSS only, reversible |
| Animals cut out and animated in 1–5 s loops (heads, wings, morpho folds, hover, bob, sway) | done | `tools/plates.py` + `tools/plates/*.json`; 24 animals, 46 parts across 7 plates; loops pause off stage, off under reduced motion |
| Flowing water (opening waterfall, Monteverde waterfall, Río Celeste rapids, Guanacaste/Corcovado/Manuel Antonio surf) + shimmer on still water | done | two-phase scroll of the water region |
| Irazú "What if it erupted?" | done | lake darkens, ash column drifts west, haze, ash fall, tremor, rumble (sound on); sourced dossier (17 dated events, what-if labelled interpretation) |
| Stops pinned on the relief map; three country facts on the map stop | built, not on the home | the code stays in `HomeMap.tsx` (`stops` markers) for the day the map stop returns |
| Six new species entries (quetzal, Baird's tapir, white-tailed deer, great blue heron, volcano hummingbird, purple-throated mountain-gem) + per-stop habitat fit for all drawn animals | done | 15 species in the journal; the Tortuguero scarlet macaw is marked "not quite here" |
| Seven sourced place records with fact tiles | done | `research/places.json` → `content.places` |
| Portrait pan across each plate | done | focal pan clamped to the plate's slack |
| Monteverde hanging-bridges stop | not built | no image supplied; cannot be generated here |
| Hotspots reachable at every stop (pointer and keyboard) | done (fixed 2026-10-24) | a transparent neighbouring stop was taking the pointer; non-current stops are now `pointer-events: none` and their hotspots hidden |
| Sheets keep the scroll position | done (fixed 2026-10-24) | `.paper { position: relative }` beat the UA's fixed position for modal dialogs, so focusing a sheet scrolled the page to the top — on every page since M1 |

## Homepage journey (2026-10-23, after Milestone 1)

| Brief item (homepage redesign) | Status | Notes |
|---|---|---|
| Audit of the live site and analysis of the reference images | done | `docs/HOMEPAGE_REDESIGN.md` |
| Scroll-driven cinematic homepage, one coordinated system, reversible, pinned stage | built | `src/journey/driver.ts` + `journey.css`; no animation library; every frame is a function of the scroll position |
| Ch. 1 Welcome — rainforest plate, title, tagline, intro, forest opens as you scroll | built | the owner's opening image, upscaled 2× (EDSR) and cut into 2.5D layers; animals answer the pointer with a label and lift |
| Ch. 2 Nature — landscape, short paragraph, verified facts with visualisations | built | push-in on the volcano, clouds on the summit; six sourced tiles (area, species share, protected land, forest cover, birds, coastline) with status tags and source counts |
| Ch. 3 Provinces — 3D map rising, hover and click, smooth transition into the chapter | built | the relief mesh in a scroll-driven camera; hover highlights, click dives then opens `/provinces/:id`; the list is the keyboard route; 2D map below the lite tier |
| Ch. 4 Wildlife — ecosystem, animals that respond, click → scientific panel | built | the owner's illustrated plate with five hotspots (sloth, capuchin, scarlet macaw, agouti, green iguana); each opens the sourced entry; habitat fit verified for the Pacific lowlands |
| Ch. 5 Flavors — wooden table, hover names, click → background, ingredients, region | built | five SVG dishes; entries for gallo pinto, casado, tamal, olla de carne, rice and beans from Costa Rican institutional, academic and press sources |
| Ch. 6 The story continues — sunset, purpose, links, contact, navigation | built | the owner's poster graded toward sunset; personal site, GitHub, contact (a mailto appears when `personal.ts` has an address), the journal's sections |
| Chapter indicators 01 / DISCOVER … 06 | built | the left rail (desktop) and the kicker in each chapter |
| Reduced-motion and mobile fallbacks | built | `--calm` freezes every displacement; portrait layouts for the plates, the map camera and the table; still/text tiers show the plate without layers |
| Wildlife page with nine species; food page with five dishes | built | `?focus=` scrolls to an entry; passport stamps for species and dishes |
| Device verification (desktop + mobile, real GPU) | **not done** | lab only (headless Chromium, SwiftShader); see TEST_RESULTS.md |

## Milestone 1 — working foundation (2026-10-23)

| Brief item | Status | Notes |
|---|---|---|
| React / TypeScript / Vite project | built | React 19, TS 7, Vite 8; typecheck + 39 tests pass |
| Animated rainforest homepage with the reveal of mountains / volcano / coast, title + personal intro | replaced | The procedural walk-in was replaced by the scroll-driven journey built on the owner's images (see above); the walk in is now the visitor's own scroll |
| Cursor / touch look-around, hover animations on animals | built | Pointer parallax on the layers; the toucans, sloth and macaws answer the pointer with a label and a lift |
| Click a butterfly → biodiversity; select the volcano → geography | changed | The doorways became the chapters: wildlife is chapter 4 (hotspots → entries), the map rises in chapter 3 |
| Cultural object → traditions | partly | The table of chapter 5 is the cultural doorway; the culture chapter itself is still M3 |
| "Discover Costa Rica" guided experience | replaced | The six chapters are the tour |
| Start Exploring, skip intro, returning visitors skip the walk | n/a | Nothing is timed any more; the scrollbar is the only clock |
| Sound optional, muted until activated | built | Synthesized wind / stream / rain ambience, labelled as such; the toggle sits in the chapter rail |
| Day/night transitions affect lighting | replaced | The journey ends in the sunset of the poster plate; the day cycle went with the procedural scene |
| 3D map: rotate, zoom, pan, select provinces, highlight borders, zoom into a province, contextual info, layers, landmarks, back, reset, search | built | Natural Earth 1:10m provinces; stylised relief ×5; layers: relief, borders, labels, cities, peaks, protected areas; search over provinces, 13 cities, 19 peaks, 27 protected areas and the chapters' 68 landmarks |
| Accessible 2D map | built | Same data as SVG; focusable provinces; viewBox animates to the goal |
| Seven provinces, each with overview, map, cities & landmarks, wildlife & vegetation, culture, history, food, environment, curiosities, sources | built from research | Content is whatever the agents could source; empty parts are hidden, not padded. See RESEARCH_SOURCES.md for the provenance and the unverified list |
| Main navigation | built | Index tabs (desktop), contents sheet (all sizes), skip link, focus management |
| Language system EN / ES / 简体中文 | built | 190+ UI strings per language (test enforces completeness and placeholders); content EN+ES, ZH for names and overviews |
| Responsive UI | built | 1440 and 390 px sweeps, no horizontal overflow |
| GitHub Pages configuration | built, deployed | `RuibinRay/Pura-Vida` → https://ruibinray.github.io/Pura-Vida/ (first deploy 2026-10-23; Pages source: GitHub Actions) |
| Discovery passport (province stamps) | partial | Stamps for provinces, species and dishes; plants, events, symbols, games come with their chapters |
| Wildlife chapter | partial | Nine species (the opening scene's, the coastal plate's five, the national bird) with IUCN status, habitat, diet, role, behaviour, facts, symbol status, sources |
| Where I come from | built as placeholders | Editable slots in `src/content/personal.ts`; nothing written on the author's behalf |
| Sources & credits | built | 256-source registry with "used for" and retrieval dates; 90 unverified claims listed; asset credits |
| Performance tiers, pause control, reduced motion, `?why` | built | full → lite → still → text; pause remembered; calm mode |
| Docs: RESEARCH_SOURCES, DESIGN_SYSTEM, WORLD_ARCHITECTURE, FEATURE_PROGRESS, TEST_RESULTS, ASSET_CREDITS, IMPROVEMENT_LOG | built | this folder |

## Next milestones (from the brief)

- **M2 Nature and biodiversity** — 20+ species journal with 3D habitat scene and discovery journal; plant encyclopedia with rotating 3D plants; six ecosystem environments; ecosystem diagram.
- **M3 Culture and history** — six-chapter timeline with environments; kitchen, music (virtual marimba), celebrations; indigenous and Afro-Costa Rican heritage from community/institutional sources; national symbols museum (the symbols list with legal instruments is already researched: 22 entries in `research/country.json`).
- **M4 Immersive expansion** — volcano exploration with cross-sections, environmental simulator (labelled model), mini-games, soundscapes, expanded province detail, waterfalls and mist.
- **M5 Refinement** — research verification pass, device testing (fps, Lighthouse on a real GPU, screen readers), mobile optimisation, asset attribution, production deployment.

## Open items for the owner

1. ~~Create (or name) the GitHub repository and enable Pages~~ — done 2026-10-23; every push to `main` redeploys.
2. Run the site on a laptop and a phone with `?why` and note fps and tier; the 60 fps target is unverified until then.
3. Fill `src/content/personal.ts` (introduction, photographs, favourite places, stories, recommendations, experiences, memories, and the contact address if one should be public).
6. State the licence/origin of the three plates in `docs/ASSET_CREDITS.md` (they were supplied without one).
4. If a licensed DEM is available (SRTM 90 m GeoTIFF for lon −86…−82.5, lat 8…11.3), supply it and the relief becomes measured instead of stylised.
5. Review the `unverified` list in `src/content/generated/sources.json` / docs/RESEARCH_SOURCES.md and the "approximate" facts drawn from press coverage where official sites blocked fetching.
