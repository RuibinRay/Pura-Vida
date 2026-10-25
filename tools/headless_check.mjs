// Opens the built site in headless Chromium (SwiftShader WebGL), records console errors and
// takes screenshots of the main routes at desktop and phone widths.
//   node tools/headless_check.mjs            (expects `vite preview` to be running on :4173, or starts it)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { createRequire } from 'node:module';
const axeSource = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const PORT = 4173;
const BASE = `http://localhost:${PORT}/`;
const OUT = path.resolve('tools/scratch/shots');
fs.mkdirSync(OUT, { recursive: true });

async function serverUp() {
  try { const r = await fetch(BASE); return r.ok; } catch { return false; }
}
let server = null;
if (!(await serverUp())) {
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  for (let i = 0; i < 40 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 250));
}

const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args, '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], headless: true });
const report = { pages: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function visit(name, hash, { width = 1440, height = 900, wait = 2500, actions = null, query = '', axe = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  const errors = [], warnings = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); else if (m.type() === 'warning') warnings.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const t0 = Date.now();
  await page.goto(BASE + query + '#' + hash, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(wait);
  if (actions) await actions(page);
  const file = path.join(OUT, `${name}-${width}.png`);
  await page.screenshot({ path: file });
  let axeViolations = null;
  if (axe) {
    await page.evaluate(axeSource);
    const res = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
    axeViolations = res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') }));
  }
  const why = await page.evaluate(() => document.querySelector('.why')?.textContent ?? null);
  const title = await page.title();
  const hScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  report.pages.push({ name, hash, width, title, ms: Date.now() - t0, errors, warnings: warnings.slice(0, 5), why, horizontalOverflow: hScroll, shot: file, axeViolations });
  console.log(`${name} @${width}: ${title} · ${errors.length} errors · ${Date.now() - t0} ms${hScroll ? ' · HORIZONTAL OVERFLOW' : ''}${axeViolations ? ' · axe ' + axeViolations.length : ''}`);
  if (axeViolations) for (const v of axeViolations) console.log('   axe', v.impact, v.id, 'x' + v.nodes, v.sample);
  for (const e of errors) console.log('   ✗', e.slice(0, 300));
  await page.close();
}

// the homepage journey: the opening, then each chapter at the scroll position where it is on stage
const scrollTo = (f) => async (p) => { await p.evaluate((ff) => { const total = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo({ top: Math.round(total * ff), behavior: 'instant' }); }, f); await sleep(3000); };
// scroll to the middle of stop n (1-based) of the walk, by the spacers' positions
const toStop = (n) => async (p) => { await p.evaluate((nn) => { const els = document.querySelectorAll('.journey [data-chapter]'); const c = els[nn - 1]; const next = els[nn]; const top = c.getBoundingClientRect().top + window.scrollY; const len = next ? next.getBoundingClientRect().top + window.scrollY - top : c.offsetHeight - window.innerHeight; window.scrollTo({ top: Math.round(top + len * 0.5), behavior: 'instant' }); }, n); await sleep(3000); };
await visit('home-open', '/', { wait: 3000, query: '?why&tier=lite', axe: true });
await visit('home-02-monteverde', '/', { wait: 2500, query: '?tier=lite', actions: toStop(2), axe: true });
await visit('home-03-rio-celeste', '/', { wait: 2500, query: '?tier=lite', actions: toStop(3), axe: true });
await visit('home-04-irazu', '/', { wait: 2500, query: '?tier=lite', actions: toStop(4), axe: true });
await visit('home-04-irazu-erupting', '/', { wait: 2500, query: '?tier=lite', actions: async (p) => { await toStop(4)(p); await p.evaluate(() => document.querySelector('.erupt-ctl .btn--primary')?.click()); await sleep(3500); }, axe: true });
await visit('home-05-guanacaste', '/', { wait: 2500, query: '?tier=lite', actions: toStop(5), axe: true });
await visit('home-06-table', '/', { wait: 2500, query: '?tier=lite', actions: toStop(6), axe: true });
await visit('home-07-corcovado', '/', { wait: 2500, query: '?tier=lite', actions: toStop(7), axe: true });
await visit('home-08-tortuguero', '/', { wait: 2500, query: '?tier=lite', actions: toStop(8), axe: true });
await visit('home-09-close', '/', { wait: 2500, query: '?tier=lite', actions: toStop(9), axe: true });
// a far jump (a rail click, a restored scroll position) must settle the stops it skipped: only the new stop stays visible
await visit('home-jump-1-to-8', '/', { wait: 2500, query: '?tier=lite', actions: async (p) => {
  await toStop(1)(p); await toStop(8)(p);
  const visible = await p.evaluate(() => [...document.querySelectorAll('.scene')].filter((e) => e.style.visibility !== 'hidden' && getComputedStyle(e).opacity !== '0').map((e) => e.className.match(/scene--(\d+)/)[1]));
  if (visible.join() !== '8') { console.log('   ✗ far jump: visible stops', visible.join(', '), '(expected only 8)'); await p.evaluate((v) => console.error('far jump left stops visible: ' + v), visible.join(', ')); } else console.log('   far jump 1→8: only stop 8 visible');
} });
await visit('home-still', '/', { wait: 2000, query: '?tier=still' });
await visit('explore', '/explore', { wait: 6000, query: '?why&tier=lite', axe: true });
await visit('explore-selected', '/explore', { wait: 4000, query: '?tier=lite', actions: async (p) => { await p.evaluate(() => { const li = document.querySelector('.province-list li[data-id="guanacaste"]'); li?.click(); }); await sleep(3000); } });
await visit('explore-2d', '/explore', { wait: 2000, actions: async (p) => { await p.evaluate(() => { const b = [...document.querySelectorAll('.seg__btn')].find((x) => x.textContent?.trim() === '2D'); b?.click(); }); await sleep(1200); await p.evaluate(() => { const li = document.querySelector('.province-list li[data-id="limon"]'); li?.click(); }); await sleep(1500); } });
await visit('explore-text', '/explore', { wait: 1500, query: '?tier=text' });
await visit('provinces', '/provinces', { wait: 2000, axe: true });
await visit('province-puntarenas', '/provinces/puntarenas', { wait: 6000, query: '?tier=lite', axe: true });
await visit('wildlife', '/wildlife', { wait: 1500, axe: true });
await visit('food', '/food', { wait: 1500, axe: true });
await visit('sources', '/sources', { wait: 1500, axe: true });
await visit('my', '/my-costa-rica', { wait: 1000, axe: true });
await visit('my-draft', '/my-costa-rica', { wait: 1000, query: '?draft' });
await visit('coming', '/history', { wait: 1000 });
await visit('es-home', '/', { wait: 3000, query: '?lang=es&tier=lite' });
await visit('zh-home-table', '/', { wait: 2000, query: '?lang=zh&tier=lite', actions: toStop(6) });
await visit('zh-explore', '/explore', { wait: 5000, query: '?lang=zh' });
// keyboard: tab into the province list on /explore and arrow down → a province gets selected
await visit('explore-keyboard', '/explore', { wait: 5000, query: '?tier=lite', actions: async (p) => {
  await p.evaluate(() => (document.querySelector('.province-list li[tabindex="0"]')).focus());
  await p.keyboard.press('ArrowDown'); await sleep(300); await p.keyboard.press('ArrowDown'); await sleep(2500);
  const sel = await p.evaluate(() => document.querySelector('.province-list li[aria-selected="true"]')?.textContent?.trim());
  console.log('   keyboard selection →', sel);
} });
// phone
await visit('home-open', '/', { width: 390, height: 844, wait: 3000, query: '?tier=lite' });
await visit('home-08-tortuguero', '/', { width: 390, height: 844, wait: 2000, query: '?tier=lite', actions: toStop(8) });
await visit('home-05-guanacaste', '/', { width: 390, height: 844, wait: 2000, query: '?tier=lite', actions: toStop(5) });
await visit('food', '/food', { width: 390, height: 844, wait: 1500 });
await visit('explore', '/explore', { width: 390, height: 844, wait: 5000 });
await visit('provinces', '/provinces', { width: 390, height: 844, wait: 1500 });
await visit('province-limon', '/provinces/limon', { width: 390, height: 844, wait: 5000 });

fs.writeFileSync('tools/scratch/check-report.json', JSON.stringify(report, null, 1));
await browser.close();
if (server) server.kill();
const totalErrors = report.pages.reduce((n, p) => n + p.errors.length, 0);
console.log(`\n${report.pages.length} page loads · ${totalErrors} console errors · overflow: ${report.pages.filter((p) => p.horizontalOverflow).map((p) => p.name + '@' + p.width).join(', ') || 'none'}`);
