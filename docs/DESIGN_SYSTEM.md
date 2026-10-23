# Design system — "The Field Journal"

The site is a naturalist's field journal of Costa Rica: warm paper and dark forest ink, chapters with index tabs, stamps in a passport, and a stylised living world (low-poly forest, raised-relief map) that reads as deliberate illustration rather than failed realism.

## Why this direction (the three concepts considered)

1. **The Field Journal** — paper, ink, index tabs, stamps; 3D rendered as stylised illustration. Chosen: it ties the personal project to the museum's credibility (every page is a journal entry with its sources), it gives the UI a non-card language, the passport maps to stamps, and procedural low-poly 3D is feasible without external assets.
2. **The Living Diorama** — a museum tabletop model under warm light, placards as UI. Rejected as the whole identity (static, toy-like) but kept for the map: the relief model *is* a diorama.
3. **Documentary Cinema** — dark, full-bleed, misty, scroll-driven. Rejected: the most generic "premium dark site" look, the heaviest on effects, and the brief explicitly wants the interface to complement the environment, not compete.

## Tokens (src/styles/tokens.css)

- Paper `#f4eedf`, deep paper `#e7dcc3`, ink `#1d2b22`, muted ink `#5a6358`, faint ink `#616861` (4.8:1 on paper).
- The country: forest `#1f5a3a`, canopy `#3e8a52`, moss `#7a8a3c`, ocean `#12456b`, turquoise `#2cb1a6`, gold `#e0a526` (text form gold-ink `#8a5a00`), sunset `#e8893a`, orchid `#8e4a9e` (fills only), volcanic `#2b2a2e`, stone `#a9a192`, wood `#8c5a32`.
- Status (never colour alone): good `#24683a`, warn `#8a5a00`, bad `#9f3328`.
- Province swatches (watercolour tones): San José `#c25d4b`, Alajuela `#d9933f`, Cartago `#7f5aa6`, Heredia `#3f8f7a`, Guanacaste `#d6b345`, Puntarenas `#3b78a8`, Limón `#4f9e5c`. The same hex values are used by the 3D map, the 2D map, silhouettes, chapter rules and stamps.
- `.on-dark` swaps paper/ink for the hero overlay and map popovers.
- A contrast test (`tests/contrast.test.ts`) checks every text pair at ≥ 4.5:1.

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
- **Map stage**: toolbar (3D/2D segment, search combobox, layers menu, whole-country, pause) → canvas with hint → side panel (selection summary, province list as a `listbox`) → footnote with data provenance.

## Motion

- Default durations 160/320/700 ms with `cubic-bezier(0.22, 1, 0.36, 1)`; all collapse to 0 under `prefers-reduced-motion`.
- Calm mode (OS preference or setting) replaces the walk-in with a 1.2 s move, slows the wind to 30 %, keeps the day cycle, and removes camera glides.
- A pause button stops the render loop (frameloop `demand`) and is remembered.
- Page transitions: a 420 ms fade-up of the main element; none under reduced motion.

## Accessibility rules applied

- Skip link, landmarks, `main` receives focus on route change, page titles per route, `lang` attribute follows the language.
- The 3D stage is `role="application"` with a described keyboard scheme; the province list beside it is the keyboard route; the 2D map's provinces are focusable buttons.
- Live region announces the selected province. Dialogs are native. Every icon-only control has an `aria-label`. Hero doorways exist as real links beside the 3D hit targets.
- Sound is off until the visitor turns it on, and it is labelled as synthesized.
