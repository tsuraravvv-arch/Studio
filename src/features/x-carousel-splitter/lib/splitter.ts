import { buildPanelFileName } from "./filename";
import { drawComposite, OUTPUT_HEIGHT, OUTPUT_WIDTH } from "./imageMath";
import type { ImageTransform, OutputPanel, SplitCount } from "../types";

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("画像の書き出しに失敗しました。"));
      }
    }, "image/png");
  });
}

/** Renders the full 3840x2160 composite, then slices it into `splitCount`
 * equal-width panels so the preview and the exported files always match. */
export async function splitImage(
  image: HTMLImageElement,
  naturalWidth: number,
  naturalHeight: number,
  transform: ImageTransform,
  splitCount: SplitCount,
  basename: string
): Promise<OutputPanel[]> {
  const composite = document.createElement("canvas");
  composite.width = OUTPUT_WIDTH;
  composite.height = OUTPUT_HEIGHT;
  const compositeCtx = composite.getContext("2d");
  if (!compositeCtx) {
    throw new Error("Canvas 2D context is not available.");
  }

  drawComposite(
    compositeCtx,
    image,
    naturalWidth,
    naturalHeight,
    transform,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  );

  const panelWidth = OUTPUT_WIDTH / splitCount;
  const panelHeight = OUTPUT_HEIGHT;
  const panels: OutputPanel[] = [];

  for (let i = 0; i < splitCount; i += 1) {
    const panelCanvas = document.createElement("canvas");
    panelCanvas.width = panelWidth;
    panelCanvas.height = panelHeight;
    const panelCtx = panelCanvas.getContext("2d");
    if (!panelCtx) {
      throw new Error("Canvas 2D context is not available.");
    }

    panelCtx.imageSmoothingEnabled = true;
    panelCtx.imageSmoothingQuality = "high";
    panelCtx.drawImage(
      composite,
      i * panelWidth,
      0,
      panelWidth,
      panelHeight,
      0,
      0,
      panelWidth,
      panelHeight
    );

    const blob = await canvasToBlob(panelCanvas);
    const index = i + 1;

    panels.push({
      index,
      url: URL.createObjectURL(blob),
      blob,
      width: panelWidth,
      height: panelHeight,
      fileName: buildPanelFileName(basename, index)
    });
  }

  return panels;
}
