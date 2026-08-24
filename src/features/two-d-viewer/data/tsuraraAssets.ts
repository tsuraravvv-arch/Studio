import type {
  DirectionDefinition,
  DirectionId,
  ExpressionDefinition,
  ExpressionId,
  IrisReflectionRegion,
  MouthFrameId,
  OverlayRegion
} from "../types/viewer";

const expressionBase = "/assets/tsurara/expressions";
const directionBase = "/assets/tsurara/directions";

export const expressions: ExpressionDefinition[] = [
  {
    id: "normal",
    label: "通常",
    src: `${expressionBase}/tsurara_front_master.png`
  },
  {
    id: "smile",
    label: "笑顔",
    src: `${expressionBase}/tsurara_front_smile.png`
  },
  {
    id: "embarrassed",
    label: "照れ",
    src: `${expressionBase}/tsurara_front_embarrassed.png`
  },
  {
    id: "troubled",
    label: "困り",
    src: `${expressionBase}/tsurara_front_troubled.png`
  },
  {
    id: "jitome",
    label: "ジト目",
    src: `${expressionBase}/tsurara_front_slyeyes.png`
  },
  {
    id: "surprised",
    label: "びっくり",
    src: `${expressionBase}/tsurara_surprised_front.png`
  },
  {
    id: "exasperated",
    label: "あきれ",
    src: `${expressionBase}/tsurara_exasperated_front.png`
  },
  {
    id: "sleepy",
    label: "眠そう",
    src: `${expressionBase}/tsurara_sleepy_front.png`
  },
  {
    id: "depressed",
    label: "しょんぼり",
    src: `${expressionBase}/tsurara_front_dejected.png`
  },
  {
    id: "relaxed",
    label: "リラックス",
    src: `${expressionBase}/tsurara_front_relaxed.png`
  },
  {
    id: "softSmile",
    label: "微笑み",
    src: `${expressionBase}/tsurara_front_softsmile.png`
  }
];

export const expressionById = Object.fromEntries(
  expressions.map((expression) => [expression.id, expression])
) as Record<ExpressionId, ExpressionDefinition>;

export const directionalExpressions: Record<
  ExpressionId,
  Record<DirectionId, string>
> = {
  normal: {
    left15: `${directionBase}/tsurara_left15_master.png`,
    front: `${expressionBase}/tsurara_front_master.png`,
    right15: `${directionBase}/tsurara_right15_master.png`
  },
  smile: {
    left15: `${directionBase}/tsurara_left15_smile.png`,
    front: `${expressionBase}/tsurara_front_smile.png`,
    right15: `${directionBase}/tsurara_right15_smile.png`
  },
  embarrassed: {
    left15: `${directionBase}/tsurara_left15_embarrassed.png`,
    front: `${expressionBase}/tsurara_front_embarrassed.png`,
    right15: `${directionBase}/tsurara_right15_embarrassed.png`
  },
  troubled: {
    left15: `${directionBase}/tsurara_left15_troubled.png`,
    front: `${expressionBase}/tsurara_front_troubled.png`,
    right15: `${directionBase}/tsurara_right15_troubled.png`
  },
  jitome: {
    left15: `${directionBase}/tsurara_left15_slyeyes.png`,
    front: `${expressionBase}/tsurara_front_slyeyes.png`,
    right15: `${directionBase}/tsurara_right15_slyeyes.png`
  },
  surprised: {
    left15: `${directionBase}/tsurara_surprised_left15.png`,
    front: `${expressionBase}/tsurara_surprised_front.png`,
    right15: `${directionBase}/tsurara_surprised_right15.png`
  },
  exasperated: {
    left15: `${directionBase}/tsurara_exasperated_left15.png`,
    front: `${expressionBase}/tsurara_exasperated_front.png`,
    right15: `${directionBase}/tsurara_exasperated_right15.png`
  },
  sleepy: {
    left15: `${directionBase}/tsurara_sleepy_left15.png`,
    front: `${expressionBase}/tsurara_sleepy_front.png`,
    right15: `${directionBase}/tsurara_sleepy_right15.png`
  },
  depressed: {
    left15: `${directionBase}/tsurara_left15_dejected.png`,
    front: `${expressionBase}/tsurara_front_dejected.png`,
    right15: `${directionBase}/tsurara_right15_dejected.png`
  },
  relaxed: {
    left15: `${directionBase}/tsurara_left15_relaxed.png`,
    front: `${expressionBase}/tsurara_front_relaxed.png`,
    right15: `${directionBase}/tsurara_right15_relaxed.png`
  },
  softSmile: {
    left15: `${directionBase}/tsurara_left15_softsmile.png`,
    front: `${expressionBase}/tsurara_front_softsmile.png`,
    right15: `${directionBase}/tsurara_right15_softsmile.png`
  }
};

export const blinkAssets: Record<DirectionId, string> = {
  left15: `${directionBase}/tsurara_blink_left15.png`,
  front: `${expressionBase}/tsurara_blink_front.png`,
  right15: `${directionBase}/tsurara_blink_right15.png`
};

export const blinkAssetsByExpression: Partial<
  Record<ExpressionId, Record<DirectionId, string>>
> = {
  embarrassed: {
    left15: `${directionBase}/tsurara_blink_embarrassed_left15.png`,
    front: `${expressionBase}/tsurara_blink_embarrassed_front.png`,
    right15: `${directionBase}/tsurara_blink_embarrassed_right15.png`
  },
  smile: {
    left15: `${directionBase}/tsurara_blink_smile_left15.png`,
    front: `${expressionBase}/tsurara_blink_smile_front.png`,
    right15: `${directionBase}/tsurara_blink_smile_right15.png`
  },
  softSmile: {
    left15: `${directionBase}/tsurara_blink_softsmile_left15.png`,
    front: `${expressionBase}/tsurara_blink_softsmile_front.png`,
    right15: `${directionBase}/tsurara_blink_softsmile_right15.png`
  },
  surprised: {
    left15: `${directionBase}/tsurara_blink_surprised_left15.png`,
    front: `${expressionBase}/tsurara_blink_surprised_front.png`,
    right15: `${directionBase}/tsurara_blink_surprised_right15.png`
  },
  depressed: {
    left15: `${directionBase}/tsurara_blink_depressed_left15.png`,
    front: `${expressionBase}/tsurara_blink_depressed_front.png`,
    right15: `${directionBase}/tsurara_blink_depressed_right15.png`
  }
};

export function resolveBlinkAssetSrc(
  expressionId: ExpressionId,
  directionId: DirectionId
): string {
  return (
    blinkAssetsByExpression[expressionId]?.[directionId] ??
    blinkAssets[directionId]
  );
}

export const blinkConfig = {
  minInterval: 3000,
  maxInterval: 7000,
  closeMsMin: 60,
  closeMsMax: 90,
  holdMsMin: 40,
  holdMsMax: 80,
  openMsMin: 70,
  openMsMax: 110,
  doubleBlinkChance: 0.12,
  doubleBlinkDelayMin: 150,
  doubleBlinkDelayMax: 400
} as const;

export const blinkDisabledExpressions: ExpressionId[] = [];

export const talkExpressions = {
  talkA: `${expressionBase}/tsurara_front_talk_a.png`,
  talkB: `${expressionBase}/tsurara_front_talk_b.png`
} as const;

export const talkMouthAssets: Record<
  DirectionId,
  Partial<Record<MouthFrameId, string>>
> = {
  front: {
    a: `${expressionBase}/tsurara_mouth_a_front.png`,
    i: `${expressionBase}/tsurara_mouth_i_front.png`,
    u: `${expressionBase}/tsurara_mouth_u_front.png`,
    e: `${expressionBase}/tsurara_mouth_e_front.png`,
    o: `${expressionBase}/tsurara_mouth_o_front.png`
  },
  left15: {
    a: `${directionBase}/tsurara_left15_a.png`,
    i: `${directionBase}/tsurara_left15_i.png`,
    u: `${directionBase}/tsurara_left15_u.png`,
    e: `${directionBase}/tsurara_left15_e.png`,
    o: `${directionBase}/tsurara_left15_o.png`
  },
  right15: {
    a: `${directionBase}/tsurara_right15_a.png`,
    i: `${directionBase}/tsurara_right15_i.png`,
    u: `${directionBase}/tsurara_right15_u.png`,
    e: `${directionBase}/tsurara_right15_e.png`,
    o: `${directionBase}/tsurara_right15_o.png`
  }
};

export const overlayRegions: {
  eye: Record<DirectionId, OverlayRegion>;
  mouth: OverlayRegion;
} = {
  eye: {
    left15: {
      xRatio: 0.435,
      yRatio: 0.322,
      widthRatio: 0.155,
      heightRatio: 0.105
    },
    front: {
      xRatio: 0.515,
      yRatio: 0.295,
      widthRatio: 0.22,
      heightRatio: 0.14
    },
    right15: {
      xRatio: 0.585,
      yRatio: 0.322,
      widthRatio: 0.168,
      heightRatio: 0.105
    }
  },
  mouth: {
    xRatio: 0.45,
    yRatio: 0.435,
    widthRatio: 0.135,
    heightRatio: 0.065
  }
};

export const blinkOverlayRegionsByExpression: Partial<
  Record<ExpressionId, Partial<Record<DirectionId, OverlayRegion>>>
> = {
  embarrassed: {
    front: {
      xRatio: 0.536,
      yRatio: 0.235,
      widthRatio: 0.148,
      heightRatio: 0.151
    }
  },
  smile: {
    front: {
      xRatio: 0.538,
      yRatio: 0.313,
      widthRatio: 0.143,
      heightRatio: 0.073
    },
    right15: {
      xRatio: 0.638,
      yRatio: 0.314,
      widthRatio: 0.117,
      heightRatio: 0.08
    }
  },
  softSmile: {
    front: {
      xRatio: 0.5405,
      yRatio: 0.3115,
      widthRatio: 0.1372,
      heightRatio: 0.0698
    },
    left15: {
      xRatio: 0.4282,
      yRatio: 0.3204,
      widthRatio: 0.1556,
      heightRatio: 0.0732
    },
    right15: {
      xRatio: 0.6354,
      yRatio: 0.3149,
      widthRatio: 0.116,
      heightRatio: 0.0787
    }
  },
  surprised: {
    front: {
      xRatio: 0.5433,
      yRatio: 0.3046,
      widthRatio: 0.1335,
      heightRatio: 0.0746
    },
    left15: {
      xRatio: 0.4337,
      yRatio: 0.3142,
      widthRatio: 0.1436,
      heightRatio: 0.0746
    },
    right15: {
      xRatio: 0.6427,
      yRatio: 0.3059,
      widthRatio: 0.1142,
      heightRatio: 0.0856
    }
  },
  depressed: {
    front: {
      xRatio: 0.5396,
      yRatio: 0.3377,
      widthRatio: 0.1234,
      heightRatio: 0.0608
    },
    left15: {
      xRatio: 0.4282,
      yRatio: 0.3564,
      widthRatio: 0.1455,
      heightRatio: 0.0573
    },
    right15: {
      xRatio: 0.628,
      yRatio: 0.3474,
      widthRatio: 0.1179,
      heightRatio: 0.0559
    }
  }
};

export function resolveBlinkOverlayRegion(
  expressionId: ExpressionId,
  directionId: DirectionId
): OverlayRegion {
  return (
    blinkOverlayRegionsByExpression[expressionId]?.[directionId] ??
    overlayRegions.eye[directionId]
  );
}

export const eyeReflectionConfig = {
  enabled: true,
  baseOpacity: 0.38,
  sweepMinInterval: 900,
  sweepMaxInterval: 1700,
  sweepDurationMin: 350,
  sweepDurationMax: 600,
  sweepMaxOpacity: 0.58,
  moveMinPx: 1,
  moveMaxPx: 3,
  scaleMin: 1,
  scaleMax: 1.12,
  disabledExpressions: ["jitome", "sleepy"] as ExpressionId[],
  irises: {
    left15: {
      centerXRatio: 0.584,
      centerYRatio: 0.349,
      radiusXRatio: 0.037,
      radiusYRatio: 0.042,
      rotation: -0.18
    },
    front: {
      centerXRatio: 0.607,
      centerYRatio: 0.348,
      radiusXRatio: 0.04,
      radiusYRatio: 0.045,
      rotation: -0.2
    },
    right15: {
      centerXRatio: 0.665,
      centerYRatio: 0.349,
      radiusXRatio: 0.036,
      radiusYRatio: 0.041,
      rotation: -0.22
    }
  } satisfies Record<DirectionId, IrisReflectionRegion>
} as const;

export const directions: DirectionDefinition[] = [
  {
    id: "left15",
    label: "左15°",
    src: `${directionBase}/tsurara_left15_master.png`
  },
  {
    id: "front",
    label: "正面",
    src: `${expressionBase}/tsurara_front_master.png`
  },
  {
    id: "right15",
    label: "右15°",
    src: `${directionBase}/tsurara_right15_master.png`
  }
];
