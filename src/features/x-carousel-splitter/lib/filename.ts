// Characters that are unsafe across common filesystems (Windows in particular).
// Unicode letters (including Japanese) and spaces are intentionally preserved.
const UNSAFE_FILENAME_CHARS = /[\\/:*?"<>|\x00-\x1f]/g;

export function getBasename(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const raw = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const sanitized = raw.replace(UNSAFE_FILENAME_CHARS, "_").trim();
  return sanitized.length > 0 ? sanitized : "image";
}

export function buildPanelFileName(basename: string, index: number): string {
  return `${basename}-${String(index).padStart(2, "0")}.png`;
}
