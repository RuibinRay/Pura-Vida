# Feature progress

Status words: **built** = implemented and exercised in the headless browser; **built, unverified on device** = implemented, but the check this session could do is not representative (software GPU); **partial**; **planned (M2–M5)**.

## Milestone 1 — working foundation (2026-10-23)

| Brief item | Status | Notes |
|---|---|---|
| React / TypeScript / Vite project | built | React 19, TS 7, Vite 8; typecheck + 39 tests pass |
| Animated rainforest homepage: walk in, sunlight through leaves, toucan, sloth, morphos, birds, reveal of mountains / volcano / coast, title + personal intro | built, unverified on device | Procedural low-poly scene; 13 s walk-in (1.2 s in calm mode); light shafts and shadows in the full tier; fps on a real GPU not yet measured |
| Cursor / touch look-around, hover animations on animals | built | Pointer parallax; touch drag; toucan turns and opens its bill, sloth looks at you |
| Click a butterfly → biodiversity; select the volcano → geography | built | Two hero morphos → /wildlife; the volcano → /explore; DOM doorway links beside them |
| Cultural object → traditions | planned (M3) | No culture chapter yet, so no doorway (nothing decorative) |
| "Discover Costa Rica" guided experience | built | Four stops (toucan, sloth, morphos, vista) with sourced captions, then the map |
| Start Exploring, skip intro, returning visitors skip the walk | built | `introSeen` persisted; `?replay=1` and a settings button replay it |
| Sound optional, muted until activated | built | Synthesized wind / stream / rain ambience, labelled as such; no bird calls |
| Day/night transitions affect lighting | built | Slow cycle (a day every four minutes), fixed moods, or Costa Rica's clock |
| 3D map: rotate, zoom, pan, select provinces, highlight borders, zoom into a province, contextual info, layers, landmarks, back, reset, search | built | Natural Earth 1:10m provinces; stylised relief ×5; layers: relief, borders, labels, cities, peaks, protected areas; search over provinces, 13 cities, 19 peaks, 27 protected areas and the chapters' 68 landmarks |
| Accessible 2D map | built | Same data as SVG; focusable provinces; viewBox animates to the goal |
| Seven provinces, each with overview, map, cities & landmarks, wildlife & vegetation, culture, history, food, environment, curiosities, sources | built from research | Content is whatever the agents could source; empty parts are hidden, not padded. See RESEARCH_SOURCES.md for the provenance and the unverified list |
| Main navigation | built | Index tabs (desktop), contents sheet (all sizes), skip link, focus management |
| Language system EN / ES / 简体中文 | built | 190+ UI strings per language (test enforces completeness and placeholders); content EN+ES, ZH for names and overviews |
| Responsive UI | built | 1440 and 390 px sweeps, no horizontal overflow |
| GitHub Pages configuration | built, not yet deployed | Workflow derives the base path from the repository name; deployment awaits a repository |
| Discovery passport (province stamps) | partial | Stamps for provinces only; animals, plants, events, symbols, games come with their chapters |
| Wildlife chapter | partial | The four species of the opening scene with IUCN status, habitat, diet, role, behaviour, facts, symbol status, sources |
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

1. Create (or name) the GitHub repository and enable Pages → Source: GitHub Actions; the workflow handles the rest.
2. Run the site on a laptop and a phone with `?why` and note fps and tier; the 60 fps target is unverified until then.
3. Fill `src/content/personal.ts` (introduction, photographs, favourite places, stories, recommendations, experiences, memories).
4. If a licensed DEM is available (SRTM 90 m GeoTIFF for lon −86…−82.5, lat 8…11.3), supply it and the relief becomes measured instead of stylised.
5. Review the `unverified` list in `src/content/generated/sources.json` / docs/RESEARCH_SOURCES.md and the "approximate" facts drawn from press coverage where official sites blocked fetching.
