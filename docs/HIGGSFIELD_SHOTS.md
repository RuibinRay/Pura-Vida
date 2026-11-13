# Film clips for the walk — a Higgsfield shot list

> **Update, 2026-11-13.** The account is now on the Ultra plan and clips can be generated from this repository with the Higgsfield CLI (`tools/film_gen.py`). The home page film was made that way and is documented in `docs/HOME_FILM.md`. The list below, clips of single animals for the plates of the walk, has still not been generated.

The walk's animals are cut-outs animated in real time: heads turn, wings flap, bodies sway. That is as far as layered
stills go — a toucan cannot shift its weight or a sloth reach along a branch without a filmed (or generated) frame
sequence. This file is the plan for getting those sequences from Higgsfield and the place they plug in.

**State on 2026-11-11.** The account read through the Higgsfield connector: plan *Starter*, 280 credits, no generations
yet. The connector can read the balance, the model catalogue and finished generations; it cannot start a generation, so
the clips below have to be made in the Higgsfield app. Nothing has been generated. The site already has the layer that
plays them (`src/journey/CineLayer.tsx`, tested with a throwaway clip): a plate without a clip keeps its cut-out
animation, so the walk is complete either way.

## How a clip plugs in

1. Generate it (below), download the MP4.
2. `tools/cine_encode.sh loop downloads/forest.mp4 forest-loop` — or `scrub` for a scroll-driven clip — writes
   `public/cine/forest-loop.webm` and `.mp4` (1600 px wide, no audio; `scrub` makes every frame a keyframe).
3. Add one line to `src/journey/cine.ts`: `forest: { file: 'forest-loop', mode: 'loop', replacesAnimals: true, credit: '…' }`.
4. `npm test` checks the files exist; add the clip to `docs/ASSET_CREDITS.md` (model, date, source image).

The clip is laid exactly over the plate, so **the frame must not move**: same framing as the source image, locked
camera, 16:9. Hotspots, copy and scroll stay the site's own. Under reduced motion the clip is not shown.

## Which model

From the catalogue the connector lists, the ones that take a **first and a last frame** — which is what makes a seamless
loop (give the same image as both):

| Model | Frames | Lengths | Notes |
|---|---|---|---|
| Seedance 1.5 Pro | start + end | 4 / 8 / 12 s | 480p–1080p; set *generate audio* off. First choice for loops |
| Cinema Studio Video 3.0 | start + end | 4–15 s | up to 4K (more credits); genre "auto" |
| Minimax Hailuo 2.3 | start + end | 6 / 10 s | 768 / 1080 |
| FLUX 3 Video | start + end | 5–20 s | 720p–4K; audio off |

Seedance 2.0's standard mode is listed as needing a Plus plan, so it is not in the table. The connector does not expose
what a generation costs: read the credit price on the Generate button, and make the first clip a 4-second 720p test of
shot 1 before spending on the rest. The list is in priority order so it can stop wherever the credits do.

## Loops (same image as first and last frame; locked camera)

Source images are the author's originals in `research/plates-original/` (the versions *with* animals).
A prompt that works for all of them, with the per-shot line added:

> Locked-off tripod shot, the camera does not move, no zoom, no cut. Photoreal nature documentary, natural light,
> gentle wind in the leaves, drifting mist. {per-shot line} Everything else holds its position. The final frame matches
> the first frame exactly.

| # | Plate (`cine.ts` key) | Source image | Per-shot line |
|---|---|---|---|
| 1 | `forest` (the opening) | `2026-10-25/opening-v3-animals.png` | The toucan turns its head and shifts its feet on the branch; the sloth slowly reaches one arm along its branch and settles back; the two hummingbirds hover with blurred wings; the tree frog's throat pulses and it blinks; the waterfall flows. The macaws glide in place with slow wingbeats. |
| 2 | `monteverde` | `monteverde-quetzal-hummingbirds-waterfall.png` | The quetzal turns its head and its long tail feathers sway; the hummingbirds hover; the waterfall flows; cloud moves through the canopy. |
| 3 | `tortuguero` | `tortuguero-mangrove-toucan-sloth-heron.png` | The heron takes one slow step and stills; the sloth climbs a hand's width; the toucan preens; the water ripples. |
| 4 | `corcovado` | `corcovado-tapir-macaw-morpho.png` | The tapir lowers its head, sniffs and chews; its ears flick; the morpho opens and closes its wings; surf breaks in the distance. |
| 5 | `arenal` | `2026-10-25/arenal-volcano-alajuela.png` | The toucan looks left, then right, and hops once on the branch; clouds drift past the cone; the lake shimmers. |
| 6 | `guanacaste` | `guanacaste-deer-macaws-oxcart.png` | The deer lifts its head, ears turning, then grazes again; dry grass moves in the wind; the macaws beat their wings in place. |
| 7 | `rio-celeste` | `2026-10-25/rio-celeste-waterfall-v2.png` | The hummingbird feeds at a flower and backs away; the morpho rests with slow wingbeats; the blue water falls and churns. |

Check each result against its plate before using it: if the frame drifted, the clip will not sit on the plate — regenerate
with "locked-off" earlier in the prompt, or lower the model's motion setting.

## Scroll-driven shots (first frame ≠ last frame; encode with `scrub`)

These replace a crossfade between two stops with a continuous move the scroll plays forward and backward.

| # | From → to | First frame | Last frame | Prompt |
|---|---|---|---|---|
| 8 | The descent into the opening | `public/plates/aerial/low-2560.webp` | `2026-10-25/empties/opening-v3-animals.png` | One continuous aerial shot: the camera descends from high over a green volcanic range through a layer of cloud and comes to rest in a rainforest clearing with a waterfall. No cut. |
| 9 | Manuel Antonio: the turtle reaches the sea (`manuel-antonio`) | `2026-10-25/manuel-antonio-turtle-puntarenas.png` | — | Locked-off camera. The sea turtle crawls down the wet sand with alternating flippers and enters the surf as a wave washes in. |
| 10 | Coffee highlands → the table | `2026-10-25/coffee-highlands-heredia.png` | a screenshot of the Flavors stop | The camera pushes in on a coffee branch until red coffee cherries fill the frame, then the cherries become roasted beans on a wooden table. |

Shot 8 needs one more line in the page than a plate clip (the aerial layer would hand over to the video instead of the
cloud veil); shots 9 and 10 use the layer as it is.

## What not to generate

The 3D map. Province selection, the camera, the layers and the light are real-time and stay that way; a video of the
map would be a recording of an interaction, not the interaction.

## Credits

Every clip used is recorded in `docs/ASSET_CREDITS.md` as "generated with Higgsfield (model, date) from the author's
plate", and the site keeps saying, as it does now, that the plates are illustrations rather than photographs of a place.
