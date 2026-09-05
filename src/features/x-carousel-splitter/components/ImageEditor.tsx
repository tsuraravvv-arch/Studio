"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  drawComposite,
  getScaleBounds,
  OUTPUT_HEIGHT,
  OUTPUT_WIDTH
} from "../lib/imageMath";
import type { ImageTransform, LoadedImage, SplitCount } from "../types";
import { CropIcon, FitIcon, ResetIcon, ZoomIcon } from "./icons";

const GUIDE_POSITIONS: Record<SplitCount, number[]> = {
  2: [50],
  4: [25, 50, 75]
};

type ImageEditorProps = {
  image: LoadedImage | null;
  transform: ImageTransform;
  splitCount: SplitCount;
  onPan: (deltaWorldX: number, deltaWorldY: number) => void;
  onZoomTo: (scale: number, anchorWorldX: number, anchorWorldY: number) => void;
  onFit: () => void;
  onOneToOne: () => void;
  onReset: () => void;
};

export function ImageEditor({
  image,
  transform,
  splitCount,
  onPan,
  onZoomTo,
  onFit,
  onOneToOne,
  onReset
}: ImageEditorProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const stateRef = useRef({ image, transform, frameWidth });
  useEffect(() => {
    stateRef.current = { image, transform, frameWidth };
  }, [image, transform, frameWidth]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setFrameWidth(entry.contentRect.width);
      }
    });
    observer.observe(frame);
    setFrameWidth(frame.clientWidth);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image || frameWidth <= 0) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(frameWidth * dpr);
    const height = Math.round((frameWidth * OUTPUT_HEIGHT * dpr) / OUTPUT_WIDTH);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    drawComposite(
      ctx,
      image.element,
      image.naturalWidth,
      image.naturalHeight,
      transform,
      width,
      height
    );
  }, [image, transform, frameWidth]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const { image: currentImage, transform: currentTransform } =
        stateRef.current;
      if (!currentImage) {
        return;
      }
      event.preventDefault();

      const rect = frame.getBoundingClientRect();
      const worldX = ((event.clientX - rect.left) / rect.width) * OUTPUT_WIDTH;
      const worldY = ((event.clientY - rect.top) / rect.height) * OUTPUT_HEIGHT;
      const zoomFactor = event.deltaY < 0 ? 1.08 : 1 / 1.08;

      onZoomTo(currentTransform.scale * zoomFactor, worldX, worldY);
    };

    frame.addEventListener("wheel", handleWheel, { passive: false });
    return () => frame.removeEventListener("wheel", handleWheel);
  }, [onZoomTo]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!image) {
      return;
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || frameWidth <= 0) {
      return;
    }
    const worldPerPx = OUTPUT_WIDTH / frameWidth;
    const deltaX = (event.clientX - lastPointerRef.current.x) * worldPerPx;
    const deltaY = (event.clientY - lastPointerRef.current.y) * worldPerPx;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    onPan(deltaX, deltaY);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }
    isDraggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const bounds = image
    ? getScaleBounds(image.naturalWidth, image.naturalHeight)
    : { min: 1, max: 1 };
  const zoomPercent = Math.round(transform.scale * 100);
  const showQualityWarning = Boolean(image) && transform.scale > 1.001;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#26677a] text-xs font-extrabold text-white">
            2
          </span>
          <h2 className="text-base font-extrabold text-[#1f3442]">
            切り出し範囲を調整
          </h2>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-[#e3edf0] px-2.5 py-1 text-xs font-bold text-[#5c7078]">
          <CropIcon className="h-3.5 w-3.5" />
          16:9
        </span>
      </div>

      <div
        aria-label="画像編集キャンバス。ドラッグで位置を調整できます。"
        className={`xcs-editor-frame aspect-video ${image ? "has-image" : ""} ${
          isDragging ? "dragging" : ""
        }`}
        onPointerCancel={endDrag}
        onPointerDown={handlePointerDown}
        onPointerLeave={endDrag}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        ref={frameRef}
        role="img"
      >
        {image ? (
          <canvas className="block h-full w-full" ref={canvasRef} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#9fb0b8]">
            <CropIcon className="h-8 w-8" />
            <p className="text-sm font-bold">画像を読み込むとここに表示されます</p>
          </div>
        )}

        <div className="xcs-guides" aria-hidden="true">
          {GUIDE_POSITIONS[splitCount].map((position) => (
            <span
              className="xcs-guide-line"
              key={position}
              style={{ left: `${position}%` }}
            />
          ))}
          {Array.from({ length: splitCount }, (_, index) => index + 1).map(
            (panelNumber) => (
              <span
                className="xcs-guide-number"
                key={panelNumber}
                style={{
                  left: `${((panelNumber - 0.5) / splitCount) * 100}%`
                }}
              >
                {panelNumber}
              </span>
            )
          )}
        </div>
      </div>

      {showQualityWarning ? (
        <p className="text-xs text-[#a97a3a]">
          ※ 元画像より拡大しているため、出力画質が低下する可能性があります。
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          aria-label="縮小"
          className="xcs-icon-button rounded-lg"
          disabled={!image}
          onClick={() =>
            image && onZoomTo(transform.scale / 1.2, OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2)
          }
          type="button"
        >
          <ZoomIcon className="mx-auto h-4 w-4" out />
        </button>

        <input
          aria-label="ズーム"
          className="h-1.5 flex-1 accent-[#3f8092]"
          disabled={!image}
          max={bounds.max}
          min={bounds.min}
          onChange={(event) =>
            image &&
            onZoomTo(Number(event.target.value), OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2)
          }
          step={(bounds.max - bounds.min) / 200 || 0.001}
          type="range"
          value={transform.scale}
        />

        <button
          aria-label="拡大"
          className="xcs-icon-button rounded-lg"
          disabled={!image}
          onClick={() =>
            image && onZoomTo(transform.scale * 1.2, OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2)
          }
          type="button"
        >
          <ZoomIcon className="mx-auto h-4 w-4" />
        </button>

        <span className="w-12 text-right text-xs font-bold text-[#5c7078]">
          {image ? `${zoomPercent}%` : "—"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="xcs-panel-button flex items-center gap-1.5 rounded-lg text-xs"
          disabled={!image}
          onClick={onFit}
          type="button"
        >
          <FitIcon className="h-3.5 w-3.5" />
          枠に合わせる
        </button>
        <button
          className="xcs-panel-button rounded-lg text-xs"
          disabled={!image}
          onClick={onOneToOne}
          type="button"
        >
          100%
        </button>
        <button
          className="xcs-panel-button flex items-center gap-1.5 rounded-lg text-xs"
          disabled={!image}
          onClick={onReset}
          type="button"
        >
          <ResetIcon className="h-3.5 w-3.5" />
          リセット
        </button>
      </div>
    </div>
  );
}
