"use client";

import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from "../lib/imageMath";
import type { SplitCount } from "../types";
import { CropIcon, DownloadIcon } from "./icons";

const SPLIT_OPTIONS: { value: SplitCount; label: string; grid: string }[] = [
  { value: 2, label: "2分割", grid: "横1 × 縦2" },
  { value: 4, label: "4分割", grid: "横1 × 縦4" }
];

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
  const panelWidth = OUTPUT_WIDTH / splitCount;

  return (
    <div className="xcs-controls flex h-full flex-col gap-6 rounded-2xl border border-[#e3edf0] bg-[#f9fcfd] p-5">
      <div className="flex items-center gap-2">
        <span className="xcs-step flex h-6 w-6 items-center justify-center rounded-full bg-[#26677a] text-xs font-extrabold text-white">
          3
        </span>
        <h2 className="text-base font-extrabold text-[#1f3442]">分割設定</h2>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-[#5c7078]">分割枚数</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="分割枚数を選択">
          {SPLIT_OPTIONS.map((option) => (
            <button
              className={option.value === splitCount ? "selected" : ""}
              key={option.value}
              onClick={() => onSplitCountChange(option.value)}
              type="button"
            >
              <span className="xcs-split-diagram" aria-hidden="true">
                {Array.from({ length: option.value }, (_, index) => <i key={index} />)}
              </span>
              <span className="block text-sm font-extrabold">{option.label}</span>
              <span className="block text-[11px] font-normal opacity-80">
                {option.grid}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="xcs-output-info flex flex-col gap-1.5 text-xs text-[#5c7078]">
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
