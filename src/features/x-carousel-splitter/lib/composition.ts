import { SPLIT_COUNTS, type CarouselSource, type SplitCount } from "../types";
import { drawComposite, OUTPUT_HEIGHT, OUTPUT_WIDTH } from "./imageMath";

/** One shared plan for guides, live preview and exported PNGs. */
export function createSplitPlan(splitCount: SplitCount, sourceCount: number) {
  if (!SPLIT_COUNTS.includes(splitCount)) throw new Error("分割枚数は2〜20枚で指定してください。");
  if (!Number.isInteger(sourceCount) || sourceCount < 1) throw new Error("画像を追加してください。");
  return Array.from({ length: splitCount }, (_, i) => {
    const startX = Math.round(i * OUTPUT_WIDTH / splitCount);
    const endX = Math.round((i + 1) * OUTPUT_WIDTH / splitCount);
    return { index: i + 1, sourceIndex: i % sourceCount, startX, endX, width: endX - startX };
  });
}

/** Render at canonical resolution; UI overlays never enter this canvas. */
export function drawAssignedComposite(ctx: CanvasRenderingContext2D, sources: CarouselSource[], splitCount: SplitCount) {
  const plan = createSplitPlan(splitCount, sources.length);
  ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  const scratch = document.createElement("canvas");
  scratch.width = OUTPUT_WIDTH;
  scratch.height = OUTPUT_HEIGHT;
  const scratchCtx = scratch.getContext("2d");
  if (!scratchCtx) throw new Error("Canvas 2D context is not available.");
  // Only sources actually assigned to a position are rendered. One scratch canvas
  // bounds memory even when the registered image count exceeds the split count.
  for (let sourceIndex = 0; sourceIndex < Math.min(sources.length, splitCount); sourceIndex++) {
    const source = sources[sourceIndex];
    drawComposite(scratchCtx, source.element, source.naturalWidth, source.naturalHeight, source.transform, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    for (const part of plan) {
      if (part.sourceIndex !== sourceIndex) continue;
      ctx.drawImage(scratch, part.startX, 0, part.width, OUTPUT_HEIGHT, part.startX, 0, part.width, OUTPUT_HEIGHT);
    }
  }
  return plan;
}
