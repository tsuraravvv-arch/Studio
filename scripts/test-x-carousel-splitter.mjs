// Start npm run dev first. Uses an existing Playwright installation.
// PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-x-carousel-splitter.mjs
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${process.env.TEST_BASE_URL || 'http://127.0.0.1:3000'}/tools/x-carousel-splitter/`);
  const saveAll = page.getByRole('button', { name: 'すべて保存', exact: true });
  assert.equal(await saveAll.count(), 1);
  assert.equal(await saveAll.isDisabled(), true);
  assert.equal(await page.locator('.xcs-controls .xcs-primary-button + .xcs-save-all-button').count(), 1);
  const fixture = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1080;
    const ctx = c.getContext('2d');
    for (let x = 0; x < c.width; x++) {
      ctx.fillStyle = `rgb(${x % 256},${Math.floor(x / 256)},123)`;
      ctx.fillRect(x, 0, 1, c.height);
    }
    return c.toDataURL().split(',')[1];
  });
  await page.locator('input[type=file]').setInputFiles({ name: 'つらら.test.png', mimeType: 'image/png', buffer: Buffer.from(fixture, 'base64') });
  const split = page.getByRole('button', { name: '分割する', exact: true });
  await split.waitFor();
  assert.equal(await saveAll.isDisabled(), true);
  for (let count = 2; count <= 20; count++) {
    await page.getByLabel('分割枚数', { exact: true }).fill(String(count));
    assert.equal(await page.locator('.xcs-guide-line').count(), count - 1);
    await split.click();
    await page.waitForFunction(n => document.querySelectorAll('.xcs-results figure').length === n, count);
    assert.equal(await saveAll.isEnabled(), true);
    const result = await page.locator('.xcs-results figure img').evaluateAll(async images => {
      let offset = 0; const widths = [];
      for (const img of images) {
        await img.decode(); widths.push(img.naturalWidth);
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = 1;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, c.width, 1, 0, 0, c.width, 1);
        const data = ctx.getImageData(0, 0, c.width, 1).data;
        for (let x = 0; x < c.width; x++) {
          const worldX = offset + x;
          if (data[x * 4] !== worldX % 256 || data[x * 4 + 1] !== Math.floor(worldX / 256) || data[x * 4 + 2] !== 123 || data[x * 4 + 3] !== 255) throw new Error(`Pixel mismatch at ${worldX}`);
        }
        if (img.naturalHeight !== 1080) throw new Error('Wrong height');
        offset += c.width;
      }
      return { width: offset, widths };
    });
    assert.equal(result.width, 1920);
    assert.ok(Math.max(...result.widths) - Math.min(...result.widths) <= 1);
  }
  const downloadPromise = page.waitForEvent('download');
  await page.locator('.xcs-results figure').last().getByRole('button').click();
  assert.equal((await downloadPromise).suggestedFilename(), 'つらら.test-20.png');
  const downloads = [];
  page.on('download', d => downloads.push(d.suggestedFilename()));
  await page.getByRole('button', { name: 'すべて保存' }).click();
  await page.waitForTimeout(5000);
  assert.deepEqual(downloads, Array.from({ length: 20 }, (_, i) => `つらら.test-${String(i + 1).padStart(2, '0')}.png`));
  await page.setViewportSize({ width: 375, height: 900 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const overlap = await page.locator('.xcs-guide-number').evaluateAll(labels => labels.some((label, i) => {
    const a = label.getBoundingClientRect();
    return labels.slice(i + 1).some(other => { const b = other.getBoundingClientRect(); return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; });
  }));
  assert.equal(overlap, false);
  await page.locator('.xcs-workspace').screenshot({ path: join(tmpdir(), 'carousel-mobile.png') });
  assert.deepEqual(errors, []);
  console.log('PASS: 2–20 panels, pixel-perfect reconstruction, 20 download names, mobile layout and guides.');
} finally {
  await browser.close();
}
