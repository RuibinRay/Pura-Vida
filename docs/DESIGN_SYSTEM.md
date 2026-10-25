# Design system — "The Field Journal"

The site is a naturalist's field journal of Costa Rica: warm paper and dark forest ink, chapters with index tabs, stamps in a passport, a raised-relief map that reads as a museum model, and — since the homepage redesign — the owner's own plates as the journal's illustrations, with the homepage as a six-chapter journey (`docs/HOMEPAGE_REDESIGN.md`).

## Why this direction (the three concepts considered)

1. **The Field Journal** — paper, ink, index tabs, stamps; 3D rendered as stylised illustration. Chosen: it ties the personal project to the museum's credibility (every page is a journal entry with its sources), it gives the UI a non-card language, the passport maps to stamps, and procedural low-poly 3D is feasible without external assets.
2. **The Living Diorama** — a museum tabletop model under warm light, placards as UI. Rejected as the whole identity (static, toy-like) but kept for the map: the relief model *is* a diorama.
3. **Documentary Cinema** — dark, full-bleed, misty, scroll-driven. Rejected: the most generic "premium dark site" look, the heaviest on effects, and the brief explicitly wants the interface to complement the environment, not compete.

## Tokens (src/styles/tokens.css) — nature edition (2026-10-24)

The journal's paper turned into leaf light on the owner's request for "nature colours". Token names are unchanged so every component reads the same; the values are:

- Surfaces: pale leaf `#eef4e3` (`--paper`), fern shade `#dde9cc`, new-leaf edge `#c8d9ad`, dew card `rgba(255,255,255,.55)` / `#f7faf1` (`--surface`, `--surface-solid`). The pages sit under a gradient from pale sky `#e3eff2` into the leaf light (`body` in `nature.css`); the home keeps its dark stage.
- Ink: deep forest `#16321f` (12.4:1 on paper), moss ink `#44583f` (6.9:1), faint `#566552` (5.5:1).
- The country: forest `#1f5a3a`, canopy `#3e8a52`, leaf `#4f9a4a`, new leaf `#8cc04b`, pale leaf `#cfe3a0`, moss `#7a8a3c`, ocean `#12456b`, river `#2a7fa1` (text form `#1f6b86`), lagoon `#8fd3cf`, turquoise `#2cb1a6`, sky `#bfe0ee`, gold `#e0a526` (text `#8a5a00`), sunset `#e8893a` (text `#a04e10`), hibiscus `#d9484f` (fills only), orchid `#8e4a9e` (fills only), volcanic `#2b2a2e`, stone `#a9a192`, sand `#e8d6a8`, wood `#8c5a32`, bark `#6b4a2d`.
- Status (never colour alone): good `#24683a`, warn `#8a5a00`, bad `#9f3328`.
- Province swatches (watercolour tones): San José `#c25d4b`, Alajuela `#d9933f`, Cartago `#7f5aa6`, Heredia `#3f8f7a`, Guanacaste `#d6b345`, Puntarenas `#3b78a8`, Limón `#4f9e5c`. The same hex values are used by the 3D map, the 2D map, silhouettes, chapter rules and stamps.
- Marker colours of the map by kind (`src/map/explore.ts`): volcano `#b23a2f`, mountain `#6b5b4a`, park `#1f5a3a`, reserve/refuge `#3e8a52`, wetland/waterfall `#2cb1a6`, river/island `#2a7fa1`, beach `#e0a526`, museum/monument `#8e4a9e`, building `#8c5a32`, cities ink. The filter chips take the same colours when on.
- `.on-dark` swaps paper/ink for the hero overlay, the map popovers and the tour bar.
- A contrast test (`tests/contrast.test.ts`) checks every text pair at ≥ 4.5:1, including the new river, sunset and bark inks and ink on sand, new leaf and the dew card.

## Illustrations (src/art, docs/ART_STYLE.md)

- **Cartoon animals** (`src/art/animals`): one original character per species of the journal, drawn as SVG in the sticker style (ink outline `#2a1d14`, flat fills, big eyes). `AnimalSvg` wraps one in an `<svg role="img">`; `ANIMAL_ART` gives the bare `<g>` for the 2D map. Used on the wildlife page (index and entry heroes), the map's wildlife layer (sprites and cards), the province chapters' species lists, and the place cards ("Animals you can meet here").
- **Place postcards** (`src/art/places`): a scene per landmark, composed from parts (volcano cone, crater lake, cloud-forest ridge, waterfall, church, theatre, oxcart…), hand-tuned for the well-known places and generated from kind + province + a hash of the id for the rest. `PlacePicture` prefers one of the author's plates when the place is on the walk (`PLATE_FOR`). The chip on each picture says "illustration" or "illustrated plate"; nothing is presented as a photograph.
- **Dishes** (`src/journey/dishes.tsx`, `src/art/food`): the five plates in the sticker style; `DishCard` sets a plate on a wood or banana-leaf table; `IngredientIcon` gives each ingredient a 32-unit sticker.

## Type

- **Literata Variable** (opsz 7–72): display and reading text. Headings at opsz 72, body at opsz 14, ledes at opsz 24.
- **Albert Sans Variable**: UI, labels, eyebrows (uppercase, 0.14em tracking), buttons, tables.
- **Caveat Variable**: margin notes only (`.note`), never for essential information, never below 1.25rem.
- Fluid scale `--t-xs … --t-display` with `clamp()` between 360 and 1440 px. Chinese adds the system CJK stack after the Latin faces.

## Components

- **Index tabs** (`.tabs`): coloured vertical tabs on the right edge, one per built section, the current one wider with a white inset edge; hidden under 1100 px where the top bar's contents button opens the same list as a sheet.
- **Contents list** (`.contents`): numbered chapters with the section colour as a dot; unbuilt chapters appear as muted text with "in preparation · milestone N" — not links.
- **Sheet** (`<dialog>`): Escape closes, click outside closes, focus returns to the opener, body scroll locked.
- **Stamp**: SVG ring of text with the province name; dashed when empty, solid and tinted when stamped, date in the centre.
- **Chapter row** (`.chapter`): number, real province silhouette from the geodata, name, capital/area meta, one-line overview.
- **Facts** (`dl.facts`): small uppercase label, serif value, status tag.
- **Status tag** (`.status`): dot + word (confirmed / approximate / interpretation / folklore / uncertain).
- **Source list**: compact "n sources" disclosure inline, full list on the chapter's end and on /sources, each with publisher, published and read-on dates.
- **Buttons**: primary (forest, gold on dark), ghost, glass (on the hero), link; all ≥ 44 px tall at default size.
- **Map stage**: toolbar (3D/2D segment, search combobox over provinces, places, animals and dishes, display menu, whole-country, pause) → a chip row (what to show: everything / volcanoes & peaks / parks & reserves / beaches & water / cities & culture; the wildlife and food layers; the tour; surprise me) → canvas with hint or the tour bar → side panel (a picture card for the place, animal or dish that is open; a province card with its postcards; the highlights strip; the province list as a `listbox`) → footnote with data provenance.
- **Place card** (`.map-card--place`): the picture (16:10), kind · elevation · tour position, name, the sourced note, "Animals you can meet here" and "On the table here" avatar rows, the province chapter button.
- **Animal / dish cards**: the cartoon or the plated dish as a hero, the sourced habitat or region line, "Where to see it" / "Where it is eaten" as buttons that fly the camera, a link into the journal.
- **Sprites** (`.map-sprite`): 48 px white discs with the cartoon inside, pinned to the places of the species' sourced range (`src/content/habitats.ts`) and fanned around a place when several share it (`src/map/sprites.ts`); the same positions in 3D and 2D.
- **Postcards** (`.postcard`): the gallery card (picture, kind in the group's colour, name, province) and the mini version in strips; `content-visibility: auto` keeps the 113-card gallery cheap.
- **Avatars** (`.avatar`): a cartoon or dish sticker on a leaf-light disc with a label; used as index tabs, in rows on cards and in the province species lists.

## The journey (homepage) conventions

- **One stage, six chapters.** A sticky stage holds every visual and every copy block; empty spacers give the scroll length; `--jt`/`--pN` custom properties written by one driver are the only clock. Nothing on the homepage is timed except decorative drift (mist, flapping, rings), and that is declared only under `prefers-reduced-motion: no-preference`.
- **Chapter copy** (`.jcopy`): kicker `NN / Name` in the UI face with a gold rule, display heading in Literata (opsz 48/72), one short paragraph, a links row in gold-ink on dark, a caption in faint paper; panels have a dark left-edge gradient and a 1 px paper rule, never blur. Copy enters from below (28 px, over the first 6–26 % of the chapter), holds, leaves upward over the last 14 %.
- **Plates**: a `.plate` covers the stage like `object-fit: cover` (`width: max(100%, 100dvh × ratio)`), transforms around a focal point, and positions its cut-out layers in plate space; portrait screens shift the focal point with `--fx-shift`.
- **Hotspots**: a 22 px ring with a gold core that breathes; a paper label (name in bold, Latin name in italic) on hover/focus; the ring is omitted on the opening plate where the animals themselves are the markers. Focus ring: 3 px gold.
- **Fact tiles**: 44 px rings, dot grids ("1 in N") and two-bar comparisons in the country colours; small label, serif value, status tag and "n sources" link — the value never stands without its provenance.
- **Chapter rail**: fixed left, numbers only, label on hover/focus, current one highlighted; hidden on phones.
- **Phones**: copy anchors to the bottom (chapters 1–3, 6) or the top (4, 5) so the animals and dishes stay reachable; the table switches to a 9:16 layout; the map camera backs off with the aspect ratio.

## Motion

- Default durations 160/320/700 ms with `cubic-bezier(0.22, 1, 0.36, 1)`; all collapse to 0 under `prefers-reduced-motion`.
- Calm mode (OS preference or setting) sets `--calm: 1` on the journey: every scroll-linked displacement is multiplied by `--m = 1 − --calm`, so only crossfades remain; the map camera jumps instead of gliding; decorative drift stops.
- A pause button stops the render loop (frameloop `demand`) and is remembered.
- Page transitions: a 420 ms fade-up of the main element; none under reduced motion.

## Accessibility rules applied

- Skip link, landmarks, `main` receives focus on route change, page titles per route, `lang` attribute follows the language.
- The 3D stage is `role="application"` with a described keyboard scheme; the province list beside it is the keyboard route; the 2D map's provinces are focusable buttons.
- Live region announces the selected province. Dialogs are native. Every icon-only control has an `aria-label`. Hero doorways exist as real links beside the 3D hit targets.
- Sound is off until the visitor turns it on, and it is labelled as synthesized.
