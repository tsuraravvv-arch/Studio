import { expressions } from "../data/tsuraraAssets";
import type { ExpressionId, ViewerToggles } from "../types/viewer";

type ViewerControlsProps = {
  expressionId: ExpressionId;
  toggles: ViewerToggles;
  onExpressionChange: (expressionId: ExpressionId) => void;
  onToggle: (key: keyof ViewerToggles) => void;
  onReset: () => void;
};

export function ViewerControls({
  expressionId,
  toggles,
  onExpressionChange,
  onToggle,
  onReset
}: ViewerControlsProps) {
  return (
    <section className="control-panel" aria-label="操作">
      <div className="control-group">
        <h2>表情</h2>
        <div className="expression-grid">
          {expressions.map((expression) => (
            <button
              className={expression.id === expressionId ? "selected" : ""}
              key={expression.id}
              onClick={() => onExpressionChange(expression.id)}
              type="button"
            >
              {expression.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <h2>動作</h2>
        <div className="action-row">
          <button
            className={toggles.blink ? "selected" : ""}
            onClick={() => onToggle("blink")}
            type="button"
          >
            まばたき {toggles.blink ? "ON" : "OFF"}
          </button>
          <button
            className={toggles.eyeReflection ? "selected" : ""}
            onClick={() => onToggle("eyeReflection")}
            type="button"
          >
            瞳反射 {toggles.eyeReflection ? "ON" : "OFF"}
          </button>
          <button
            className={toggles.mouseFollow ? "selected" : ""}
            onClick={() => onToggle("mouseFollow")}
            type="button"
          >
            マウス追従 {toggles.mouseFollow ? "ON" : "OFF"}
          </button>
          <button
            className={toggles.talk ? "selected talk-active" : ""}
            onClick={() => onToggle("talk")}
            type="button"
          >
            会話モード {toggles.talk ? "ON" : "OFF"}
          </button>
          <button className="reset-button" onClick={onReset} type="button">
            リセット
          </button>
        </div>
      </div>
    </section>
  );
}
