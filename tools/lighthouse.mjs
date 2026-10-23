// Lab Lighthouse run against the preview server with the bundled Chromium.
//   node tools/lighthouse.mjs   (writes tools/scratch/lh-*.json and prints a summary)
import fs from 'node:fs';
import chromium from '@sparticuz/chromium';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const urls = { home: 'http://localhost:4173/?tier=lite#/', explore: 'http://localhost:4173/?tier=lite#/explore', provinces: 'http://localhost:4173/#/provinces', province: 'http://localhost:4173/#/provinces/guanacaste', sources: 'http://localhost:4173/#/sources' };
const chrome = await chromeLauncher.launch({ chromePath: await chromium.executablePath(), chromeFlags: [...chromium.args, '--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const rows = [];
for (const [name, url] of Object.entries(urls)) {
  const result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false } });
  const lhr = result.lhr;
  const a = lhr.audits;
  rows.push({ name, perf: Math.round(lhr.categories.performance.score * 100), a11y: Math.round(lhr.categories.accessibility.score * 100), bp: Math.round(lhr.categories['best-practices'].score * 100), seo: Math.round(lhr.categories.seo.score * 100), lcp: a['largest-contentful-paint'].displayValue, tbt: a['total-blocking-time'].displayValue, cls: a['cumulative-layout-shift'].displayValue, fcp: a['first-contentful-paint'].displayValue, a11yFails: Object.values(a).filter((x) => x.score !== null && x.score < 1 && lhr.categories.accessibility.auditRefs.some((r) => r.id === x.id && r.weight > 0)).map((x) => x.id) });
  fs.writeFileSync(`tools/scratch/lh-${name}.json`, result.report);
  console.log(JSON.stringify(rows[rows.length - 1]));
}
await chrome.kill();
fs.writeFileSync('tools/scratch/lh-summary.json', JSON.stringify(rows, null, 1));
