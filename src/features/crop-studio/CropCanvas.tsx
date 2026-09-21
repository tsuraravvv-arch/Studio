"use client";

import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction, PointerEvent, KeyboardEvent } from "react";
import { drawCrop, zoomAt } from "./crop";
import type { CropTransform, Size } from "./crop";
import type { SafeArea } from "./presets";
import styles from "./crop-studio.module.css";

type Props = {
  image: HTMLImageElement | null; size: Size; transform: CropTransform;
  onChange: Dispatch<SetStateAction<CropTransform>>; background: string;
  center: boolean; grid: boolean; snap: boolean; safeAreas: SafeArea[];
  maxScale: number;
};

export function CropCanvas({ image, size, transform, onChange, background, center, grid, snap, safeAreas, maxScale }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const rawPosition = useRef({ x: 0, y: 0 });
  const latest = useRef({ transform, size, image, maxScale, onChange });
  useEffect(() => { latest.current = { transform, size, image, maxScale, onChange }; });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Limit preview memory independently of requested export resolution.
    const factor = Math.min(1, 1600 / Math.max(size.width, size.height));
    canvas.width = Math.max(1, Math.round(size.width * factor));
    canvas.height = Math.max(1, Math.round(size.height * factor));
    const ctx = canvas.getContext("2d");
    if (ctx) drawCrop(ctx, image, size, transform, background);
  }, [image, size, transform, background]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const wheel = (event: WheelEvent) => {
      const state = latest.current;
      if (!state.image) return;
      event.preventDefault();
      const rect = frame.getBoundingClientRect();
      const point = { x: (event.clientX - rect.left) / rect.width * state.size.width - state.size.width / 2,
        y: (event.clientY - rect.top) / rect.height * state.size.height - state.size.height / 2 };
      state.onChange(t => zoomAt(t, Math.max(.001, Math.min(state.maxScale, t.scale * Math.exp(-event.deltaY * .002))), point));
    };
    frame.addEventListener("wheel", wheel, { passive: false });
    return () => frame.removeEventListener("wheel", wheel);
  }, []);

  // Clear active gestures when changing the image or the output canvas.
  useEffect(() => { pointers.current.clear(); }, [image, size]);

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous || !image) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const factor = size.width / rect.width;
    const next = { x: event.clientX, y: event.clientY };
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
    pointers.current.set(event.pointerId, next);
    if (other) {
      const distance = Math.hypot(previous.x - other.x, previous.y - other.y);
      const nextDistance = Math.hypot(next.x - other.x, next.y - other.y);
      if (distance < 1) return;
      const anchor = { x: ((previous.x + other.x) / 2 - rect.left) * factor - size.width / 2,
        y: ((previous.y + other.y) / 2 - rect.top) * factor - size.height / 2 };
      onChange(t => {
        const zoomed = zoomAt(t, Math.max(.001, Math.min(maxScale, t.scale * nextDistance / distance)), anchor);
        return { ...zoomed, x: zoomed.x + (next.x - previous.x) * factor / 2, y: zoomed.y + (next.y - previous.y) * factor / 2 };
      });
    } else {
      rawPosition.current.x += (next.x - previous.x) * factor;
      rawPosition.current.y += (next.y - previous.y) * factor;
      const { x, y } = rawPosition.current;
      const threshold = 6 * factor;
      onChange(t => ({ ...t, x: snap && Math.abs(x) < threshold ? 0 : x, y: snap && Math.abs(y) < threshold ? 0 : y }));
    }
  };
  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    rawPosition.current = { x: transform.x, y: transform.y };
  };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!image || !delta) return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 1;
    onChange(t => ({ ...t, x: t.x + delta[0] * step, y: t.y + delta[1] * step }));
  };

  return <div className={styles.stage}>
    <div className={styles.frame} ref={frameRef} style={{ aspectRatio: `${size.width} / ${size.height}`, width: `min(100%, ${480 * size.width / size.height}px)` }}
      tabIndex={0} role="group" aria-label="画像編集キャンバス" aria-describedby="crop-instructions"
      onKeyDown={keyDown} onPointerDown={event => {
        if (!image || (event.pointerType === "mouse" && event.button !== 0) || pointers.current.size >= 2) return;
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        rawPosition.current = { x: transform.x, y: transform.y };
      }} onPointerMove={pointerMove} onPointerUp={endPointer} onPointerCancel={endPointer} onLostPointerCapture={endPointer}>
      <canvas ref={canvasRef} aria-label={`切り抜きプレビュー ${size.width} × ${size.height}px`} />
      {!image && <div className={styles.empty}>画像を読み込むと<br />ここにプレビューが表示されます</div>}
      <div className={styles.guides} aria-hidden="true">
        {center && <><i className={styles.vertical} style={{ left: "50%" }} /><i className={styles.horizontal} style={{ top: "50%" }} /></>}
        {grid && [1, 2].map(n => <span key={n}><i className={`${styles.vertical} ${styles.third}`} style={{ left: `${n * 100 / 3}%` }} /><i className={`${styles.horizontal} ${styles.third}`} style={{ top: `${n * 100 / 3}%` }} /></span>)}
        {safeAreas.map(area => <div key={area.label} className={styles.safeArea} style={{ left: `${area.x / size.width * 100}%`, top: `${area.y / size.height * 100}%`, width: `${area.width / size.width * 100}%`, height: `${area.height / size.height * 100}%` }}><span>{area.label}</span></div>)}
      </div>
    </div>
  </div>;
}
