/* Browser integration checks. Uses an existing Playwright installation; no app dependency added.
 * PLAYWRIGHT_MODULE=/path/to/playwright node scripts/test-crop-studio.mjs
 * Start the dev server separately. TEST_BASE_URL defaults to http://127.0.0.1:3000.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import Module, { createRequire } from 'node:module';
const requireModule = createRequire(import.meta.url);
const { chromium } = requireModule(process.env.PLAYWRIGHT_MODULE || 'playwright');

const source = path.resolve('src/features/crop-studio/crop.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const math = new Module(source); math._compile(compiled, source);
const { placementScale, validSize, initialTransform, zoomAt } = math.exports;
assert.equal(validSize(0, 100), false);
assert.equal(validSize(-1, 100), false);
assert.equal(validSize(100.5, 100), false);
assert.equal(validSize(Infinity, 100), false);
assert.equal(validSize(8192, 8192), false);
assert.equal(validSize(1920, 1080), true);
assert.equal(initialTransform({ width: 100, height: 100 }, { width: 1280, height: 720 }).scale, 12.8);
// Every inverse-transformed output corner must be inside the source for rotated Fill.
for (const angle of [-90, -2.5, 0, 15, 45, 90, 179]) {
  const sourceSize = { width: 640, height: 360 }, output = { width: 1000, height: 1000 };
  const scale = placementScale(sourceSize, output, angle, 'fill');
  const a = angle * Math.PI / 180;
  for (const x of [-500, 500]) for (const y of [-500, 500]) {
    assert.ok(Math.abs(x * Math.cos(a) + y * Math.sin(a)) / scale <= 320 + 1e-8);
    assert.ok(Math.abs(-x * Math.sin(a) + y * Math.cos(a)) / scale <= 180 + 1e-8);
  }
  const fit = placementScale(sourceSize, output, angle, 'fit');
  assert.ok(fit * (640 * Math.abs(Math.cos(a)) + 360 * Math.abs(Math.sin(a))) <= 1000 + 1e-8);
  assert.ok(fit * (640 * Math.abs(Math.sin(a)) + 360 * Math.abs(Math.cos(a))) <= 1000 + 1e-8);
}
const t = initialTransform({ width: 100, height: 100 }, { width: 100, height: 100 });
assert.deepEqual(zoomAt(t, 2, { x: 10, y: 20 }), { ...t, scale: 2, x: -10, y: -20 });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [], remoteRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(base)) remoteRequests.push(request.url()); });
  const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
  try {
    await page.goto(`${base}/tools/crop-studio/`);
    await page.getByRole('heading', { name: 'Crop Studio.' }).waitFor();
    const fixtures = await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 640; c.height = 360;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = '#00ff00'; ctx.fillRect(320, 0, 320, 180);
      ctx.fillStyle = '#0000ff'; ctx.fillRect(0, 180, 320, 180);
      ctx.fillStyle = '#ffff00'; ctx.fillRect(320, 180, 320, 180);
      return ['png', 'jpeg', 'webp'].map(format => ({ format, data: c.toDataURL(`image/${format}`).split(',')[1] }));
    });
    for (const fixture of fixtures) {
      await page.locator('input[type=file]').setInputFiles({ name: `fixture.${fixture.format}`, mimeType: `image/${fixture.format}`, buffer: Buffer.from(fixture.data, 'base64') });
      await page.getByText('元画像：640 × 360 px').waitFor();
      await page.getByText(`fixture.${fixture.format}`, { exact: true }).waitFor();
    }
    // Return to lossless pixels for transform/output assertions.
    await page.locator('input[type=file]').setInputFiles({ name: 'quadrants.png', mimeType: 'image/png', buffer: Buffer.from(fixtures[0].data, 'base64') });
    await page.getByText('quadrants.png', { exact: true }).waitFor();
    const warning = page.getByText('元画像の解像度を超えて拡大しています。書き出し画像がぼやける可能性があります。');
    await warning.waitFor();
    const zoom = page.getByLabel('ズーム');
    assert.equal(await zoom.inputValue(), '200');
    await page.getByRole('button', { name: '100%', exact: true }).click();
    assert.equal(await zoom.inputValue(), '100');
    assert.equal(await warning.count(), 0);
    await zoom.fill('180');
    await warning.waitFor();
    await page.getByRole('button', { name: '初期状態へリセット' }).click();
    await page.getByText('回転・反転・細かな位置調整', { exact: true }).click();
    await page.getByText('ガイド・セーフエリア・背景色', { exact: true }).click();
    const frame = page.getByRole('group', { name: '画像編集キャンバス' });
    await frame.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Shift+ArrowDown');
    await page.getByText('X 1 / Y 10 px', { exact: true }).waitFor();
    await page.getByRole('button', { name: '左へ1px' }).click();
    await page.getByText('X 0 / Y 10 px', { exact: true }).waitFor();
    await page.getByRole('button', { name: '中央配置', exact: true }).click();
    await frame.scrollIntoViewIfNeeded();
    let box = await frame.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 30, { steps: 10 }); await page.mouse.up();
    assert.notEqual(await page.locator('span').filter({ hasText: /^X .* px$/ }).textContent(), 'X 0 / Y 0 px');
    await page.getByRole('button', { name: '中央配置', exact: true }).click();
    await frame.scrollIntoViewIfNeeded(); box = await frame.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2, { steps: 3 }); await page.mouse.up();
    await page.getByText('X 0 / Y 0 px', { exact: true }).waitFor();
    await page.getByLabel('ガイドにスナップ', { exact: true }).uncheck();
    await frame.scrollIntoViewIfNeeded(); box = await frame.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2); await page.mouse.up();
    assert.notEqual(await page.locator('span').filter({ hasText: /^X .* px$/ }).textContent(), 'X 0 / Y 0 px');
    const beforeWheel = Number(await zoom.inputValue());
    await page.mouse.wheel(0, -100);
    await page.waitForFunction(v => Number(document.querySelector('#crop-zoom').value) > v, beforeWheel);
    await page.getByRole('button', { name: '右へ90°' }).click(); assert.equal(await page.getByLabel('回転角度', { exact: true }).inputValue(), '90');
    await page.getByRole('button', { name: '左へ90°' }).click(); assert.equal(await page.getByLabel('回転角度', { exact: true }).inputValue(), '0');
    await page.getByLabel('回転角度', { exact: true }).fill('-2.5');
    assert.equal(await page.getByLabel('回転角度', { exact: true }).inputValue(), '-2.5');
    await page.getByLabel('回転スライダー').fill('15');
    await page.getByRole('button', { name: '左右反転', exact: true }).click();
    await page.getByRole('button', { name: '上下反転', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: '左右反転', exact: true }).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.getByRole('button', { name: '上下反転', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.getByLabel('センターガイド', { exact: true }).uncheck();
    await page.getByLabel('3×3グリッド', { exact: true }).check();
    await page.getByRole('button', { name: '初期状態へリセット' }).click();
    assert.equal(await page.getByLabel('回転角度', { exact: true }).inputValue(), '0');
    assert.equal(await page.getByRole('button', { name: '左右反転', exact: true }).getAttribute('aria-pressed'), 'false');
    for (const id of ['youtube-art', 'x-header', 'x-post', 'instagram-square', 'instagram-portrait', 'youtube-thumbnail']) {
      await page.getByLabel('テンプレート', { exact: true }).selectOption(id);
      if (id === 'youtube-art') await page.getByText('文字・ロゴの配置目安', { exact: true }).waitFor();
      if (id === 'x-header') {
        await page.getByLabel('セーフエリア', { exact: true }).uncheck();
        assert.equal(await page.getByText('重要な内容の配置目安', { exact: true }).count(), 0);
        await page.getByLabel('セーフエリア', { exact: true }).check();
      }
    }
    await page.getByLabel('サイズの指定方法').selectOption('ratio');
    for (const ratio of ['16:9', '4:3', '3:2', '1:1', '8:5', '4:5', '3:1']) {
      await page.getByLabel('比率', { exact: true }).selectOption(ratio);
      const [w,h] = ratio.split(':').map(Number);
      assert.equal(Number(await page.getByLabel('高さ px').inputValue()), Math.round(1200 * h / w));
    }
    await page.getByLabel('サイズの指定方法').selectOption('custom');
    for (const invalid of ['', '0', '-1', '1.5', '9000']) {
      await page.getByLabel('幅 px').fill(invalid);
      assert.equal(await page.getByRole('button', { name: '画像をダウンロード' }).isDisabled(), true);
    }
    await page.getByLabel('幅 px').fill('320'); await page.getByLabel('高さ px').fill('180');
    assert.equal(await warning.count(), 0);

    const exportInfo = async () => {
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: '画像をダウンロード' }).click();
      const download = await pending;
      const bytes = fs.readFileSync(await download.path());
      return page.evaluate(async ({ data, name }) => {
        const blob = new Blob([Uint8Array.from(atob(data), c => c.charCodeAt(0))]);
        const bitmap = await createImageBitmap(blob);
        const c = document.createElement('canvas'); c.width = bitmap.width; c.height = bitmap.height;
        const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bitmap, 0, 0);
        return { width: c.width, height: c.height, name, topLeft: [...ctx.getImageData(10, 10, 1, 1).data], bottomLeft: [...ctx.getImageData(10, c.height - 10, 1, 1).data] };
      }, { data: bytes.toString('base64'), name: download.suggestedFilename() });
    };
    let result = await exportInfo();
    assert.equal(result.width, 320); assert.equal(result.height, 180);
    assert.deepEqual(result.topLeft, [255, 0, 0, 255]);
    await page.getByRole('button', { name: '左右反転', exact: true }).click();
    result = await exportInfo(); assert.deepEqual(result.topLeft, [0, 255, 0, 255]);
    await page.getByRole('button', { name: '上下反転', exact: true }).click();
    result = await exportInfo(); assert.deepEqual(result.topLeft, [255, 255, 0, 255]);
    await page.getByRole('button', { name: '初期状態へリセット' }).click();
    await page.getByRole('button', { name: '右へ90°' }).click();
    await page.getByRole('button', { name: '枠に合わせる（Fill）', exact: true }).click();
    result = await exportInfo(); assert.deepEqual(result.topLeft, [0, 0, 255, 255]);
    await page.getByRole('button', { name: '0°へ戻す' }).click();
    await page.getByLabel('幅 px').fill('1280'); await page.getByLabel('高さ px').fill('1280');
    await page.getByRole('button', { name: '全体を収める（Fit）', exact: true }).click();
    result = await exportInfo(); assert.equal(result.width, 1280); assert.equal(result.height, 1280); assert.equal(result.topLeft[3], 0);
    for (const bg of ['#000000', '#ffffff', 'custom']) {
      await page.getByLabel('背景色', { exact: true }).selectOption(bg);
      if (bg === 'custom') await page.getByLabel('任意の背景色').fill('#123456');
      result = await exportInfo();
      assert.deepEqual(result.topLeft, bg === '#000000' ? [0, 0, 0, 255] : bg === '#ffffff' ? [255, 255, 255, 255] : [18, 52, 86, 255]);
    }
    await page.getByLabel('背景色', { exact: true }).selectOption('transparent');
    for (const format of ['jpeg', 'webp']) {
      await page.getByLabel('書き出し形式').selectOption(format);
      await page.getByLabel('書き出し品質').fill('80');
      result = await exportInfo();
      assert.equal(result.name, `crop-studio-1280x1280.${format === 'jpeg' ? 'jpg' : 'webp'}`);
      assert.equal(result.topLeft[3], format === 'jpeg' ? 255 : 0);
      if (format === 'jpeg') assert.deepEqual(result.topLeft, [255, 255, 255, 255]);
    }
    const artifacts = process.env.TEST_ARTIFACTS;
    if (artifacts) { fs.mkdirSync(artifacts, { recursive: true }); await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: path.join(artifacts, 'crop-desktop.png'), fullPage: true }); }
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (artifacts) await page.screenshot({ path: path.join(artifacts, 'crop-mobile.png'), fullPage: true });
    // Multi-touch pinch through Chromium's input API.
    await frame.scrollIntoViewIfNeeded(); box = await frame.boundingBox();
    const cdp = await context.newCDPSession(page);
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const beforePinch = Number(await zoom.inputValue());
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx - 30, y: cy, id: 1 }, { x: cx + 30, y: cy, id: 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - 55, y: cy, id: 1 }, { x: cx + 55, y: cy, id: 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(v => Number(document.querySelector('#crop-zoom').value) > v, beforePinch);
    // Existing tool: read/load, split into two then four, inspect output dimensions.
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${base}/tools/x-carousel-splitter/`);
    await page.locator('input[type=file]').setInputFiles({ name: 'regression.png', mimeType: 'image/png', buffer: Buffer.from(fixtures[0].data, 'base64') });
    for (const count of [2, 4]) {
      await page.getByRole('button', { name: new RegExp(`${count}分割`) }).click();
      await page.getByRole('button', { name: '分割する', exact: true }).click();
      await page.waitForFunction(n => document.querySelectorAll('img[src^="blob:"]').length === n, count);
      const sizes = await page.locator('img[src^="blob:"]').evaluateAll(images => images.map(i => [i.naturalWidth, i.naturalHeight]));
      assert.deepEqual(sizes, Array(count).fill([3840 / count, 2160]));
    }
    await page.goto(`${base}/tools/`);
    await page.getByRole('heading', { name: 'Crop Studio', exact: true }).waitFor();
    assert.equal(await page.locator('a[href="/tools/crop-studio/"]').count(), 1);
    assert.deepEqual(errors, []);
    assert.deepEqual(remoteRequests, []);
    console.log('PASS: math, PNG/JPEG/WebP loading, drag, keyboard, zoom, wheel/pinch, snap, rotation/flips, guides, presets/ratios, validation, Fill/Fit, backgrounds, pixel-checked exports, desktop/mobile, existing splitter, catalog, console/network.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
