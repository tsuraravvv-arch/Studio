import type { ImageTransform } from "../types";

/** Canonical output canvas size. All editing math happens in this coordinate
 * space so the on-screen preview and the final exported pixels always match. */
export const OUTPUT_WIDTH = 3840;
export const OUTPUT_HEIGHT = 2160;

/** Zoom is allowed up to this multiple of the "fit / cover" scale. */
const MAX_ZOOM_MULTIPLIER = 4;

export function computeCoverScale(
  naturalWidth: number,
  naturalHeight: number
): number {
  return Math.max(OUTPUT_WIDTH / naturalWidth, OUTPUT_HEIGHT / naturalHeight);
}

export function getScaleBounds(
  naturalWidth: number,
  naturalHeight: number
): { min: number; max: number } {
  const min = computeCoverScale(naturalWidth, naturalHeight);
  return { min, max: min * MAX_ZOOM_MULTIPLIER };
}

export function clampOffset(
  offsetX: number,
  offsetY: number,
  scale: number,
  naturalWidth: number,
  naturalHeight: number
): { offsetX: number; offsetY: number } {
  const scaledWidth = naturalWidth * scale;
  const scaledHeight = naturalHeight * scale;
  const minX = OUTPUT_WIDTH - scaledWidth;
  const minY = OUTPUT_HEIGHT - scaledHeight;

  return {
    offsetX: Math.min(0, Math.max(minX, offsetX)),
    offsetY: Math.min(0, Math.max(minY, offsetY))
  };
}

export function centeredTransform(
  naturalWidth: number,
  naturalHeight: number,
  scale: number
): ImageTransform {
  const scaledWidth = naturalWidth * scale;
  const scaledHeight = naturalHeight * scale;

  return {
    scale,
    offsetX: (OUTPUT_WIDTH - scaledWidth) / 2,
    offsetY: (OUTPUT_HEIGHT - scaledHeight) / 2
  };
}

/** "枠に合わせる" — smallest scale that leaves no empty space, centered. */
export function fitTransform(
  naturalWidth: number,
  naturalHeight: number
): ImageTransform {
  return centeredTransform(
    naturalWidth,
    naturalHeight,
    computeCoverScale(naturalWidth, naturalHeight)
  );
}

/** Rescale while keeping the image point under a given world coordinate fixed
 * (used for pointer-anchored wheel zoom and center-anchored slider zoom). */
export function rescaleAroundWorldPoint(
  transform: ImageTransform,
  naturalWidth: number,
  naturalHeight: number,
  nextScale: number,
  worldX: number,
  worldY: number
): ImageTransform {
  const { min, max } = getScaleBounds(naturalWidth, naturalHeight);
  const scale = Math.min(max, Math.max(min, nextScale));

  const imagePointX = (worldX - transform.offsetX) / transform.scale;
  const imagePointY = (worldY - transform.offsetY) / transform.scale;

  const rawOffsetX = worldX - imagePointX * scale;
  const rawOffsetY = worldY - imagePointY * scale;
  const { offsetX, offsetY } = clampOffset(
    rawOffsetX,
    rawOffsetY,
    scale,
    naturalWidth,
    naturalHeight
  );

  return { scale, offsetX, offsetY };
}

export function panTransform(
  transform: ImageTransform,
  deltaWorldX: number,
  deltaWorldY: number,
  naturalWidth: number,
  naturalHeight: number
): ImageTransform {
  const { offsetX, offsetY } = clampOffset(
    transform.offsetX + deltaWorldX,
    transform.offsetY + deltaWorldY,
    transform.scale,
    naturalWidth,
    naturalHeight
  );

  return { ...transform, offsetX, offsetY };
}

export function drawComposite(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  transform: ImageTransform,
  destWidth: number,
  destHeight: number
): void {
  const scaleFactor = destWidth / OUTPUT_WIDTH;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, destWidth, destHeight);
  ctx.drawImage(
    image,
    0,
    0,
    naturalWidth,
    naturalHeight,
    transform.offsetX * scaleFactor,
    transform.offsetY * scaleFactor,
    naturalWidth * transform.scale * scaleFactor,
    naturalHeight * transform.scale * scaleFactor
  );
}
