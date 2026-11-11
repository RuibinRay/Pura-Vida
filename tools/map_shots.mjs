// Screenshots and a frame-rate reading of the 3D map in a real Chrome (GPU through ANGLE), against a running dev or
// preview server:  node tools/map_shots.mjs [baseUrl] [outDir]
// CHROME=/path/to/chrome overrides the browser. Shots go to tools/scratch/map/ (not committed).
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] || 'http://localhost:5173/').replace(/\/?$/, '/');
const OUT = path.resolve(process.argv[3] || 'tools/scratch/map');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error('no Chrome found: set CHROME=/path/to/chrome');
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--force-prefers-reduced-motion=no-preference'] });
const report = [];

async function shot(name, { width = 1440, height = 900, query = '?tier=full&why', hash = '/explore', setup = null, wait = 2500, clip = '.map-canvas', dpr = 1 } = {}) {
  if (only && !only.includes(name)) return;
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: dpr });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch { /* private mode */ } });
  await page.goto(BASE + query + '#' + hash, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector(clip, { timeout: 20000 }).catch(() => null);
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), clip);
  await sleep(3500);
  if (setup) await setup(page);
  await sleep(wait);
  const why = await page.evaluate(() => document.querySelector('.why')?.textContent || document.querySelector('[class*="why"]')?.textContent || '');
  const fps = (why.match(/fps:\s*(\d+)/) || [])[1];
  const tier = (why.match(/tier:\s*(\w+)/) || [])[1];
  const el = await page.$(clip);
  const file = path.join(OUT, name + '.png');
  if (el) await el.screenshot({ path: file }); else await page.screenshot({ path: file });
  report.push({ name, width, tier, fps: fps ? Number(fps) : null, errors: errors.slice(0, 5) });
  console.log(name, 'tier', tier, 'fps', fps, errors.length ? 'ERRORS ' + errors.slice(0, 3).join(' | ') : '');
  await page.close();
}

const store = (fn) => (page) => page.evaluate(fn);
const click = (text) => async (page) => { await page.evaluate((t) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t); b?.click(); }, text); };
const seq = (...fns) => async (page) => { for (const f of fns) { await f(page); await sleep(400); } };
const province = (id) => async (page) => { await page.evaluate((n) => { document.querySelector(`.province-list li[data-id="${n}"]`)?.click(); }, id); await sleep(3200); };

await shot('01-country-satellite');
await shot('02-terrain', { setup: click('Terrain') });
await shot('03-provinces', { setup: click('Provinces') });
await shot('04-dawn', { setup: click('Dawn') });
await shot('05-dusk', { setup: click('Dusk') });
await shot('06-night', { setup: click('Night'), wait: 3500 });
await shot('07-rain', { setup: click('Rain'), wait: 3500 });
await shot('08-guanacaste', { setup: province('guanacaste') });
await shot('09-limon', { setup: seq(click('Provinces'), province('limon')) });
await shot('10-arenal', { hash: '/explore?place=peak-arenal', wait: 4500 });
await shot('11-chirripo', { hash: '/explore?place=peak-chirripo', wait: 4500 });
await shot('12-phone', { width: 390, height: 844, query: '?tier=lite&why', dpr: 2 });
await shot('13-2d', { setup: click('2D') });
await shot('14-parks', { setup: async (page) => { await page.evaluate(() => { const d = document.querySelector('details.menu'); d.open = true; [...d.querySelectorAll('label')].find((l) => /Protected areas/.test(l.textContent))?.querySelector('input').click(); d.open = false; }); }, wait: 3500 });
void store; void seq;

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
await browser.close();
