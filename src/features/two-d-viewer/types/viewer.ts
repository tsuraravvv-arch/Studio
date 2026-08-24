export type ExpressionId =
  | "normal"
  | "smile"
  | "embarrassed"
  | "troubled"
  | "jitome"
  | "surprised"
  | "exasperated"
  | "sleepy"
  | "depressed"
  | "relaxed"
  | "softSmile";

export type DirectionId = "left15" | "front" | "right15";

export type MouthFrameId = "closed" | "a" | "i" | "u" | "e" | "o";

export type ExpressionDefinition = {
  id: ExpressionId;
  label: string;
  src: string;
};

export type DirectionDefinition = {
  id: DirectionId;
  label: string;
  src: string;
};

export type ViewerToggles = {
  blink: boolean;
  eyeReflection: boolean;
  mouseFollow: boolean;
  talk: boolean;
};

export type OverlayRegion = {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
};

export type IrisReflectionRegion = {
  centerXRatio: number;
  centerYRatio: number;
  radiusXRatio: number;
  radiusYRatio: number;
  rotation: number;
};
