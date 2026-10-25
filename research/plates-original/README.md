# Original plates

The three images the site's author supplied on 2026-10-23, unchanged, so `tools/hero_assets.py` can be re-run:

```
python3 tools/hero_assets.py <opening upscaled 2x> research/plates-original/wildlife-beach-path.jpg research/plates-original/poster-volcano-lake-title.jpg
```

The opening image is 1376×768 and was upscaled 2× with EDSR (tiled) before cutting; the upscaled PNG (7 MB) is not kept in the repository — regenerate it with OpenCV's `dnn_superres` and the `EDSR_x2.pb` model from github.com/Saafke/EDSR_Tensorflow, or run the script on the original (the layers will simply be smaller).

Origin and licence of the images: to be stated by the author (see docs/ASSET_CREDITS.md).

## 2026-10-25 — ten more plates from the author (`2026-10-25/`)

Supplied on 2026-10-25, unchanged (1672×941 PNG; the composite 1679×937). The author's titles, in his order: Arenal Volcano — Alajuela; Monteverde Cloud Forest — Puntarenas (v2); Manuel Antonio National Park — Puntarenas (the turtle); Tortuguero Mangrove Channels — Limón (v2, heron and caiman); Río Celeste Waterfall — Alajuela (v2, hummingbird and morpho); Guanacaste Dry Forest — Guanacaste (v2); Cerro Chirripó — San José; Cartago Historic Landscape — Cartago (the basilica); Coffee Highlands — Heredia; and an untitled composite (sloth, toucan, macaw, morpho over a volcano, lake and waterfall).

His brief: keep the stops that already have animals; replace the two plates without animals (Río Celeste, Manuel Antonio) with the new ones; a stop for every province; the old Río Celeste plate goes to the map part; the extra images may be placed elsewhere.

## 2026-10-25 (afternoon) — the same scenes without their animals (`2026-10-25/empties/`)

Twelve images the author made from the plates above by erasing the animals with his tool's generative fill, supplied unchanged (1672×941 PNG). Each is pixel-aligned with its original — a correlation of 0.95–0.99 at 320 px and 86–95 % of pixels unchanged (the rest is the generator's re-encoding noise plus the filled silhouettes), checked by `tools/scratch/match_empties.py` — so `tools/plates.py` uses them as the `clean` base of a plate: nothing has to be inpainted under a moving animal, and the animal's silhouette can be read off the difference between the two files. Named after their originals: eight belong to plates on the walk (`arenal-volcano-alajuela`, `cartago-historic-landscape`, `cerro-chirripo-san-jose`, `coffee-highlands-heredia`, `corcovado-tapir-macaw-morpho`, `guanacaste-deer-macaws-oxcart`, `manuel-antonio-turtle-puntarenas`, `rio-celeste-waterfall-v2`), three belong to the unused second versions (`monteverde-cloud-forest-v2`, `tortuguero-mangrove-v2`, `guanacaste-dry-forest-v2`) and one to the composite (1672×941 here against the original's 1679×937, so not aligned; unused). Not supplied yet: the opening forest, the Monteverde, Irazú and Tortuguero plates on the walk.

`2026-10-25/opening-forest-regenerated.jpg` (2576×1438) is a thirteenth image from the same afternoon: the opening scene regenerated without animals — a new picture (0.43 correlation with the first opening image), so not an erase of it. It became the opening's base, with the first plate's animals pasted on (`tools/plates/forest.json`).
