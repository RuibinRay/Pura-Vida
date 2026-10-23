# Homepage redesign — audit, reference analysis, direction (2026-10-23)

## 1. Audit of the Milestone-1 homepage (live at ruibinray.github.io/Pura-Vida, inspected headless + screenshots)

What was weak, in order of importance:

1. **The hero carried the whole page and the page carried nothing else.** Below the 3D scene sat a plain contents list ("The journal") — a table of contents, not a journey. The brief's six-chapter story did not exist.
2. **The procedural forest read as "low-poly demo"**: lollipop hill trees, a flat clearing, a blocky sloth and toucan, a volcano cone with a cloud ring. Coherent, but a visitor compares it with photographs of Costa Rica and loses.
3. **No scroll language.** The only motion was the timed 13 s walk-in; scrolling did nothing. The brief asks for scroll-linked, reversible storytelling.
4. **Generic hero furniture**: a kicker, an H1, a tagline in quotes, two buttons, a "Doorways" card list — the pattern every template uses. The doorway links duplicated the contents list.
5. **Too much UI on the hero**: time-of-day select, sound, pause, skip, tour — five controls before the visitor has read a word.
6. **Typography was fine but undirected**: no chapter numbers, no scientific labels, the title wrapped at some widths.
7. **The still illustration (phone fallback) cropped badly** and looked like a different site.
8. **Performance was good on paper** (CLS 0, a11y 100) but the three.js chunk (256 KB gz) loaded before anything was readable, for a scene most visitors skip.

Kept: the Field-Journal identity (paper, ink, index tabs, stamps, status tags), the 3D relief map and its keyboard twin, the chapter pages, the sources system, the tier ladder and `?why`, trilingual UI.

## 2. Reference analysis

### Image A — the hero plate (rainforest, two toucans, waterfall, volcano, sloth, macaws, morpho; 1376×768, upscaled 2× with EDSR)
- **Composition.** A classic "window" composition: dark, detailed foliage frames the left, right and bottom edges; the eye travels from the toucans (top-left, the brightest colour) down the waterfall to the pool, then back up the valley to the volcano. The sloth closes the right edge; the macaws give the mid-ground scale; the morpho anchors the bottom-right.
- **Lighting.** Soft overcast daylight with warm sun on the toucans' branch and the far trees; mist sits in the valley and wraps the cone. Values: near frame dark, mid-ground mid-green, far hazy blue-grey — textbook atmospheric perspective, which is what makes it a natural 2.5D plate.
- **Colour.** Greens dominate (near: saturated dark; far: desaturated); accents are the toucans' yellow/green/red, the macaws' scarlet, the morpho's blue, the bromeliads' red. The palette is exactly the site's token set (forest, canopy, moss, turquoise, sunset, gold).
- **Depth / camera.** Three planes at roughly 1 m (frame), 50–200 m (waterfall, forest), 5–10 km (volcano). Eye level slightly above the pool. A scroll-linked dolly-in toward the volcano is the natural motion; the near frame should part and pass the camera, the mist should thin.
- **Typography placement.** The quietest region is the sky left of the cone and the mist band over the valley: the title sits there, left-aligned, over the sky, never over the animals.
- **Suggested motion.** Near frame: part left/right and scale up as we "walk in"; mist: drift; clouds: crawl across the summit; macaws: nothing (keep them still — moving cut-outs would look like stickers); morpho: an SVG morpho flies a slow figure-of-eight in front of the plate; toucans/sloth: respond to the pointer with a label and a slight lift.
- **Becoming a page.** Chapter 1 is this plate at rest; Chapter 2 is the same plate pushed into the volcano with the facts beside it; Chapter 3 rises the relief map out of the valley mist. One continuous shot, three chapters.

### Image B — the beach path (illustrated; sloth, capuchin, scarlet macaw, agouti, green iguana; 2752×1536)
- **Composition.** A tunnel of foliage opens onto a Pacific beach; the vanishing point is the horizon between the islands. Five animals sit on a ring around the opening: sloth and capuchin on the left trees, macaw on the right, agouti and iguana on the ground.
- **Style.** Ink outlines and flat painterly fills — a naturalist's plate rather than a photograph. That is the Field-Journal register, so it belongs on the wildlife chapter as an **interactive plate** with hotspots, not as a photo.
- **Lighting / colour.** Even daylight, cool sea against warm sand and greens; the animals are the saturated accents.
- **Motion.** A plate like this should barely move: a slow drift of the whole image with the pointer, hotspot rings that breathe, the animal regions lifting slightly on hover. Clicking an animal opens its journal entry (scientific name, IUCN status, habitat, diet, facts, sources). Habitat check: all five occur in Pacific lowland coastal forest (verified in research/species-coast.json).
- **Becoming a page.** Chapter 4 — "A world of wildlife" — and the header of the Wildlife page.

### Image C — the title poster (volcano over a lake, toucan, sloth, morpho, "COSTA RICA" baked in; 2752×1536)
- A finished poster: golden-hour light, the title set in a serif close to Literata over the mist band. Removing the title was tried (shift-map and FSR inpainting) and left visible ghosts, so the poster is used as what it is: **the end card** of the journey (Chapter 6, with a slow warm grade toward sunset) and the **social/OG image**. A title at the end of a film is a bookend, not a repetition.

## 3. Creative direction — "A journey through Costa Rica"

Three ways to realise the brief were weighed:
1. **One continuous plate, six chapters (chosen).** A single sticky stage; the hero photograph is the opening shot, the camera pushes in on scroll, the map rises out of the mist, the illustrated plate and the table are new "pages" of the same journal, and the poster closes. Scroll position is the only clock. Cheapest to load, reversible by construction, works without WebGL except the map.
2. **Full 3D rebuild of the plate** (GLTF foliage, volcano, water). Honest, but every model would be compared with the photograph beside it and lose; weeks of asset work for a worse hero.
3. **Separate full-screen scenes with snap scrolling.** The "disconnected sections" the brief rejects.

Technical choices: native `position: sticky` stage + one rAF scroll reader writing chapter progress (no GSAP — the existing R3F loop and CSS transforms already do the job, and one system means no conflicts); 2.5D layers cut from the plate with a near-frame mask (saturation × local contrast × a spatial prior), served as responsive WebP; the map's three.js chunk is loaded only when Chapter 2 is in view; reduced motion → static layers and crossfades; the still/text tiers show the plate without layers.
