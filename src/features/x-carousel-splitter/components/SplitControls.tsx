"use client";

import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from "../lib/imageMath";
import type { SplitCount } from "../types";
import { CropIcon, DownloadIcon } from "./icons";

type SplitControlsProps = {
  splitCount: SplitCount;
  onSplitCountChange: (count: SplitCount) => void;
  onSplit: () => void;
  isSplitDisabled: boolean;
  isSplitting: boolean;
  errorMessage: string | null;
};

export function SplitControls({
  splitCount,
  onSplitCountChange,
  onSplit,
  isSplitDisabled,
  isSplitting,
  errorMessage
}: SplitControlsProps) {
  const minWidth = Math.floor(OUTPUT_WIDTH / splitCount);
  const maxWidth = Math.ceil(OUTPUT_WIDTH / splitCount);
  const panelWidth = minWidth === maxWidth ? String(minWidth) : `${minWidth}〜${maxWidth}`;

  return (
    <div className="xcs-controls flex h-full flex-col gap-6 rounded-2xl border border-[#e3edf0] bg-[#f9fcfd] p-5">
      <div className="flex items-center gap-2">
        <span className="xcs-step flex h-6 w-6 items-center justify-center rounded-full bg-[#26677a] text-xs font-extrabold text-white">
          3
        </span>
        <h2 className="text-base font-extrabold text-[#1f3442]">分割設定</h2>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#5c7078]" htmlFor="xcs-split-count">分割枚数</label>
        <output htmlFor="xcs-split-count" className="text-lg font-bold text-[#235cb0]">{splitCount}分割</output>
        <input
          id="xcs-split-count"
          className="xcs-split-slider"
          type="range"
          min={2}
          max={20}
          step={1}
          value={splitCount}
          aria-valuetext={`${splitCount}分割`}
          disabled={isSplitting}
          onChange={(event) => onSplitCountChange(Number(event.target.value) as SplitCount)}
        />
        <div className="flex justify-between text-xs text-[#5c7078]" aria-hidden="true"><span>2枚</span><span>20枚</span></div>
        <p className="text-xs leading-6 text-[#5c7078]">16:9の画像を左から右へ、2〜20枚に縦分割します。</p>
      </div>

      <div className="xcs-output-info flex flex-col gap-1.5 text-xs text-[#5c7078]">
        <div className="flex items-center justify-between">
          <span className="font-bold">全体サイズ</span>
          <span>{OUTPUT_WIDTH} × {OUTPUT_HEIGHT}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold">出力サイズ（1枚あたり）</span>
          <span>
            {panelWidth} × {OUTPUT_HEIGHT}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold">保存形式</span>
          <span>PNG（高画質）</span>
        </div>
      </div>

      <button
        className="xcs-primary-button mt-auto"
        disabled={isSplitDisabled || isSplitting}
        onClick={onSplit}
        type="button"
      >
        {isSplitting ? (
          "書き出し中…"
        ) : (
          <>
            <CropIcon className="h-4 w-4" />
            分割する
          </>
        )}
      </button>

      {errorMessage ? (
        <p className="text-xs font-bold text-[#b0435c]" role="alert">
          {errorMessage}
        </p>
      ) : isSplitDisabled ? (
        <p className="flex items-center gap-1.5 text-xs text-[#8493a0]">
          <DownloadIcon className="h-3.5 w-3.5" />
          画像を読み込むと分割できます
        </p>
      ) : null}
    </div>
  );
}
