# Original plates

The three images the site's author supplied on 2026-10-23, unchanged, so `tools/hero_assets.py` can be re-run:

```
python3 tools/hero_assets.py <opening upscaled 2x> research/plates-original/wildlife-beach-path.jpg research/plates-original/poster-volcano-lake-title.jpg
```

The opening image is 1376×768 and was upscaled 2× with EDSR (tiled) before cutting; the upscaled PNG (7 MB) is not kept in the repository — regenerate it with OpenCV's `dnn_superres` and the `EDSR_x2.pb` model from github.com/Saafke/EDSR_Tensorflow, or run the script on the original (the layers will simply be smaller).

Origin and licence of the images: to be stated by the author (see docs/ASSET_CREDITS.md).
