// Node checks for crop boundaries and filenames; no browser dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import ts from 'typescript';
const cache = new Map();
function load(relative) {
  const file = path.resolve(relative);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = new Module(file); cache.set(file, mod);
  mod.require = specifier => load(path.resolve(path.dirname(file), `${specifier}.ts`));
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, file);
  return mod.exports;
}
const { splitImage } = load('src/features/x-carousel-splitter/lib/splitter.ts');
const { getBasename } = load('src/features/x-carousel-splitter/lib/filename.ts');
const draws = [];
globalThis.document = {
  createElement: () => ({ width: 0, height: 0,
    getContext: () => ({ clearRect() {}, fillRect() {}, save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { draws.push(args); } }),
    toBlob(callback) { callback(new Blob(['png'], { type: 'image/png' })); }
  })
};
for (let count = 2; count <= 20; count++) {
  draws.length = 0;
  const panels = await splitImage({}, 3840, 2160, { scale: 1, offsetX: 0, offsetY: 0 }, count, getBasename('つらら.test.png'));
  assert.equal(panels.length, count);
  let boundary = 0;
  panels.forEach((panel, i) => {
    const crop = draws[i + 1];
    assert.equal(crop[1], boundary);
    assert.equal(crop[3], panel.width);
    assert.equal(crop[7], panel.width);
    assert.equal(panel.height, 2160);
    assert.ok(Number.isInteger(panel.width));
    assert.equal(panel.fileName, `つらら.test-${String(i + 1).padStart(2, '0')}.png`);
    boundary += panel.width;
    URL.revokeObjectURL(panel.url);
  });
  assert.equal(boundary, 3840);
  assert.ok(Math.max(...panels.map(p => p.width)) - Math.min(...panels.map(p => p.width)) <= 1);
}
for (const invalid of [0, 1, 21, 2.5, NaN]) {
  await assert.rejects(splitImage({}, 3840, 2160, { scale: 1, offsetX: 0, offsetY: 0 }, invalid, 'image'));
}
console.log('PASS: all 2–20 crop boundaries cover 3840 pixels without gaps/overlap; dimensions, 01–20 names, invalid counts.');
