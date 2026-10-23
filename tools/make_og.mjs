// Renders the social preview image (public/og.png, 1200×630) from the illustrated home at the still tier.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto('http://localhost:4173/?tier=still#/', { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(() => { document.querySelector('.topbar')?.remove(); document.querySelector('.tabs')?.remove(); document.querySelector('.doorways')?.remove(); document.querySelector('.hero__note')?.remove(); });
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: 'public/og.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('public/og.png written');
