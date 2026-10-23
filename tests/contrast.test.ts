import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

// WCAG 2.x contrast of the design-token pairs actually used for text.
function lum(hex: string) {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
const css = fs.readFileSync('src/styles/tokens.css', 'utf8');
const root = css.slice(css.indexOf(':root'), css.indexOf('.on-dark'));
const tokens = Object.fromEntries([...root.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()]));

describe('text contrast (WCAG AA)', () => {
  const pairs: [string, string, number][] = [
    ['ink', 'paper', 4.5], ['ink-muted', 'paper', 4.5], ['ink-faint', 'paper', 4.5], ['forest-ink', 'paper', 4.5], ['gold-ink', 'paper', 4.5], ['moss-ink', 'paper', 4.5],
    ['good', 'paper', 4.5], ['warn', 'paper', 4.5], ['bad', 'paper', 4.5],
    ['paper', 'volcanic', 4.5], ['paper', 'forest', 4.5], ['paper', 'ocean', 4.5], ['paper', 'moss-ink', 4.5], ['paper', 'forest-ink', 4.5], ['paper', 'orchid', 4.5], ['paper', 'wood', 4.5], ['ink', 'gold', 4.5], ['ink', 'stone', 4.5], ['ink', 'paper-edge', 4.5], ['ink', 'turquoise', 4.5], ['ink', 'sunset', 4.5],
  ];
  for (const [fg, bg, min] of pairs) {
    it(`${fg} on ${bg} ≥ ${min}:1`, () => {
      expect(tokens[fg], fg).toBeDefined();
      expect(tokens[bg], bg).toBeDefined();
      expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(min);
    });
  }
});
