"use client";

import { useId, useState } from "react";
import type { DragEvent } from "react";
import { UploadCloudIcon } from "./icons";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

type ImageUploaderProps = {
  fileName: string | null;
  error: string | null;
  onFileSelected: (file: File) => void;
};

export function ImageUploader({
  fileName,
  error,
  onFileSelected
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#26677a] text-xs font-extrabold text-white">
          1
        </span>
        <h2 className="text-base font-extrabold text-[#1f3442]">
          画像を読み込む
        </h2>
      </div>

      <div
        className={`xcs-dropzone flex flex-col items-center gap-2 px-6 py-10 text-center ${
          isDragging ? "dragging" : ""
        }`}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={handleDrop}
      >
        <UploadCloudIcon className="h-9 w-9 text-[#3f8092]" />
        <label className="cursor-pointer text-sm font-bold text-[#334655]" htmlFor={inputId}>
          ここに画像をドラッグ&ドロップ
          <br />
          または
          <span className="ml-1 underline decoration-[#8faab2] underline-offset-2">
            クリックして選択
          </span>
          <input
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            id={inputId}
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
            type="file"
          />
        </label>
        <p className="text-xs text-[#8493a0]">対応形式：PNG / JPEG / WebP</p>
      </div>

      {error ? (
        <p className="text-xs font-bold text-[#b0435c]" role="alert">
          {error}
        </p>
      ) : null}

      {fileName ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e3edf0] bg-[#f7fbfc] px-4 py-2.5">
          <p className="min-w-0 truncate text-xs text-[#5c7078]">
            読み込み中：<span className="font-bold text-[#334655]">{fileName}</span>
          </p>
          <label
            className="xcs-panel-button inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#d9e4e7] text-xs text-[#334655] transition hover:border-[#8faab2]"
            htmlFor={inputId}
          >
            画像を変更
          </label>
        </div>
      ) : null}
    </div>
  );
}
