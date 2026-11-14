"use client";

import { useEffect, useRef, useState } from "react";
import { drawAssignedComposite } from "../lib/composition";
import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from "../lib/imageMath";
import type { CarouselSource, SplitCount } from "../types";
import { SplitGuides } from "./SplitGuides";

export function LivePreview({ sources, splitCount }: { sources: CarouselSource[]; splitCount: SplitCount }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      try {
        ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        if (sources.length) drawAssignedComposite(ctx, sources, splitCount);
        setError(null);
      } catch {
        setError("プレビューを描画できませんでした。画像を減らしてお試しください。");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [sources, splitCount]);
  return <section className="xcs-live-preview" aria-label="分断プレビュー">
    <h2>分断プレビュー</h2>
    <p>左から投稿順。登録順に画像を切り替え、同じ位置の帯だけを切り出します。</p>
    <div className="xcs-editor-frame aspect-video">
      <canvas ref={canvasRef} width={OUTPUT_WIDTH} height={OUTPUT_HEIGHT} className="block h-full w-full" aria-label="保存画像の並びを示すプレビュー" />
      {!sources.length && <span className="xcs-preview-empty">画像を追加すると表示されます</span>}
      <SplitGuides splitCount={splitCount} />
    </div>
    {error && <p role="alert">{error}</p>}
  </section>;
}
