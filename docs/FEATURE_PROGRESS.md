# Feature progress

Status words: **built** = implemented and exercised in the headless browser; **built, unverified on device** = implemented, but the check this session could do is not representative (software GPU); **partial**; **planned (M2–M5)**.

## Clean plates — the owner's scenes without their animals (2026-10-25, afternoon)

The owner asked whether images without the animals would make the animation better, then sent twelve of them (the scenes with the animals erased by his tool's generative fill) and a thirteenth that turned out to be a new generation of the opening scene rather than an erase.

| Change | Status | Notes |
|---|---|---|
| Alignment check of the twelve | done | `tools/scratch/match_empties.py`: every one pixel-aligned with its original (correlation 0.95–0.99 at 320 px, 86–95 % of pixels unchanged); the opening image he sent afterwards is a different picture (0.43) and was not used |
| `clean` source in `tools/plates.py` | done | the base, frame layers and water come from the clean image (upscaled the same way); the animals are cut from the original; the difference between the files vetoes the rim of a cut-out only (never the core); preview sheet gains the clean-base and vetoed-pixels panels |
| Eight plates rebuilt on clean bases | done | arenal, rio-celeste, manuel-antonio, coffee, cartago, chirripo, guanacaste, corcovado — no inpainting on any of them; the veto trimmed 0–1.6 % of a mask |
| Heads keep a band of body under them | done | `overlap` on poly parts (3 source px): a turned head opens onto neck, not onto the base |
| Loops that travel on clean plates | done | `plate--clean`: head gains 2.6 / 1.9 (was 2 / 1.3), `perch-free` (a hop along the perch and back, `hop` vectors in the specs for the Arenal toucan and both thrushes), `stand-free`, `hover-free`, `drift-free` |
| The turtle crawls | done | `walk` vectors in `scenes.ts` (the close stop: 2.6 vw right, 0.5 vw up over the stop, the ring following) + a `crawl` loop (a push with the flippers, 3.6 s) |
| Four plates still inpainted | **waiting on images** | the opening forest, Monteverde, Irazú and Tortuguero have no clean scene yet; they keep the earlier loops |
| Device verification | **not done** | lab only |

## Map page, pictures and cartoons — "nature edition" (2026-10-24, night)

The owner asked for: a better map page with interactive features, an image for every location, a cartoon for every animal, food images, and the pages redesigned in nature colours. Photographs cannot be generated or fetched from this environment, so every picture is drawn in code (see `docs/ART_STYLE.md`) and labelled as an illustration.

| Change | Status | Notes |
|---|---|---|
| Nature palette on every page | done | `tokens.css`: pale leaf surfaces, deep forest ink, river/sunset/bark inks, dew cards; a sky-to-leaf page gradient and a leaf in the margin (`nature.css`); contrast test extended; the home keeps its dark stage |
| A picture for all 113 places | done | `src/art/places`: a drawn postcard per landmark (hand-tuned scenes for the well-known places, generated from kind + province + id for the rest); the author's plates where a place is on the walk (`PLATE_FOR`); shown on the map's place card and popover, in the postcard gallery under the map, in the province strips and in every province chapter's landmark list |
| A cartoon for all 15 animals | done | `src/art/animals`: original characters in one sticker style; wildlife page index and heroes, the map's wildlife layer, place cards, province species lists |
| Food images | done | the five dishes redrawn richer; `DishCard` plates them on a wood or banana-leaf table (food page heroes, the map's food layer and dish cards); ingredient stickers in the ingredient lists |
| Map: filter chips | done | everything / volcanoes & peaks / parks & reserves / beaches & water / cities & culture; a chosen kind shows all of its places at every zoom, "everything" thins out at the whole-country view |
| Map: wildlife layer | done | the species' cartoons pinned to the places of their sourced range (`src/content/habitats.ts`, every placement with a note); click → animal card with "Where to see it" (flies the camera) and a link to the journal; 3D sprites and 2D markers share the positions |
| Map: food layer | done | the dishes pinned where the sources place them (`src/content/foodPlaces.ts`); dish card with "Where it is eaten" |
| Map: place cards | done | picture, note, "Animals you can meet here", "On the table here", province chapter button; the 3D popover shows the picture too; every opened place is stamped in the passport |
| Map: guided tour | done | 15 stops around the country (`TOUR_STOPS`), tour bar with previous/next, auto-play every 7 s, end; "Surprise me" flies to a random place |
| Map: search finds animals and dishes | done | opens the card on its layer and flies to the first place |
| Map: Isla del Coco in both views | done | its two places are pinned in the ×7 inset in 3D; the 2D map now draws the inset too |
| Postcard gallery under the map | done | all places as cards with filter chips and a text filter; a click opens the place on the map above |
| Deep links | done | `/explore?place=<id>`, `?animal=<species>`, `?dish=<id>` from the wildlife, food and province pages |
| Wildlife page | done | cartoon index, a hero per species with "Where to see it" links into the map; the journal entries unchanged |
| Food page | done | dish index, a plated hero per dish with "Where it is eaten"; ingredient stickers |
| Province chapters | done | landmark list with a picture per place (click → shown on the map); species list with the cartoon when the journal has the species |
| Device verification (desktop + mobile, real GPU) | **not done** | lab only (headless Chromium, SwiftShader); see TEST_RESULTS.md |
## Province pass — every province on the walk, ten new plates (2026-10-25)

The owner supplied ten images with a brief: keep the stops that already have animals, replace the two plates without animals, put a stop for every province on the home page, link them with smooth transitions, give the animals moving heads, use the old Río Celeste on the map part, and give the closing "Why this journey exists" stop an animal.

| Change | Status | Notes |
|---|---|---|
| Thirteen stops, all seven provinces | built | Discover → Arenal (Alajuela) → Monteverde → Río Celeste → Guanacaste → Flavors → Coffee highlands (Heredia) → Basílica de los Ángeles (Cartago) → Irazú → Cerro Chirripó (San José) → Corcovado → Tortuguero → Manuel Antonio (Puntarenas, closing); a route that makes geographic sense, the same mist/warm washes at every boundary |
| Two plates replaced | built | Río Celeste (hummingbird, morpho, waterfall + pool + rapids), Manuel Antonio (a sea turtle on the beach, surf, wet sand); the old plates kept as `rio-celeste-pool` (Tenorio's picture on the map page) and `manuel-antonio-sunset` (the Quepos pin) |
| Four new plates | built | Arenal (toucan, lake), Chirripó (thrush over the cloud sea), Cartago (two hummingbirds, the basilica), coffee highlands (thrush, hummingbird); each with foliage frame layers that sway, clouds and, where the sky allows, a flock |
| Moving heads on every new animal | built | head parts with pivots at the neck (tilt/turn/watch) and whole-body cut-outs beneath them; the turtle breathes and turns its head slowly; hummingbirds hover with a fluttering near wing |
| Sourced places | built | `research/places.json`: Arenal (29 July 1968, 78 dead by the CNE's count with the other figures recorded, activity ceased October 2010, Lake Arenal 85 km², the park of 1991), Chirripó (3,820 m, Law 5773 of 1975, 43,700 → ~50,150 ha, −9 °C, 14 km + 5 km), the basilica (2 August 1635, patroness 1824, the 1910 earthquake and Llach's 1912 design, the 22 km romería with no official count), the coffee highlands (coffee since 1779, Le Lacheur 1843, 1,200–1,700 m, Barva 2,906 m, Heredia at 1,137 m) — every figure with its source and status |
| Sourced species | built | `research/species-provinces.json`: olive ridley sea turtle (ICT lists Manuel Antonio among its Pacific nesting beaches; the drawing looks more like a green turtle, and the sheet says so), rufous-tailed hummingbird, ruby-throated hummingbird (a winter migrant, marked as an inference); habitat verdicts for the toucan at Arenal, the thrush at Chirripó (*not quite here* — the páramo's thrush is the sooty thrush) and in the coffee, the mountain-gem and the morpho at Río Celeste |
| The map page | built | `PLATE_FOR` maps Arenal, Chirripó, the basilica/Cartago, Heredia/Barva to the new plates; Tenorio to the old pool plate |
| The composite | built | the tenth image is a still figure on the "Where I come from" page |
| Copy placement per stop | built | Río Celeste's words right of centre (the morpho rests lower left), a narrower Cartago column (the basilica's right wing), the end card starting right of the turtle and fading toward it; on phones the new stops and the end card anchor at the top with clamped text |
| Not done | — | the three second versions (Monteverde, Tortuguero with its caiman, Guanacaste) are kept in the repository and unused; a province-page figure for each would be a natural next use |

## Alive pass — "the toucan is terrible", clouds, wind, lag (2026-10-24, night)

The owner's third look at the walk: the toucan's motion was wrong, the plates needed wind and moving clouds, and the scroll lagged on his machine.

| Change | Status | Notes |
|---|---|---|
| Whole-body loops only for whole-body cut-outs | done | the perch/stand loops were rotating animals whose body is still painted in the plate (only the head was a part): the head hopped off the body. Every perched or standing animal now has a `body` part (`rest: true` in the plate specs — the silhouette minus the head), the base is inpainted under it, and `bodyAnim` in `Scene.tsx` gives a whole-body loop only to an animal that has one |
| The toucan pair cut apart properly | done | the two opening toucans overlap; each one's segmentation grabbed the other (one body carried the neighbour's body, the other carried the first one's beak: a double beak when the head turned). `tools/plates.py` now resolves overlapping masks (a poly part wins, otherwise the pixel goes to the animal whose box it lies deeper in; the loser keeps only what the winner leaves) and the forest spec adds `exclude`/`include` polygons along the line between the birds and a box that holds the whole beak |
| Feet planted | done | perch/stand keyframes pivot at the feet (`transform-origin: 50% 100%`); the quetzal's soft perch pivots at the branch |
| Wind in the trees | done | every plate now has two near-frame foliage layers (`frame` polygons in the specs, split 45/55 %); they sway about the frame edge (`wind-l`/`wind-r`, 7.5 and 9.2 s, out of phase) or, where one crown crosses the split (Guanacaste, Manuel Antonio), as one (`wind-s`); on the opening plate they still part and pass the camera |
| Clouds drifting | done | a 200 %-wide cloud strip in a box of the sky per stop (`ambient.clouds`), translated one tile per 70 s on the compositor; opacity grows with the stop's progress; slides with the scroll |
| A flock crossing the sky | done | five birds (two-stroke SVG) glide across a box of the sky and flap (opening, Guanacaste, Corcovado, the close) |
| Mist strips loop without a jump | done | the strip holds a whole number of tiles per container width (`background-size: 25% / 16.667%`) |
| Scroll lag: style recalculation | done | the driver writes `--jt`/`--pn` only on the elements of the current stop ±1 (`data-scene`), `--vel`/`--px`/`--py` only on the current stop, and hides stops that are off stage outright (`data-fade`); nothing is written on the root any more, so a scroll frame recalculates three stops' styles, not the page's |
| Scroll lag: compositor | done, unverified on device | no `mix-blend-mode` anywhere; the mist, cloud and shaft layers no longer use CSS masks (the fades are baked into their textures — a masked layer is an offscreen surface the GPU fills every frame); the glass buttons on the journey drop their backdrop blur; the mist drifts by `transform` instead of `background-position` |
| Far jumps settle the stops they skip | done | a rail click, a link or a restored scroll position from stop 1 to stop 8 used to leave the stops in between with their last values — stop 1 stayed visible under stop 8 while its plate loaded. The driver now settles every stop outside the window whenever the current stop changes; `tools/headless_check.mjs` asserts it |
| The lite tier carries a lighter sky | done | a phone, or a device the fps watchdog stepped down, keeps the animals, the water, the wind and the clouds and drops the flock, the light shafts and the near mist veil (`rich` = full tier only); the modal sheets' backdrop is a plain tint over the live stage (a blurred backdrop is re-filtered every frame the plates move) |
| A stop's base image fetched as soon as the stop mounts | done | `eager` + `fetchpriority=high` on the base (stops mount 0.75 of a chapter before they start); parts stay lazy |

Real-device frame rate is still unmeasured here (software GPU); the owner's `?why` panel reports fps on his machine.

## Motion pass — "it's not moving" (2026-10-24, evening)

The owner saw the live walk and said the animals were not moving. Two causes, both fixed, plus a stronger motion design:

| Change | Status | Notes |
|---|---|---|
| Loops no longer gated on the OS media query alone | done | every loop was inside `@media (prefers-reduced-motion: no-preference)`, so a system "reduce motion" setting (the owner's device has had it on since the portfolio) froze everything even when the visitor chose Full in settings; the gate is now the journey's own calm state (`.journey--calm`), which the settings override |
| A visible notice when motion is off because of the system, with "Turn the motion on" | done | `.motion-notice` on the home; one click sets motion = full; "Keep it still" dismisses |
| The still tier gets the moving plates | done | the walk has no WebGL, so only the text tier is static now |
| Amplitudes ×2–2.6 and whole-body loops | done | heads turn 8–13°, wings flap ±28°, sloths sway ±5°, quetzal tail ±5.5°; perched birds hop and settle (`perch`), the quetzal breathes (`perch-soft`), the deer, tapir and heron shift their weight (`stand`); hummingbirds dart, morphos loop wider |
| Fliers cross the frame as the stop progresses | done | `fly` vectors per stop (`scenes.ts`): the opening macaws fly 26–30 vw left, Guanacaste's four fly 20–26 vw toward the sun, Corcovado's right, Tortuguero's left, morphos drift 10–14 vw; the hotspot ring follows the bird |
| Scroll-coupled motion | done | the driver writes a smoothed `--vel`; animals lift and fliers bank with the scroll, mist and clouds slide with the stop's progress, animals scale slightly against the plate for depth |
| Water ×2.2, spray at the waterfalls | done | `--wgain`; four spray puffs rise where each waterfall lands |
| Eruption | done | ten puffs (was six), a taller column, lightning flashes inside the ash, 14 embers at the vent, 72 ash flakes (was 42) |
| Smooth page transitions | done | every router link goes through `src/ui/Link.tsx` with `viewTransition`; the old page recedes and the new one settles in (`::view-transition-*` in base.css); browsers without view transitions get a fade-in of the new page; reduced motion keeps a 120 ms fade |

## The walk — nine stops, moving animals, flowing water, the Irazú what-if (2026-10-23 evening → 2026-10-24)

| Feature | Status | Notes |
|---|---|---|
| Nine-stop walk (Discover → Monteverde → Río Celeste → Irazú → Guanacaste → Flavors → Corcovado → Tortuguero → Manuel Antonio) | done | `src/journey/scenes.ts`, `Scene.tsx`; one driver, `--pn`/`--i` per stop. The relief map was a tenth stop (between Irazú and Guanacaste) and was taken out on 2026-10-24: a dark map screen between two photographic plates broke the walk, and the owner had said to prefer smooth transitions over the map if it was not good. It is one click away (chapter 1, every stop's province link, the closing chips, /explore) and one line to restore. |
| Walk-through transitions (arrive large, push in, mist/warm wash at the boundary) | done | CSS only, reversible |
| Animals cut out and animated in 1–5 s loops (heads, wings, morpho folds, hover, bob, sway) | done | `tools/plates.py` + `tools/plates/*.json`; 26 animals, 50 parts across 8 plates; loops pause off stage, off under reduced motion |
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
