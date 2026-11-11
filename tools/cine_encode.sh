#!/bin/sh
# Encodes a generated clip for the walk (see docs/HIGGSFIELD_SHOTS.md):
#   tools/cine_encode.sh loop  downloads/forest.mp4 forest-loop     → public/cine/forest-loop.{webm,mp4}
#   tools/cine_encode.sh scrub downloads/descent.mp4 descent        → every frame a keyframe, for scroll scrubbing
# 1600 px wide, no audio. Needs ffmpeg.
set -e
MODE="$1"; IN="$2"; OUT="public/cine/$3"
[ -n "$3" ] || { echo "usage: $0 loop|scrub input.mp4 name"; exit 1; }
mkdir -p public/cine
SCALE="scale=1600:-2:flags=lanczos"
if [ "$MODE" = "scrub" ]; then
  ffmpeg -y -i "$IN" -an -vf "$SCALE,fps=24" -c:v libx264 -preset slow -crf 23 -g 1 -pix_fmt yuv420p -movflags +faststart "$OUT.mp4"
  ffmpeg -y -i "$IN" -an -vf "$SCALE,fps=24" -c:v libvpx-vp9 -crf 34 -b:v 0 -g 1 -row-mt 1 "$OUT.webm"
else
  ffmpeg -y -i "$IN" -an -vf "$SCALE" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart "$OUT.mp4"
  ffmpeg -y -i "$IN" -an -vf "$SCALE" -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 "$OUT.webm"
fi
ls -la "$OUT.mp4" "$OUT.webm"
