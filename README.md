# Costa Rica — Pura Vida: The Living Country

An interactive, trilingual (EN · ES · 简体中文) field journal of Costa Rica. The home page is a film scrubbed frame by frame with the scroll: the country from above, a scarlet macaw's flight down through the clouds to a waterfall and a river, a zip line, rafts in a gorge, a canal, a Pacific beach, Arenal, a crater, the National Theatre, the ruins of Cartago, the stone spheres, a Bribri house, a Boruca mask, and back up to the sky (`docs/HOME_FILM.md`). Behind it: an illustrated walk through the country in thirteen stops (`/walk`), a 3D map of the seven provinces on measured terrain with satellite imagery, real rivers and protected areas and a day–night light, and chapters on wildlife, food and culture written from official and scientific sources. Built as a static site for GitHub Pages — no backend, no trackers, no accounts.

**Status: Milestone 1 (working foundation) + the homepage walk.** See `docs/FEATURE_PROGRESS.md` for what is built, what is measured, and what comes next; `docs/HOMEPAGE_REDESIGN.md` for the audit, the reference analysis and the direction.

## Run it

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # vitest: translations, geodata, content sources, contrast
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ on :4173
```

Useful URL switches: `?tier=full|lite|still|text` forces a rendering tier, `?why` shows the diagnostics overlay (tier, reason, fps, GPU), `?lang=es` picks a language, `?draft` shows the editable placeholders of the personal section. The home page is scroll-driven: every position of the scrollbar is a frame of the film.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` typechecks, tests, builds with a base path derived from the repository name, and publishes to GitHub Pages (enable *Settings → Pages → Source: GitHub Actions* once). Renaming the repository needs no code change.

## Where things live

| Folder | What |
|---|---|
| `src/app/` | router, shell (index tabs, sheets), pages |
| `src/film/` | the home page film: the shots on the scroll (`shots.ts`), the clip decoder (`frames.ts`), the player (`usePlayer.ts`), the page (`Film.tsx`); clips in `public/film/`, cut by `tools/film_build.py` |
| `src/journey/` | the illustrated walk (`/walk`): scroll driver, stop list (`scenes.ts`), scenes (plates with moving animals and water), the Irazú eruption, stop copy, home map (not on the walk now), flavors table, dish illustrations |
| `public/plates/` | the owner's three images as responsive WebP plates and cut-out layers (built by `tools/hero_assets.py`) |
| `public/zoo/` | the wildlife trail: the owner's animal cut-outs as stickers and his environment images as backdrops (`tools/zoo_stickers.py`, `tools/zoo_envs.py`) |
| `src/map/` | 3D map on measured terrain (R3F): satellite / terrain / province styles, rivers, protected areas, day–night light, clouds and rain; 2D SVG map; camera; labels overlay; the shared projection and elevation lookup (`relief.js`, `terrain.ts`) |
| `src/content/` | typed content, the personal section (`personal.ts`), `generated/*.json` built from `research/` |
| `src/i18n/` | UI strings for en/es/zh |
| `src/perf/` | tier ladder full → lite → still → text, fps watchdog, `?why` |
| `src/audio/` | synthesized forest ambience (muted by default) |
| `public/geo/` | the map's data: elevation grid, normal maps, satellite and relief textures, bathymetry, night lights, province meshes, topology, rivers and lakes, protected areas, places |
| `research/` | sourced research JSON + fetch logs (the content's provenance) |
| `tools/` | `build_geo.mjs`, `build_content.mjs`, `hero_assets.py`, `headless_check.mjs`, `lighthouse.mjs`, `export_sources.mjs` |
| `docs/` | research sources, design system, world architecture, progress, test results, asset credits, improvement log |

## Adding content

- **Facts:** edit or extend `research/*.json` (every claim carries `status` and `sources` with a retrieval date), then `node tools/build_content.mjs` and `npm test`. Species go in `species*.json`, dishes in `foods.json`, the chapter-2 numbers in `nature-facts.json`.
- **Plates:** each stop's plate is built from a spec in `tools/plates/<name>.json` (animals as polygons with parts — a `rest: true` body part for anything that moves as a whole — water regions, near-frame foliage polygons, focal point, and a `clean` image — the same scene with the animals erased, so nothing is inpainted and the loops can travel) by `python3 -I tools/plates.py tools/plates/<name>.json` (needs opencv-contrib-python, onnxruntime, numpy, Pillow and the U²-Net/FSRCNN models — see `tools/plates/README.md`); `python3 -I tools/plates.py --index-only` rebuilds `src/journey/plates.generated.json`. The older `tools/hero_assets.py` built the beach and poster plates.
- **Your own words and photos:** `src/content/personal.ts` (photos go in `public/personal/`). Empty fields stay hidden on the public site.
- **The wildlife trail:** the backdrops and the animal stickers of `/wildlife` are built by `python3 -I tools/zoo_envs.py` (from `tools/zoo/envs.json`) and `python3 -I tools/zoo_stickers.py` (from `tools/zoo/stickers.json`; `--only id,id` and `--preview DIR`) into `public/zoo/`; the zones, positions and loops live in `src/journey/trail.ts`, and `tests/trail.test.ts` checks that every animal stands where its sources put it.
- **Culture chapter:** the entries are `research/culture.json` (texts in English and Spanish, names and summaries also in Chinese, sources, and an `unverified` list); `node tools/build_content.mjs` writes `src/content/generated/culture.json`. Its photographs: `python3 tools/fetch_food.py --set culture`, then `python3 tools/culture_photos.py`.
- **Dish photographs:** `python3 tools/fetch_food.py` downloads the photograph chosen for each dish from Wikimedia Commons (the choice is the `PHOTOS` table at the top of the script) and records its author and licence in `tools/food/sources.json`; `python3 tools/food_plates.py` (numpy, Pillow) cuts the plate out along the outline in `tools/food/plates.json` and writes `public/food/` and `src/content/foodPhotos.generated.json`. `npm test` checks that every dish has a credited, openly licensed photograph of a Costa Rican plate.
- **Geodata:** the map is built from open data in three steps (the outputs in `public/geo/` are committed, so this is only needed to regenerate them): `python3 tools/fetch_geo.py` downloads everything into `tools/cache/` (elevation tiles, Sentinel-2 imagery, NASA night lights, Natural Earth, the provinces from geoBoundaries, rivers, lakes and protected areas from OpenStreetMap); `python3 tools/build_terrain.py` (numpy, Pillow) resamples the rasters into the map's frame — `dem.png`, the normal maps, the satellite and relief textures, the bathymetry, the night lights; `node tools/build_geo.mjs` builds the province meshes on the measured heights, the topology, `water.json` and `parks.json`. `node tools/map_shots.mjs` photographs the 3D map in a real Chrome and reports its frame rate. Sources and licences: `docs/ASSET_CREDITS.md`.
