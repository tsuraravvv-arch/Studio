"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  blinkConfig,
  blinkDisabledExpressions,
  directionalExpressions,
  eyeReflectionConfig,
  expressionById,
  fullFrameBlinkDirections,
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

function targetDirectionFromMouse(
  mouseX: number,
  mouseY: number,
  availableDirections: Partial<Record<DirectionId, string>>
): DirectionId {
  const isHorizontallyCentered = mouseX >= 0.28 && mouseX <= 0.72;
  const isLookingLeft = mouseX < 0.3;
  const isLookingRight = mouseX > 0.7;
  const canUseUp = Boolean(availableDirections.up15);
  const canUseDown = Boolean(availableDirections.down15);

  if (canUseUp && mouseY < 0.28) {
    if (isLookingLeft && availableDirections.upLeft15) {
      return "upLeft15";
    }

    if (isLookingRight && availableDirections.upRight15) {
      return "upRight15";
    }

    if (isHorizontallyCentered) {
      return "up15";
    }
  }

  if (canUseDown && mouseY > 0.72) {
    if (isLookingLeft && availableDirections.downLeft15) {
      return "downLeft15";
    }

    if (isLookingRight && availableDirections.downRight15) {
      return "downRight15";
    }

    if (isHorizontallyCentered) {
      return "down15";
    }
  }

  if (isLookingLeft) {
    return "left15";
  }

  if (isLookingRight) {
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
  const [blinkHoldMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).has("blink_hold");
  });
  const blinkTimeoutRefs = useRef<number[]>([]);
  const talkTimeoutRef = useRef<number | undefined>(undefined);
  const directionTimeoutRef = useRef<number | undefined>(undefined);
  const pendingDirectionRef = useRef<DirectionId>("front");

  const canUseDirectionalImage = toggles.mouseFollow;
  const availableDirectionalImages = directionalExpressions[expressionId];
  const blinkAssetSrc = resolveBlinkAssetSrc(expressionId, directionId);
  const canBlink =
    toggles.blink &&
    Boolean(blinkAssetSrc) &&
    !blinkDisabledExpressions.includes(expressionId);
  const effectiveIsBlinking = canBlink && (blinkHoldMode || isBlinking);

  const [wasDirectionalImageEnabled, setWasDirectionalImageEnabled] =
    useState(canUseDirectionalImage);
  if (canUseDirectionalImage !== wasDirectionalImageEnabled) {
    setWasDirectionalImageEnabled(canUseDirectionalImage);
    if (!canUseDirectionalImage) {
      setDirectionId("front");
    }
  }

  const [prevCanBlink, setPrevCanBlink] = useState(canBlink);
  if (canBlink !== prevCanBlink) {
    setPrevCanBlink(canBlink);
    setIsBlinking(false);
  }

  const [wasTalkEnabled, setWasTalkEnabled] = useState(toggles.talk);
  if (toggles.talk !== wasTalkEnabled) {
    setWasTalkEnabled(toggles.talk);
    if (!toggles.talk) {
      setTalkFrame("closed");
    }
  }

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
      const nextMouseY = Math.min(
        1,
        Math.max(0, event.clientY / window.innerHeight)
      );
      setMouseX(nextMouseX);

      if (!canUseDirectionalImage) {
        return;
      }

      const nextTarget = targetDirectionFromMouse(
        nextMouseX,
        nextMouseY,
        toggles.talk ? { front: availableDirectionalImages.front } : availableDirectionalImages
      );

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
  }, [availableDirectionalImages, canUseDirectionalImage, directionId, toggles.talk]);

  useEffect(() => {
    if (!canUseDirectionalImage) {
      window.clearTimeout(directionTimeoutRef.current);
      pendingDirectionRef.current = "front";
    }
  }, [canUseDirectionalImage]);

  useEffect(() => {
    clearBlinkTimeouts();

    if (!canBlink || blinkHoldMode) {
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
  }, [blinkHoldMode, canBlink]);

  useEffect(() => {
    window.clearTimeout(talkTimeoutRef.current);

    if (!toggles.talk) {
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

    scheduleTalk();

    return () => window.clearTimeout(talkTimeoutRef.current);
  }, [toggles.talk]);

  const shouldUseFullFrameBlink =
    effectiveIsBlinking &&
    ((expressionId === "normal" &&
      fullFrameBlinkDirections.includes(directionId)) ||
      (expressionId === "embarrassed" &&
        (directionId === "up15" || directionId === "down15")) ||
      (expressionId === "jitome" && directionId === "down15") ||
      (expressionId === "surprised" && directionId === "up15")) &&
    Boolean(blinkAssetSrc);

  const baseImageSrc = useMemo(() => {
    if (shouldUseFullFrameBlink && blinkAssetSrc) {
      return blinkAssetSrc;
    }

    if (canUseDirectionalImage) {
      return (
        directionalExpressions[expressionId][directionId] ??
        directionalExpressions[expressionId].front
      );
    }

    return expressionById[expressionId].src;
  }, [
    blinkAssetSrc,
    canUseDirectionalImage,
    directionId,
    expressionId,
    shouldUseFullFrameBlink
  ]);

  const eyeOverlaySrc =
    effectiveIsBlinking && !shouldUseFullFrameBlink ? blinkAssetSrc : undefined;
  const canUseGenericMouth =
    !expressionsWithoutGenericMouth.includes(expressionId);
  const mouthOverlaySrc =
    toggles.talk && canUseGenericMouth && talkFrame !== "closed"
      ? talkMouthAssets[directionId]?.[talkFrame]
      : undefined;
  const enableEyeReflection =
    toggles.eyeReflection &&
    expressionId === "normal" &&
    !effectiveIsBlinking &&
    Boolean(eyeReflectionConfig.irises[directionId]) &&
    !eyeReflectionConfig.disabledExpressions.includes(expressionId);
  const eyeReflection = useMemo(
    () => ({
      ...eyeReflectionConfig,
      enabled: enableEyeReflection,
      iris: eyeReflectionConfig.irises[directionId] ?? eyeReflectionConfig.irises.front!
    }),
    [directionId, enableEyeReflection]
  );

  const handleToggle = (key: keyof ViewerToggles) => {
    if (key === "talk" && !toggles.talk) {
      window.clearTimeout(directionTimeoutRef.current);
      pendingDirectionRef.current = "front";
      setDirectionId("front");
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
            isBlinking={effectiveIsBlinking}
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


