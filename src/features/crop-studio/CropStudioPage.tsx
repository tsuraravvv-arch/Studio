"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { ImageUploader } from "../x-carousel-splitter/components/ImageUploader";
import { SiteHeader } from "../x-carousel-splitter/components/SiteHeader";
import { SiteFooter } from "../x-carousel-splitter/components/SiteFooter";
import { downloadBlobUrl } from "../x-carousel-splitter/lib/download";
import "../x-carousel-splitter/components/splitter-design.css";
import { CROP_PRESETS, CROP_RATIOS } from "./presets";
import { DEFAULT_TRANSFORM, exportCrop, initialTransform, normalizeAngle, placementScale, validSize } from "./crop";
import type { Size } from "./crop";
import { CropCanvas } from "./CropCanvas";
import styles from "./crop-studio.module.css";

type LoadedImage = { element: HTMLImageElement; name: string; width: number; height: number };
type Mode = "template" | "ratio" | "custom";
const WARNING = "元画像の解像度を超えて拡大しています。書き出し画像がぼやける可能性があります。";

export function CropStudioPage() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [transform, setTransform] = useState(DEFAULT_TRANSFORM);
  const [angleDraft, setAngleDraft] = useState<string | null>(null);
  const [size, setSize] = useState<Size>({ width: 1280, height: 720 });
  const [mode, setMode] = useState<Mode>("template");
  const [presetId, setPresetId] = useState(CROP_PRESETS[0].id);
  const [ratio, setRatio] = useState("16:9");
  const [draft, setDraft] = useState({ width: "1280", height: "720" });
  const [center, setCenter] = useState(true);
  const [grid, setGrid] = useState(false);
  const [snap, setSnap] = useState(true);
  const [safe, setSafe] = useState(true);
  const [background, setBackground] = useState("transparent");
  const [customColor, setCustomColor] = useState("#eaf2ff");
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState(90);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const requestId = useRef(0);
  const sizeRef = useRef(size);
  useEffect(() => { sizeRef.current = size; }, [size]);
  useEffect(() => () => { requestId.current += 1; }, []);

  const preset = CROP_PRESETS.find(item => item.id === presetId)!;
  const invalidSize = mode !== "template" && !validSize(Number(draft.width), Number(draft.height));
  const actualBackground = background === "custom" ? customColor : background;
  const previewBackground = actualBackground === "transparent" && format === "jpeg" ? "#ffffff" : actualBackground;
  const maxScale = image ? Math.max(4, placementScale(image, size, transform.angle, "fill") * 8, transform.scale) : 4;

  function applySize(next: Size) {
    setSize(next);
    sizeRef.current = next;
    setDraft({ width: String(next.width), height: String(next.height) });
    if (image) setTransform(initialTransform(image, next));
    setStatus("");
  }
  function changeMode(next: Mode) {
    setMode(next);
    if (next === "template") applySize(preset);
    else if (next === "ratio") {
      const [w, h] = ratio.split(":").map(Number);
      applySize({ width: 1200, height: Math.round(1200 * h / w) });
    } else applySize(size);
  }
  function swapRatio() {
    if (invalidSize) return;
    const [width, height] = ratio.split(":");
    if (width === height) return;
    setRatio(`${height}:${width}`);
    applySize({ width: size.height, height: size.width });
  }
  function editSize(axis: "width" | "height", value: string) {
    const next = { ...draft, [axis]: value };
    if (mode === "ratio") {
      const [w, h] = ratio.split(":").map(Number);
      next.height = value.trim() ? String(Math.round(Number(value) * h / w)) : "";
    }
    setDraft(next);
    const candidate = { width: Number(next.width), height: Number(next.height) };
    if (validSize(candidate.width, candidate.height)) {
      setSize(candidate);
      sizeRef.current = candidate;
      if (image) setTransform(initialTransform(image, candidate));
    }
    setStatus("");
  }
  async function loadFile(file: File) {
    const id = ++requestId.current;
    setLoading(false);
    setUploadError(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadError("対応していない形式です。PNG / JPEG / WebP をご利用ください。");
      return;
    }
    const url = URL.createObjectURL(file);
    setLoading(true);
    try {
      const element = new Image();
      element.src = url;
      await element.decode();
      if (id !== requestId.current) return;
      if (!element.naturalWidth || !element.naturalHeight) throw new Error("Invalid image");
      const loaded = { element, name: file.name, width: element.naturalWidth, height: element.naturalHeight };
      setImage(loaded);
      setTransform(initialTransform(loaded, sizeRef.current));
      setExportError(null);
      setStatus("");
    } catch {
      if (id === requestId.current) setUploadError("画像を読み込めませんでした。別のファイルをお試しください。");
    } finally {
      URL.revokeObjectURL(url);
      if (id === requestId.current) setLoading(false);
    }
  }
  function place(placement: "fill" | "fit") {
    if (image) setTransform(t => ({ ...t, x: 0, y: 0, scale: placementScale(image, size, t.angle, placement) }));
  }
  async function save() {
    if (!image || invalidSize || exporting) return;
    setExporting(true);
    setExportError(null);
    setStatus("");
    try {
      const blob = await exportCrop(image.element, size, transform, actualBackground, format, quality);
      const url = URL.createObjectURL(blob);
      downloadBlobUrl(url, `crop-studio-${size.width}x${size.height}.${format === "jpeg" ? "jpg" : format}`);
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setStatus("画像を生成し、ダウンロードを開始しました。");
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "書き出しに失敗しました。");
    } finally { setExporting(false); }
  }

  return <div className={`xcs-page ${styles.page}`}>
    <SiteHeader />
    <main>
      <section className={`xcs-hero ${styles.hero}`}>
        <div className={styles.heroInner}>
          <nav className="xcs-breadcrumb" aria-label="パンくずリスト"><Link href="/">Home</Link><span>›</span><Link href="/tools/">Tools</Link><span>›</span><span aria-current="page">Crop Studio</span></nav>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <p className="xcs-eyebrow">TSURARA STUDIO / IMAGE TOOL</p>
              <h1>Crop Studio<span className="xcs-title-dot">.</span></h1>
              <p className="xcs-hero-subtitle">ぴったりのサイズに、思い通りの構図で。</p>
              <p className="xcs-hero-description">画像を入れる → サイズを選ぶ → 画像を動かす → 保存する。<br />画像は端末内で処理され、外部へ送信されません。</p>
            </div>
            <NextImage
              className={styles.heroImage}
              src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/assets/hero/tools/crop-studio-hero.png"}
              alt="Crop Studio のイメージビジュアル"
              width={1536}
              height={1024}
              sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 900px) 560px, 580px"
              preload
            />
          </div>
        </div>
      </section>
      <section className={styles.workspace} aria-label="Crop Studio ワークスペース">
        <div className={`xcs-workspace-card ${styles.layout}`}>
          <div className={styles.editor}>
            <ImageUploader fileName={image?.name ?? null} error={uploadError} onFileSelected={loadFile} />
            <p className={styles.note} role="status">{loading ? "画像を読み込んでいます…" : image ? `元画像：${image.width} × ${image.height} px` : "PNG / JPEG / WebP を切り抜いて保存できます。"}</p>
            <div className={styles.heading}><h2>プレビュー</h2><span>{size.width} × {size.height} px</span></div>
            <CropCanvas image={image?.element ?? null} size={size} transform={transform} onChange={setTransform} background={previewBackground} center={center} grid={grid} snap={snap} safeAreas={mode === "template" && safe ? preset.safeAreas ?? [] : []} maxScale={maxScale} />
            <p id="crop-instructions" className={styles.note}>ドラッグで移動・ホイール / ピンチで拡大縮小。キャンバスを選択して矢印キーで1px、Shift＋矢印で10px移動。</p>
            <fieldset disabled={!image} className={styles.zoom}>
              <label htmlFor="crop-zoom">ズーム <output>{Number((transform.scale * 100).toFixed(1))}%</output></label>
              <input id="crop-zoom" type="range" min="0.1" max={maxScale * 100} step="0.1" value={transform.scale * 100} onChange={e => setTransform(t => ({ ...t, scale: Number(e.target.value) / 100 }))} />
              <div className={styles.buttons}>
                <button onClick={() => setTransform(t => ({ ...t, scale: 1 }))}>100%</button>
                <button onClick={() => place("fill")}>枠に合わせる（Fill）</button>
                <button onClick={() => place("fit")}>全体を収める（Fit）</button>
                <button onClick={() => setTransform(t => ({ ...t, x: 0, y: 0 }))}>中央配置</button>
                <button onClick={() => image && setTransform(initialTransform(image, size))}>初期状態へリセット</button>
              </div>
            </fieldset>
            <details className={styles.details}>
              <summary>回転・反転・細かな位置調整</summary>
              <fieldset disabled={!image} className={styles.fields}>
                <label className={styles.rotation}>回転角度（°）<input aria-label="回転角度" type="number" min="-180" max="180" step="0.1" value={angleDraft ?? Number(transform.angle.toFixed(2))} onFocus={() => setAngleDraft(String(Number(transform.angle.toFixed(2))))} onBlur={() => setAngleDraft(null)} onChange={e => { const value = e.target.valueAsNumber; setAngleDraft(e.target.value); if (e.target.value !== "" && Number.isFinite(value)) setTransform(t => ({ ...t, angle: normalizeAngle(value) })); }} /></label>
                <input aria-label="回転スライダー" type="range" min="-180" max="180" step="0.1" value={transform.angle} onChange={e => setTransform(t => ({ ...t, angle: Number(e.target.value) }))} />
                <div className={styles.buttons}>
                  <button onClick={() => setTransform(t => ({ ...t, angle: normalizeAngle(t.angle - 90) }))}>左へ90°</button>
                  <button onClick={() => setTransform(t => ({ ...t, angle: normalizeAngle(t.angle + 90) }))}>右へ90°</button>
                  <button onClick={() => setTransform(t => ({ ...t, angle: 0 }))}>0°へ戻す</button>
                  <button aria-pressed={transform.flipX} onClick={() => setTransform(t => ({ ...t, flipX: !t.flipX }))}>左右反転</button>
                  <button aria-pressed={transform.flipY} onClick={() => setTransform(t => ({ ...t, flipY: !t.flipY }))}>上下反転</button>
                </div>
                <div className={styles.buttons} aria-label="1pxずつ位置を調整">
                  {([['←', -1, 0, '左へ1px'], ['↑', 0, -1, '上へ1px'], ['↓', 0, 1, '下へ1px'], ['→', 1, 0, '右へ1px']] as const).map(([label, x, y, name]) => <button key={name} aria-label={name} onClick={() => setTransform(t => ({ ...t, x: t.x + x, y: t.y + y }))}>{label}</button>)}
                  <span className={styles.note}>X {Math.round(transform.x)} / Y {Math.round(transform.y)} px</span>
                </div>
              </fieldset>
            </details>
            <details className={styles.details}>
              <summary>ガイド・セーフエリア・背景色</summary>
              <div className={styles.fields}>
                <div className={styles.toggles}>
                  <label><input type="checkbox" checked={center} onChange={e => setCenter(e.target.checked)} />センターガイド</label>
                  <label><input type="checkbox" checked={grid} onChange={e => setGrid(e.target.checked)} />3×3グリッド</label>
                  <label><input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)} />ガイドにスナップ</label>
                  <label><input type="checkbox" checked={safe} onChange={e => setSafe(e.target.checked)} />セーフエリア</label>
                </div>
                <p className={styles.note}>スナップはドラッグ時の画像中心に適用。ガイド類は書き出しに含まれません。セーフエリアは対応テンプレートのみの目安です。端末や表示位置によって見える範囲は変わります。</p>
                <label>背景色<select aria-label="背景色" value={background} onChange={e => setBackground(e.target.value)}><option value="transparent">透明</option><option value="#ffffff">白</option><option value="#000000">黒</option><option value="custom">任意色</option></select></label>
                {background === "custom" && <label className={styles.rotation}>任意の背景色<input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} /></label>}
              </div>
            </details>
          </div>
          <aside className={styles.settings}>
            <h2><span className="xcs-step">2</span> 出力サイズを選ぶ</h2>
            <label>サイズの指定方法<select aria-label="サイズの指定方法" value={mode} onChange={e => changeMode(e.target.value as Mode)}><option value="template">サービス用テンプレート</option><option value="ratio">比率指定</option><option value="custom">カスタム解像度</option></select></label>
            {mode === "template" && <label>テンプレート<select aria-label="テンプレート" value={presetId} onChange={e => { setPresetId(e.target.value); applySize(CROP_PRESETS.find(p => p.id === e.target.value)!); }}>{CROP_PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}（{p.width} × {p.height}）</option>)}</select></label>}
            {mode === "ratio" && <>
              <label>比率<select aria-label="比率" value={ratio} onChange={e => { setRatio(e.target.value); const [w, h] = e.target.value.split(":").map(Number); applySize({ width: 1200, height: Math.round(1200 * h / w) }); }}>
                {CROP_RATIOS.map(([w, h]) => <option key={`${w}:${h}`}>{w}:{h}</option>)}
                {!CROP_RATIOS.some(([w, h]) => `${w}:${h}` === ratio) && <option value={ratio}>{ratio}</option>}
              </select></label>
              <div className={styles.buttons}><button type="button" disabled={invalidSize} onClick={swapRatio}>縦横入れ替え</button></div>
            </>}
            {mode !== "template" && <div className={styles.dimensions}>
              <label>幅 px<input type="number" min="1" max="8192" step="1" value={draft.width} aria-invalid={invalidSize} aria-describedby={invalidSize ? "crop-size-error" : undefined} onChange={e => editSize("width", e.target.value)} /></label>
              <label>高さ px<input type="number" min="1" max="8192" step="1" value={draft.height} readOnly={mode === "ratio"} aria-invalid={invalidSize} onChange={e => editSize("height", e.target.value)} /></label>
            </div>}
            {invalidSize && <p id="crop-size-error" className={styles.error} role="alert">幅・高さは1〜8192の整数、合計3200万画素以下で入力してください。プレビューは直前の有効なサイズです。</p>}
            <p className={styles.note}>サイズを変更すると、画像は回転・反転を解除し、枠全体を覆う位置に戻ります。{mode === "ratio" && "高さは比率に合わせて整数pxに丸めます。"}</p>
            <div className={styles.export}>
              <h2><span className="xcs-step">3</span> 画像を保存する</h2>
              <label>書き出し形式<select aria-label="書き出し形式" value={format} onChange={e => setFormat(e.target.value as typeof format)}><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></label>
              {format !== "png" && <label>品質 <output>{quality}%</output><input aria-label="書き出し品質" type="range" min="1" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} /></label>}
              <dl className={styles.output}><div><dt>出力サイズ</dt><dd>{invalidSize ? "入力を確認してください" : `${size.width} × ${size.height} px`}</dd></div><div><dt>形式</dt><dd>{format.toUpperCase()}</dd></div></dl>
              {image && transform.scale > 1.00001 && <p className={styles.warning} role="status">{WARNING}</p>}
              {background === "transparent" && format === "jpeg" && <p className={styles.note}>JPEGは透明非対応のため、透明部分を白で保存します。プレビューにも反映しています。</p>}
              {exportError && <p className={styles.error} role="alert">{exportError}</p>}
              <button className="xcs-primary-button" disabled={!image || invalidSize || loading || exporting} onClick={save}>{exporting ? "書き出しています…" : "画像をダウンロード"}</button>
              <p className={styles.note} role="status">{status}</p>
              <p className={styles.note}>端末内で処理・登録不要。<br />画像のアップロードやサーバー保存は行いません。</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
