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
