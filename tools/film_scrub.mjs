// Scrubs the home page's film in a real Chrome the way a visitor does (wheel steps down the whole film, then back
// up part of it) and reports how smooth it was: frame times of the page, and how often the exact frame asked for
// was already decoded. Needs a running dev server (the counters are development-only).
//   node tools/film_scrub.mjs [baseUrl]        WIDTH, HEIGHT, STEP (px per wheel step), EVERY (ms between steps)
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] || 'http://localhost:5173/').replace(/\/?$/, '/');
const W = Number(process.env.WIDTH || 1440), H = Number(process.env.HEIGHT || 900);
const STEP = Number(process.env.STEP || 120), EVERY = Number(process.env.EVERY || 16);
const CHROME = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--use-angle=metal', '--enable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: W < 600 ? 2 : 1 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(BASE + '#/', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.film__canvas');
await sleep(1500);
await page.evaluate(() => {
  const w = window;
  w.__times = [];
  let last = performance.now();
  const tick = (now) => { w.__times.push(now - last); last = now; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const run = async (label, from, to) => {
  await page.evaluate(() => { window.__times.length = 0; const s = window.__filmStats; s.exact = s.near = s.still = 0; s.where = {}; s.loadingShown = 0; });
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const a = from * max, b = to * max;
  const t0 = Date.now();
  for (let y = a; a < b ? y < b : y > b; y += a < b ? STEP : -STEP) { await page.evaluate((y) => window.scrollTo(0, y), y); await sleep(EVERY); }
  await sleep(800);
  const r = await page.evaluate(() => {
    const t = window.__times.slice().sort((x, y) => x - y);
    const s = window.__filmStats;
    return { frames: t.length, median: t[Math.floor(t.length / 2)], p95: t[Math.floor(t.length * 0.95)], worst: t[t.length - 1], over33: t.filter((x) => x > 33.4).length, ...s };
  });
  const drawn = r.exact + r.near + r.still;
  console.log(`${label}: ${((Date.now() - t0) / 1000).toFixed(1)} s, frame time median ${r.median.toFixed(1)} ms, 95th ${r.p95.toFixed(1)} ms, worst ${r.worst.toFixed(0)} ms, ${r.over33} of ${r.frames} frames over 33 ms; pictures drawn: ${(100 * r.exact / drawn).toFixed(1)}% exact, ${(100 * r.near / drawn).toFixed(1)}% a neighbouring frame, ${(100 * r.still / drawn).toFixed(1)}% the still (decoding: ${r.moving}); loading line on ${r.loadingShown} frames; clips ${r.set}`);
  if (process.env.WHERE) console.log('   stills by shot:group', JSON.stringify(r.where));
};
await run('down the whole film', 0, 1);
await run('back up the second half', 1, 0.5);
await run('fast down (jumps)', 0.5, 1);
console.log(errors.length ? 'ERRORS ' + [...new Set(errors)].slice(0, 5).join(' | ') : 'no console errors');
await browser.close();
