# Test results

All figures below were produced in this session's environment unless stated otherwise: a 2-core Linux container, headless Chromium 153 with SwiftShader (software WebGL), no real GPU, no field data. Numbers that depend on a GPU are marked as such and must be re-measured on a laptop and a phone.

## Unit and data tests (`npm test`, Vitest)

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
