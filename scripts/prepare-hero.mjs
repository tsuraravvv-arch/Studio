import { cp, mkdir } from "node:fs/promises";
// docs/assets is the source of truth; mirror Studio assets for dev/static export.
for (const directory of ["hero", "cards", "ui", "community", "music"]) {
  const destination = new URL(`../public/assets/${directory}/`, import.meta.url);
  await mkdir(destination, { recursive: true });
  await cp(new URL(`../docs/assets/${directory}/`, import.meta.url), destination, { recursive: true });
}
