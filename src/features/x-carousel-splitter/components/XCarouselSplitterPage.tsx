"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadAll } from "../lib/download";
import { clampOffset, getScaleBounds, fitTransform, OUTPUT_HEIGHT, OUTPUT_WIDTH, panTransform, rescaleAroundWorldPoint } from "../lib/imageMath";
import { splitImages } from "../lib/splitter";
import type { CarouselSource, ImageTransform, OutputPanel, SplitCount } from "../types";
import "./splitter-design.css";
import { Hero } from "./Hero";
import { ImageEditor } from "./ImageEditor";
import { SourceUploader } from "./SourceUploader";
import { LivePreview } from "./LivePreview";
import { PostingGuide } from "./PostingGuide";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SplitControls } from "./SplitControls";

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const releasePanels = (panels: OutputPanel[]) => panels.forEach(panel => URL.revokeObjectURL(panel.url));

export function XCarouselSplitterPage() {
  const [sources, setSources] = useState<CarouselSource[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applyToAll, setApplyToAll] = useState(false);
  const [splitCount, setSplitCount] = useState<SplitCount>(4);
  const [panels, setPanels] = useState<OutputPanel[]>([]);
  const [pending, setPending] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const sourcesRef = useRef<CarouselSource[]>([]);
  const panelsRef = useRef<OutputPanel[]>([]);
  const revision = useRef(0);
  const mounted = useRef(true);
  const loading = useRef(0);
  const splitting = useRef(false);
  const sourceUrls = useRef(new Set<string>());
  const appendQueue = useRef(Promise.resolve());

  useEffect(() => {
    mounted.current = true;
    const urls = sourceUrls.current;
    return () => {
      mounted.current = false;
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
      releasePanels(panelsRef.current);
    };
  }, []);

  const invalidate = useCallback(() => {
    revision.current++;
    releasePanels(panelsRef.current);
    panelsRef.current = [];
    setPanels([]);
    setSplitError(null);
  }, []);

  const changeSources = useCallback((next: CarouselSource[]) => {
    invalidate();
    sourcesRef.current = next;
    setSources(next);
  }, [invalidate]);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (!files.length) return;
    invalidate();
    setUploadError(null);
    loading.current++;
    setPending(loading.current);
    // Decode concurrently, but commit batches in selection order, and each batch
    // in FileList order. Load completion order can never change registration order.
    const batch = Promise.all(files.map(async (file): Promise<CarouselSource | string> => {
      if (!ACCEPTED_TYPES.has(file.type)) return `${file.name}: PNG / JPEG / WebPをご利用ください。`;
      const objectUrl = URL.createObjectURL(file);
      sourceUrls.current.add(objectUrl);
      try {
        const element = new Image();
        await new Promise<void>((resolve, reject) => {
          element.onload = () => resolve();
          element.onerror = reject;
          element.src = objectUrl;
        });
        return { id: crypto.randomUUID(), element, objectUrl, fileName: file.name, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight, transform: fitTransform(element.naturalWidth, element.naturalHeight) };
      } catch {
        URL.revokeObjectURL(objectUrl);
        sourceUrls.current.delete(objectUrl);
        return `${file.name}: 画像を読み込めませんでした。`;
      }
    }));
    appendQueue.current = appendQueue.current.then(async () => {
      const results = await batch;
      if (!mounted.current) {
        results.forEach(result => { if (typeof result !== "string") URL.revokeObjectURL(result.objectUrl); });
        return;
      }
      const ready = results.filter((result): result is CarouselSource => typeof result !== "string");
      const errors = results.filter((result): result is string => typeof result === "string");
      if (ready.length) {
        changeSources([...sourcesRef.current, ...ready]);
        setSelectedId(current => current ?? ready[0].id);
      }
      if (errors.length) setUploadError(errors.join("\n"));
      loading.current--;
      setPending(loading.current);
    });
  }, [changeSources, invalidate]);

  const active = sources.find(source => source.id === selectedId) ?? null;
  const applyTransform = useCallback((reference: CarouselSource, transform: ImageTransform, all: boolean) => {
    let changed = false;
    const next = sourcesRef.current.map(source => {
      if (!all && source.id !== reference.id) return source;
      const bounds = getScaleBounds(source.naturalWidth, source.naturalHeight);
      const scale = Math.min(bounds.max, Math.max(bounds.min, transform.scale));
      const nextTransform = { scale, ...clampOffset(transform.offsetX, transform.offsetY, scale, source.naturalWidth, source.naturalHeight) };
      if (nextTransform.scale === source.transform.scale && nextTransform.offsetX === source.transform.offsetX && nextTransform.offsetY === source.transform.offsetY) return source;
      changed = true;
      return { ...source, transform: nextTransform };
    });
    if (changed) changeSources(next);
  }, [changeSources]);

  const updateTransform = useCallback((update: (source: CarouselSource) => ImageTransform) => {
    const reference = sourcesRef.current.find(source => source.id === selectedId);
    if (reference) applyTransform(reference, update(reference), applyToAll);
  }, [selectedId, applyToAll, applyTransform]);

  const handleApplyToAllChange = (checked: boolean) => {
    setApplyToAll(checked);
    const reference = sourcesRef.current.find(source => source.id === selectedId);
    if (checked && reference) applyTransform(reference, reference.transform, true);
  };

  const handlePan = useCallback((x: number, y: number) => updateTransform(source => panTransform(source.transform, x, y, source.naturalWidth, source.naturalHeight)), [updateTransform]);
  const handleZoomTo = useCallback((scale: number, x: number, y: number) => updateTransform(source => rescaleAroundWorldPoint(source.transform, source.naturalWidth, source.naturalHeight, scale, x, y)), [updateTransform]);
  const handleFit = () => updateTransform(source => fitTransform(source.naturalWidth, source.naturalHeight));
  const handleMove = (id: string, targetId: string) => {
    const next = [...sourcesRef.current];
    const from = next.findIndex(source => source.id === id);
    const to = next.findIndex(source => source.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    next.splice(to, 0, next.splice(from, 1)[0]);
    changeSources(next);
  };
  const handleRemove = (id: string) => {
    const source = sourcesRef.current.find(item => item.id === id);
    if (!source) return;
    const next = sourcesRef.current.filter(item => item.id !== id);
    changeSources(next);
    URL.revokeObjectURL(source.objectUrl);
    sourceUrls.current.delete(source.objectUrl);
    setSelectedId(current => current === id ? next[0]?.id ?? null : current);
  };

  const handleSplit = async () => {
    if (!sourcesRef.current.length || loading.current || splitting.current) return;
    invalidate();
    const version = revision.current;
    splitting.current = true;
    setIsSplitting(true);
    try {
      const result = await splitImages(sourcesRef.current, splitCount, "carousel");
      // Edits and uploads during asynchronous PNG encoding must not publish stale results.
      if (!mounted.current || revision.current !== version) { releasePanels(result); return; }
      panelsRef.current = result;
      setPanels(result);
    } catch (error) {
      if (mounted.current && revision.current === version) setSplitError(error instanceof Error ? error.message : "分割に失敗しました。");
    } finally {
      splitting.current = false;
      if (mounted.current) setIsSplitting(false);
    }
  };
  const handleSave = () => {
    if (!panelsRef.current.length || splitting.current || loading.current) return;
    const version = revision.current;
    downloadAll(panelsRef.current, () => mounted.current && revision.current === version);
  };

  return <main className="xcs-page flex min-h-screen flex-col bg-[#fbfdfe] text-[#243241]">
    <SiteHeader /><Hero />
    <section className="xcs-workspace mx-auto w-full max-w-6xl px-6 py-10">
      <div className="xcs-workspace-card rounded-3xl border border-[#e3edf0] bg-white p-6 sm:p-8">
        <div className="xcs-workspace-grid grid gap-8 lg:grid-cols-10">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <SourceUploader sources={sources} selectedId={selectedId} pending={pending} error={uploadError} onFilesSelected={handleFilesSelected} onSelect={setSelectedId} onMove={handleMove} onRemove={handleRemove} />
            <LivePreview sources={sources} splitCount={splitCount} />
            <div>
              {active && <p className="xcs-editing-label">編集中：画像{sources.indexOf(active) + 1} · {active.fileName}</p>}
              <ImageEditor applyToAll={applyToAll} onApplyToAllChange={handleApplyToAllChange} key={selectedId ?? "empty"} image={active} transform={active?.transform ?? { scale: 1, offsetX: 0, offsetY: 0 }} splitCount={splitCount} onPan={handlePan} onZoomTo={handleZoomTo} onFit={handleFit} onReset={handleFit} onOneToOne={() => handleZoomTo(1, OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2)} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <SplitControls splitCount={splitCount} onSplitCountChange={count => { if (count !== splitCount) { invalidate(); setSplitCount(count); } }} isSplitDisabled={!sources.length || pending > 0} isSplitting={isSplitting} errorMessage={splitError} onSplit={handleSplit} onSaveAll={handleSave} isSaveDisabled={!panels.length || pending > 0} />
            <p className="xcs-save-status" role="status">{isSplitting ? "PNGを作成中…" : panels.length ? `${panels.length}枚の保存準備ができました。` : "設定を整えて「分割する」を押してください。"}</p>
            <p className="xcs-save-help">carousel-01.pngから投稿順に保存します。画像や設定を変更した場合は、もう一度分割してください。一括保存にはブラウザの複数ダウンロード許可が必要な場合があります。</p>
          </div>
        </div>
      </div>
    </section>
    <PostingGuide splitCount={splitCount} /><SiteFooter />
  </main>;
}
