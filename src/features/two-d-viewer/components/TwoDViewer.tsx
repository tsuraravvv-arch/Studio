"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  blinkConfig,
  blinkDisabledExpressions,
  directionalExpressions,
  eyeReflectionConfig,
  expressionById,
  overlayRegions,
  resolveBlinkAssetSrc,
  resolveBlinkOverlayRegion,
  talkMouthAssets
} from "../data/tsuraraAssets";
import type {
  DirectionId,
  ExpressionId,
  MouthFrameId,
  ViewerToggles
} from "../types/viewer";
import { randomBetween } from "../../../shared/random";
import { StatusBadge } from "./StatusBadge";
import { TsuraraStage } from "./TsuraraStage";
import { ViewerControls } from "./ViewerControls";

const initialToggles: ViewerToggles = {
  blink: true,
  eyeReflection: true,
  mouseFollow: true,
  talk: false
};

const talkFrames: MouthFrameId[] = [
  "a",
  "i",
  "u",
  "e",
  "o",
  "closed"
];

const expressionsWithoutGenericMouth: ExpressionId[] = [
  "embarrassed",
  "depressed",
  "relaxed"
];

function targetDirectionFromMouse(mouseX: number): DirectionId {
  if (mouseX < 0.3) {
    return "left15";
  }

  if (mouseX > 0.7) {
    return "right15";
  }

  return "front";
}

export function TwoDViewer() {
  const [expressionId, setExpressionId] = useState<ExpressionId>("normal");
  const [directionId, setDirectionId] = useState<DirectionId>("front");
  const [toggles, setToggles] = useState<ViewerToggles>(initialToggles);
  const [mouseX, setMouseX] = useState(0.5);
  const [isBlinking, setIsBlinking] = useState(false);
  const [talkFrame, setTalkFrame] = useState<MouthFrameId>("closed");
  const blinkTimeoutRefs = useRef<number[]>([]);
  const talkTimeoutRef = useRef<number | undefined>(undefined);
  const directionTimeoutRef = useRef<number | undefined>(undefined);
  const pendingDirectionRef = useRef<DirectionId>("front");

  const canUseDirectionalImage = toggles.mouseFollow;
  const canBlink =
    toggles.blink && !blinkDisabledExpressions.includes(expressionId);

  const clearBlinkTimeouts = () => {
    blinkTimeoutRefs.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    blinkTimeoutRefs.current = [];
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const nextMouseX = Math.min(
        1,
        Math.max(0, event.clientX / window.innerWidth)
      );
      setMouseX(nextMouseX);

      if (!canUseDirectionalImage) {
        return;
      }

      const nextTarget = targetDirectionFromMouse(nextMouseX);

      if (nextTarget === directionId) {
        pendingDirectionRef.current = nextTarget;
        window.clearTimeout(directionTimeoutRef.current);
        return;
      }

      if (pendingDirectionRef.current === nextTarget) {
        return;
      }

      pendingDirectionRef.current = nextTarget;
      window.clearTimeout(directionTimeoutRef.current);
      directionTimeoutRef.current = window.setTimeout(() => {
        setDirectionId(nextTarget);
      }, 210);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.clearTimeout(directionTimeoutRef.current);
    };
  }, [canUseDirectionalImage, directionId]);

  useEffect(() => {
    if (!canUseDirectionalImage) {
      window.clearTimeout(directionTimeoutRef.current);
      pendingDirectionRef.current = "front";
      setDirectionId("front");
    }
  }, [canUseDirectionalImage]);

  useEffect(() => {
    clearBlinkTimeouts();
    setIsBlinking(false);

    if (!canBlink) {
      return;
    }

    let disposed = false;

    const queueTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        blinkTimeoutRefs.current = blinkTimeoutRefs.current.filter(
          (currentId) => currentId !== timeoutId
        );
        callback();
      }, delay);
      blinkTimeoutRefs.current.push(timeoutId);
    };

    const runBlink = (onDone: () => void) => {
      const visibleMs =
        randomBetween(blinkConfig.closeMsMin, blinkConfig.closeMsMax) +
        randomBetween(blinkConfig.holdMsMin, blinkConfig.holdMsMax) +
        randomBetween(blinkConfig.openMsMin, blinkConfig.openMsMax);

      setIsBlinking(true);
      queueTimeout(() => {
        setIsBlinking(false);
        onDone();
      }, visibleMs);
    };

    const scheduleBlink = () => {
      queueTimeout(() => {
        if (disposed) {
          return;
        }

        runBlink(() => {
          if (Math.random() < blinkConfig.doubleBlinkChance) {
            queueTimeout(() => {
              runBlink(scheduleBlink);
            }, randomBetween(blinkConfig.doubleBlinkDelayMin, blinkConfig.doubleBlinkDelayMax));
            return;
          }

          scheduleBlink();
        });
      }, randomBetween(blinkConfig.minInterval, blinkConfig.maxInterval));
    };

    scheduleBlink();

    return () => {
      disposed = true;
      clearBlinkTimeouts();
    };
  }, [canBlink]);

  useEffect(() => {
    window.clearTimeout(talkTimeoutRef.current);

    if (!toggles.talk) {
      setTalkFrame("closed");
      return;
    }

    const pickNextTalkFrame = (current: MouthFrameId): MouthFrameId => {
      const nextFrames =
        Math.random() < 0.18
          ? talkFrames.filter((frame) => frame === "closed" || frame !== current)
          : talkFrames.filter((frame) => frame !== current);
      return nextFrames[Math.floor(Math.random() * nextFrames.length)];
    };

    const scheduleTalk = () => {
      talkTimeoutRef.current = window.setTimeout(() => {
        setTalkFrame((current) => pickNextTalkFrame(current));
        scheduleTalk();
      }, randomBetween(190, 360));
    };

    setTalkFrame((current) => pickNextTalkFrame(current));
    scheduleTalk();

    return () => window.clearTimeout(talkTimeoutRef.current);
  }, [toggles.talk]);

  const baseImageSrc = useMemo(() => {
    if (canUseDirectionalImage) {
      return directionalExpressions[expressionId][directionId];
    }

    return expressionById[expressionId].src;
  }, [
    canUseDirectionalImage,
    directionId,
    expressionId
  ]);

  const eyeOverlaySrc = isBlinking
    ? resolveBlinkAssetSrc(expressionId, directionId)
    : undefined;
  const canUseGenericMouth =
    !expressionsWithoutGenericMouth.includes(expressionId);
  const mouthOverlaySrc =
    toggles.talk && canUseGenericMouth && talkFrame !== "closed"
      ? talkMouthAssets[directionId][talkFrame]
      : undefined;
  const enableEyeReflection =
    toggles.eyeReflection &&
    expressionId === "normal" &&
    !isBlinking &&
    !eyeReflectionConfig.disabledExpressions.includes(expressionId);
  const eyeReflection = useMemo(
    () => ({
      ...eyeReflectionConfig,
      enabled: enableEyeReflection,
      iris: eyeReflectionConfig.irises[directionId]
    }),
    [directionId, enableEyeReflection]
  );

  const handleToggle = (key: keyof ViewerToggles) => {
    if (key === "talk" && !toggles.talk) {
      window.clearTimeout(directionTimeoutRef.current);
      setTalkFrame("closed");
    }

    setToggles((current) => ({
      ...current,
      [key]: !current[key]
    }));
  };

  const handleReset = () => {
    window.clearTimeout(directionTimeoutRef.current);
    clearBlinkTimeouts();
    window.clearTimeout(talkTimeoutRef.current);
    pendingDirectionRef.current = "front";
    setExpressionId("normal");
    setDirectionId("front");
    setMouseX(0.5);
    setIsBlinking(false);
    setTalkFrame("closed");
    setToggles(initialToggles);
  };

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div>
          <p className="eyebrow">Tsurara Studio</p>
          <h1>つらら 2D Viewer</h1>
        </div>
        <p>表情と簡易モーションを確認するためのMVPです。</p>
      </header>

      <section className="workspace">
        <div className="character-area">
          <TsuraraStage
            enableMouseTilt={toggles.mouseFollow}
            baseImageSrc={baseImageSrc}
            eyeReflection={eyeReflection}
            eyeOverlaySrc={eyeOverlaySrc}
            isBlinking={isBlinking}
            mouseX={mouseX}
            mouthOverlaySrc={mouthOverlaySrc}
            overlayRegions={{
              eye: resolveBlinkOverlayRegion(expressionId, directionId),
              mouth: overlayRegions.mouth
            }}
          />
          <StatusBadge
            directionId={directionId}
            expressionId={expressionId}
            toggles={toggles}
          />
        </div>

        <ViewerControls
          expressionId={expressionId}
          onExpressionChange={(nextExpression) => {
            window.clearTimeout(directionTimeoutRef.current);
            pendingDirectionRef.current = "front";
            setExpressionId(nextExpression);
            setDirectionId("front");
          }}
          onReset={handleReset}
          onToggle={handleToggle}
          toggles={toggles}
        />
      </section>
    </main>
  );
}

