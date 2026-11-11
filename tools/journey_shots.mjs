// Frames of the home page's walk at chosen scroll positions (stop number + progress), in a real Chrome:
//   node tools/journey_shots.mjs [baseUrl]   → tools/scratch/journey/*.png
// POS="1:0,1:0.2,2:0.5" overrides the positions; WIDTH/HEIGHT the viewport.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] || 'http://localhost:5173/').replace(/\/?$/, '/');
const OUT = path.resolve('tools/scratch/journey');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const W = Number(process.env.WIDTH || 1440), H = Number(process.env.HEIGHT || 900);
const POS = (process.env.POS || '1:0,1:0.1,1:0.18,1:0.26,1:0.32,1:0.37,1:0.5,1:0.9,2:0.5,5:0.5').split(',').map((s) => s.split(':').map(Number));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: W < 600 ? 2 : 1 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: process.env.CALM ? 'reduce' : 'no-preference' }]);
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(BASE + (process.env.QUERY || '') + '#/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(2500);
for (const [stop, p] of POS) {
  await page.evaluate(([n, k]) => {
    const el = document.querySelector('.jspace--' + n);
    const next = document.querySelector('.jspace--' + (n + 1));
    const top = el.getBoundingClientRect().top + window.scrollY;
    const len = next ? next.getBoundingClientRect().top + window.scrollY - top : el.offsetHeight - window.innerHeight;
    window.scrollTo(0, top + len * k + 1);
  }, [stop, p]);
  await sleep(1600);
  const name = `${W}-s${String(stop).padStart(2, '0')}-${String(Math.round(p * 100)).padStart(3, '0')}.png`;
  await page.screenshot({ path: path.join(OUT, name) });
  console.log(name);
}
if (errors.length) console.log('ERRORS', errors.slice(0, 5));
await browser.close();
