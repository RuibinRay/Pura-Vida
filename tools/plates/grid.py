"""Draws a labelled 100 px grid on an image (optionally a crop) so coordinates can be read off a preview.
usage: python3 grid.py <image> <out.png> [x0 y0 x1 y1] [step]
"""
import sys, cv2, numpy as np

src = cv2.imread(sys.argv[1])
out = sys.argv[2]
if len(sys.argv) >= 7:
    x0, y0, x1, y1 = [int(v) for v in sys.argv[3:7]]
    step = int(sys.argv[7]) if len(sys.argv) > 7 else 50
else:
    x0, y0, x1, y1 = 0, 0, src.shape[1], src.shape[0]
    step = int(sys.argv[3]) if len(sys.argv) > 3 else 100
im = src[y0:y1, x0:x1].copy()
h, w = im.shape[:2]
for x in range((x0 // step) * step, x1 + 1, step):
    if x < x0: continue
    cv2.line(im, (x - x0, 0), (x - x0, h), (255, 255, 255), 1)
    cv2.putText(im, str(x), (x - x0 + 2, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 0), 2)
    cv2.putText(im, str(x), (x - x0 + 2, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 255, 255), 1)
for y in range((y0 // step) * step, y1 + 1, step):
    if y < y0: continue
    cv2.line(im, (0, y - y0), (w, y - y0), (255, 255, 255), 1)
    cv2.putText(im, str(y), (2, y - y0 - 3), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 0), 2)
    cv2.putText(im, str(y), (2, y - y0 - 3), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 255, 255), 1)
# fit the preview to 1400 px wide at most
if w > 1400:
    s = 1400 / w
    im = cv2.resize(im, (1400, round(h * s)), interpolation=cv2.INTER_AREA)
cv2.imwrite(out, im)
print(out, im.shape)
