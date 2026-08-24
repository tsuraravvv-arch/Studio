import { useEffect, useRef, useState } from "react";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture
} from "pixi.js";
import type { IrisReflectionRegion, OverlayRegion } from "../types/viewer";
import { randomBetween } from "../../../shared/random";

type EyeReflectionSettings = {
  enabled: boolean;
  baseOpacity: number;
  sweepMinInterval: number;
  sweepMaxInterval: number;
  sweepDurationMin: number;
  sweepDurationMax: number;
  sweepMaxOpacity: number;
  moveMinPx: number;
  moveMaxPx: number;
  scaleMin: number;
  scaleMax: number;
  iris: IrisReflectionRegion;
};

type TsuraraStageProps = {
  baseImageSrc: string;
  eyeReflection: EyeReflectionSettings;
  eyeOverlaySrc?: string;
  isBlinking: boolean;
  mouthOverlaySrc?: string;
  mouseX: number;
  enableMouseTilt: boolean;
  overlayRegions: {
    eye: OverlayRegion;
    mouth: OverlayRegion;
  };
  transitionMs?: number;
};

type SpriteTransition = {
  from: Sprite;
  to: Sprite;
  elapsed: number;
  duration: number;
};

type PixiRefs = {
  app: Application;
  character: Container;
  base?: Sprite;
  baseTransition?: SpriteTransition;
  eyeOverlay?: Sprite;
  irisBaseReflection?: Graphics;
  irisReflectionSweep?: Graphics;
  irisReflectionMask?: Graphics;
  irisReflectionAnimation?: {
    start: number;
    duration: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    startScale: number;
    endScale: number;
  };
  mouthOverlay?: Sprite;
  sourceSize?: {
    width: number;
    height: number;
  };
};

const missingMessage = "画像素材を public/assets/tsurara に配置してください";
const overlayFadeMs = 55;

function drawSoftEllipse(
  graphic: Graphics,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: number,
  alpha: number
) {
  graphic
    .ellipse(x, y, radiusX * 1.55, radiusY * 1.55)
    .fill({ color, alpha: alpha * 0.08 })
    .ellipse(x, y, radiusX * 1.12, radiusY * 1.12)
    .fill({ color, alpha: alpha * 0.15 })
    .ellipse(x, y, radiusX * 0.74, radiusY * 0.74)
    .fill({ color, alpha: alpha * 0.26 })
    .ellipse(x, y, radiusX * 0.42, radiusY * 0.42)
    .fill({ color, alpha });
}

function createBaseReflectionGraphic(radiusX: number, radiusY: number) {
  const graphic = new Graphics();
  drawSoftEllipse(
    graphic,
    -radiusX * 0.22,
    -radiusY * 0.34,
    radiusX * 0.16,
    radiusY * 0.07,
    0xffffff,
    0.34
  );
  drawSoftEllipse(
    graphic,
    radiusX * 0.1,
    -radiusY * 0.22,
    radiusX * 0.13,
    radiusY * 0.06,
    0xd9ecff,
    0.24
  );
  return graphic;
}

function createSweepReflectionGraphic(radiusX: number, radiusY: number) {
  const graphic = new Graphics();
  drawSoftEllipse(
    graphic,
    0,
    0,
    radiusX * 0.12,
    radiusY * 0.055,
    0xffffff,
    0.56
  );
  drawSoftEllipse(
    graphic,
    radiusX * 0.04,
    radiusY * 0.015,
    radiusX * 0.18,
    radiusY * 0.075,
    0xcde6ff,
    0.18
  );
  return graphic;
}

function regionToFrame(texture: Texture, region: OverlayRegion) {
  return new Rectangle(
    Math.round(texture.width * region.xRatio),
    Math.round(texture.height * region.yRatio),
    Math.round(texture.width * region.widthRatio),
    Math.round(texture.height * region.heightRatio)
  );
}

function createRegionSprite(texture: Texture, region: OverlayRegion) {
  const frame = regionToFrame(texture, region);
  const croppedTexture = new Texture({
    source: texture.source,
    frame
  });
  const sprite = new Sprite(croppedTexture);

  sprite.x = frame.x;
  sprite.y = frame.y;

  return sprite;
}

function fitCharacter(refs: PixiRefs) {
  const { app, character, sourceSize } = refs;

  if (!sourceSize) {
    return;
  }

  const width = app.renderer.width;
  const height = app.renderer.height;
  const usableWidth = Math.max(width - 32, 120);
  const usableHeight = Math.max(height - 24, 160);
  const scale = Math.min(
    usableWidth / sourceSize.width,
    usableHeight / sourceSize.height
  );

  character.pivot.set(sourceSize.width / 2, sourceSize.height / 2);
  character.scale.set(scale);
  character.x = width / 2 - Math.min(width * 0.1, 120);
  character.y = height / 2 + 8;
}

function destroySprite(sprite?: Sprite) {
  if (sprite) {
    sprite.destroy();
  }
}

function fadeOutAndDestroy(sprite: Sprite) {
  const start = performance.now();
  const initialAlpha = sprite.alpha;

  const fadeOut = () => {
    const progress = Math.min((performance.now() - start) / overlayFadeMs, 1);
    sprite.alpha = initialAlpha * (1 - progress);

    if (progress < 1) {
      requestAnimationFrame(fadeOut);
      return;
    }

    destroySprite(sprite);
  };

  requestAnimationFrame(fadeOut);
}

function destroyGraphic(graphic?: Graphics) {
  if (graphic) {
    graphic.destroy();
  }
}

export function TsuraraStage({
  baseImageSrc,
  eyeReflection,
  eyeOverlaySrc,
  isBlinking,
  mouthOverlaySrc,
  mouseX,
  enableMouseTilt,
  overlayRegions,
  transitionMs = 90
}: TsuraraStageProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pixiRef = useRef<PixiRefs | null>(null);
  const baseImageSrcRef = useRef(baseImageSrc);
  const eyeOverlaySrcRef = useRef(eyeOverlaySrc);
  const mouthOverlaySrcRef = useRef(mouthOverlaySrc);
  const mouseXRef = useRef(mouseX);
  const tiltEnabledRef = useRef(enableMouseTilt);
  const isBlinkingRef = useRef(isBlinking);
  const eyeReflectionRef = useRef(eyeReflection);
  const eyeReflectionTimeoutRef = useRef<number | undefined>(undefined);
  const [isPixiReady, setIsPixiReady] = useState(false);
  const [missingAsset, setMissingAsset] = useState(false);
  const [sourceVersion, setSourceVersion] = useState(0);

  useEffect(() => {
    mouseXRef.current = mouseX;
  }, [mouseX]);

  useEffect(() => {
    tiltEnabledRef.current = enableMouseTilt;
  }, [enableMouseTilt]);

  useEffect(() => {
    isBlinkingRef.current = isBlinking;
  }, [isBlinking]);

  useEffect(() => {
    eyeReflectionRef.current = eyeReflection;
  }, [eyeReflection]);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;

    if (!host) {
      return;
    }

    async function setup(target: HTMLDivElement) {
      const app = new Application();
      await app.init({
        resizeTo: target,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2)
      });

      if (disposed) {
        app.destroy();
        return;
      }

      const character = new Container();
      app.stage.addChild(character);
      target.appendChild(app.canvas);
      pixiRef.current = { app, character };
      setIsPixiReady(true);

      app.ticker.add((ticker) => {
        const refs = pixiRef.current;

        if (!refs) {
          return;
        }

        const time = performance.now() / 1000;
        const breath = Math.sin(time * ((Math.PI * 2) / 6)) * 2.2;
        const sway = Math.sin(time * ((Math.PI * 2) / 8.5)) * 0.003;
        const mouseTilt = tiltEnabledRef.current
          ? (mouseXRef.current - 0.5) * 0.007
          : 0;

        fitCharacter(refs);
        refs.character.y += breath;
        refs.character.rotation = sway + mouseTilt;

        if (refs.baseTransition) {
          refs.baseTransition.elapsed += ticker.deltaMS;
          const progress = Math.min(
            refs.baseTransition.elapsed / refs.baseTransition.duration,
            1
          );

          refs.baseTransition.from.alpha = 1 - progress;
          refs.baseTransition.to.alpha = progress;

          if (progress >= 1) {
            refs.character.removeChild(refs.baseTransition.from);
            destroySprite(refs.baseTransition.from);
            refs.base = refs.baseTransition.to;
            refs.baseTransition = undefined;
          }
        }

        const reflectionSettings = eyeReflectionRef.current;
        const baseReflection = refs.irisBaseReflection;
        const reflectionSweep = refs.irisReflectionSweep;

        if (baseReflection || reflectionSweep) {
          const shouldHideReflection =
            !reflectionSettings.enabled ||
            isBlinkingRef.current ||
            !refs.sourceSize;

          if (shouldHideReflection) {
            if (baseReflection) {
              baseReflection.alpha = 0;
            }
            if (reflectionSweep) {
              reflectionSweep.alpha = 0;
            }
            refs.irisReflectionAnimation = undefined;
          } else {
            if (baseReflection) {
              baseReflection.alpha = reflectionSettings.baseOpacity;
            }

            if (reflectionSweep && refs.irisReflectionAnimation) {
              const elapsed =
                performance.now() - refs.irisReflectionAnimation.start;
              const progress = Math.min(
                elapsed / refs.irisReflectionAnimation.duration,
                1
              );
              const fade = Math.sin(progress * Math.PI);
              const moveProgress = progress;
              const scale =
                refs.irisReflectionAnimation.startScale +
                (refs.irisReflectionAnimation.endScale -
                  refs.irisReflectionAnimation.startScale) *
                  fade;

              reflectionSweep.x =
                refs.irisReflectionAnimation.startX +
                (refs.irisReflectionAnimation.endX -
                  refs.irisReflectionAnimation.startX) *
                  moveProgress;
              reflectionSweep.y =
                refs.irisReflectionAnimation.startY +
                (refs.irisReflectionAnimation.endY -
                  refs.irisReflectionAnimation.startY) *
                  moveProgress;
              reflectionSweep.alpha =
                reflectionSettings.sweepMaxOpacity * fade;
              reflectionSweep.scale.set(scale);

              if (progress >= 1) {
                reflectionSweep.alpha = 0;
                reflectionSweep.scale.set(1);
                refs.irisReflectionAnimation = undefined;
              }
            } else if (reflectionSweep) {
              reflectionSweep.alpha = 0;
            }
          }
        }
      });
    }

    void setup(host);

    return () => {
      disposed = true;
      const refs = pixiRef.current;
      pixiRef.current = null;
      setIsPixiReady(false);
      window.clearTimeout(eyeReflectionTimeoutRef.current);
      if (refs) {
        refs.app.destroy(true, { children: true });
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    baseImageSrcRef.current = baseImageSrc;

    async function loadBase() {
      const refs = pixiRef.current;
      if (!refs || !isPixiReady) {
        return;
      }

      try {
        const texture = await Assets.load<Texture>(baseImageSrc);
        if (cancelled || baseImageSrcRef.current !== baseImageSrc) {
          return;
        }

        setMissingAsset(false);
        refs.sourceSize = {
          width: texture.width,
          height: texture.height
        };
        setSourceVersion((current) => current + 1);

        const next = new Sprite(texture);
        next.alpha = refs.base ? 0 : 1;
        refs.character.addChildAt(next, 0);
        fitCharacter(refs);

        if (!refs.base) {
          refs.base = next;
          return;
        }

        if (refs.baseTransition) {
          refs.character.removeChild(refs.baseTransition.from);
          destroySprite(refs.baseTransition.from);
          refs.base = refs.baseTransition.to;
          refs.baseTransition = undefined;
        }

        refs.baseTransition = {
          from: refs.base,
          to: next,
          elapsed: 0,
          duration: transitionMs
        };
      } catch {
        if (!cancelled) {
          setMissingAsset(true);
        }
      }
    }

    void loadBase();

    return () => {
      cancelled = true;
    };
  }, [baseImageSrc, isPixiReady, transitionMs]);

  useEffect(() => {
    let cancelled = false;
    eyeOverlaySrcRef.current = eyeOverlaySrc;

    async function updateEyeOverlay() {
      const refs = pixiRef.current;
      if (!refs || !isPixiReady) {
        return;
      }

      if (!eyeOverlaySrc) {
        if (refs.eyeOverlay) {
          fadeOutAndDestroy(refs.eyeOverlay);
        }
        refs.eyeOverlay = undefined;
        return;
      }

      try {
        const texture = await Assets.load<Texture>(eyeOverlaySrc);
        if (cancelled || eyeOverlaySrcRef.current !== eyeOverlaySrc) {
          return;
        }

        const next = createRegionSprite(texture, overlayRegions.eye);
        next.alpha = 0;
        refs.character.addChild(next);

        const previous = refs.eyeOverlay;
        refs.eyeOverlay = next;

        const start = performance.now();
        const fadeIn = () => {
          if (cancelled || refs.eyeOverlay !== next) {
            return;
          }

          next.alpha = Math.min((performance.now() - start) / overlayFadeMs, 1);

          if (next.alpha < 1) {
            requestAnimationFrame(fadeIn);
          }
        };

        requestAnimationFrame(fadeIn);
        destroySprite(previous);
        setMissingAsset(false);
      } catch {
        if (!cancelled) {
          setMissingAsset(true);
        }
      }
    }

    void updateEyeOverlay();

    return () => {
      cancelled = true;
    };
  }, [eyeOverlaySrc, isPixiReady, overlayRegions.eye]);

  useEffect(() => {
    let cancelled = false;
    mouthOverlaySrcRef.current = mouthOverlaySrc;

    async function updateMouthOverlay() {
      const refs = pixiRef.current;
      if (!refs || !isPixiReady) {
        return;
      }

      if (!mouthOverlaySrc) {
        destroySprite(refs.mouthOverlay);
        refs.mouthOverlay = undefined;
        return;
      }

      try {
        const texture = await Assets.load<Texture>(mouthOverlaySrc);
        if (cancelled || mouthOverlaySrcRef.current !== mouthOverlaySrc) {
          return;
        }

        const next = createRegionSprite(texture, overlayRegions.mouth);
        refs.character.addChild(next);
        destroySprite(refs.mouthOverlay);
        refs.mouthOverlay = next;
        setMissingAsset(false);
      } catch {
        if (!cancelled) {
          setMissingAsset(true);
        }
      }
    }

    void updateMouthOverlay();

    return () => {
      cancelled = true;
    };
  }, [mouthOverlaySrc, isPixiReady, overlayRegions.mouth]);

  useEffect(() => {
    const refs = pixiRef.current;

    if (!refs || !isPixiReady || !refs.sourceSize) {
      return;
    }

    const clearReflection = () => {
      destroyGraphic(refs.irisBaseReflection);
      destroyGraphic(refs.irisReflectionSweep);
      destroyGraphic(refs.irisReflectionMask);
      refs.irisBaseReflection = undefined;
      refs.irisReflectionSweep = undefined;
      refs.irisReflectionMask = undefined;
      refs.irisReflectionAnimation = undefined;
      window.clearTimeout(eyeReflectionTimeoutRef.current);
    };

    if (!eyeReflection.enabled) {
      clearReflection();
      return;
    }

    clearReflection();

    const { sourceSize } = refs;
    const { iris } = eyeReflection;
    const centerX = sourceSize.width * iris.centerXRatio;
    const centerY = sourceSize.height * iris.centerYRatio;
    const radiusX = sourceSize.width * iris.radiusXRatio;
    const radiusY = sourceSize.height * iris.radiusYRatio;

    const reflectionMask = new Graphics()
      .ellipse(0, 0, radiusX, radiusY)
      .fill({ color: 0xffffff, alpha: 1 });
    reflectionMask.x = centerX;
    reflectionMask.y = centerY;
    reflectionMask.rotation = iris.rotation;
    refs.character.addChild(reflectionMask);

    const baseReflection = createBaseReflectionGraphic(radiusX, radiusY);
    baseReflection.x = centerX;
    baseReflection.y = centerY - radiusY * 0.22;
    baseReflection.rotation = iris.rotation - 0.18;
    baseReflection.alpha = eyeReflection.baseOpacity;
    baseReflection.blendMode = "screen";
    baseReflection.mask = reflectionMask;
    refs.character.addChild(baseReflection);

    const reflectionSweep = createSweepReflectionGraphic(radiusX, radiusY);
    reflectionSweep.x = centerX;
    reflectionSweep.y = centerY - radiusY * 0.22;
    reflectionSweep.rotation = iris.rotation - 0.18;
    reflectionSweep.alpha = 0;
    reflectionSweep.blendMode = "screen";
    reflectionSweep.mask = reflectionMask;
    refs.character.addChild(reflectionSweep);

    refs.irisBaseReflection = baseReflection;
    refs.irisReflectionSweep = reflectionSweep;
    refs.irisReflectionMask = reflectionMask;

    const scheduleReflectionSweep = () => {
      window.clearTimeout(eyeReflectionTimeoutRef.current);
      eyeReflectionTimeoutRef.current = window.setTimeout(() => {
        const currentRefs = pixiRef.current;
        const currentSettings = eyeReflectionRef.current;

        if (
          currentRefs?.irisReflectionSweep &&
          currentRefs.sourceSize &&
          currentSettings.enabled &&
          !isBlinkingRef.current
        ) {
          const currentIris = currentSettings.iris;
          const currentCenterX =
            currentRefs.sourceSize.width * currentIris.centerXRatio;
          const currentCenterY =
            currentRefs.sourceSize.height * currentIris.centerYRatio;
          const currentRadiusX =
            currentRefs.sourceSize.width * currentIris.radiusXRatio;
          const currentRadiusY =
            currentRefs.sourceSize.height * currentIris.radiusYRatio;
          const moveDistance = randomBetween(
            currentSettings.moveMinPx,
            currentSettings.moveMaxPx
          );
          const highlightX = currentCenterX - currentRadiusX * 0.22;
          const highlightY = currentCenterY - currentRadiusY * 0.34;

          currentRefs.irisReflectionAnimation = {
            start: performance.now(),
            duration: randomBetween(
              currentSettings.sweepDurationMin,
              currentSettings.sweepDurationMax
            ),
            startX: highlightX - moveDistance * 0.35,
            startY: highlightY - moveDistance * 0.2,
            endX: highlightX + moveDistance * 0.35,
            endY: highlightY + moveDistance * 0.2,
            startScale: currentSettings.scaleMin,
            endScale: currentSettings.scaleMax
          };
        }

        scheduleReflectionSweep();
      }, randomBetween(eyeReflection.sweepMinInterval, eyeReflection.sweepMaxInterval));
    };

    scheduleReflectionSweep();

    return () => {
      window.clearTimeout(eyeReflectionTimeoutRef.current);
    };
  }, [eyeReflection, isPixiReady, sourceVersion]);

  return (
    <div className="viewer-stage" ref={hostRef}>
      {missingAsset ? (
        <div className="asset-message">{missingMessage}</div>
      ) : null}
    </div>
  );
}
