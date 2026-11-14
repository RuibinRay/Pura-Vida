// The home page film on a throttled connection, in a real Chrome: how long each shot takes to arrive, whether the
// player steps down to the small clips, and when the loading line shows. Needs a running dev server (the counters
// are development-only).
//   node tools/film_slow.mjs [baseUrl]      KBPS (download, kilobytes a second; default 450), LATENCY (ms, default 150)
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] || 'http://localhost:5173/').replace(/\/?$/, '/');
const KBPS = Number(process.env.KBPS || 450);
const LATENCY = Number(process.env.LATENCY || 150);
const CHROME = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync('tools/scratch/film/shots', { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--use-angle=metal', '--enable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
const clips = [];
page.on('requestfinished', (r) => { if (r.url().endsWith('.pvf')) clips.push(r.url().split('/film/')[1]); });
page.on('requestfailed', (r) => { if (r.url().endsWith('.pvf')) clips.push('aborted ' + r.url().split('/film/')[1]); });
// the page itself loads at full speed; the throttle starts with the film
await page.goto(BASE + '#/', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForSelector('.film__canvas');
const cdp = await page.createCDPSession();
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: LATENCY, downloadThroughput: KBPS * 1024, uploadThroughput: 200 * 1024 });
console.log(`throttled to ${KBPS} KB/s, ${LATENCY} ms`);

const state = () => page.evaluate(() => ({ shot: document.querySelector('.film').dataset.shot, loading: document.querySelector('.film').hasAttribute('data-loading'), load: getComputedStyle(document.querySelector('.film')).getPropertyValue('--film-load'), set: window.__filmStats?.set, rate: window.__filmStats?.rate }));
let shotLoading = false;
// scroll down the film at a visitor's pace (a wheel step every 50 ms) for the first third of it
const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (let y = 0, i = 0; y < max * 0.34; y += 90, i++) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await sleep(50);
  if (i % 20 === 0) {
    const s = await state();
    console.log(`  ${(y / max * 100).toFixed(0).padStart(2)}% ${s.shot.padEnd(7)} set ${s.set} rate ${(s.rate / 1024).toFixed(0)} KB/s ${s.loading ? 'LOADING ' + s.load : ''}`);
    if (s.loading && !shotLoading) { shotLoading = true; await page.screenshot({ path: 'tools/scratch/film/shots/slow-loading.png' }); }
  }
}
// a jump far ahead (the chapter rail): the shot there has nothing loaded yet
await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.7));
for (let k = 0; k < 12; k++) {
  await sleep(500);
  const s = await state();
  if (k === 2) await page.screenshot({ path: 'tools/scratch/film/shots/slow-loading.png' });
  console.log(`  jump +${((k + 1) * 0.5).toFixed(1)} s ${s.shot.padEnd(7)} ${s.loading ? 'LOADING ' + s.load : 'playing'}`);
}
await sleep(1500);
const end = await state();
const stats = await page.evaluate(() => ({ ...window.__filmStats, where: undefined }));
console.log('end:', JSON.stringify(end));
console.log('pictures:', JSON.stringify({ exact: stats.exact, near: stats.near, still: stats.still, framesWithLoadingLine: stats.loadingShown }));
console.log('clips:', clips.join(', '));
console.log(errors.length ? 'ERRORS ' + [...new Set(errors)].slice(0, 5).join(' | ') : 'no console errors');
await browser.close();
