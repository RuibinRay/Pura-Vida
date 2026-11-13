// Films the opening shot of the home page's film from the site's own 3D map (measured relief, Sentinel-2 imagery):
// Costa Rica from high above, then down and down towards the Arenal volcano and the Tilarán range. Needs a running
// dev or preview server and a real Chrome:
//   node tools/film_map.mjs [baseUrl]     → tools/cache/film/takes/m0-map.mp4 (+ .jpg contact sheet)
// FRAMES (default 120), WIDTH/HEIGHT (1920×1080), HOUR (local solar time, default 8.1) and ONLY (comma-separated frame
// numbers, for test stills) are read from the environment.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] || 'http://localhost:5173/').replace(/\/?$/, '/');
const FRAMES = Number(process.env.FRAMES || 120);
const W = Number(process.env.WIDTH || 1920);
const H = Number(process.env.HEIGHT || 1080);
const HOUR = Number(process.env.HOUR || 8.1);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
const OUT = path.resolve('tools/cache/film/takes');
const DIR = path.join(OUT, 'm0-map-frames');
fs.mkdirSync(DIR, { recursive: true });
const CHROME = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// scene axes: x east, z south (km from 84.2° W, 9.75° N). Arenal is at about (-55, -79).
// [u, target x, y, z, distance, polar, azimuth]
const KEYS = [
  [0.0, 4, 0, 44, 640, 0.3, -0.06],
  [0.34, -16, 0, -4, 400, 0.52, -0.16],
  [0.68, -44, 1, -60, 170, 0.88, -0.4],
  [1.0, -55, 3, -79, 78, 1.14, -0.66],
];
const ease = (t) => t * t * (3 - 2 * t);
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function viewAt(u) {
  let i = 0;
  while (i < KEYS.length - 2 && u > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = (u - a[0]) / (b[0] - a[0]);
  const k = (j) => {
    const g = (row) => (j === 4 ? Math.log(row[j]) : row[j]);
    const v = catmull(g(KEYS[Math.max(0, i - 1)]), g(a), g(b), g(KEYS[Math.min(KEYS.length - 1, i + 2)]), t);
    return j === 4 ? Math.exp(v) : v;
  };
  return { target: [k(1), k(2), k(3)], distance: k(4), polar: k(5), azimuth: k(6), fov: 40 };
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await page.evaluateOnNewDocument((hour) => {
  localStorage.setItem('puravida:map.layers', JSON.stringify({ relief: true, borders: false, cities: false, peaks: false, parks: false, labels: false, rivers: false, areas: false, markers: false }));
  localStorage.setItem('puravida:map.overlays', JSON.stringify({ wildlife: false, food: false }));
  localStorage.setItem('puravida:map.look', JSON.stringify({ style: 'satellite', hour, weather: 'clouds' }));
}, HOUR);
await page.goto(BASE + '?tier=full#/explore', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.map3d canvas');
await page.addStyleTag({ content: '.map-canvas{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-height:none!important;z-index:99999!important;border-radius:0!important}.sky-bar,.map-hint,.map-overlay,.tour-bar{display:none!important}' });
await sleep(7000); // the dense mesh and the 4096 px imagery

async function shoot(n) {
  const u = ease(FRAMES > 1 ? n / (FRAMES - 1) : 0);
  await page.evaluate(async (v) => {
    const m = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const st = m._roots.get(document.querySelector('.map3d canvas')).store.getState();
    const coco = st.scene.getObjectByName('coco-inset');
    if (coco) coco.visible = false;
    const c = st.controls;
    c.enableDamping = false;
    c.minDistance = 5; c.maxDistance = 2000; c.maxPolarAngle = 1.5;
    c.target.set(v.target[0], v.target[1], v.target[2]);
    const sinP = Math.sin(v.polar);
    st.camera.position.set(v.target[0] + v.distance * sinP * Math.sin(v.azimuth), v.target[1] + v.distance * Math.cos(v.polar), v.target[2] + v.distance * sinP * Math.cos(v.azimuth));
    st.camera.fov = v.fov; st.camera.updateProjectionMatrix();
    c.update();
    st.invalidate();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
  }, viewAt(u));
  await sleep(n === 0 || ONLY ? 1500 : 140);
  const el = await page.$('.map-canvas');
  await el.screenshot({ path: path.join(DIR, String(n + 1).padStart(4, '0') + '.png') });
}

const list = ONLY || Array.from({ length: FRAMES }, (_, i) => i);
for (const n of list) { await shoot(n); if (n % 20 === 0) console.log('frame', n + 1, '/', FRAMES); }
await browser.close();

if (!ONLY) {
  const mp4 = path.join(OUT, 'm0-map.mp4');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '24', '-i', path.join(DIR, '%04d.png'), '-c:v', 'libx264', '-crf', '10', '-pix_fmt', 'yuv420p', mp4]);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', mp4, '-vf', `fps=6/${(FRAMES / 24).toFixed(3)},scale=640:-2,tile=3x2`, '-frames:v', '1', path.join(OUT, 'm0-map.jpg')]);
  console.log('written', mp4);
}
