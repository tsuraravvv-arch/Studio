export function downloadBlobUrl(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Triggers sequential downloads with a small stagger — some browsers block
 * or silently drop multiple simultaneous same-tick downloads. */
export function downloadAll(
  panels: { url: string; fileName: string }[]
): void {
  panels.forEach((panel, index) => {
    window.setTimeout(() => {
      downloadBlobUrl(panel.url, panel.fileName);
    }, index * 180);
  });
}
