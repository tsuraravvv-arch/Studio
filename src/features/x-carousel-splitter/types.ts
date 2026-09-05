export type SplitCount = 2 | 4;

export interface ImageTransform {
  /** World px (output px) per source image px. */
  scale: number;
  /** Top-left X of the image in world (output) px. */
  offsetX: number;
  /** Top-left Y of the image in world (output) px. */
  offsetY: number;
}

export interface LoadedImage {
  element: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  objectUrl: string;
  fileName: string;
}

export interface OutputPanel {
  index: number;
  url: string;
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
}
