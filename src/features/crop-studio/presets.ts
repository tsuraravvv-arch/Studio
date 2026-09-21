export type SafeArea = {
  x: number; y: number; width: number; height: number; label: string;
};
export type CropPreset = {
  id: string; name: string; width: number; height: number; safeAreas?: SafeArea[];
};

// Safe areas use output pixels. They are composition aids, never export layers.
// X's inset is a conservative editorial guide, not a guaranteed device crop.
export const CROP_PRESETS: CropPreset[] = [
  { id: "youtube-thumbnail", name: "YouTube サムネイル", width: 1280, height: 720 },
  { id: "youtube-art", name: "YouTube チャンネルアート", width: 2560, height: 1440,
    safeAreas: [{ x: 507, y: 508.5, width: 1546, height: 423, label: "文字・ロゴの配置目安" }] },
  { id: "x-header", name: "X ヘッダー", width: 1500, height: 500,
    safeAreas: [{ x: 300, y: 80, width: 1100, height: 340, label: "重要な内容の配置目安" }] },
  { id: "x-post", name: "X 投稿画像", width: 1200, height: 675 },
  { id: "instagram-square", name: "Instagram 正方形", width: 1080, height: 1080 },
  { id: "instagram-portrait", name: "Instagram 縦", width: 1080, height: 1350 },
];
export const CROP_RATIOS = [[16, 9], [4, 3], [3, 2], [1, 1], [8, 5], [4, 5], [3, 1]] as const;
