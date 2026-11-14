export const SPLIT_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
export type SplitCount = (typeof SPLIT_COUNTS)[number];

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

/** Stable identity keeps placement attached to an image when the list moves. */
export interface CarouselSource extends LoadedImage {
  id: string;
  transform: ImageTransform;
}
