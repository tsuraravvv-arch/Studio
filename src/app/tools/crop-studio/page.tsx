import type { Metadata } from "next";
import { CropStudioPage } from "../../../features/crop-studio/CropStudioPage";

export const metadata: Metadata = {
  title: "Crop Studio | Tsurara Studio",
  description: "SNSテンプレート・比率・カスタムサイズで画像を切り抜き。位置、拡大、回転を調整してPNG / JPEG / WebPで保存。画像はブラウザ内だけで処理されます。",
};

export default function Page() {
  return <CropStudioPage />;
}
