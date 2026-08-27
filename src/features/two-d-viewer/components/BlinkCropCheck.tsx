import Image from "next/image";
import {
  directionalExpressions,
  resolveBlinkAssetSrc,
  resolveBlinkOverlayRegion
} from "../data/tsuraraAssets";
import type { DirectionId, ExpressionId, OverlayRegion } from "../types/viewer";

type BlinkCropVerdict = "OK" | "EDGE_RISK" | "WEAK" | "NO_DIFF" | "ERROR";
type CardVerdict = BlinkCropVerdict | "UNKNOWN";

type BlinkCropCounts = {
  inside: number;
  outside: number;
  border: number;
  edgeDensityPercent: { left: number; right: number; top: number; bottom: number };
};

type BlinkCropCheckRecord = {
  expression: ExpressionId;
  direction: DirectionId;
  source: string | null;
  cropRect: { x: number; y: number; width: number; height: number } | null;
  counts: BlinkCropCounts | null;
  insideRatioPercent?: number;
  verdict: BlinkCropVerdict;
  detail: string;
  edgeRisks: string[];
};

export type BlinkCropReport = {
  generatedAt: string;
  imageWidth: number;
  imageHeight: number;
  blinkCropChecks: BlinkCropCheckRecord[];
  summary: Record<"OK" | "EDGE_RISK" | "WEAK" | "NO_DIFF", number>;
};

type BlinkCropCheckProps = {
  report: BlinkCropReport | null;
};

// Matches blinkAssetsByExpression in tsuraraAssets.ts (plus the "normal" default).
const targetExpressions: ExpressionId[] = [
  "normal",
  "embarrassed",
  "smile",
  "softSmile",
  "surprised",
  "depressed",
  "cheerful"
];

const targetDirections: DirectionId[] = ["front", "left15", "right15"];

const expressionLabel: Record<ExpressionId, string> = {
  normal: "通常",
  smile: "笑顔",
  embarrassed: "照れ",
  troubled: "困り",
  jitome: "ジト目",
  surprised: "びっくり",
  exasperated: "あきれ",
  sleepy: "眠そう",
  depressed: "しょんぼり",
  relaxed: "リラックス",
  softSmile: "微笑み",
  cheerful: "楽しげ"
};

const directionLabel: Record<DirectionId, string> = {
  left15: "左15°",
  front: "正面",
  right15: "右15°"
};

const verdictStyle: Record<CardVerdict, string> = {
  OK: "border-emerald-300 bg-emerald-50 text-emerald-700",
  EDGE_RISK: "border-amber-300 bg-amber-50 text-amber-700",
  WEAK: "border-yellow-300 bg-yellow-50 text-yellow-700",
  NO_DIFF: "border-slate-300 bg-slate-100 text-slate-600",
  ERROR: "border-rose-300 bg-rose-50 text-rose-700",
  UNKNOWN: "border-slate-200 bg-white text-slate-400"
};

function findRecord(
  report: BlinkCropReport | null,
  expression: ExpressionId,
  direction: DirectionId
): BlinkCropCheckRecord | null {
  if (!report) return null;
  return (
    report.blinkCropChecks.find(
      (record) => record.expression === expression && record.direction === direction
    ) ?? null
  );
}

function CropOverlay({ region }: { region: OverlayRegion }) {
  return (
    <div
      className="pointer-events-none absolute border-2 border-red-500 shadow-[0_0_0_1px_rgba(255,255,255,0.7)]"
      style={{
        left: `${region.xRatio * 100}%`,
        top: `${region.yRatio * 100}%`,
        width: `${region.widthRatio * 100}%`,
        height: `${region.heightRatio * 100}%`
      }}
    />
  );
}

function ImagePreview({
  src,
  label,
  region,
  imageWidth,
  imageHeight
}: {
  src: string;
  label: string;
  region: OverlayRegion;
  imageWidth: number;
  imageHeight: number;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="relative w-full overflow-hidden rounded border border-slate-200 bg-[conic-gradient(#f1f5f9_90deg,#fff_90deg_180deg,#f1f5f9_180deg_270deg,#fff_270deg)] bg-[length:20px_20px]">
        <Image
          src={src}
          alt={label}
          width={imageWidth}
          height={imageHeight}
          unoptimized
          className="block h-auto w-full"
        />
        <CropOverlay region={region} />
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: CardVerdict }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${verdictStyle[verdict]}`}
    >
      {verdict}
    </span>
  );
}

function BlinkCropCard({
  expression,
  direction,
  record,
  imageWidth,
  imageHeight
}: {
  expression: ExpressionId;
  direction: DirectionId;
  record: BlinkCropCheckRecord | null;
  imageWidth: number;
  imageHeight: number;
}) {
  const baseSrc = directionalExpressions[expression][direction];
  const blinkSrc = resolveBlinkAssetSrc(expression, direction);
  const region = resolveBlinkOverlayRegion(expression, direction);
  const verdict: CardVerdict = record?.verdict ?? "UNKNOWN";
  const detail = record?.detail ?? "report未生成: npm run verify:assets:json を実行してください";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {expressionLabel[expression]} <span className="font-normal text-slate-400">/</span>{" "}
            {directionLabel[direction]}
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            {expression}/{direction}
          </p>
        </div>
        <VerdictBadge verdict={verdict} />
      </header>

      <div className="grid grid-cols-2 gap-2">
        <ImagePreview
          src={baseSrc}
          label="base"
          region={region}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
        <ImagePreview
          src={blinkSrc}
          label="blink"
          region={region}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">{detail}</p>

      {verdict === "EDGE_RISK" && record?.edgeRisks.length ? (
        <p className="mt-1 text-xs font-medium text-amber-700">
          危険辺: {record.edgeRisks.join(", ")}
        </p>
      ) : null}

      {record?.counts ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-100 pt-2 font-mono text-[11px] text-slate-500">
          <div className="flex justify-between">
            <dt>inside</dt>
            <dd>
              {record.counts.inside}px ({record.insideRatioPercent}%)
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>outside</dt>
            <dd>{record.counts.outside}px</dd>
          </div>
          <div className="col-span-2 flex justify-between">
            <dt>edges L/R/T/B</dt>
            <dd>
              {record.counts.edgeDensityPercent.left}% / {record.counts.edgeDensityPercent.right}%
              / {record.counts.edgeDensityPercent.top}% / {record.counts.edgeDensityPercent.bottom}
              %
            </dd>
          </div>
        </dl>
      ) : null}

      {record?.cropRect ? (
        <p className="mt-2 font-mono text-[11px] text-slate-400">
          crop: x={record.cropRect.x} y={record.cropRect.y} w={record.cropRect.width} h=
          {record.cropRect.height}
        </p>
      ) : null}
    </article>
  );
}

export function BlinkCropCheck({ report }: BlinkCropCheckProps) {
  const imageWidth = report?.imageWidth ?? 1086;
  const imageHeight = report?.imageHeight ?? 1448;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-slate-800">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Dev tool &middot; read-only
        </p>
        <h1 className="text-xl font-bold text-slate-800">Blink Crop Check</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          verify-tsurara-assets.mjs
          の判定結果を、Viewerが実際に使うblink overlay crop矩形と重ねて目視確認するための開発用ページです。画像ファイルはこのページから一切変更されません。
        </p>
        {report ? (
          <p className="mt-2 text-xs text-slate-400">
            generated: {report.generatedAt} / OK={report.summary.OK} EDGE_RISK=
            {report.summary.EDGE_RISK} WEAK={report.summary.WEAK} NO_DIFF={report.summary.NO_DIFF}
          </p>
        ) : (
          <p className="mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            レポートが見つかりません。<code className="font-mono">npm run verify:assets:json</code>{" "}
            を実行してから再読み込みしてください。画像とcrop枠のみ、判定なしで表示します。
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {targetExpressions.flatMap((expression) =>
          targetDirections.map((direction) => (
            <BlinkCropCard
              key={`${expression}/${direction}`}
              expression={expression}
              direction={direction}
              record={findRecord(report, expression, direction)}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
            />
          ))
        )}
      </div>
    </main>
  );
}
