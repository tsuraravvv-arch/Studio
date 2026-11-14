import { buildPanelFileName } from "./filename";
import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from "./imageMath";
import { drawAssignedComposite } from "./composition";
import type { CarouselSource, ImageTransform, OutputPanel, SplitCount } from "../types";

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob) resolve(blob);
    else reject(new Error("画像の書き出しに失敗しました。"));
  }, "image/png"));
}

export async function splitImages(sources: CarouselSource[], splitCount: SplitCount, basename: string): Promise<OutputPanel[]> {
  const composite = document.createElement("canvas");
  composite.width = OUTPUT_WIDTH;
  composite.height = OUTPUT_HEIGHT;
  const ctx = composite.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available.");
  const plan = drawAssignedComposite(ctx, sources, splitCount);
  const panels: OutputPanel[] = [];
  try {
    for (const part of plan) {
      const canvas = document.createElement("canvas");
      canvas.width = part.width;
      canvas.height = OUTPUT_HEIGHT;
      const panelCtx = canvas.getContext("2d");
      if (!panelCtx) throw new Error("Canvas 2D context is not available.");
      panelCtx.drawImage(composite, part.startX, 0, part.width, OUTPUT_HEIGHT, 0, 0, part.width, OUTPUT_HEIGHT);
      const blob = await canvasToBlob(canvas);
      panels.push({ index: part.index, url: URL.createObjectURL(blob), blob, width: part.width, height: OUTPUT_HEIGHT, fileName: buildPanelFileName(basename, part.index) });
    }
    return panels;
  } catch (error) {
    panels.forEach(panel => URL.revokeObjectURL(panel.url));
    throw error;
  }
}

/** Backwards-compatible single-image entry point. */
export function splitImage(image: HTMLImageElement, naturalWidth: number, naturalHeight: number, transform: ImageTransform, splitCount: SplitCount, basename: string) {
  return splitImages([{ id: "single", element: image, naturalWidth, naturalHeight, transform, objectUrl: "", fileName: basename }], splitCount, basename);
}
