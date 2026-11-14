import { createSplitPlan } from "../lib/composition";
import { OUTPUT_WIDTH } from "../lib/imageMath";
import type { SplitCount } from "../types";

export function SplitGuides({ splitCount }: { splitCount: SplitCount }) {
  const plan = createSplitPlan(splitCount, 1);
  return <div className="xcs-guides" aria-hidden="true">
    {plan.slice(1).map(part => <span className="xcs-guide-line" key={part.index} style={{ left: `${part.startX / OUTPUT_WIDTH * 100}%` }} />)}
    {plan.map(part => <span className="xcs-guide-number" key={part.index} style={{ left: `${(part.startX + part.endX) / 2 / OUTPUT_WIDTH * 100}%`, top: splitCount > 8 && part.index % 2 === 0 ? 34 : 10, padding: splitCount > 8 ? "2px 1px" : undefined, fontSize: splitCount > 8 ? 9 : undefined }}>{String(part.index).padStart(2, "0")}</span>)}
  </div>;
}
