// Screenshots of the home page's film at chosen moments, in a real Chrome. Needs a running dev server (the script
// reads the film's layout from /src/film/shots.ts).
//   node tools/film_shots.mjs [baseUrl]        → tools/scratch/film/shots/<name>.png
// POS  = comma-separated "shot:progress" (progress 0–1 through that shot), default: a moment in every shot
// WIDTH, HEIGHT (default 1440×900), CALM=1 (reduced motion), QUERY (e.g. "tier=lite"), LANG (en|es|zh), TAG (file prefix)
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] || 'http://localhost:5173/').replace(/\/?$/, '/');
const W = Number(process.env.WIDTH || 1440);
const H = Number(process.env.HEIGHT || 900);
const OUT = path.resolve('tools/scratch/film/shots');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--use-angle=metal', '--enable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: W < 600 ? 2 : 1, isMobile: W < 600, hasTouch: W < 600 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: process.env.CALM ? 'reduce' : 'no-preference' }]);
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('requestfailed', (r) => { if (r.failure()?.errorText !== 'net::ERR_ABORTED') errors.push('failed ' + r.url()); }); // the player aborts the clips of shots it has left
const q = [process.env.QUERY, process.env.LANG ? 'lang=' + process.env.LANG : ''].filter(Boolean).join('&');
await page.goto(BASE + (q ? '?' + q : '') + '#/', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('.film__canvas, .film-text');

if (await page.$('.film-text')) { // the text tier is a plain page: one picture of its top
  await page.screenshot({ path: path.join(OUT, (process.env.TAG ? process.env.TAG + '-' : '') + 'text.png') });
  console.log('text tier:', await page.evaluate(() => document.querySelectorAll('.film-text li').length), 'shots listed');
  console.log(errors.length ? 'ERRORS ' + [...new Set(errors)].slice(0, 6).join(' | ') : 'no console errors');
  await browser.close();
  process.exit(0);
}
const film = await page.evaluate(async () => {
  const m = await import('/src/film/shots.ts');
  return { total: m.FILM.total, shots: m.FILM.shots.map((s) => ({ id: s.id, start: s.start, end: s.end, frames: s.frames })) };
});
const spec = process.env.POS ? process.env.POS.split(',').map((s) => s.split(':')) : film.shots.map((s) => [s.id, '0.5']);
const tag = process.env.TAG ? process.env.TAG + '-' : '';
const info = [];
for (const [id, p] of spec) {
  const s = film.shots.find((x) => x.id === id);
  if (!s) { console.log('no shot', id); continue; }
  const pos = s.start + (s.end - s.start) * Number(p);
  await page.evaluate((pos, total) => {
    const root = document.querySelector('.film');
    const range = root.offsetHeight - window.innerHeight;
    window.scrollTo(0, root.getBoundingClientRect().top + window.scrollY + (pos / total) * range);
  }, pos, film.total);
  // let the easing arrive and the frames of this shot load
  await sleep(Number(process.env.WAIT || 2200));
  const name = `${tag}${String(film.shots.indexOf(s) + 1).padStart(2, '0')}-${id}-${String(p).replace('.', '_')}`;
  await page.screenshot({ path: path.join(OUT, name + '.png') });
  info.push(await page.evaluate((name) => {
    const cap = [...document.querySelectorAll('.fcap')].filter((e) => Number(e.style.opacity) > 0.5).map((e) => (e.querySelector('h1,h2') || {}).textContent);
    return { name, caption: cap.join(' | '), shot: document.querySelector('.film')?.dataset.shot, p: getComputedStyle(document.querySelector('.film')).getPropertyValue('--film-p') };
  }, name));
}
console.log(JSON.stringify({ shots: film.shots.length, totalVh: Math.round(film.total), pageHeight: await page.evaluate(() => document.documentElement.scrollHeight), overflowX: await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) }, null, 0));
for (const i of info) console.log(' ', i.name, '|', i.shot, '|', i.caption, '|', i.p);
console.log(errors.length ? 'ERRORS ' + [...new Set(errors)].slice(0, 6).join(' | ') : 'no console errors');
await browser.close();
