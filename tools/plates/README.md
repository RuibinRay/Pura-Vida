# Plate specs

One JSON file per homepage plate, consumed by `python3 tools/plates.py tools/plates/<id>.json [--preview DIR]`.
All coordinates are **source-image pixels** (before the 2× upscale); the tool scales them.

```jsonc
{
  "id": "guanacaste",                                  // → public/plates/guanacaste/
  "source": "research/plates-original/....png",
  "upscale": 2,                                        // FSRCNN x2 (cached in ~/models/plates-cache)
  "focal": { "x": 0.46, "y": 0.5, "panFrom": 0.22, "panTo": 0.72 },   // fractions; portrait pans from→to across the chapter
  "points": { "oxcart": [0.27, 0.78] },               // named points (fractions) the site can use for labels/effects
  "clean": "research/plates-original/.../empties/....png",   // optional: the same scene with the animals erased (pixel-aligned) → no inpainting
  "inpaint": "fsr",                                    // "fsr" (texture synthesis, default) or "telea" (smooth, fine for sky); ignored with "clean"
  "animals": [ ... ],
  "water": [ ... ],
  "frame": { "polys": [[[x,y],...]], "split": [0.42, 0.58] }   // optional near-frame layers (heuristic, see tools/plates.py)
}
```

## Animals

```jsonc
{
  "id": "macaw-b", "species": "scarlet-macaw", "kind": "macaw",   // species = id in src/content/generated/species.json
  "anim": "bob", "period": 2.1,                                   // optional whole-animal loop (the group moves); "crawl" for a turtle
  "hop": [22, -2],                                                // optional: a hop along the perch (source px) for the site's perch loop on a clean plate
  "box": [x0, y0, x1, y1],                                        // generous box around the WHOLE animal incl. tail/wing tips
  "u2net": [[x0,y0,x1,y1], ...],                                  // crops to run U²-Net on (default: the box); add a tight crop for small parts
  "include": [[[x,y],...]],                                       // polygons forced into the mask (thin antlers, dark wings the model misses)
  "exclude": [[[x,y],...]],                                       // polygons forced out (a branch the model grabbed)
  "grabcut": [[x0,y0,x1,y1]],                                     // refine the mask edge inside these boxes with GrabCut (after include/exclude)
  "threshold": [0.3, 0.7], "feather": 0.8,                        // optional
  "hotspot": [x, y],                                              // where the clickable ring sits (omit for a second individual of the same species)
  "parts": [ ... ]                                                // what moves; anything not in a part stays in the base image
}
```

Only moving pieces become layers. The base image is inpainted under every exported part, so a part may move a few
degrees without revealing the original. Parts:

- `{ "name": "head", "anim": "turn", "poly": [[x,y],...], "pivot": [x,y], "z": 2, "amp": 3.5, "period": 4.2, "overlap": 3 }` — polygon part
  (cut = animal mask ∩ polygon). The polygon should include a little of the neck so the joint never opens. `overlap`
  (source px) keeps a band inside the polygon's outline in the body part as well, under the head: a turn then opens
  onto neck rather than onto the base. Use it on clean plates, where the heads turn further.
- `{ "name": "wing-upper", "anim": "flap-a", "half": { "axis": [[headX,headY],[tailX,tailY]], "side": "pos"|"neg", "span": [a0,a1], "halfWidth": 12, "overlap": 5 }, "pivot": [x,y] }`
  — half-plane part for wings. `axis` runs head → tail through the body. `side` "pos" is the side where
  cross(axis, point − head) > 0 — in image coordinates (y down) with the axis pointing LEFT that is ABOVE the line; with
  the axis pointing RIGHT it is BELOW. `span` limits the part along the axis as fractions of its length (0 = head,
  1 = tail; negative values reach beyond the head). `halfWidth` is the body's half-thickness in source px: the wing
  starts `halfWidth − overlap` from the axis so the body band stays in the body part.
- `{ "name": "body", "anim": "none", "z": 2, "rest": true }` — everything of the mask not taken by other parts. Needed
  whenever the whole animal moves (`anim` on the animal, or the site's own perch/stand loops for perched birds, deer,
  tapirs and herons — `bodyAnim` in `src/journey/Scene.tsx` gives those only to animals that have a body part);
  omit it for an animal whose body stays in the base. A whole-body loop on a head-only animal moves the head off the
  body (the toucan of 2026-10-24).
- Overlapping animals (two toucans on one branch): each one's segmentation takes pieces of the other. The tool
  resolves pixels both masks claim — a `poly` part wins, otherwise the pixel goes to the animal whose box it lies
  deeper inside — but draw the line yourself where the bodies touch: an `exclude` polygon on each animal along the
  boundary, an `include` for anything the model loses against the neighbour (a beak tip over a dark neck), and a box
  that holds the whole animal (a beak tip outside the box stays in the base and doubles when the head turns).
- `pivot` is the rotation centre in source px (the neck base for a head, the wing root for a wing, the hands for a
  hanging sloth). `axis` on a part (or from `half`) becomes the 3D rotation axis for flaps.

Animation names the site understands: `turn` (head rotates ±amp°), `tilt` (toucan head/bill), `graze` (head lowers and
rises), `watch` (slow heron neck), `sway` (hanging sloth), `tail` (quetzal tail), `flap-a` / `flap-b` (wings, opposite
phase, 3D rotation about the axis), `morpho-a` / `morpho-b` (butterfly wings folding), `flutter` (hummingbird wings, fast,
small), `bob` (whole flying bird), `hover` (whole hummingbird), `drift` (whole butterfly), `breathe` (body), `none`.

### Clean plates (the scene without its animals)

When the author can erase the animals from an image with his tool's generative fill and send the result, name it as
`clean`. The tool checks the size, upscales it the same way, and uses it as the base, the frame layers and the water,
so nothing is inpainted and a loop may travel (the site's `plate--clean` rules: heads turn further, perched birds hop,
grazers shift, hummingbirds and morphos roam wider, the turtle crawls with the scroll). The animals are still cut from
the source by U²-Net and the polygons; the difference between the two files is used only as a veto — a 5-px mean of
the channel-mean difference above 0.1, closed, hole-filled and dilated by 4 px, always keeping the interior of the
confident mask — so a halo of untouched background can never travel with a cut-out, and an animal whose colour matches
the fill (a black back over a shadowed fill) is never cut into. The generator re-encodes the whole image (per-pixel
differences above 0.2 on 6 % of untouched pixels, 15 % in foliage), which is why the difference is averaged first.
The preview sheet gains two panels: the clean base under the animal, and the crop with the vetoed pixels in red (there
should be almost none) together with any *pocket*: a region of the cut-out that the fill never touched and that is open
to the cut-out's edge — background the segmentation (or an `include` polygon drawn a half-cell low) swallowed. The
inpainted base used to hide such a pocket; the clean base shows it moving with the animal. Pockets are reported and
drawn, not removed: a leg or a bill tip whose colour matches the fill looks the same to the test, and a dark animal over a
dark fill (the Corcovado tapir) reports tens of thousands of pixels that are in fact repainted. Fix one with an
`exclude` polygon, as for the coffee hummingbird's bill. Read a grid's labels as sitting *above* their line. A regenerated scene (same prompt, new picture) is not a clean image: the animals would sit on
branches that are not there — check alignment first (`tools/scratch/match_empties.py`: correlation above 0.95 and
more than 85 % of pixels unchanged at 320 px).

### Pasted animals (a new scene, the old cut-outs)

When the author regenerates a scene instead of erasing its animals (a different picture), the old plate's cut-outs can
be placed on it: `"paste": [{ "from": "research/plates-built/forest-v1", "id": "toucan-a", "as": "toucan", "at": [x, y],
"scale": 0.95, "flip": false, "warm": 0.06, "gain": 1.0, "layer": "near-left", "hotspot": [x, y], "hop": [dx, dy],
"species": "...", "period": 5.4 }]`. `from` is a built plate directory (under `public/plates/` by name, or any path
under the repository); `at` is the top-left of the animal's box in this spec's source px; `scale` is relative to the
source plate's px (0.95 of a 2× plate's parts on a 1× scene ≈ 1.9× the old source). Parts keep their names, loops,
pivots and axes (mirrored on `flip`); the base is the scene untouched, and the manifest says `clean`. Mock positions
first with `tools/scratch/compose_mock.py`, then build with `--preview` and read the `<plate>-<animal>.png` sheets
(the scene crop, then the animal composited on it). Pasted animals are not cut from this scene, so no `include`/`exclude`
applies to them; `erase` polygons (this spec's source px) clear what the old cut-out carried of its old scene (a patch
of the first plate's sky under the toucan's bill, invisible over its own base, a grey square over the new one). A scene
can also have its own cut animals in `animals` beside the pasted ones.

### `diffInclude` (clean plates)

A box in which every pixel that differs between the source and the clean image (5-px mean > 0.14) and connects to
the animal already found (through a 3-px bridge) is foreground — for thin things the model loses against a bright
sky (the deer's antlers): `"diffInclude": [[x0, y0, x1, y1]]`. A repainted leaf floating above the antlers does not
connect and stays out.

## Water

```jsonc
{ "name": "waterfall", "poly": [[x,y],...], "feather": 8, "whiteOnly": true, "vMin": 0.6, "sMax": 0.4,
  "flow": { "dx": 0, "dy": 1, "period": 1.8, "amp": 0.05 }, "mode": "flow" }
```
`whiteOnly` keeps only the bright, unsaturated water pixels inside the polygon (rocks and banks stay in the base).
`flow` is the direction and amplitude (fraction of the layer size) of the two-phase scroll the site uses to make it
flow; `mode` "flow" | "shimmer" (reflections) | "still" (exported only, for effects such as the crater lake).

## Workflow that works

1. Read the plate with a coordinate grid: `python3 tools/plates/grid.py <image> <out.png> [x0 y0 x1 y1] [step]`;
   a 20 px grid on a 150–200 px crop, upscaled 4×, gives coordinates good to ±3 px. Coarse grids mislead by a cell.
2. Write the spec, run the tool with `--preview DIR`, open `DIR/<plate>-<animal>.png`: panels are the original crop,
   the cut-out on magenta, the parts colour-coded (red/green/orange… in part order, pivots as white dots) and the
   inpainted base. Check: the whole animal is in the cut-out (tail tips, wing tips, antlers); parts are where you
   intended; nothing of the animal remains in the inpainted base (a tail outside the box is the usual cause → widen
   the box); the inpainted fill is plausible (foliage texture, not a smear).
3. Composite check at 1672 px (base + layers at rest) must be indistinguishable from the original.
