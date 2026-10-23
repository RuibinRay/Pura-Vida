# Costa Rica — Pura Vida: The Living Country

An interactive, trilingual (EN · ES · 简体中文) field journal of Costa Rica: a rainforest you walk into, a 3D relief map of the seven provinces, and chapters written from official and scientific sources. Built as a static site for GitHub Pages — no backend, no trackers, no accounts.

**Status: Milestone 1 (working foundation).** See `docs/FEATURE_PROGRESS.md` for what is built, what is measured, and what comes next.

## Run it

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # vitest: translations, geodata, content sources, contrast
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ on :4173
```

Useful URL switches: `?tier=full|lite|still|text` forces a rendering tier, `?why` shows the diagnostics overlay (tier, reason, fps, GPU), `?lang=es` picks a language, `?draft` shows the editable placeholders of the personal section, `?replay=1` replays the walk in.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` typechecks, tests, builds with a base path derived from the repository name, and publishes to GitHub Pages (enable *Settings → Pages → Source: GitHub Actions* once). Renaming the repository needs no code change.

## Where things live

| Folder | What |
|---|---|
| `src/app/` | router, shell (index tabs, sheets), pages |
| `src/scenes/home/` | the rainforest walk-in, creatures, vista, day cycle |
| `src/map/` | 3D relief map (R3F), 2D SVG map, camera, labels overlay, stylised relief (`relief.js`) |
| `src/content/` | typed content, the personal section (`personal.ts`), `generated/*.json` built from `research/` |
| `src/i18n/` | UI strings for en/es/zh |
| `src/perf/` | tier ladder full → lite → still → text, fps watchdog, `?why` |
| `src/audio/` | synthesized forest ambience (muted by default) |
| `public/geo/` | processed Natural Earth data (provinces, mesh with relief, places) |
| `research/` | sourced research JSON + fetch logs (the content's provenance) |
| `tools/` | `build_geo.mjs`, `build_content.mjs`, `headless_check.mjs`, `lighthouse.mjs` |
| `docs/` | research sources, design system, world architecture, progress, test results, asset credits, improvement log |

## Adding content

- **Facts:** edit or extend `research/*.json` (every claim carries `status` and `sources` with a retrieval date), then `node tools/build_content.mjs` and `npm test`.
- **Your own words and photos:** `src/content/personal.ts` (photos go in `public/personal/`). Empty fields stay hidden on the public site.
- **Geodata:** `node tools/build_geo.mjs` rebuilds `public/geo/` from the Natural Earth 1:10m shapefiles in `tools/cache/` (public domain; not committed). Download `ne_10m_admin_0_countries`, `ne_10m_admin_1_states_provinces`, `ne_10m_populated_places`, `ne_10m_lakes` and `ne_10m_rivers_lake_centerlines` from naturalearthdata.com and unzip the `.shp`/`.dbf` pairs into `tools/cache/`. The generated `public/geo/*.json` files are committed, so this step is only needed to regenerate them.
