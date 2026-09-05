"use client";

import { downloadAll, downloadBlobUrl } from "../lib/download";
import type { OutputPanel, SplitCount } from "../types";
import { DownloadIcon, SnowflakeIcon, StarIcon } from "./icons";

type OutputPreviewProps = {
  panels: OutputPanel[];
  splitCount: SplitCount;
};

export function OutputPreview({ panels, splitCount }: OutputPreviewProps) {
  if (panels.length === 0) {
    return null;
  }

  return (
    <section className="xcs-results mx-auto w-full max-w-6xl px-6">
      <div className="rounded-3xl border border-[#e3edf0] bg-white p-6 shadow-[0_20px_60px_rgba(59,88,98,0.10)] sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="xcs-step flex h-6 w-6 items-center justify-center rounded-full bg-[#26677a] text-xs font-extrabold text-white">
              4
            </span>
            <h2 className="text-base font-extrabold text-[#1f3442]">
              分割結果プレビュー
            </h2>
          </div>
          <button
            className="xcs-panel-button flex items-center gap-1.5 rounded-lg text-xs"
            onClick={() => downloadAll(panels)}
            type="button"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            すべて保存
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div
            className={`grid flex-1 gap-4 ${
              splitCount === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {panels.map((panel) => (
              <figure
                className="flex flex-col overflow-hidden rounded-xl border border-[#e3edf0] bg-[#f9fcfd]"
                key={panel.index}
              >
                <div className="relative">
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-extrabold text-[#26677a] shadow-sm">
                    {panel.index}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- locally generated blob URL, not an optimizable static asset */}
                  <img
                    alt={`分割結果 ${panel.index}`}
                    className="w-full object-cover"
                    src={panel.url}
                    style={{ aspectRatio: `${panel.width} / ${panel.height}` }}
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-2 p-2.5">
                  <span className="text-xs font-bold text-[#5c7078]">
                    #{panel.index}
                  </span>
                  <button
                    className="xcs-panel-button flex items-center gap-1 rounded-md text-[11px]"
                    onClick={() => downloadBlobUrl(panel.url, panel.fileName)}
                    type="button"
                  >
                    <DownloadIcon className="h-3 w-3" />
                    ダウンロード
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="xcs-result-note flex w-full flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#f2fafc] to-[#eef0fb] p-5 text-center lg:w-48">
            <SnowflakeIcon className="h-6 w-6 text-[#9fd2e2]" />
            <p className="text-xs font-bold leading-relaxed text-[#4a5c66]">
              きれいに切り出せたよ！
              <br />
              あとは X に投稿するだけ。
            </p>
            <StarIcon className="h-5 w-5 text-[#c9bdf0]" />
          </div>
        </div>
      </div>
    </section>
  );
}
