"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getBasename } from "../lib/filename";
import {
  fitTransform,
  OUTPUT_HEIGHT,
  OUTPUT_WIDTH,
  panTransform,
  rescaleAroundWorldPoint
} from "../lib/imageMath";
import { splitImage } from "../lib/splitter";
import type {
  ImageTransform,
  LoadedImage,
  OutputPanel,
  SplitCount
} from "../types";
import "./splitter-design.css";
import { Hero } from "./Hero";
import { ImageEditor } from "./ImageEditor";
import { ImageUploader } from "./ImageUploader";
import { OutputPreview } from "./OutputPreview";
import { PostingGuide } from "./PostingGuide";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SplitControls } from "./SplitControls";

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const VIEWPORT_CENTER = { x: OUTPUT_WIDTH / 2, y: OUTPUT_HEIGHT / 2 };

function loadImageElement(
  file: File
): Promise<{ element: HTMLImageElement; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => resolve({ element, objectUrl });
    element.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("画像を読み込めませんでした。"));
    };
    element.src = objectUrl;
  });
}

export function XCarouselSplitterPage() {
  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const [transform, setTransform] = useState<ImageTransform | null>(null);
  const [splitCount, setSplitCount] = useState<SplitCount>(4);
  const [panels, setPanels] = useState<OutputPanel[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);

  const loadedImageRef = useRef(loadedImage);
  const panelsRef = useRef(panels);

  useEffect(() => {
    loadedImageRef.current = loadedImage;
    panelsRef.current = panels;
  }, [loadedImage, panels]);

  useEffect(
    () => () => {
      if (loadedImageRef.current) {
        URL.revokeObjectURL(loadedImageRef.current.objectUrl);
      }
      panelsRef.current.forEach((panel) => URL.revokeObjectURL(panel.url));
    },
    []
  );

  const handleFileSelected = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.has(file.type)) {
      setUploadError(
        "対応していないファイル形式です。PNG / JPEG / WebP をご利用ください。"
      );
      return;
    }

    setUploadError(null);
    setSplitError(null);

    try {
      const { element, objectUrl } = await loadImageElement(file);

      setLoadedImage((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous.objectUrl);
        }
        return {
          element,
          naturalWidth: element.naturalWidth,
          naturalHeight: element.naturalHeight,
          objectUrl,
          fileName: file.name
        };
      });

      setPanels((previous) => {
        previous.forEach((panel) => URL.revokeObjectURL(panel.url));
        return [];
      });

      setTransform(fitTransform(element.naturalWidth, element.naturalHeight));
    } catch {
      setUploadError("画像を読み込めませんでした。別のファイルをお試しください。");
    }
  }, []);

  const handlePan = useCallback(
    (deltaWorldX: number, deltaWorldY: number) => {
      if (!loadedImage) {
        return;
      }
      setTransform((previous) =>
        previous
          ? panTransform(
              previous,
              deltaWorldX,
              deltaWorldY,
              loadedImage.naturalWidth,
              loadedImage.naturalHeight
            )
          : previous
      );
    },
    [loadedImage]
  );

  const handleZoomTo = useCallback(
    (scale: number, anchorWorldX: number, anchorWorldY: number) => {
      if (!loadedImage) {
        return;
      }
      setTransform((previous) =>
        previous
          ? rescaleAroundWorldPoint(
              previous,
              loadedImage.naturalWidth,
              loadedImage.naturalHeight,
              scale,
              anchorWorldX,
              anchorWorldY
            )
          : previous
      );
    },
    [loadedImage]
  );

  const handleFit = useCallback(() => {
    if (!loadedImage) {
      return;
    }
    const fitScale = fitTransform(
      loadedImage.naturalWidth,
      loadedImage.naturalHeight
    ).scale;
    handleZoomTo(fitScale, VIEWPORT_CENTER.x, VIEWPORT_CENTER.y);
  }, [loadedImage, handleZoomTo]);

  const handleOneToOne = useCallback(() => {
    handleZoomTo(1, VIEWPORT_CENTER.x, VIEWPORT_CENTER.y);
  }, [handleZoomTo]);

  const handleReset = useCallback(() => {
    if (!loadedImage) {
      return;
    }
    setTransform(
      fitTransform(loadedImage.naturalWidth, loadedImage.naturalHeight)
    );
  }, [loadedImage]);

  const handleSplit = useCallback(async () => {
    if (!loadedImage || !transform) {
      return;
    }

    setIsSplitting(true);
    setSplitError(null);

    try {
      const basename = getBasename(loadedImage.fileName);
      const newPanels = await splitImage(
        loadedImage.element,
        loadedImage.naturalWidth,
        loadedImage.naturalHeight,
        transform,
        splitCount,
        basename
      );

      setPanels((previous) => {
        previous.forEach((panel) => URL.revokeObjectURL(panel.url));
        return newPanels;
      });
    } catch (error) {
      setSplitError(
        error instanceof Error ? error.message : "分割に失敗しました。"
      );
    } finally {
      setIsSplitting(false);
    }
  }, [loadedImage, transform, splitCount]);

  return (
    <main className="xcs-page flex min-h-screen flex-col bg-[#fbfdfe] text-[#243241]">
      <SiteHeader />
      <Hero />

      <section className="xcs-workspace mx-auto w-full max-w-6xl px-6 py-10">
        <div className="xcs-workspace-card rounded-3xl border border-[#e3edf0] bg-white p-6 shadow-[0_20px_60px_rgba(59,88,98,0.10)] sm:p-8">
          <div className="xcs-workspace-grid grid gap-8 lg:grid-cols-10">
            <div className="flex flex-col gap-8 lg:col-span-7">
              <ImageUploader
                error={uploadError}
                fileName={loadedImage?.fileName ?? null}
                onFileSelected={handleFileSelected}
              />
              <ImageEditor
                image={loadedImage}
                onFit={handleFit}
                onOneToOne={handleOneToOne}
                onPan={handlePan}
                onReset={handleReset}
                onZoomTo={handleZoomTo}
                splitCount={splitCount}
                transform={
                  transform ?? {
                    scale: 1,
                    offsetX: 0,
                    offsetY: 0
                  }
                }
              />
            </div>

            <div className="lg:col-span-3">
              <SplitControls
                errorMessage={splitError}
                isSplitDisabled={!loadedImage}
                isSplitting={isSplitting}
                onSplit={handleSplit}
                onSplitCountChange={setSplitCount}
                splitCount={splitCount}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="xcs-result-wrap pb-10">
        <OutputPreview panels={panels} splitCount={splitCount} />
      </div>

      <PostingGuide splitCount={splitCount} />
      <SiteFooter />
    </main>
  );
}
