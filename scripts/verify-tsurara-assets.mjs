#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const assetTsPath = path.join(root, "src/features/two-d-viewer/data/tsuraraAssets.ts");
const expressionDir = path.join(root, "public/assets/tsurara/expressions");
const directionDir = path.join(root, "public/assets/tsurara/directions");

const expectedWidth = 1086;
const expectedHeight = 1448;
const diffThreshold = 24;

const errors = [];
const warnings = [];
const notes = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function note(message) {
  notes.push(message);
}

function readPngMeta(filePath) {
  const buffer = readFileSync(filePath);
  if (buffer.length < 33 || buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
    throw new Error("PNG signature not found");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25],
    interlace: buffer[28]
  };
}

function bytesPerPixel(colorType) {
  if (colorType === 6) return 4;
  if (colorType === 2) return 3;
  if (colorType === 0) return 1;
  throw new Error(`Unsupported PNG color type: ${colorType}`);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(filePath) {
  const buffer = readFileSync(filePath);
  const meta = readPngMeta(filePath);
  if (meta.bitDepth !== 8) throw new Error(`Unsupported bit depth: ${meta.bitDepth}`);
  if (meta.interlace !== 0) throw new Error("Interlaced PNG is not supported by this checker");

  let offset = 8;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (type === "IDAT") idat.push(buffer.subarray(dataStart, dataEnd));
    if (type === "IEND") break;
    offset = dataEnd + 4;
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = bytesPerPixel(meta.colorType);
  const stride = meta.width * bpp;
  const pixels = Buffer.alloc(meta.width * meta.height * 4);
  let rawOffset = 0;
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < meta.height; y += 1) {
    const filter = raw[rawOffset++];
    const scan = Buffer.from(raw.subarray(rawOffset, rawOffset + stride));
    rawOffset += stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bpp ? scan[x - bpp] : 0;
      const up = prev[x] ?? 0;
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      if (filter === 1) scan[x] = (scan[x] + left) & 255;
      else if (filter === 2) scan[x] = (scan[x] + up) & 255;
      else if (filter === 3) scan[x] = (scan[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) scan[x] = (scan[x] + paeth(left, up, upLeft)) & 255;
      else if (filter !== 0) throw new Error(`Unsupported PNG filter: ${filter}`);
    }

    for (let x = 0; x < meta.width; x += 1) {
      const src = x * bpp;
      const dst = (y * meta.width + x) * 4;
      if (meta.colorType === 6) {
        pixels[dst] = scan[src];
        pixels[dst + 1] = scan[src + 1];
        pixels[dst + 2] = scan[src + 2];
        pixels[dst + 3] = scan[src + 3];
      } else if (meta.colorType === 2) {
        pixels[dst] = scan[src];
        pixels[dst + 1] = scan[src + 1];
        pixels[dst + 2] = scan[src + 2];
        pixels[dst + 3] = 255;
      } else {
        pixels[dst] = scan[src];
        pixels[dst + 1] = scan[src];
        pixels[dst + 2] = scan[src];
        pixels[dst + 3] = 255;
      }
    }

    prev = scan;
  }

  return { ...meta, pixels };
}

function relativeAssetPath(absPath) {
  return path.relative(path.join(root, "public"), absPath).replaceAll(path.sep, "/");
}

function resolveAsset(kind, fileName) {
  return path.join(kind === "expression" ? expressionDir : directionDir, fileName);
}

function extractBalancedBlock(source, openIndex) {
  let depth = 0;
  let inTemplate = false;
  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    const prev = source[i - 1];
    if (char === "`" && prev !== "\\") inTemplate = !inTemplate;
    if (inTemplate) continue;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, i + 1);
    }
  }
  return source.slice(openIndex);
}

function extractExportBlock(constName) {
  const source = readFileSync(assetTsPath, "utf8");
  const start = source.indexOf(`export const ${constName}`);
  if (start < 0) return "";
  // Anchor on the `=` first: a type annotation like `: { ... }` can itself
  // contain braces, which would otherwise be mistaken for the value block.
  const equalsIndex = source.indexOf("=", start);
  if (equalsIndex < 0) return "";
  const open = source.indexOf("{", equalsIndex);
  if (open < 0) return "";
  return extractBalancedBlock(source, open);
}
function collectRegisteredAssets() {
  const source = readFileSync(assetTsPath, "utf8");
  const registered = new Map();
  const add = (kind, fileName) => {
    const filePath = resolveAsset(kind, fileName);
    registered.set(filePath, { kind, fileName });
  };

  for (const match of source.matchAll(/\$\{expressionBase\}\/([A-Za-z0-9_.\-]+\.png)/g)) {
    add("expression", match[1]);
  }
  for (const match of source.matchAll(/\$\{directionBase\}\/([A-Za-z0-9_.\-]+\.png)/g)) {
    add("direction", match[1]);
  }

  return [...registered.values()].sort((a, b) => a.fileName.localeCompare(b.fileName));
}

function assertPngAsset(kind, fileName) {
  const filePath = resolveAsset(kind, fileName);
  const label = `${kind}/${fileName}`;
  if (!existsSync(filePath)) {
    fail(`Missing registered asset: ${label}`);
    return null;
  }

  try {
    const meta = readPngMeta(filePath);
    if (meta.width !== expectedWidth || meta.height !== expectedHeight) {
      fail(`${label}: expected ${expectedWidth}x${expectedHeight}, got ${meta.width}x${meta.height}`);
    }
    if (meta.bitDepth !== 8) warn(`${label}: uncommon bit depth ${meta.bitDepth}`);
    if (![2, 6].includes(meta.colorType)) warn(`${label}: uncommon color type ${meta.colorType}`);
    if (meta.interlace !== 0) warn(`${label}: interlaced PNG`);
    return { filePath, ...meta };
  } catch (error) {
    fail(`${label}: ${error.message}`);
    return null;
  }
}

function parseDirectionalRecord(recordName) {
  const block = extractExportBlock(recordName);
  if (!block) return [];
  const entries = [];

  for (const exprMatch of block.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*):\s*{([\s\S]*?)^\s{2}}/gm)) {
    const expression = exprMatch[1];
    const body = exprMatch[2];
    const directions = {};
    for (const dirMatch of body.matchAll(/(left15|front|right15):\s*`\$\{(expressionBase|directionBase)\}\/([A-Za-z0-9_.\-]+\.png)`/g)) {
      directions[dirMatch[1]] = {
        kind: dirMatch[2] === "expressionBase" ? "expression" : "direction",
        fileName: dirMatch[3]
      };
    }
    entries.push({ expression, directions });
  }

  return entries;
}

function parseBlinkOverrides() {
  return parseDirectionalRecord("blinkAssetsByExpression");
}

function parseDefaultBlinkAssets() {
  const block = extractExportBlock("blinkAssets");
  const directions = {};
  for (const dirMatch of block.matchAll(/(left15|front|right15):\s*`\$\{(expressionBase|directionBase)\}\/([A-Za-z0-9_.\-]+\.png)`/g)) {
    directions[dirMatch[1]] = {
      kind: dirMatch[2] === "expressionBase" ? "expression" : "direction",
      fileName: dirMatch[3]
    };
  }
  return directions;
}

const regionEntryPattern =
  /(left15|front|right15)\s*:\s*\{\s*xRatio:\s*([\d.]+),\s*yRatio:\s*([\d.]+),\s*widthRatio:\s*([\d.]+),\s*heightRatio:\s*([\d.]+)\s*\}/g;

function collectRegionEntries(text) {
  const regions = {};
  for (const match of text.matchAll(regionEntryPattern)) {
    regions[match[1]] = {
      xRatio: Number(match[2]),
      yRatio: Number(match[3]),
      widthRatio: Number(match[4]),
      heightRatio: Number(match[5])
    };
  }
  return regions;
}

// Mirrors overlayRegions.eye in tsuraraAssets.ts: the default crop rect per direction.
function parseEyeOverlayRegions() {
  const block = extractExportBlock("overlayRegions");
  const eyeKeyIndex = block.indexOf("eye:");
  const openIndex = block.indexOf("{", eyeKeyIndex);
  const eyeBlock = extractBalancedBlock(block, openIndex);
  return collectRegionEntries(eyeBlock);
}

// Mirrors blinkOverlayRegionsByExpression: per-expression crop overrides.
function parseBlinkOverlayRegionsByExpression() {
  const block = extractExportBlock("blinkOverlayRegionsByExpression");
  const overrides = {};
  for (const match of block.matchAll(/^\s{2}(\w+):\s*\{/gm)) {
    const expression = match[1];
    const openIndex = match.index + match[0].length - 1;
    const expressionBlock = extractBalancedBlock(block, openIndex);
    overrides[expression] = collectRegionEntries(expressionBlock);
  }
  return overrides;
}

// Mirrors resolveBlinkOverlayRegion(): the crop rect the Viewer actually uses.
function resolveCropRegion(expression, direction, eyeRegions, blinkOverrides) {
  return blinkOverrides[expression]?.[direction] ?? eyeRegions[direction];
}

// Mirrors regionToFrame() in TsuraraStage.tsx (Pixi Rectangle from ratio + texture size).
function regionToPixelRect(region) {
  return {
    x: Math.round(expectedWidth * region.xRatio),
    y: Math.round(expectedHeight * region.yRatio),
    width: Math.round(expectedWidth * region.widthRatio),
    height: Math.round(expectedHeight * region.heightRatio)
  };
}

function pointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    x < rect.x + rect.width &&
    y >= rect.y &&
    y < rect.y + rect.height
  );
}

function expandRect(rect, margin) {
  return {
    x: rect.x - margin,
    y: rect.y - margin,
    width: rect.width + margin * 2,
    height: rect.height + margin * 2
  };
}

function shrinkRect(rect, margin) {
  return {
    x: rect.x + margin,
    y: rect.y + margin,
    width: Math.max(0, rect.width - margin * 2),
    height: Math.max(0, rect.height - margin * 2)
  };
}

// Border bucket (informational): a ring straddling the crop edge, inside and out.
const borderMarginRatio = 0.02;
const minBorderMarginPx = 2;

// Edge-risk bucket: is a *meaningful band* of change hugging one edge of the
// crop, not just a stray anti-aliased pixel? Measured as density (changed /
// strip area) within a thin strip along each edge, inside the crop only.
const edgeStripDepthRatio = 0.03;
const minEdgeStripDepthPx = 2;
const edgeRiskDensity = 0.2;

const weakInsideDiffRatio = 0.015;

function borderMarginForRect(rect) {
  return Math.max(
    minBorderMarginPx,
    Math.round(Math.min(rect.width, rect.height) * borderMarginRatio)
  );
}

function edgeStripDepthForRect(rect) {
  return Math.max(
    minEdgeStripDepthPx,
    Math.round(Math.min(rect.width, rect.height) * edgeStripDepthRatio)
  );
}

function edgeStripAreas(cropRect, edgeDepth) {
  return {
    left: edgeDepth * cropRect.height,
    right: edgeDepth * cropRect.height,
    top: edgeDepth * cropRect.width,
    bottom: edgeDepth * cropRect.width
  };
}

function detectEdgeRisk(cropRect, edgeCounts, edgeDepth) {
  const stripArea = edgeStripAreas(cropRect, edgeDepth);
  return ["left", "right", "top", "bottom"].filter(
    (side) => stripArea[side] > 0 && edgeCounts[side] / stripArea[side] > edgeRiskDensity
  );
}

function edgeDensityPercents(cropRect, edgeCounts, edgeDepth) {
  const stripArea = edgeStripAreas(cropRect, edgeDepth);
  const percent = (side) =>
    stripArea[side] > 0 ? Math.round((edgeCounts[side] / stripArea[side]) * 100) : 0;
  return {
    left: percent("left"),
    right: percent("right"),
    top: percent("top"),
    bottom: percent("bottom")
  };
}

function analyzeCropDiff(basePath, blinkPath, cropRect) {
  const base = decodePng(basePath);
  const changed = decodePng(blinkPath);
  if (base.width !== changed.width || base.height !== changed.height) {
    throw new Error("Image sizes do not match");
  }

  const margin = borderMarginForRect(cropRect);
  const outerRect = expandRect(cropRect, margin);
  const innerRect = shrinkRect(cropRect, margin);
  const edgeDepth = edgeStripDepthForRect(cropRect);

  let insideCount = 0;
  let outsideCount = 0;
  let borderCount = 0;
  const edgeCounts = { left: 0, right: 0, top: 0, bottom: 0 };

  for (let y = 0; y < base.height; y += 1) {
    for (let x = 0; x < base.width; x += 1) {
      const idx = (y * base.width + x) * 4;
      const d =
        Math.abs(base.pixels[idx] - changed.pixels[idx]) +
        Math.abs(base.pixels[idx + 1] - changed.pixels[idx + 1]) +
        Math.abs(base.pixels[idx + 2] - changed.pixels[idx + 2]) +
        Math.abs(base.pixels[idx + 3] - changed.pixels[idx + 3]);
      if (d <= diffThreshold) continue;

      if (pointInRect(x, y, cropRect)) {
        insideCount += 1;
        if (x - cropRect.x < edgeDepth) edgeCounts.left += 1;
        if (cropRect.x + cropRect.width - 1 - x < edgeDepth) edgeCounts.right += 1;
        if (y - cropRect.y < edgeDepth) edgeCounts.top += 1;
        if (cropRect.y + cropRect.height - 1 - y < edgeDepth) edgeCounts.bottom += 1;
      } else {
        outsideCount += 1;
      }

      if (pointInRect(x, y, outerRect) && !pointInRect(x, y, innerRect)) {
        borderCount += 1;
      }
    }
  }

  return { cropRect, margin, edgeDepth, insideCount, outsideCount, borderCount, edgeCounts };
}

function classifyCropDiff(result) {
  const { cropRect, edgeDepth, insideCount, edgeCounts } = result;
  const cropArea = cropRect.width * cropRect.height;
  const insideRatio = cropArea > 0 ? insideCount / cropArea : 0;
  const edgeRisks = detectEdgeRisk(cropRect, edgeCounts, edgeDepth);

  if (insideCount === 0) {
    return {
      verdict: "NO_DIFF",
      detail: "no change detected inside the crop; the closed-eye art may not be reflected here",
      insideRatio,
      edgeRisks
    };
  }
  if (insideRatio < weakInsideDiffRatio) {
    return {
      verdict: "WEAK",
      detail: "change inside the crop is small; the closed-eye difference may be too subtle",
      insideRatio,
      edgeRisks
    };
  }
  if (edgeRisks.length > 0) {
    return {
      verdict: "EDGE_RISK",
      detail: `change is dense along the crop edge (${edgeRisks.join(", ")}); the eye corner/lash may be clipped`,
      insideRatio,
      edgeRisks
    };
  }
  return { verdict: "OK", detail: "", insideRatio, edgeRisks };
}

function formatCropDiffReport(label, source, result, classification) {
  const { cropRect, margin, edgeDepth, insideCount, outsideCount, borderCount, edgeCounts } = result;
  const { verdict, detail, insideRatio } = classification;
  const density = edgeDensityPercents(cropRect, edgeCounts, edgeDepth);

  const lines = [
    `Blink crop check ${label}`,
    `  crop   : x=${cropRect.x} y=${cropRect.y} w=${cropRect.width} h=${cropRect.height} (${source})`,
    `  inside : ${insideCount}px changed (${(insideRatio * 100).toFixed(1)}% of crop)`,
    `  outside: ${outsideCount}px changed (outside crop)`,
    `  border : ${borderCount}px changed within ${margin}px of the crop edge (inside+outside band)`,
    `  edges  : ${edgeDepth}px-deep strip density -> left=${density.left}% right=${density.right}% top=${density.top}% bottom=${density.bottom}%`
  ];

  if (outsideCount > insideCount && outsideCount > 0) {
    lines.push("  note   : outside diff exists but the Viewer crops it away, so it has no visible effect");
  }

  lines.push(`  verdict: ${verdict}${detail ? ` - ${detail}` : ""}`);
  return lines.join("\n");
}

function analyzeBlinkDiffs() {
  const expressions = parseDirectionalRecord("directionalExpressions");
  const expressionById = Object.fromEntries(expressions.map((item) => [item.expression, item.directions]));
  const defaultBlink = parseDefaultBlinkAssets();
  const overrides = parseBlinkOverrides();
  const eyeRegions = parseEyeOverlayRegions();
  const blinkCropOverrides = parseBlinkOverlayRegionsByExpression();

  const jobs = [{ expression: "normal", directions: defaultBlink }, ...overrides];
  const records = [];

  for (const job of jobs) {
    for (const direction of ["front", "left15", "right15"]) {
      const base = expressionById[job.expression]?.[direction];
      const blink = job.directions[direction];
      if (!base || !blink) continue;

      const basePath = resolveAsset(base.kind, base.fileName);
      const blinkPath = resolveAsset(blink.kind, blink.fileName);
      if (!existsSync(basePath) || !existsSync(blinkPath)) continue;

      const label = `${job.expression}/${direction}`;
      const region = resolveCropRegion(job.expression, direction, eyeRegions, blinkCropOverrides);
      if (!region) {
        const message = `Blink crop check ${label}: no overlay region defined for this direction`;
        warn(message);
        records.push({
          expression: job.expression,
          direction,
          source: null,
          cropRect: null,
          counts: null,
          verdict: "ERROR",
          detail: "no overlay region defined for this direction",
          edgeRisks: []
        });
        continue;
      }
      const isOverride = Boolean(blinkCropOverrides[job.expression]?.[direction]);
      const source = isOverride ? "blinkOverlayRegionsByExpression" : "overlayRegions.eye";
      const cropRect = regionToPixelRect(region);

      try {
        const result = analyzeCropDiff(basePath, blinkPath, cropRect);
        const classification = classifyCropDiff(result);
        const text = formatCropDiffReport(label, source, result, classification);
        if (classification.verdict === "OK") note(text);
        else warn(text);

        records.push({
          expression: job.expression,
          direction,
          source,
          cropRect,
          counts: {
            inside: result.insideCount,
            outside: result.outsideCount,
            border: result.borderCount,
            edgeDensityPercent: edgeDensityPercents(cropRect, result.edgeCounts, result.edgeDepth)
          },
          insideRatioPercent: Number((classification.insideRatio * 100).toFixed(1)),
          verdict: classification.verdict,
          detail: classification.detail,
          edgeRisks: classification.edgeRisks
        });
      } catch (error) {
        warn(`Blink crop check ${label}: ${error.message}`);
        records.push({
          expression: job.expression,
          direction,
          source,
          cropRect,
          counts: null,
          verdict: "ERROR",
          detail: error.message,
          edgeRisks: []
        });
      }
    }
  }

  return records;
}

const summaryVerdicts = ["OK", "EDGE_RISK", "WEAK", "NO_DIFF"];
const riskVerdicts = ["EDGE_RISK", "WEAK", "NO_DIFF"];

function summarizeBlinkCropResults(records) {
  const counts = Object.fromEntries(summaryVerdicts.map((verdict) => [verdict, 0]));
  for (const record of records) {
    if (summaryVerdicts.includes(record.verdict)) counts[record.verdict] += 1;
  }
  return counts;
}

function printBlinkCropSummary(records, counts) {
  console.log("\nSummary");
  for (const verdict of summaryVerdicts) {
    console.log(`- ${verdict}: ${counts[verdict]}`);
  }

  const edgeRiskRecords = records.filter((record) => record.verdict === "EDGE_RISK");
  if (edgeRiskRecords.length) {
    console.log("\nEDGE_RISK - review these in the Viewer:");
    for (const record of edgeRiskRecords) {
      const { cropRect } = record;
      console.log(
        `- ${record.expression}/${record.direction}: edges=[${record.edgeRisks.join(", ")}] crop=x${cropRect.x},y${cropRect.y},w${cropRect.width},h${cropRect.height}`
      );
    }
  }
}

function warnUnregisteredPngs(registeredAssets) {
  const registered = new Set(
    registeredAssets.map((item) => resolveAsset(item.kind, item.fileName))
  );
  for (const dir of [expressionDir, directionDir]) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".png")) continue;
      const abs = path.join(dir, name);
      if (!registered.has(abs)) warn(`Unregistered PNG in asset folder: ${relativeAssetPath(abs)}`);
    }
  }
}

const cliArgs = process.argv.slice(2);
const jsonMode = cliArgs.includes("--json");
const failOnRisk = cliArgs.includes("--fail-on-risk");
const outIndex = cliArgs.indexOf("--out");
const outPath = outIndex >= 0 ? cliArgs[outIndex + 1] : undefined;

const registeredAssets = collectRegisteredAssets();
if (!jsonMode) {
  console.log(`Tsurara asset check: ${registeredAssets.length} registered PNG references`);
}

for (const asset of registeredAssets) {
  assertPngAsset(asset.kind, asset.fileName);
}

warnUnregisteredPngs(registeredAssets);
const blinkCropResults = analyzeBlinkDiffs();
const blinkCropSummary = summarizeBlinkCropResults(blinkCropResults);
const riskFound = riskVerdicts.some((verdict) => blinkCropSummary[verdict] > 0);

const reportPayload = {
  generatedAt: new Date().toISOString(),
  imageWidth: expectedWidth,
  imageHeight: expectedHeight,
  registeredAssetCount: registeredAssets.length,
  errors,
  warnings,
  notes,
  blinkCropChecks: blinkCropResults,
  summary: blinkCropSummary
};

let writtenReportPath;
if (outPath) {
  const resolvedOutPath = path.isAbsolute(outPath) ? outPath : path.join(root, outPath);
  mkdirSync(path.dirname(resolvedOutPath), { recursive: true });
  writeFileSync(resolvedOutPath, `${JSON.stringify(reportPayload, null, 2)}\n`);
  writtenReportPath = path.relative(root, resolvedOutPath);
}

if (jsonMode) {
  console.log(JSON.stringify(reportPayload, null, 2));
} else {
  if (notes.length) {
    console.log("\nNotes");
    for (const message of notes) console.log(`- ${message}`);
  }

  if (warnings.length) {
    console.log("\nWarnings");
    for (const message of warnings) console.log(`- ${message}`);
  }

  printBlinkCropSummary(blinkCropResults, blinkCropSummary);

  if (writtenReportPath) {
    console.log(`\nWrote blink crop report: ${writtenReportPath}`);
  }
}

if (errors.length) {
  if (!jsonMode) {
    console.error("\nErrors");
    for (const message of errors) console.error(`- ${message}`);
  }
  process.exit(1);
}

if (failOnRisk && riskFound) {
  if (!jsonMode) {
    console.error(
      `\nfail-on-risk: EDGE_RISK=${blinkCropSummary.EDGE_RISK} WEAK=${blinkCropSummary.WEAK} NO_DIFF=${blinkCropSummary.NO_DIFF}`
    );
  }
  process.exit(1);
}

if (!jsonMode) {
  console.log("\nAsset check passed.");
}

