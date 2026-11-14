"use client";

import { useId, useState } from "react";
import type { CarouselSource } from "../types";
import { UploadCloudIcon } from "./icons";

type SourceUploaderProps = {
  sources: CarouselSource[];
  selectedId: string | null;
  pending: number;
  error: string | null;
  onFilesSelected: (files: File[]) => void;
  onSelect: (id: string) => void;
  onMove: (id: string, targetId: string) => void;
  onRemove: (id: string) => void;
};

export function SourceUploader({ sources, selectedId, pending, error, onFilesSelected, onSelect, onMove, onRemove }: SourceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const inputId = useId();
  return <section className="xcs-upload flex flex-col gap-3">
    <div className="flex items-center gap-2"><span className="xcs-step">1</span><h2>画像を追加・並べ替え</h2></div>
    <div className={`xcs-dropzone flex flex-col items-center gap-2 px-6 py-10 text-center ${isDragging ? "dragging" : ""}`}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={event => { if (event.dataTransfer.types.includes("Files")) { event.preventDefault(); setIsDragging(true); } }}
      onDrop={event => { event.preventDefault(); setIsDragging(false); if (event.dataTransfer.files.length) onFilesSelected(Array.from(event.dataTransfer.files)); }}>
      <UploadCloudIcon className="h-9 w-9" />
      <label className="cursor-pointer text-sm" htmlFor={inputId}>ここに画像をドラッグ＆ドロップ<br /><span className="underline">クリックして追加（複数選択可）</span>
        <input className="sr-only" id={inputId} type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={event => { onFilesSelected(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
      </label>
      <p className="text-xs">PNG / JPEG / WebP · 1枚でも利用できます</p>
    </div>
    {pending > 0 && <p role="status">画像を読み込み中…</p>}
    {error && <p className="text-xs text-[#b0435c]" role="alert">{error}</p>}
    {sources.length > 0 && <>
      <p className="xcs-source-help">クリックで編集対象を選択。ドラッグ、または「前へ」「後へ」で投稿に使う画像の順番を変更できます。</p>
      <ol className="xcs-source-list" aria-label="登録画像">
        {sources.map((source, index) => <li key={source.id} data-source-id={source.id} className={`xcs-source-card ${source.id === selectedId ? "is-selected" : ""}`}
          draggable onDragStart={event => { setDragId(source.id); event.dataTransfer.setData("text/x-carousel-source", source.id); event.dataTransfer.effectAllowed = "move"; }}
          onDragEnd={() => setDragId(null)}
          onDragOver={event => { if (dragId) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } }}
          onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData("text/x-carousel-source"); if (id && id !== source.id) onMove(id, source.id); setDragId(null); }}>
          <button className="xcs-source-select" type="button" aria-pressed={source.id === selectedId} onClick={() => onSelect(source.id)} aria-label={`画像${index + 1}を編集: ${source.fileName}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
            <img src={source.objectUrl} alt="" draggable={false} />
            <span className="xcs-source-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="xcs-source-name" title={source.fileName}>{source.fileName}</span>
          </button>
          <div className="xcs-source-actions">
            <button type="button" disabled={index === 0} aria-label={`画像${index + 1}を前へ`} onClick={() => onMove(source.id, sources[index - 1].id)}>前へ</button>
            <button type="button" disabled={index === sources.length - 1} aria-label={`画像${index + 1}を後へ`} onClick={() => onMove(source.id, sources[index + 1].id)}>後へ</button>
            <button type="button" aria-label={`画像${index + 1}を削除`} onClick={() => onRemove(source.id)}>削除</button>
          </div>
        </li>)}
      </ol>
    </>}
  </section>;
}
