#!/usr/bin/env node
import {
  constants as fsConstants,
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const incomingDir = path.join(root, "public/assets/tsurara/incoming");
const expressionsDir = path.join(root, "public/assets/tsurara/expressions");
const directionsDir = path.join(root, "public/assets/tsurara/directions");

const viewerTypesPath = path.join(root, "src/features/two-d-viewer/types/viewer.ts");
const assetsPath = path.join(root, "src/features/two-d-viewer/data/tsuraraAssets.ts");
const twoDViewerPath = path.join(root, "src/features/two-d-viewer/components/TwoDViewer.tsx");
const blinkCropCheckPath = path.join(root, "src/features/two-d-viewer/components/BlinkCropCheck.tsx");

const expectedWidth = 1086;
const expectedHeight = 1448;
const directionKeys = ["left15", "front", "right15"];
const idPattern = /^[a-z][a-zA-Z0-9]*$/;
const filenamePattern = /^[A-Za-z0-9_.-]+\.png$/;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const packNameArg = args.find((arg) => !arg.startsWith("--"));

function readPngDimensions(filePath) {
  const buffer = readFileSync(filePath);
  if (buffer.length < 33 || buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
    throw new Error("PNG signature not found");
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function isSafeFilename(name) {
  return typeof name === "string" && filenamePattern.test(name);
}

// ---------------------------------------------------------------------------
// 1. Resolve which pack to import
// ---------------------------------------------------------------------------

function resolvePack() {
  if (packNameArg) {
    const dir = path.join(incomingDir, packNameArg);
    if (!existsSync(dir)) {
      console.error(`Pack folder not found: ${dir}`);
      process.exit(1);
    }
    return { name: packNameArg, dir };
  }

  if (!existsSync(incomingDir)) {
    console.error(`Incoming folder not found: ${incomingDir}`);
    process.exit(1);
  }
  const entries = readdirSync(incomingDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (entries.length === 0) {
    console.error(`No pack folders found under ${path.relative(root, incomingDir)}`);
    process.exit(1);
  }
  if (entries.length > 1) {
    console.error(
      `Multiple pack folders found under ${path.relative(root, incomingDir)}; specify one:\n` +
        entries.map((entry) => `  - ${entry.name}`).join("\n")
    );
    process.exit(1);
  }
  return { name: entries[0].name, dir: path.join(incomingDir, entries[0].name) };
}

const pack = resolvePack();
console.log(`Pack: ${pack.name}`);
console.log(`Path: ${path.relative(root, pack.dir)}`);

// ---------------------------------------------------------------------------
// 2. Read + validate manifest.json
// ---------------------------------------------------------------------------

const manifestPath = path.join(pack.dir, "manifest.json");
if (!existsSync(manifestPath)) {
  console.error(`manifest.json not found: ${path.relative(root, manifestPath)}`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  console.error(`manifest.json is not valid JSON: ${error.message}`);
  process.exit(1);
}

const manifestErrors = [];
const manifestFail = (message) => manifestErrors.push(message);

if (manifest.type !== "expression") {
  manifestFail(`type must be "expression" (got ${JSON.stringify(manifest.type)}); only new-expression packs are supported so far`);
}
if (typeof manifest.id !== "string" || !idPattern.test(manifest.id)) {
  manifestFail(`id must match ${idPattern} (got ${JSON.stringify(manifest.id)})`);
}
if (typeof manifest.label !== "string" || manifest.label.length === 0) {
  manifestFail(`label must be a non-empty string (got ${JSON.stringify(manifest.label)})`);
}
if (manifest.mouthPolicy !== "generic" && manifest.mouthPolicy !== "disabled") {
  manifestFail(`mouthPolicy must be "generic" or "disabled" (got ${JSON.stringify(manifest.mouthPolicy)})`);
}

const base = manifest.base ?? {};
for (const key of directionKeys) {
  if (!isSafeFilename(base[key])) {
    manifestFail(`base.${key} must be a plain "*.png" filename (got ${JSON.stringify(base[key])})`);
  }
}

const blink = manifest.blink ?? {};
const blinkDirections = directionKeys.filter((key) => key in blink);
for (const key of blinkDirections) {
  if (!isSafeFilename(blink[key])) {
    manifestFail(`blink.${key} must be a plain "*.png" filename (got ${JSON.stringify(blink[key])})`);
  }
}

if (manifestErrors.length) {
  console.error("\nManifest errors:");
  for (const message of manifestErrors) console.error(`- ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. PNG existence + dimension checks
// ---------------------------------------------------------------------------

const pngChecks = [
  { field: "base.front", filename: base.front },
  { field: "base.left15", filename: base.left15 },
  { field: "base.right15", filename: base.right15 },
  ...blinkDirections.map((key) => ({ field: `blink.${key}`, filename: blink[key] }))
];

const pngErrors = [];
for (const check of pngChecks) {
  const filePath = path.join(pack.dir, check.filename);
  if (!existsSync(filePath)) {
    pngErrors.push(`${check.field}: file not found (${check.filename})`);
    continue;
  }
  try {
    const { width, height } = readPngDimensions(filePath);
    if (width !== expectedWidth || height !== expectedHeight) {
      pngErrors.push(`${check.field}: expected ${expectedWidth}x${expectedHeight}, got ${width}x${height} (${check.filename})`);
    }
  } catch (error) {
    pngErrors.push(`${check.field}: ${error.message} (${check.filename})`);
  }
}

if (pngErrors.length) {
  console.error("\nAsset errors:");
  for (const message of pngErrors) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`\nValidated ${pngChecks.length} PNG(s): all ${expectedWidth}x${expectedHeight}, present.`);

// ---------------------------------------------------------------------------
// 4. Plan destinations + check for collisions (nothing is written yet)
// ---------------------------------------------------------------------------

const copyPlan = [
  { field: "base.front", from: base.front, toDir: expressionsDir },
  { field: "base.left15", from: base.left15, toDir: directionsDir },
  { field: "base.right15", from: base.right15, toDir: directionsDir },
  ...blinkDirections.map((key) => ({
    field: `blink.${key}`,
    from: blink[key],
    toDir: key === "front" ? expressionsDir : directionsDir
  }))
].map((item) => ({ ...item, srcPath: path.join(pack.dir, item.from), destPath: path.join(item.toDir, item.from) }));

const destByPath = new Map();
const collisionErrors = [];
for (const item of copyPlan) {
  if (existsSync(item.destPath)) {
    collisionErrors.push(`${item.field}: destination already exists (${path.relative(root, item.destPath)})`);
  }
  const existing = destByPath.get(item.destPath);
  if (existing) {
    collisionErrors.push(`${item.field} and ${existing} both target ${path.relative(root, item.destPath)}`);
  } else {
    destByPath.set(item.destPath, item.field);
  }
}

if (collisionErrors.length) {
  console.error("\nDestination collisions (nothing was copied or registered):");
  for (const message of collisionErrors) console.error(`- ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 5. Check the id is not already registered
// ---------------------------------------------------------------------------

function detectNewline(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function loadFile(filePath, scriptKind) {
  const text = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, scriptKind);
  return { filePath, text, sourceFile, nl: detectNewline(text), edits: [] };
}

function findVariableDeclaration(sourceFile, name) {
  let found;
  function visit(node) {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function findTypeAlias(sourceFile, name) {
  let found;
  ts.forEachChild(sourceFile, (node) => {
    if (!found && ts.isTypeAliasDeclaration(node) && node.name.text === name) found = node;
  });
  return found;
}

const viewerFile = loadFile(viewerTypesPath, ts.ScriptKind.TS);
const expressionIdAlias = findTypeAlias(viewerFile.sourceFile, "ExpressionId");
if (!expressionIdAlias || !ts.isUnionTypeNode(expressionIdAlias.type)) {
  console.error(`Could not locate the ExpressionId union type in ${path.relative(root, viewerTypesPath)}`);
  process.exit(1);
}
const existingIds = expressionIdAlias.type.types
  .filter(ts.isLiteralTypeNode)
  .map((node) => node.literal.text);
if (existingIds.includes(manifest.id)) {
  console.error(`id "${manifest.id}" is already registered in ExpressionId. Aborting.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 6. Plan the source edits (still nothing written)
// ---------------------------------------------------------------------------

function planAppendListItem(file, node, itemText) {
  const text = file.text;
  const closeIndex = node.end - 1; // position of the closing ']' or '}'
  let i = closeIndex - 1;
  while (i > 0 && /\s/.test(text[i])) i -= 1;
  const hasTrailingComma = text[i] === ",";
  const insertPos = i + 1;
  const insertion = hasTrailingComma ? `${file.nl}  ${itemText},` : `,${file.nl}  ${itemText}`;
  file.edits.push({ pos: insertPos, text: insertion });
}

function planAppendUnionMember(file, typeAliasNode, memberText) {
  file.edits.push({ pos: typeAliasNode.type.end, text: `${file.nl}  | ${memberText}` });
}

function applyEdits(file) {
  const sorted = [...file.edits].sort((a, b) => b.pos - a.pos);
  let text = file.text;
  for (const edit of sorted) {
    const end = edit.end ?? edit.pos;
    text = text.slice(0, edit.pos) + edit.text + text.slice(end);
  }
  return text;
}

const idLiteral = JSON.stringify(manifest.id);
const labelLiteral = JSON.stringify(manifest.label);

// -- viewer.ts: ExpressionId union --------------------------------------
planAppendUnionMember(viewerFile, expressionIdAlias, idLiteral);

// -- tsuraraAssets.ts -----------------------------------------------------
const assetsFile = loadFile(assetsPath, ts.ScriptKind.TS);

const expressionsDecl = findVariableDeclaration(assetsFile.sourceFile, "expressions");
const directionalExpressionsDecl = findVariableDeclaration(assetsFile.sourceFile, "directionalExpressions");
const blinkAssetsByExpressionDecl = findVariableDeclaration(assetsFile.sourceFile, "blinkAssetsByExpression");
const blinkDisabledExpressionsDecl = findVariableDeclaration(assetsFile.sourceFile, "blinkDisabledExpressions");

if (!expressionsDecl || !ts.isArrayLiteralExpression(expressionsDecl.initializer)) {
  console.error(`Could not locate the "expressions" array in ${path.relative(root, assetsPath)}`);
  process.exit(1);
}
if (!directionalExpressionsDecl || !ts.isObjectLiteralExpression(directionalExpressionsDecl.initializer)) {
  console.error(`Could not locate the "directionalExpressions" object in ${path.relative(root, assetsPath)}`);
  process.exit(1);
}
if (!blinkAssetsByExpressionDecl || !ts.isObjectLiteralExpression(blinkAssetsByExpressionDecl.initializer)) {
  console.error(`Could not locate the "blinkAssetsByExpression" object in ${path.relative(root, assetsPath)}`);
  process.exit(1);
}
if (!blinkDisabledExpressionsDecl || !ts.isArrayLiteralExpression(blinkDisabledExpressionsDecl.initializer)) {
  console.error(`Could not locate the "blinkDisabledExpressions" array in ${path.relative(root, assetsPath)}`);
  process.exit(1);
}

planAppendListItem(
  assetsFile,
  expressionsDecl.initializer,
  `{\n    id: ${idLiteral},\n    label: ${labelLiteral},\n    src: \`\${expressionBase}/${base.front}\`\n  }`
);

planAppendListItem(
  assetsFile,
  directionalExpressionsDecl.initializer,
  `${manifest.id}: {\n    left15: \`\${directionBase}/${base.left15}\`,\n    front: \`\${expressionBase}/${base.front}\`,\n    right15: \`\${directionBase}/${base.right15}\`\n  }`
);

if (blinkDirections.length === 0) {
  planAppendListItem(assetsFile, blinkDisabledExpressionsDecl.initializer, idLiteral);
} else {
  if (blinkDirections.length < directionKeys.length) {
    // Loosen the per-direction map from a full Record to Partial, matching
    // manifests where blink is only provided for some directions.
    const partialType = blinkAssetsByExpressionDecl.type; // Partial<Record<ExpressionId, Record<DirectionId, string>>>
    const outerRecord = partialType?.typeArguments?.[0];
    const innerRecordType = outerRecord?.typeArguments?.[1];
    if (innerRecordType && innerRecordType.getText(assetsFile.sourceFile) === "Record<DirectionId, string>") {
      assetsFile.edits.push({
        pos: innerRecordType.getStart(assetsFile.sourceFile),
        end: innerRecordType.getEnd(),
        text: "Partial<Record<DirectionId, string>>"
      });
    }
  }
  const blinkLines = blinkDirections
    .map((key) => `    ${key}: \`\${${key === "front" ? "expressionBase" : "directionBase"}}/${blink[key]}\``)
    .join(`,${assetsFile.nl}`);
  planAppendListItem(assetsFile, blinkAssetsByExpressionDecl.initializer, `${manifest.id}: {\n${blinkLines}\n  }`);
}

// -- TwoDViewer.tsx: expressionsWithoutGenericMouth ------------------------
const twoDViewerFile = loadFile(twoDViewerPath, ts.ScriptKind.TSX);
const mouthListDecl = findVariableDeclaration(twoDViewerFile.sourceFile, "expressionsWithoutGenericMouth");
if (!mouthListDecl || !ts.isArrayLiteralExpression(mouthListDecl.initializer)) {
  console.error(`Could not locate "expressionsWithoutGenericMouth" in ${path.relative(root, twoDViewerPath)}`);
  process.exit(1);
}
if (manifest.mouthPolicy === "disabled") {
  planAppendListItem(twoDViewerFile, mouthListDecl.initializer, idLiteral);
}

// -- BlinkCropCheck.tsx: expressionLabel (required for type-checking) + ---
// -- targetExpressions (only expressions with blink assets get a card) ----
const blinkCropCheckFile = loadFile(blinkCropCheckPath, ts.ScriptKind.TSX);
const expressionLabelDecl = findVariableDeclaration(blinkCropCheckFile.sourceFile, "expressionLabel");
const targetExpressionsDecl = findVariableDeclaration(blinkCropCheckFile.sourceFile, "targetExpressions");
if (!expressionLabelDecl || !ts.isObjectLiteralExpression(expressionLabelDecl.initializer)) {
  console.error(`Could not locate "expressionLabel" in ${path.relative(root, blinkCropCheckPath)}`);
  process.exit(1);
}
if (!targetExpressionsDecl || !ts.isArrayLiteralExpression(targetExpressionsDecl.initializer)) {
  console.error(`Could not locate "targetExpressions" in ${path.relative(root, blinkCropCheckPath)}`);
  process.exit(1);
}
planAppendListItem(blinkCropCheckFile, expressionLabelDecl.initializer, `${manifest.id}: ${labelLiteral}`);
if (blinkDirections.length > 0) {
  planAppendListItem(blinkCropCheckFile, targetExpressionsDecl.initializer, idLiteral);
}

// ---------------------------------------------------------------------------
// 7. Apply: copy PNGs, then write the edited source files
// ---------------------------------------------------------------------------

console.log(`\n${dryRun ? "[dry-run] Would copy" : "Copying"} ${copyPlan.length} file(s):`);
for (const item of copyPlan) {
  console.log(`  ${item.field}: ${item.from} -> ${path.relative(root, item.destPath)}`);
}

const filesToWrite = [
  { file: viewerFile, label: "src/features/two-d-viewer/types/viewer.ts" },
  { file: assetsFile, label: "src/features/two-d-viewer/data/tsuraraAssets.ts" },
  { file: twoDViewerFile, label: "src/features/two-d-viewer/components/TwoDViewer.tsx" },
  { file: blinkCropCheckFile, label: "src/features/two-d-viewer/components/BlinkCropCheck.tsx" }
];

console.log(`\n${dryRun ? "[dry-run] Would register" : "Registering"} "${manifest.id}" in:`);
for (const { file, label } of filesToWrite) {
  console.log(`  ${label} (${file.edits.length} edit${file.edits.length === 1 ? "" : "s"})`);
}

if (dryRun) {
  console.log("\n[dry-run] No files were copied or modified.");
  process.exit(0);
}

for (const item of copyPlan) {
  copyFileSync(item.srcPath, item.destPath, fsConstants.COPYFILE_EXCL);
}

for (const { file } of filesToWrite) {
  writeFileSync(file.filePath, applyEdits(file));
}

console.log(`\nImported "${manifest.id}" from pack "${pack.name}".`);
console.log("Next: npm run verify:assets:json && npm run check");
