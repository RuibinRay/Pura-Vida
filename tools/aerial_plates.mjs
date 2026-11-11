// Renders the two aerial plates of the home page's opening from the 3D map itself (measured relief, Sentinel-2
// imagery): Costa Rica from high above, and a lower look across the Cordillera Volcánica Central. Needs a running dev
// or preview server and a real Chrome:
//   node tools/aerial_plates.mjs [baseUrl]      → tools/scratch/aerial/{high,low}.png
//   python3 tools/aerial_webp.py                → public/plates/aerial/{high,low}-{960,1600,2560}.webp
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] || 'http://localhost:5173/').replace(/\/?$/, '/');
const OUT = path.resolve('tools/scratch/aerial');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 2560, height: 1440, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await page.evaluateOnNewDocument(() => {
  localStorage.setItem('puravida:map.layers', JSON.stringify({ relief: true, borders: false, cities: false, peaks: false, parks: false, labels: false, rivers: false, areas: false, markers: false }));
  localStorage.setItem('puravida:map.overlays', JSON.stringify({ wildlife: false, food: false }));
  localStorage.setItem('puravida:map.look', JSON.stringify({ style: 'satellite', hour: 9.25, weather: 'clouds' }));
});
await page.goto(BASE + '?tier=full#/explore', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.map3d canvas');
await page.addStyleTag({ content: '.map-canvas{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-height:none!important;z-index:99999!important;border-radius:0!important}.sky-bar,.map-hint,.map-overlay,.tour-bar{display:none!important}' });
await sleep(6000); // the dense mesh and the 4096 px imagery

async function frame(name, view) {
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
    if (v.fov) { st.camera.fov = v.fov; st.camera.updateProjectionMatrix(); }
    c.update();
  }, view);
  await sleep(2500);
  const el = await page.$('.map-canvas');
  await el.screenshot({ path: path.join(OUT, name + '.png') });
  console.log(name, 'written');
}

// scene axes: x east, z south (km from 84.2° W, 9.75° N)
await frame('high', { target: [-4, 0, 22], distance: 600, polar: 0.5, azimuth: -0.16, fov: 40 });
// over the Pacific slope, looking north-east at Poás and Barva with the Caribbean plain beyond
await frame('low', { target: [10, 6, -44], distance: 120, polar: 1.16, azimuth: -0.62, fov: 40 });
await browser.close();
