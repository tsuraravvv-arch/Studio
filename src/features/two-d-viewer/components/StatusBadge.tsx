import { expressionById } from "../data/tsuraraAssets";
import type { DirectionId, ExpressionId, ViewerToggles } from "../types/viewer";

type StatusBadgeProps = {
  expressionId: ExpressionId;
  directionId: DirectionId;
  toggles: ViewerToggles;
};

const directionLabel: Record<DirectionId, string> = {
  left15: "左15°",
  front: "正面",
  right15: "右15°",
  up15: "上15°",
  down15: "下15°"
};

export function StatusBadge({
  expressionId,
  directionId,
  toggles
}: StatusBadgeProps) {
  return (
    <aside className="status-badge" aria-label="状態">
      <span>Expression: {expressionById[expressionId].label}</span>
      <span>Direction: {directionLabel[directionId]}</span>
      <span>Blink: {toggles.blink ? "ON" : "OFF"}</span>
      <span>Eye Reflection: {toggles.eyeReflection ? "ON" : "OFF"}</span>
      <span>Mouse Follow: {toggles.mouseFollow ? "ON" : "OFF"}</span>
      <span>Talk: {toggles.talk ? "ON" : "OFF"}</span>
    </aside>
  );
}
