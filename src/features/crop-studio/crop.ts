export type Size = { width: number; height: number };
// Position is an offset from the output center, in output pixels.
export type CropTransform = { x: number; y: number; scale: number; angle: number; flipX: boolean; flipY: boolean };
export const DEFAULT_TRANSFORM: CropTransform = { x: 0, y: 0, scale: 1, angle: 0, flipX: false, flipY: false };
export const MAX_SIDE = 8192;
export const MAX_PIXELS = 32_000_000;

export function validSize(width: number, height: number): boolean {
  return Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0 &&
    width <= MAX_SIDE && height <= MAX_SIDE && width * height <= MAX_PIXELS;
}

export function placementScale(image: Size, output: Size, angle: number, mode: "fill" | "fit"): number {
  const radians = angle * Math.PI / 180;
  const c = Math.abs(Math.cos(radians)), s = Math.abs(Math.sin(radians));
  return mode === "fill"
    ? Math.max((c * output.width + s * output.height) / image.width, (s * output.width + c * output.height) / image.height)
    : Math.min(output.width / (c * image.width + s * image.height), output.height / (s * image.width + c * image.height));
}

export function initialTransform(image: Size, output: Size): CropTransform {
  return { ...DEFAULT_TRANSFORM, scale: placementScale(image, output, 0, "fill") };
}

export function zoomAt(t: CropTransform, scale: number, point: { x: number; y: number }): CropTransform {
  const ratio = scale / t.scale;
  return { ...t, scale, x: point.x - (point.x - t.x) * ratio, y: point.y - (point.y - t.y) * ratio };
}

export function normalizeAngle(angle: number): number {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}

// Both preview and export use this renderer; guide overlays live outside it.
export function drawCrop(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, size: Size,
  t: CropTransform, background: string): void {
  const { canvas } = ctx;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.scale(canvas.width / size.width, canvas.height / size.height);
  ctx.translate(size.width / 2 + t.x, size.height / 2 + t.y);
  ctx.rotate(t.angle * Math.PI / 180);
  ctx.scale(t.scale * (t.flipX ? -1 : 1), t.scale * (t.flipY ? -1 : 1));
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (image) ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.restore();
}

export async function exportCrop(image: HTMLImageElement, size: Size, t: CropTransform,
  background: string, format: "png" | "jpeg" | "webp", quality: number): Promise<Blob> {
  if (!validSize(size.width, size.height)) throw new Error("出力サイズを確認してください。");
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("このブラウザでは画像を書き出せません。");
    drawCrop(ctx, image, size, t, background === "transparent" && format === "jpeg" ? "#ffffff" : background);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) reject(new Error("書き出しに失敗しました。サイズを小さくしてお試しください。"));
        else if (blob.type !== `image/${format}`) reject(new Error("このブラウザは選択した形式の書き出しに対応していません。PNGをお試しください。"));
        else resolve(blob);
      }, `image/${format}`, quality / 100);
    });
  } finally {
    canvas.width = canvas.height = 0;
  }
}
