# Test results

All figures below were produced in this session's environment unless stated otherwise: a 2-core Linux container, headless Chromium 153 with SwiftShader (software WebGL), no real GPU, no field data. Numbers that depend on a GPU are marked as such and must be re-measured on a laptop and a phone.

## Province pass (2026-10-25) — ten new plates, thirteen stops, every province

### Tests
`npx vitest run`: **60 tests in 5 files, all passing** — the content test now requires a place on the walk for each of the seven provinces and checks the plate manifests of all fourteen plates (the six new ones, the two retired ones kept for the map page, the six unchanged); the stop tests cover the new animals' body parts and wind layers. `tsc --noEmit`: clean. `node tools/build_content.mjs`: 11 places, 18 species, 490 sources, 183 unverified items (the pre-existing warnings only). `npm run build`: clean.

### The new animals (`tools/scratch/bodies.mjs`, three phases each)
Arenal toucan (perch + head tilt), the coffee thrush (perch + head turn) and hummingbird (hover + flutter), the Chirripó thrush (perch + head turn), the turtle (breathe + a slow head turn): whole bodies at every phase, heads on their necks, no seams; the preview sheets of all six plates showed each part alone (one animal per part after the morpho's axis was corrected) and an inpainted base with no residue of the animal.

### Motion sweep (`tools/scratch/motion.mjs`, the new stops, 1440×900, full tier)
| Stop | Loops | Animals (px changed in ≤ 2.5 s) | Water | Wind L / R | Clouds | Flock | Mist |
|---|---|---|---|---|---|---|---|
| 02 Arenal | 17/17 | 27.3 % | 9.5 % (lake) | 14.9 / 3.9 % | 7.7 % | 10.3 % | — |
| 04 Río Celeste | 25/25 | 28.8 / 37.7 % | 20.1 / 8.8 / 3.0 % (falls, pool, rapids) | 17.0 / 12.1 % | — | — | 9.3 % |
| 07 Coffee | 10/10 | 20.7 / 31.1 % | — | 9.3 / 2.9 % | 4.3 % | — | — |
| 08 Cartago | 19/19 | 35.2 / 37.1 % | — | 15.7 / 2.9 % | 9.9 % | 10.2 % | — |
| 10 Chirripó | 7/7 | 34.4 % | — | 14.6 / 5.4 % | 10.0 % | — | — |
| 13 Close | 21/21 | 2.9 % (the turtle, by design slow) | 1.1 / 1.7 / 2.4 % | 7.9 / 1.6 % | 9.8 % | 14.5 % | — |

Unchanged checks still pass at their new indices: the fliers carry their rings at the opening, Guanacaste and Tortuguero; `--vel` 0.443 in a burst, 0 at rest; the eruption at Irazú (stop 9) with ten puffs, 72 flakes, the dossier's 17 events, off again; the quetzal's sheet with its verdict; the Guanacaste tab order; reduced motion → 0 loops, the puffs standing at 0.85, no ash, the notice; the override → 26 loops; the province link with a view transition. 0 console errors.

### Far jump (`tools/scratch/jump.mjs`)
1 → 12 settles in 0.6 s (only stop 12 visible, its base loaded), back to 3 and on to 13 the same; the rail click lands in the 1→2 crossfade as designed.

### Walk and site sweeps
Phone walk (390×844, lite): 13 chapters, 18,568 px, back to 6/3/1 at t = 5.50 / 2.50 / 0.50, **ALL CLEAN**. Desktop and phone screenshots of all 13 stops (`tools/scratch/stops-shots.mjs`) reviewed by eye: no animal under the words at mid-stop on desktop; on phones the new stops anchor their words at the top and the end card scrolls inside its panel above the turtle. Site sweep (`node tools/headless_check.mjs`): **49 page loads, 0 console errors, no horizontal overflow; axe 0 violations on all 26 audited loads** (every stop of the walk, the eruption, the still tier, the opening in three languages, the content pages); the far-jump assertion "1→12: only stop 12 visible".

### Scroll cost (`tools/scratch/perf.mjs`)
3.9 s wall for the 60-step pattern · style recalculation 1.52 s in 297 passes · layout 3 ms · script 282 ms (the alive pass: 5.4 s / 1.49 s / 282 passes) — the thirteen-stop walk costs the scroll no more than the nine-stop one, because only the current stop and its neighbours are ever recomputed.

### Lighthouse (lab, mobile emulation)
Home (lite): a11y 100 · BP 100 · SEO 100 · FCP 2.1 s · LCP 9.9 s · TBT 0 · CLS 0; still tier 76 / 100 / 100 / 100, LCP 6.7 s. Same floor as before: the first plate loads before anything else and nothing in this pass changed it.

### Not tested
The frame rate on a real device; Safari/Firefox; the feel of a 13-stop walk (about 24 screens of scroll) on a phone.

## Alive pass (2026-10-24 night → 10-25) — the toucan, clouds, wind, lag

### Tests
`npx vitest run`: **51 tests in 5 files, all passing** — two new ones: every animal of a kind that gets a whole-body loop (toucan, thrush, quetzal, deer, tapir, heron) has a `body` part in its plate manifest; every stop with `wind` has the two foliage frame layers. `tsc --noEmit`: clean. `npm run build`: clean (the three.js chunk warning as before).

### The toucan (close-ups, `tools/scratch/toucan3.mjs`, 1440×900 at 2×)
Each toucan frozen at the extreme of its loop (67 %) and at rest, cropped at 2×: before the rebuild, the opening pair showed a second beak on the first bird (the second bird's body part carried a copy of it) and a sliver of the first bird's body in the second; after the overlap rule and the spec's boundary polygons, each part composited alone on magenta shows one bird, and the frozen close-ups show whole birds leaning on their feet with no seam at the throat. The Tortuguero toucan, thrush, deer, tapir, heron and quetzal were checked the same way at three phases (`tools/scratch/bodies.mjs`): bodies whole, feet planted.

### Far jump (`tools/scratch/jump.mjs`; now also in `tools/headless_check.mjs`)
Stop 1 → stop 8 by an instant scroll: before the fix, stop 1 stayed `visible` at opacity 1 under stop 8 (the forest plate showed through while Tortuguero's base loaded); after, 0.6 s after the jump only stop 8 is visible (`1:h/0 … 8:v/1 9:h/0`), the base of stop 8 is loaded, and jumping back to 3 and on to 9 settles the same way. A rail click (smooth scroll) lands between stops 1 and 2 with the two in their crossfade, as designed.

### Scroll cost (`tools/scratch/perf.mjs`, the same 60-step scroll pattern with pointer movement, full tier)
| Build | Wall time | Style recalculation | Layout | Script |
|---|---|---|---|---|
| Before the motion pass (root-level variables, blend modes, mist by background-position) | 30 s | ~1.3 s in ~130 passes | — | — |
| After the per-scene writer (22:00) | 10.5 s | ~1.3 s in ~266 passes | — | — |
| This pass (no masks, baked fades, eager bases) | **5.4 s** | 1.49 s in 282 passes | 1 ms in 4 | 188 ms |

Wall time here is dominated by software rasterisation and is not a frame rate; the style figure is the main-thread cost the pattern incurs (about 5 ms per pass in this slow lab, each pass now the current stop and its neighbours rather than the page). The GPU side cannot be measured here; the owner's `?why` panel reports fps on his device.

### Motion sweep (`tools/scratch/motion.mjs`, 1440×900, full tier)
Change within 2.5 s inside each layer's box (animals: the larger of 0.9 s and 2.5 s):

| Stop | Loops running | Animals | Water | Wind (frame left / right) | Clouds | Flock | Mist |
|---|---|---|---|---|---|---|---|
| 01 Discover | 37/37 | 39.7 / 29.1 / 28.7 / 18.6 / 12.6 / 28.7 % | 5.6 / 7.2 % | 7.0 / 8.6 % | 4.7 % | 3.5 % | 8.9 % |
| 02 Monteverde | 26/26 | 21.1 / 14.3 / 25.0 / 50.5 % | 0.1 % (the far waterfall) | 13.3 / 6.4 % | 4.1 % | — | 10.4 % |
| 03 Río Celeste | 17/17 | — | 12.2 / 23.8 / 6.0 % | 9.5 / 10.9 % | — | — | 8.8 % |
| 04 Irazú | 9/9 | 30.9 / 41.3 / 26.1 % | 1.3 % (still lake) | 17.0 / 2.1 % | 4.2 % | — | — |
| 05 Guanacaste | 20+ | 4–22 % | surf | sync sway | yes | yes | — |
| 07 Corcovado | | | | 16.6 / 8.4 % | | | 8.5 % |
| 09 Close | 17/17 | — | 0.2 / 0.4 % | 1.3 / 2.2 % | 1.6 % | 1.3 % | — |

(Stops 5 and 7's animal rows are in `tools/scratch/motion-report.txt`; the table keeps the layers this pass added.) The fliers: every macaw and morpho that has a hotspot carries its ring at 85 % of its stop (the "false" readings are the two macaws per plate that have no hotspot). The eruption: ten puffs at 0.9 opacity, 72 ash flakes, the dossier with 17 timeline items, off again on the second click. The quetzal's hotspot opens its sheet with the habitat verdict, the page stays at scrollY 2903, and the sheet's backdrop is a plain tint over the live stage (`backdrop-filter: none` — the blur made this screenshot time out in the software renderer and is a per-frame full-screen filter on a device). `--vel` 0.381 during a scroll burst, 0.000 at rest, read on the current stop. Tab order at Guanacaste: hotspots → fact sources → links → rail. Reduced motion (emulated): `--calm: 1`, 0 loops, identity transforms, no drift, no flock, the notice; "Turn the motion on" → 26 loops at Monteverde, the notice gone; the province link crosses with `startViewTransition` present. 0 console errors in both sessions.

### Walk sweep (`tools/scratch/walk.mjs`)
Desktop 1440×900 full tier: 27 positions forward and three back, **ALL CLEAN** (0 errors, no overflow). Phone 390×844 lite: nine stops, back to 6/3/1 with t = 5.50 / 2.50 / 0.50, **ALL CLEAN**. (The desktop "back to stop 3" line read the previous chapter because the software renderer had not produced a frame within the probe's 1.5 s; the next step read correctly, and the far-jump check below asserts the settled state.)

### Site sweep (`node tools/headless_check.mjs`)
**35 page loads, 0 console errors, no horizontal overflow; axe 0 violations on all 17 audited loads**; the new far-jump check: "1→8: only stop 8 visible".

### Lighthouse (lab, mobile emulation)
Home (lite): a11y 100 · BP 100 · SEO 100 · FCP 2.0 s · LCP 10.0 s · TBT 0 · CLS 0 (performance not computable here, as before); still tier 75 / 100 / 100 / 100, LCP 6.9 s (was 72, 9.8 s); wildlife 76 / 100 / 100 / 100, LCP 6.3 s.

### Lite tier
A device the watchdog steps down, or a phone, now drops the flock, the light shafts and the near mist veil (`rich` = full tier only) and keeps the animals, water, wind and clouds; verified by the phone walk (lite) running clean.

### Not tested
The frame rate on a real GPU (the owner's `?why` reading is the instrument), Safari/Firefox, the feel of the wind on a device.

## Motion pass (2026-10-24, evening) — "it's not moving"

### Tests
`npx vitest run`: **49 tests in 5 files, all passing** — three new ones on the stop list: every scene stop names an existing plate with unique keys; every `facing`/`fly` override names an animal of that plate, fliers are macaws, morphos or hummingbirds, and flights are 8–34 vw long; every macaw drawn in flight has a flight. `tsc --noEmit`: clean.

### Motion probe (`node tools/scratch/motion.mjs`, 1440×900, full tier)
Share of pixels that change inside each animal's box within 2.5 s (the larger of a 0.9 s and a 2.5 s interval), and the running loops per stop:

| Stop | Running loops | Changed pixels per animal (before → after) |
|---|---|---|
| 01 Discover | 24 (waterfall + spray, lake shimmer, shafts, mist, toucans perch + tilt, sloth sway, macaws bob + flight, morpho) | 0.0 / 0.2 / 0.3 / 9.3 / 5.8 / 22.4 % → **11.1 / 14.3 / 23.1 / 25.8 / 16.2 / 30.8 %** |
| 02 Monteverde | 23 | 0.6 / 9.9 / 1.3 / 24.2 % → **19.1 / 27.4 / 31.7 / 24.0 %** |
| 03 Río Celeste | 15 (water only) | water 25.5 / 32.1 / 10.0 % |
| 04 Irazú | 7 | 0.5 / 22.9 / 12.1 % → **10.6 / 36.8 / 22.2 %** |
| 05 Guanacaste | 20 | 4.1 / 10.7 / 8.3 / 0.2 / 6.7 % → **4.3 / 22.4 / 12.7 / 5.8 / 11.7 %** |
| 07 Corcovado | 13 | 0.0 / 18.3 / 40.1 % → **9.2 / 17.6 / 23.6 %** |
| 08 Tortuguero | 19 | 12.1 / 34.1 / 4.8 / 20.6 / 1.7 % → **14.3 / 23.6 / 19.3 / 37.0 / 2.2 %** |

Every animal now changes at least 2 % of its pixels (the heron, a slow watcher) and most 10–37 %; before, four animals were under 1 %. Also verified: the fliers cross their stops (the opening macaws from x = 852 → 560 px between 10 % and 85 % of the stop) with the hotspot ring riding on them; `--vel` reaches the stylesheet during a scroll burst and returns to 0 at rest; the eruption shows ten puffs, 72 ash flakes, flashes and embers, and switches off; the quetzal's hotspot opens its sheet with the habitat verdict; the tab order at Guanacaste runs hotspots → tiles → links → rail; 0 console errors.

**Reduced motion (emulated `prefers-reduced-motion: reduce`):** `--calm: 1`, 0 running loops, identity transforms, water still, the eruption's puffs standing, no ash, no tremor — and the notice "The animals and the water are still because your system asks for reduced motion" with two buttons; "Turn the motion on" → `--calm: 0`, the class gone, 23 loops running at Monteverde, the notice gone. A province link then crossed to `#/provinces/puntarenas` with `document.startViewTransition` present and the `has-vt` flag set; 0 errors.

### Scroll sweep (`node tools/scratch/walk.mjs`, desktop)
Nine stops × three positions forward, three back, 0 console errors, no horizontal overflow; the frames show the macaws crossing each stop (left over the opening waterfall, right toward the Guanacaste sun) and the animals in their loops.

### Site sweep (`node tools/headless_check.mjs`)
34 page loads (the home at the opening and every stop 2–9 with the eruption on at Irazú, the still tier, Spanish and Chinese, explore, provinces, a chapter, wildlife, food, sources, personal, a milestone page, seven phone pages): **0 console errors, no overflow; axe 0 violations on all 17 audited loads** — the moved hotspots, the spray, the flashes and the motion notice introduced nothing.

### Lighthouse (lab, mobile emulation)
Home — opening (lite): a11y 100 · BP 100 · SEO 100 · FCP 2.0 s · LCP 9.8 s · TBT 0 · CLS 0 (performance null in this lab, as before); still tier 72 / 100 / 100 / 100, LCP 9.8 s; wildlife 76 / 100 / 100 / 100, LCP 6.3 s. Same floor as the previous run (5.6–9.7 s); nothing in this pass changed what loads before first paint.

### Not tested
Real-device frame rate (24 loops over large images at the first stop; the lab cannot say), the feel of the flights and the perch hops on a device, Safari's handling of `rotate3d` with custom properties in keyframes, the view transition in Safari and Firefox (Chromium only here), screen readers.

## The walk (2026-10-23 evening → 2026-10-24)

### Unit and data tests
`npx vitest run`: **46 tests in 4 files, all passing** — four new ones: the six species of the walk fit the stop they are drawn on, carry IUCN entries and sources, and the Tortuguero scarlet macaw is marked as *not* fitting with a note; the seven places have trilingual sourced overviews, ≥ 4 sourced fact tiles and a province; the Irazú what-if is labelled interpretation, says "not a forecast", and the record has ≥ 10 dated, sourced events including 1963; every plate manifest lists the expected animals, every part and water file exists at every width, and water flows at Río Celeste and under both waterfalls. `tsc --noEmit`: clean. Production build: 27 MB of which 23 MB are the plates (eight plates × five widths × base + parts + water); JS unchanged in shape (the three.js chunk now loads only on /explore and the province chapters — the map left the home).

### Scroll sweep (`node tools/scratch/walk.mjs`)
Desktop 1440×900 (full tier): nine stops × three positions (10 %, 50 %, 90 %) forward, then back to stops 6, 3 and 1, then to 0; phone 390×844 (lite) and still tier 1200×800 at every stop's midpoint. **0 console errors, 0 page errors, no horizontal overflow**; the driver reports t = n + 0.5 at every midpoint and t = 0.5 again on the way back (reversible). Screenshots in `tools/scratch/shots/` and the handoff folder.

### Motion check (`node tools/scratch/motion.mjs`)
At each scene stop, the running animations inside the current scene and the share of pixels that change between two frames 650 ms apart inside every animal's and water's box (a region of sky away from them as the baseline):

| Stop | Parts | Running loops | Changed pixels per animal | Water | Baseline |
|---|---|---|---|---|---|
| 01 Discover | 8 | 18 (waterfall flow, lake shimmer, shafts, mist, toucan tilt, sloth sway, macaw bob, morpho drift + fold) | 0.0 %, 0.2 %, 0.3 %, 9.3 %, 5.8 %, 22.4 % | 0.8 %, 2.8 % | 0.0 % |
| 02 Monteverde | 10 | 18 (waterfall, shafts, mist, quetzal tail sway + head turn, hummingbird hover + flap, morpho) | 0.6 %, 9.9 %, 1.3 %, 24.2 % | 0.0 %* | 0.0 % |
| 03 Río Celeste | – | 7 (rapids flow, surface shimmer, mist) | – | 25.1 %, 30.2 %, 10.9 % | 0.0 % |
| 04 Irazú | 3 | 6 (clouds, thrush head turn, hummingbird hover) | 0.5 %, 22.9 %, 12.1 % | 21.2 % (lake) | 0.0 % |
| 05 Guanacaste | 13 | 19 (surf, sun, deer head turn, four macaws bob + flap) | 4.1 %, 10.7 %, 8.3 %, 0.2 %, 6.7 % | 0.0 %* | 0.0 % |
| 07 Corcovado | 7 | 12 (surf, tapir graze, macaw bob + flap, morpho) | 0.0 %, 18.3 %, 40.1 % | 0.1 % | 0.0 % |
| 08 Tortuguero | 9 | 17 (channel shimmer, mist, toucan tilt, morpho, macaw, sloth sway, heron watch) | 12.1 %, 34.1 %, 4.8 %, 20.6 %, 1.7 % | 0.2 % | 0.0 % |

The slow, small loops (a sloth swaying 2° over 5.5 s, a tapir grazing) change fewer than 1 % of their pixels in 650 ms — they move, slowly, by design. \* The Monteverde waterfall and the surf regions sit mostly outside the 1440×900 crop at that scroll position, so their boxes measured 0 % here; their loops were running (listed) and Río Celeste shows the same water code at 25–30 %.

Also exercised: the eruption toggle (class on, six puffs at 0.86–0.90 opacity after 4.5 s with the last two still rising, 42 ash flakes, the live hint "Ash falls over the valley…"), the dossier (three sections, 17 dated events), the toggle off; the quetzal's hotspot → its species sheet with the habitat verdict; the hotspots at every scene stop hit-tested at their centre (all reach the ring after the fix below); reduced motion (`--calm: 1`, 0 running animations, identity transforms on the parts, no water animation; the eruption then shows its six puffs at a fixed 0.85 opacity, no ash, no tremor).

### Site sweep (`node tools/headless_check.mjs`)
34 page loads: the home at the opening and at every stop 2–9 (1440 px, with the eruption on at Irazú), the still tier, Spanish and Chinese, explore (3D, selected, 2D, text, keyboard), provinces, a chapter, wildlife, food, sources, personal (public and draft), a milestone page, and seven phone pages (the opening, Tortuguero and Guanacaste among them). **0 console errors, no overflow.** axe-core (WCAG 2.0/2.1/2.2 A+AA) on 17 of them: **0 violations**, including every stop of the walk and the erupting Irazú.

### Fixed during verification
- A transparent neighbouring stop (mounted for the crossfade) took the pointer at every stop: hotspots at Monteverde, Guanacaste, Corcovado and Tortuguero could not be clicked, and the next stop's hotspots were in the tab order. Non-current stops are now `pointer-events: none` with their hotspots hidden.
- Opening any sheet scrolled the page to the top (the species sheets, the dossier, the passport — on every page since M1): `.paper { position: relative }` beat the UA's fixed position for modal dialogs, so focusing the sheet scrolled to where the dialog sat in the flow. `.sheet` is now explicitly fixed; the probe shows scrollY unchanged across open and close.
- Every plate layer was served too small: srcset descriptors were scaled by the layer's share of the plate while the files are named by plate width, and `sizes` ignored that a plate in portrait is 100vh × ratio wide (≈ 3.5 × the viewport on a phone). Descriptors are now plate widths and `sizes` is the plate's rendered width (capped at 900 CSS px in portrait to keep mobile data reasonable). Lighthouse's image-size-responsive went from failing (three files flagged) to passing.
- On phones, the top-anchored copy of Guanacaste, Corcovado and Tortuguero clipped its own fact tiles and links; the overview is now clamped to four lines there and the block is taller.
- The Tortuguero copy covered the macaw's hotspot; the block sits at 41 % instead of centre on desktop. The Irazú column is narrower so the crater and its ash column stay clear of the words.
- The relief map stop was taken out of the walk (a dark map screen between two photographic plates; the owner had asked for smooth transitions over the map where it was not good). It is one click from every stop.

### Lighthouse (lab, mobile emulation, `node tools/lighthouse.mjs`)
| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home — opening (lite tier) | – \* | 100 | 100 | 100 | 2.0 s | 9.7 s | 0 ms | 0 |
| Home — still tier | 74 | 100 | 100 | 100 | 2.0 s | 9.1 s | 0 ms | 0 |
| Explore (lite tier) | 74 | 100 | 100 | 100 | 2.0 s | 7.6 s | 0 ms | 0 |
| Provinces | 78 | 100 | 100 | 100 | 2.0 s | 5.6 s | 0 ms | 0 |
| Province chapter (lite tier) | 74 | 100 | 100 | 100 | 2.0 s | 7.5 s | 0 ms | 0 |
| Wildlife | 78 | 100 | 100 | 100 | 2.0 s | 5.6 s | 0 ms | 0 |
| Food | 78 | 100 | 100 | 100 | 2.0 s | 5.6 s | 0 ms | 0 |
| Sources | 78 | 100 | 100 | 100 | 2.0 s | 5.6 s | 0 ms | 0 |

Mobile emulation (412×823, DPR 1.75, 4× CPU slowdown, simulated 3G), bundled Chromium 153 with SwiftShader, 2 CPU cores, one run per page. \* The home's performance category is null in this lab (Chrome collected no screenshots while SwiftShader rendered, so no Speed Index). The home's LCP rose from 7 s to ~10 s in the lab because the hero now downloads the file its rendered size calls for (the 1981-px base, 286 KB, instead of the 960-px one it was wrongly picking before); on simulated 3G that is +3 s, on a real phone on 4G or wifi it is a fraction of a second. LCP sits at 5.6 s even on the text-only pages here, so these are the lab's floor, not device numbers. CLS 0 and TBT 0 everywhere.

### Not tested
Real-device frame rate with ~18 concurrent CSS loops per stop over large images (the lab cannot say), physical touch and scroll feel, tablets between 760 and 1100 px, Safari and Firefox (the `min()` inside `sizes` falls back to `100vw` where unsupported), screen readers, the ambience rumble through speakers.

## Homepage journey (2026-10-23, after Milestone 1)

### Unit and data tests
`npx vitest run`: **42 tests in 4 files, all passing** — the three new ones check the nine species (and that the coastal five fit the Pacific lowland habitat of the plate), the five dishes (sourced descriptions, ≥ 5 ingredients, no false heritage claim) and the chapter-2 facts (ranges and sources). `tsc --noEmit`: clean. Production build: three.js chunk unchanged (959 KB, 256 KB gz) and now loaded only when the visitor approaches chapter 3; content chunks: foods 29 KB gz, species 36 KB gz, country 31 KB gz.

### Scroll sweep (`node tools/scratch/journey.mjs`, headless Chromium 153 + SwiftShader)
Desktop 1440×900 (full tier), phone 390×844 (lite), still tier 1200×800: eleven scroll positions forward (0 → 100 %), four backward, screenshots of each. Chapter progress reported by the driver at every point; scrolling back to 0 restores t = 0 and the opening frame. **0 console errors, 0 page errors, no horizontal overflow** (an earlier 42 px overflow on the phone was fixed).

### Site sweep (`node tools/headless_check.mjs`)
29 page loads: the home at the opening and at chapters 2–6 (1440) and at the opening and chapter 4 (390), the still tier, Spanish and Chinese, explore (3D, selected, 2D, text, keyboard), provinces, a chapter, wildlife, food, sources, personal (public and draft), a milestone page, and four phone pages. **0 console errors, no overflow.** axe-core (WCAG 2.0/2.1/2.2 A+AA rules) on 12 of them: **0 violations** after four fixes (dish hotspot names, index-tab contrast over the canvas, IUCN tag contrast, a journey class that restyled the provinces page).

### Interaction run (`node tools/scratch/interact.mjs`)
Wildlife hotspot → sheet titled "Scarlet Macaw / Ara macao"; Escape closes it; dish hotspot → "Tamal (Christmas tamal)" with 14 ingredients; passport stamped `species: scarlet-macaw`, `food: tamal`; province list hover → the map label "Guanacaste" becomes active; click → `#/provinces/guanacaste` with the chapter's H1; `prefers-reduced-motion: reduce` → `--calm: 1` and the near layers' transform is the identity; keyboard order from the top: toucans → sloth → macaws → Begin → Open the map → rail 01–06 → sound; `/wildlife?focus=scarlet-macaw` and `/food?focus=tamal` scroll to their entries; axe clean on both sheets.

### Lighthouse (lab, mobile emulation, `node tools/lighthouse.mjs`)
| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home — opening (lite tier) | 69 | 100 | 100 | 100 | 2.0 s | 6.9 s | 0 ms | 0 |
| Home — still tier | 76 | 100 | 100 | 100 | 2.0 s | 6.3 s | 0 ms | 0 |
| Explore (lite tier) | 75 | 100 | 100 | 100 | 2.0 s | 7.0 s | 0 ms | 0 |
| Provinces | 80 | 100 | 100 | 100 | 1.4 s | 5.2 s | 0 ms | 0 |
| Province chapter (lite tier) | 75 | 100 | 100 | 100 | 2.0 s | 6.9 s | 0 ms | 0 |
| Wildlife | 81 | 100 | 100 | 100 | 1.4 s | 5.0 s | 0 ms | 0 |
| Food | 81 | 100 | 100 | 100 | 1.4 s | 5.0 s | 0 ms | 0 |
| Sources | 80 | 100 | 100 | 100 | 2.0 s | 5.0 s | 0 ms | 0 |

Mobile emulation (412×823, DPR 1.75, 4× CPU slowdown, simulated 3G), bundled Chromium 153 with SwiftShader, 2 CPU cores; one run per page on the final build with nothing else running. Earlier runs the same afternoon, made while a build or a sweep was running in parallel, returned null performance scores and CLS 0.19 on the home and the wildlife page: the CLS came from the web-font swap moving the bottom-anchored opening copy and from the wildlife plate image having no intrinsic size — both fixed (self-hosted, preloaded text fonts; `width`/`height` on every plate image). LCP in this lab sits at 5–7 s on every page including the text-only ones; the M1 run measured 1.2–6.5 s under the same settings, so treat these as a lower bound of what the lab can do today rather than a regression measured on a device. A real-GPU, real-network run is still the measurement that matters.

\* The home's performance category was null in two of three runs (SwiftShader cannot produce the frames the Speed Index needs); the one computed value is shown.

### Not tested
Real-device frame rate (the layers are CSS transforms on three large images; the map chapter is WebGL), physical touch and scroll feel on iOS/Android, tablets between 760 and 1100 px, Safari and Firefox, screen readers.

## Milestone 1 results (kept for the record)

### Unit and data tests (`npm test`, Vitest)

| Suite | What it checks | Result |
|---|---|---|
| tests/i18n.test.ts | every English key exists in es and zh, no extra keys, placeholders preserved, accented place names kept | pass |
| tests/geo.test.ts | 7 provinces with ISO codes and Chinese names; mesh areas within 3 % of official areas (total vs IGN 2021 51,179.92 km²); all 14k triangles wound upward; heights in range; Isla del Coco kept as its own part; relief peaks at Chirripó/Irazú/Arenal and stays low on both coasts; projection round-trip | pass |
| tests/content.test.ts | seven chapters with sourced overviews (en + es) and key facts; landmarks inside Costa Rica with unique ids; species with scientific names and sources; source registry integrity | pass |
| tests/contrast.test.ts | WCAG AA ratios for every text/background token pair (≥ 4.5:1) | pass |

**39 tests in 4 files, all passing** (`npx vitest run`, 2026-10-23). TypeScript 7 `tsc --noEmit`: clean. Production build: 651 modules; initial JS 74 KB + 299 KB React chunk (29 + 94 KB gzipped); the three.js chunk (959 KB, 256 KB gzipped) loads only on the home and map pages; chapter content ships as separate JSON chunks (provinces 85 KB gz, landmarks 37 KB gz, sources 24 KB gz, species 14 KB gz).

## Headless browser sweep (`node tools/headless_check.mjs`)

24 page loads (home at four moods, skip, tour; map 3D/2D/text/selected/keyboard; provinces; a chapter; wildlife; sources; personal page public and `?draft`; a milestone page; Spanish and Chinese; four phone-width pages).

- Console errors: **0** · page errors: **0** · horizontal overflow: **none** at 1440 and 390 px.
- axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on home, map, provinces, chapter, wildlife, sources, personal: **0 violations** after fixing two earlier ones (index-tab contrast, a label/name mismatch on the tour button).
- Keyboard: focusing the province list and pressing ↓ twice selected the second province and flew the camera to it.
- Tier ladder observed end to end: `?tier=full|lite|still|text` render the four versions; without a forced tier the watchdog stepped the software-GPU run from lite to still after four seconds under 22 fps, exactly as designed.
- Screenshots in `handoff/` and `tools/scratch/shots/`.

## Lighthouse (lab, mobile emulation, `node tools/lighthouse.mjs`)

Mobile emulation (412×823, DPR 1.75), bundled Chromium 153, SwiftShader, 2 CPU cores. Three runs; the last run is shown.

| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home (lite tier) | not computable* | 100 | 100 | 100 | 3.0 s | 6.5 s | 0 ms | 0 |
| Explore (lite tier) | 71–78* | 100 | 100 | 100 | 1.8–3.0 s | 6.5 s | 0 ms | 0 |
| Provinces | 89–100 | 100 | 100 | 100 | 1.2–1.8 s | 1.2–3.6 s | 0 ms | 0 |
| Province chapter (lite tier) | 61–77* | 100 | 100 | 100 | 1.2–3.0 s | 4.1–6.5 s | 0 ms | 0 |
| Sources | 86–92 | 100 | 100 | 100 | 1.2–1.8 s | 1.8–3.2 s | 0 ms | 0 |

\* Pages with WebGL: the Speed Index and Interaction-to-Next-Paint proxies depend on frames that SwiftShader produces at 1–5 fps, so the performance category is unreliable or null here. CLS went from 0.105 (/provinces), 0.316 (chapter) and 0.153 (/sources) to 0 during this session by reserving the heights of late-loading content and keeping the footer below the first viewport.

Performance scores for pages with WebGL (home, explore, province) are **not computable** in this environment: Lighthouse cannot derive a Speed Index while SwiftShader renders at 1–5 fps, so the category score is null. The metrics it did measure (FCP, LCP, TBT, CLS) are listed. Treat them as a lower bound and re-run on a real GPU.

## Deployment (2026-10-23)

GitHub Actions run on `RuibinRay/Pura-Vida`: `npm ci` → typecheck → 39 tests → `vite build --base=/Pura-Vida/` → Pages deploy, all green. Verified live: the root document serves with the expected title and canonical URL, and `geo/places.json` resolves under the base path. The hash routes were exercised against the same build under a `/Pura-Vida/` prefix in headless Chromium before the push (six routes, no console errors, no 404s).

## Not yet tested

- Real-device frame rate and the 60 fps target (`?why` prints fps; please record laptop and phone numbers in this file).
- Screen readers (NVDA / VoiceOver) — the structure is in place (landmarks, listbox twin, live region, dialogs) but no session has been run.
- Touch gestures on a physical device (pinch/drag are implemented through OrbitControls and pointer events).
- Safari and Firefox.
