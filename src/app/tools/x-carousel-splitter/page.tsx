import type { Metadata } from "next";
import { XCarouselSplitterPage } from "../../../features/x-carousel-splitter/components/XCarouselSplitterPage";

export const metadata: Metadata = {
  title: "X Carousel Splitter | Tsurara Studio",
  description:
    "横長画像を、Xのカルーセル投稿向けに2枚・4枚へブラウザ内だけで分割できる無料ツールです。"
};

export default function Page() {
  return <XCarouselSplitterPage />;
}
