import { spawnSync } from "node:child_process";
import { cp, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
await import("./prepare-hero.mjs");
const root = new URL("../", import.meta.url);
const result = spawnSync(process.execPath, [fileURLToPath(new URL("node_modules/next/dist/bin/next", root)), "build"], {
  cwd: fileURLToPath(root), stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "true", NEXT_PUBLIC_BASE_PATH: "/Studio" },
});
if (result.status !== 0) process.exit(result.status ?? 1);
// Overlay only: keep manually supplied assets, design references and existing tools.
await cp(new URL("out/", root), new URL("docs/", root), { recursive: true });
await writeFile(new URL("docs/.nojekyll", root), "");
console.log("GitHub Pages export is ready in docs/ (base path: /Studio).");
