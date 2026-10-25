# Illustration style — "Pura Vida sticker & postcard"

The site's drawn assets (cartoon animals, place postcards, dish plates) share one hand. They are SVG drawn in code
(React components), never raster, never third-party clip art.

## Shared palette (nature)
- Ink/outline: `#2a1d14` (warm dark brown). Outlines are used on the **stickers** (animals, dishes), not on the postcards.
- Leaf greens: `#2f6b3a` (deep), `#4f9a4a` (leaf), `#8cc04b` (new leaf), `#cfe3a0` (pale). Moss `#7a8a3c`.
- Earth: bark `#6b4a2d`, clay `#b86a3c`, sand `#e8d6a8`, stone `#a9a192`, volcanic `#3a3236`.
- Water: river `#2a7fa1`, turquoise `#2cb1a6`, lagoon `#8fd3cf`, deep sea `#12456b`.
- Sky: day `#bfe0ee` → `#e9f3f7`; dusk `#f3b27a` → `#8b5a8e`; night `#1b2740`.
- Sun/accents: gold `#e0a526`, sunset `#e8893a`, hibiscus `#d9484f`, orchid `#8e4a9e`.

## Stickers (animals, dishes)
- Thick rounded outline (stroke `#2a1d14`, width ≈ 3 on a 200-unit canvas, `strokeLinejoin="round"`, `strokeLinecap="round"`).
- Flat fills; each big shape gets ONE lighter highlight shape and ONE darker shade shape, no gradients on fur/feathers
  (gradients are fine for shine on a beak or an eye). Nothing blurred.
- Big round eyes: white, dark iris `#1d1a16`, one white glint. A small friendly smile. Chunky "chibi" proportions:
  head about 40 % of the height, short limbs, rounded everything. Real field-guide colours so the species is recognisable.
- Canvas `viewBox="0 0 200 200"`, subject centred, feet near y≈170, an elliptical ground shadow `rgba(42,29,20,0.18)`
  under it (hovering/flying animals get a smaller shadow lower down). Each animal is a `<g>` component so it can be
  embedded in other SVGs; `AnimalSvg` wraps it in an `<svg>` with `role="img"` and an `aria-label`.
- Ids inside `<defs>` must be prefixed per drawing (`pv-toucan-…`) — several copies of one drawing may be on a page.

## Postcards (places)
- `viewBox="0 0 320 200"`, landscape, "travel poster" flat illustration with layered depth: sky gradient, far shapes
  in atmospheric haze (lighter, bluer), the subject in the middle ground, dark vegetation silhouettes framing one or two
  corners. Thin or no outlines. Gradients allowed (sky, water, haze); no blur filters.
- Scenes are composed from reusable parts (volcano cone, crater lake, cloud forest ridge, waterfall, palm, mangrove,
  church façade, theatre, museum block, lighthouse, boat, oxcart, bridge, ruins…) with a deterministic variation per
  place (seeded by its id), and hand-tuned specs for the well-known places.
- Honest: these are illustrations in the spirit of a place, not photographs of it, and the UI says so.

## Dishes
- Same sticker rules as the animals. Plates are drawn in `viewBox="-260 -200 520 400"`; a `DishCard` adds a table top
  (wood or banana leaf), a cloth and a little steam; ingredient icons are 32-unit stickers.
