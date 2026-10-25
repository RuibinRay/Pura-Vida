# Asset credits

| Asset | Author | Source | License | Attribution requirement |
|---|---|---|---|---|
| Province, country, lake and river boundaries (1:10m) | Natural Earth (Nathaniel V. Kelso, Tom Patterson and contributors) | naturalearthdata.com · github.com/nvkelso/natural-earth-vector (`ne_10m_admin_1_states_provinces`, `ne_10m_admin_0_countries`, `ne_10m_lakes`, `ne_10m_rivers_lake_centerlines`) | Public domain | None required; credited on /sources |
| Populated places (1:10m) | Natural Earth | `ne_10m_populated_places` | Public domain | None; population figures are NE estimates and are labelled as such |
| Elevation point "Cerro Chirripó 3,820 m" | Natural Earth | `ne_10m_geography_regions_elevation_points` | Public domain | None |
| Literata (variable) | TypeTogether for Google | npm `@fontsource-variable/literata` | SIL OFL 1.1 | None |
| Albert Sans (variable) | Andreas Rasmussen | npm `@fontsource-variable/albert-sans` | SIL OFL 1.1 | None |
| Caveat (variable) | Pablo Impallari | npm `@fontsource-variable/caveat` | SIL OFL 1.1 | None |
| Three.js, React Three Fiber, Drei | mrdoob and contributors; Poimandres | npm | MIT | None |
| React, React Router, Zustand, Vite, Vitest, TopoJSON, cdt2d, shapefile | their maintainers | npm | MIT / ISC / BSD-3 | None |
| Opening plate — rainforest clearing with toucans, waterfall, volcano, macaws, sloth, morpho (`public/plates/forest/`) | provided by the site's author (supplied 2026-10-23 as a 1376×768 image; its generator was not stated) | upscaled 2× with EDSR (see below), cut into base + near-frame layers by `tools/hero_assets.py` | the author's own asset; licence to be stated by the author | Credited on the home page and /sources as "provided by the author of this site" |
| Wildlife plate — illustrated forest path to a Pacific beach (`public/plates/beach/`) | provided by the site's author (2752×1536) | cut into base + near-frame layers by `tools/hero_assets.py` | the author's own asset | Same credit line |
| End card / social image — volcano over a lake with the title "COSTA RICA" (`public/plates/poster/`, `public/og.jpg`) | provided by the site's author (2752×1536) | responsive WebP + a 1200×630 JPEG crop | the author's own asset | Same credit line |
| EDSR ×2 super-resolution model (`EDSR_x2.pb`, used once, offline, to upscale the opening plate) | Saafke/EDSR_Tensorflow (Lim et al., "Enhanced Deep Residual Networks for Single Image Super-Resolution", 2017) | github.com/Saafke/EDSR_Tensorflow | Apache-2.0 (repository licence) | Not shipped with the site; recorded here as a processing step |
| MiDaS v2.1 small depth model | Intel ISL | github.com/isl-org/MiDaS releases | MIT | Evaluated for depth-based parallax and **not used** (its depth of the composite plate was unreliable); the near-frame masks are heuristic (see docs/HOMEPAGE_REDESIGN.md) |
| Mist and cloud textures (`public/plates/mist-*.png`) | generated procedurally by `tools/hero_assets.py` (tileable fractal noise) | this repository | part of the site | None |
| Dish illustrations (gallo pinto, casado, tamales, olla de carne, rice and beans), the table, the morpho, icons, stamps, favicon | drawn as SVG for this site | `src/journey/dishes.tsx`, `src/journey/Morpho.tsx`, `src/ui/` | part of the site | Illustrations, not photographs; the ingredients shown follow the sourced lists |
| Relief map | built procedurally from Natural Earth (above) | this repository | part of the site | The relief is interpolated, not surveyed |
| Forest ambience | synthesized with the Web Audio API at runtime | `src/audio/ambience.ts` | part of the site | Labelled as synthesized; it is not a field recording and contains no bird calls |

The three plates were supplied by the site's author for use on the site; they appear to be AI-generated composites and are presented as illustrations, never as photographs of a named place (the home page says so under the volcano). No tourism imagery, no government images and no third-party photographs are used. The personal section's photographs will be the author's own (to be added in `public/personal/`).

## The walk's plates (2026-10-23)
Seven more images supplied by the author on 2026-10-23 (originals in `research/plates-original/`): `guanacaste-deer-macaws-oxcart.png`, `corcovado-tapir-macaw-morpho.png`, `tortuguero-mangrove-toucan-sloth-heron.png`, `irazu-crater-thrush-hummingbirds.png`, `monteverde-quetzal-hummingbirds-waterfall.png` (1672×941) and `rio-celeste.jpg`, `manuel-antonio-sunset.jpg` (1376×768). Upscaled 2× with FSRCNN (github.com/Saafke/FSRCNN_Tensorflow, Apache-2.0); animals cut out with U²-Net (`u2net.onnx` from github.com/danielgatis/rembg, Apache-2.0 model release); inpainting with OpenCV's FSR. The ash and steam sprites in `public/plates/fx/` are procedural (tools in this repo). **Origin and licence of the author's images: to be stated by the author.**
