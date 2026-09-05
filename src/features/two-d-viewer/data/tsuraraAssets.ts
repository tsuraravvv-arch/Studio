import type {
  DirectionDefinition,
  DirectionId,
  ExpressionDefinition,
  ExpressionId,
  IrisReflectionRegion,
  MouthFrameId,
  OverlayRegion
} from "../types/viewer";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const expressionBase = `${publicBasePath}/assets/tsurara/expressions`;
const directionBase = `${publicBasePath}/assets/tsurara/directions`;

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
  },
  {
    id: "cheerful",
    label: "楽しげ",
    src: `${expressionBase}/tsurara_front_cheerful.png`
  }
];

export const expressionById = Object.fromEntries(
  expressions.map((expression) => [expression.id, expression])
) as Record<ExpressionId, ExpressionDefinition>;

export const directionalExpressions: Record<
  ExpressionId,
  Partial<Record<DirectionId, string>> & Record<"front", string>
> = {
  normal: {
    left15: `${directionBase}/tsurara_left15_master.png`,
    front: `${expressionBase}/tsurara_front_master.png`,
    right15: `${directionBase}/tsurara_right15_master.png`,
    up15: `${directionBase}/tsurara_up15_master.png`,
    down15: `${directionBase}/tsurara_down15_master.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_master.png`,
    upRight15: `${directionBase}/tsurara_up_right15_master.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_master.png`,
    downRight15: `${directionBase}/tsurara_down_right15_master.png`
  },
  smile: {
    left15: `${directionBase}/tsurara_left15_smile.png`,
    front: `${expressionBase}/tsurara_front_smile.png`,
    right15: `${directionBase}/tsurara_right15_smile.png`,
    up15: `${directionBase}/tsurara_up15_smile.png`,
    down15: `${directionBase}/tsurara_down15_smile.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_smile.png`,
    upRight15: `${directionBase}/tsurara_up_right15_smile_v3.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_smile.png`,
    downRight15: `${directionBase}/tsurara_down_right15_smile_v2.png`
  },
  embarrassed: {
    left15: `${directionBase}/tsurara_left15_embarrassed.png`,
    front: `${expressionBase}/tsurara_front_embarrassed.png`,
    right15: `${directionBase}/tsurara_right15_embarrassed.png`,
    up15: `${directionBase}/tsurara_up15_embarrassed.png`,
    down15: `${directionBase}/tsurara_down15_embarrassed.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_embarrassed.png`,
    upRight15: `${directionBase}/tsurara_up_right15_embarrassed.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_embarrassed.png`,
    downRight15: `${directionBase}/tsurara_down_right15_embarrassed.png`
  },
  troubled: {
    left15: `${directionBase}/tsurara_left15_troubled.png`,
    front: `${expressionBase}/tsurara_front_troubled.png`,
    right15: `${directionBase}/tsurara_right15_troubled.png`,
    up15: `${directionBase}/tsurara_up15_troubled.png`,
    down15: `${directionBase}/tsurara_down15_troubled.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_troubled.png`,
    upRight15: `${directionBase}/tsurara_up_right15_troubled.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_troubled.png`,
    downRight15: `${directionBase}/tsurara_down_right15_troubled.png`
  },
  jitome: {
    left15: `${directionBase}/tsurara_left15_slyeyes_v5.png`,
    front: `${expressionBase}/tsurara_front_slyeyes.png`,
    right15: `${directionBase}/tsurara_right15_slyeyes.png`,
    up15: `${directionBase}/tsurara_up15_slyeyes.png`,
    down15: `${directionBase}/tsurara_down15_slyeyes.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_slyeyes_mouth_v9.png`,
    upRight15: `${directionBase}/tsurara_up_right15_slyeyes_mouth_v11.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_slyeyes_mouth_v11.png`,
    downRight15: `${directionBase}/tsurara_down_right15_slyeyes_v16.png`
  },
  surprised: {
    left15: `${directionBase}/tsurara_surprised_left15.png`,
    front: `${expressionBase}/tsurara_surprised_front.png`,
    right15: `${directionBase}/tsurara_surprised_right15.png`,
    up15: `${directionBase}/tsurara_surprised_up15.png`,
    down15: `${directionBase}/tsurara_surprised_down15.png`,
    upLeft15: `${directionBase}/tsurara_surprised_up_left15.png`,
    upRight15: `${directionBase}/tsurara_surprised_up_right15.png`,
    downLeft15: `${directionBase}/tsurara_surprised_down_left15.png`,
    downRight15: `${directionBase}/tsurara_surprised_down_right15.png`
  },
  exasperated: {
    left15: `${directionBase}/tsurara_exasperated_left15.png`,
    front: `${expressionBase}/tsurara_exasperated_front.png`,
    right15: `${directionBase}/tsurara_exasperated_right15.png`,
    up15: `${directionBase}/tsurara_exasperated_up15.png`,
    down15: `${directionBase}/tsurara_exasperated_down15.png`,
    upLeft15: `${directionBase}/tsurara_exasperated_up_left15.png`,
    upRight15: `${directionBase}/tsurara_exasperated_up_right15.png`,
    downLeft15: `${directionBase}/tsurara_exasperated_down_left15.png`,
    downRight15: `${directionBase}/tsurara_exasperated_down_right15.png`
  },
  sleepy: {
    left15: `${directionBase}/tsurara_sleepy_left15.png`,
    front: `${expressionBase}/tsurara_sleepy_front.png`,
    right15: `${directionBase}/tsurara_sleepy_right15.png`,
    up15: `${directionBase}/tsurara_sleepy_up15.png`,
    down15: `${directionBase}/tsurara_sleepy_down15.png`,
    upLeft15: `${directionBase}/tsurara_sleepy_up_left15.png`,
    upRight15: `${directionBase}/tsurara_sleepy_up_right15.png`,
    downLeft15: `${directionBase}/tsurara_sleepy_down_left15.png`,
    downRight15: `${directionBase}/tsurara_sleepy_down_right15.png`
  },
  depressed: {
    left15: `${directionBase}/tsurara_left15_dejected.png`,
    front: `${expressionBase}/tsurara_front_dejected.png`,
    right15: `${directionBase}/tsurara_right15_dejected.png`,
    up15: `${directionBase}/tsurara_up15_dejected.png`,
    down15: `${directionBase}/tsurara_down15_dejected.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_dejected.png`,
    upRight15: `${directionBase}/tsurara_up_right15_dejected.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_dejected.png`,
    downRight15: `${directionBase}/tsurara_down_right15_dejected.png`
  },
  relaxed: {
    left15: `${directionBase}/tsurara_left15_relaxed.png`,
    front: `${expressionBase}/tsurara_front_relaxed.png`,
    right15: `${directionBase}/tsurara_right15_relaxed.png`,
    up15: `${directionBase}/tsurara_up15_relaxed.png`,
    down15: `${directionBase}/tsurara_down15_relaxed.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_relaxed.png`,
    upRight15: `${directionBase}/tsurara_up_right15_relaxed.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_relaxed.png`,
    downRight15: `${directionBase}/tsurara_down_right15_relaxed.png`
  },
  softSmile: {
    left15: `${directionBase}/tsurara_left15_softsmile.png`,
    front: `${expressionBase}/tsurara_front_softsmile.png`,
    right15: `${directionBase}/tsurara_right15_softsmile.png`,
    up15: `${directionBase}/tsurara_up15_softsmile.png`,
    down15: `${directionBase}/tsurara_down15_softsmile.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_softsmile.png`,
    upRight15: `${directionBase}/tsurara_up_right15_softsmile.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_softsmile_v2.png`,
    downRight15: `${directionBase}/tsurara_down_right15_softsmile.png`
  },
  cheerful: {
    left15: `${directionBase}/tsurara_left15_cheerful.png`,
    front: `${expressionBase}/tsurara_front_cheerful.png`,
    right15: `${directionBase}/tsurara_right15_cheerful.png`,
    up15: `${directionBase}/tsurara_up15_cheerful.png`,
    down15: `${directionBase}/tsurara_down15_cheerful.png`,
    upLeft15: `${directionBase}/tsurara_up_left15_cheerful.png`,
    upRight15: `${directionBase}/tsurara_up_right15_cheerful.png`,
    downLeft15: `${directionBase}/tsurara_down_left15_cheerful.png`,
    downRight15: `${directionBase}/tsurara_down_right15_cheerful.png`
  }
};

export const blinkAssets: Partial<Record<DirectionId, string>> = {
  left15: `${directionBase}/tsurara_blink_left15.png`,
  front: `${expressionBase}/tsurara_blink_front.png`,
  right15: `${directionBase}/tsurara_blink_right15.png`,
  up15: `${directionBase}/tsurara_blink_up15.png`,
  down15: `${directionBase}/tsurara_blink_down15.png`,
  upLeft15: `${directionBase}/tsurara_blink_up_left15.png`,
  upRight15: `${directionBase}/tsurara_blink_up_right15.png`,
  downLeft15: `${directionBase}/tsurara_blink_down_left15.png`,
  downRight15: `${directionBase}/tsurara_blink_down_right15.png`
};

export const fullFrameBlinkDirections: DirectionId[] = [
  "upLeft15",
  "upRight15",
  "downLeft15",
  "downRight15"
];

export const blinkAssetsByExpression: Partial<
  Record<ExpressionId, Partial<Record<DirectionId, string>>>
> = {
  normal: {
    upLeft15: `${directionBase}/tsurara_blink_up_left15_patch_v8.png`,
    upRight15: `${directionBase}/tsurara_blink_up_right15_patch_v11.png`,
    downLeft15: `${directionBase}/tsurara_blink_down_left15_v11.png`,
    downRight15: `${directionBase}/tsurara_blink_down_right15_patch_v4.png`
  },
  embarrassed: {
    left15: `${directionBase}/tsurara_blink_embarrassed_left15.png`,
    front: `${expressionBase}/tsurara_blink_embarrassed_front.png`,
    right15: `${directionBase}/tsurara_blink_embarrassed_right15.png`,
    up15: `${directionBase}/tsurara_blink_embarrassed_up15_patch_v5.png`,
    down15: `${directionBase}/tsurara_blink_embarrassed_down15_patch_v5.png`,
    upLeft15: `${directionBase}/tsurara_blink_up_left15_embarrassed_patch_v5.png`,
    upRight15: `${directionBase}/tsurara_blink_up_right15_embarrassed_patch_v12.png`,
    downLeft15: `${directionBase}/tsurara_blink_down_left15_embarrassed_patch_v5.png`,
    downRight15: `${directionBase}/tsurara_blink_down_right15_embarrassed_patch_v6.png`
  },
  smile: {
    left15: `${directionBase}/tsurara_blink_smile_left15.png`,
    front: `${expressionBase}/tsurara_blink_smile_front.png`,
    right15: `${directionBase}/tsurara_blink_smile_right15.png`,
    upLeft15: `${directionBase}/tsurara_blink_up_left15_smile_patch_v8.png`,
    upRight15: `${directionBase}/tsurara_blink_up_right15_smile_patch_v8.png`,
    downLeft15: `${directionBase}/tsurara_blink_down_left15_smile_patch_v8.png`,
    downRight15: `${directionBase}/tsurara_blink_down_right15_smile_patch_v9.png`
  },
  softSmile: {
    left15: `${directionBase}/tsurara_blink_softsmile_left15.png`,
    front: `${expressionBase}/tsurara_blink_softsmile_front.png`,
    right15: `${directionBase}/tsurara_blink_softsmile_right15.png`,
    upLeft15: `${directionBase}/tsurara_blink_up_left15_softsmile.png`,
    upRight15: `${directionBase}/tsurara_blink_up_right15_softsmile.png`,
    downLeft15: `${directionBase}/tsurara_blink_down_left15_softsmile.png`,
    downRight15: `${directionBase}/tsurara_blink_down_right15_softsmile.png`
  },
  troubled: {
    upLeft15: `${directionBase}/tsurara_blink_up_left15_troubled_patch_v10.png`,
    upRight15: `${directionBase}/tsurara_blink_up_right15_troubled_patch_v9.png`,
    downLeft15: `${directionBase}/tsurara_blink_down_left15_troubled_patch_v3.png`,
    downRight15: `${directionBase}/tsurara_blink_down_right15_troubled_patch_v15.png`
  },
  jitome: {
    left15: `${directionBase}/tsurara_blink_left15_slyeyes_patch_v5.png`,
    upLeft15: `${directionBase}/tsurara_blink_jitome_up_left15_local_patch_v16.png`,
    upRight15: `${directionBase}/tsurara_blink_jitome_up_right15_local_patch_v16.png`,
    down15: `${directionBase}/tsurara_blink_jitome_down15_local_patch_v16.png`,
    downLeft15: `${directionBase}/tsurara_blink_jitome_down_left15_local_patch_v16.png`,
    downRight15: `${directionBase}/tsurara_blink_jitome_down_right15_local_patch_v16.png`
  },
  surprised: {
    left15: `${directionBase}/tsurara_blink_surprised_left15.png`,
    front: `${expressionBase}/tsurara_blink_surprised_front.png`,
    right15: `${directionBase}/tsurara_blink_surprised_right15.png`,
    up15: `${directionBase}/tsurara_blink_surprised_up15_v2.png`,
    upLeft15: `${directionBase}/tsurara_blink_surprised_up_left15.png`,
    upRight15: `${directionBase}/tsurara_blink_surprised_up_right15.png`,
    downLeft15: `${directionBase}/tsurara_blink_surprised_down_left15.png`,
    downRight15: `${directionBase}/tsurara_blink_surprised_down_right15.png`
  },
  exasperated: {
    upLeft15: `${directionBase}/tsurara_blink_exasperated_up_left15.png`,
    upRight15: `${directionBase}/tsurara_blink_exasperated_up_right15.png`,
    downLeft15: `${directionBase}/tsurara_blink_exasperated_down_left15.png`,
    downRight15: `${directionBase}/tsurara_blink_exasperated_down_right15.png`
  },
  depressed: {
    left15: `${directionBase}/tsurara_blink_depressed_left15.png`,
    front: `${expressionBase}/tsurara_blink_depressed_front.png`,
    right15: `${directionBase}/tsurara_blink_depressed_right15.png`
  },
  cheerful: {
    left15: `${directionBase}/tsurara_blink_cheerful_left15.png`,
    front: `${expressionBase}/tsurara_blink_cheerful_front.png`,
    right15: `${directionBase}/tsurara_blink_cheerful_right15.png`
  }
};

export function resolveBlinkAssetSrc(
  expressionId: ExpressionId,
  directionId: DirectionId
): string | undefined {
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


export const talkMouthAssets: Partial<Record<
  DirectionId,
  Partial<Record<MouthFrameId, string>>
>> = {
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
  eye: Partial<Record<DirectionId, OverlayRegion>>;
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
      yRatio: 0.3135,
      widthRatio: 0.22,
      heightRatio: 0.0649
    },
    right15: {
      xRatio: 0.6308,
      yRatio: 0.317,
      widthRatio: 0.1234,
      heightRatio: 0.0698
    },
    up15: {
      xRatio: 0.543,
      yRatio: 0.261,
      widthRatio: 0.147,
      heightRatio: 0.117
    },
    down15: {
      xRatio: 0.534,
      yRatio: 0.345,
      widthRatio: 0.17,
      heightRatio: 0.094
    },
    upLeft15: {
      xRatio: 0.56,
      yRatio: 0.294,
      widthRatio: 0.17,
      heightRatio: 0.096
    },
    upRight15: {
      xRatio: 0.587,
      yRatio: 0.287,
      widthRatio: 0.15,
      heightRatio: 0.09
    },
    downLeft15: {
      xRatio: 0.555,
      yRatio: 0.328,
      widthRatio: 0.155,
      heightRatio: 0.085
    },
    downRight15: {
      xRatio: 0.572,
      yRatio: 0.329,
      widthRatio: 0.145,
      heightRatio: 0.084
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
  normal: {
    upLeft15: {
      xRatio: 0.49,
      yRatio: 0.27,
      widthRatio: 0.24,
      heightRatio: 0.15
    },
    upRight15: {
      xRatio: 0.555,
      yRatio: 0.27,
      widthRatio: 0.24,
      heightRatio: 0.15
    },
    downLeft15: {
      xRatio: 0.465,
      yRatio: 0.33,
      widthRatio: 0.24,
      heightRatio: 0.14
    },
    downRight15: {
      xRatio: 0.545,
      yRatio: 0.33,
      widthRatio: 0.24,
      heightRatio: 0.14
    }
  },
  embarrassed: {
    front: {
      xRatio: 0.536,
      yRatio: 0.3191,
      widthRatio: 0.148,
      heightRatio: 0.0622
    },
    right15: {
      xRatio: 0.6409,
      yRatio: 0.317,
      widthRatio: 0.1105,
      heightRatio: 0.0698
    },
    up15: {
      xRatio: 0.452,
      yRatio: 0.257,
      widthRatio: 0.261,
      heightRatio: 0.122
    },
    down15: {
      xRatio: 0.443,
      yRatio: 0.319,
      widthRatio: 0.272,
      heightRatio: 0.121
    },
    upLeft15: {
      xRatio: 0.454,
      yRatio: 0.267,
      widthRatio: 0.257,
      heightRatio: 0.122
    },
    upRight15: {
      xRatio: 0.555,
      yRatio: 0.267,
      widthRatio: 0.224,
      heightRatio: 0.116
    },
    downLeft15: {
      xRatio: 0.424,
      yRatio: 0.34,
      widthRatio: 0.253,
      heightRatio: 0.105
    },
    downRight15: {
      xRatio: 0.566,
      yRatio: 0.331,
      widthRatio: 0.213,
      heightRatio: 0.108
    }
  },
  troubled: {
    upLeft15: {
      xRatio: 0.47,
      yRatio: 0.26,
      widthRatio: 0.215,
      heightRatio: 0.127
    },
    upRight15: {
      xRatio: 0.622,
      yRatio: 0.271,
      widthRatio: 0.122,
      heightRatio: 0.116
    },
    downLeft15: {
      xRatio: 0.413,
      yRatio: 0.35,
      widthRatio: 0.262,
      heightRatio: 0.088
    },
    downRight15: {
      xRatio: 0.622,
      yRatio: 0.325,
      widthRatio: 0.124,
      heightRatio: 0.113
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
    },
    upLeft15: {
      xRatio: 0.429,
      yRatio: 0.278,
      widthRatio: 0.276,
      heightRatio: 0.115
    },
    upRight15: {
      xRatio: 0.502,
      yRatio: 0.273,
      widthRatio: 0.268,
      heightRatio: 0.112
    },
    downLeft15: {
      xRatio: 0.416,
      yRatio: 0.354,
      widthRatio: 0.246,
      heightRatio: 0.081
    },
    downRight15: {
      xRatio: 0.502,
      yRatio: 0.309,
      widthRatio: 0.287,
      heightRatio: 0.13
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
  jitome: {
    left15: {
      xRatio: 0.385,
      yRatio: 0.302,
      widthRatio: 0.207,
      heightRatio: 0.107
    },
    upLeft15: {
      xRatio: 0.463,
      yRatio: 0.31,
      widthRatio: 0.193,
      heightRatio: 0.07
    },
    upRight15: {
      xRatio: 0.54,
      yRatio: 0.31,
      widthRatio: 0.196,
      heightRatio: 0.072
    },
    down15: {
      xRatio: 0.455,
      yRatio: 0.372,
      widthRatio: 0.21,
      heightRatio: 0.074
    },
    downLeft15: {
      xRatio: 0.435,
      yRatio: 0.372,
      widthRatio: 0.207,
      heightRatio: 0.074
    },
    downRight15: {
      xRatio: 0.546,
      yRatio: 0.354,
      widthRatio: 0.212,
      heightRatio: 0.077
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
    overlayRegions.eye[directionId] ??
    overlayRegions.eye.front!
  );
}

export const eyeReflectionConfig: {
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
  disabledExpressions: ExpressionId[];
  irises: Partial<Record<DirectionId, IrisReflectionRegion>> &
    Record<"front", IrisReflectionRegion>;
} = {
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
  } satisfies Partial<Record<DirectionId, IrisReflectionRegion>>
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
  },
  {
    id: "up15",
    label: "上15°",
    src: `${directionBase}/tsurara_up15_master.png`
  },
  {
    id: "upLeft15",
    label: "左上15°",
    src: `${directionBase}/tsurara_up_left15_master.png`
  },
  {
    id: "upRight15",
    label: "右上15°",
    src: `${directionBase}/tsurara_up_right15_master.png`
  },
  {
    id: "down15",
    label: "下15°",
    src: `${directionBase}/tsurara_down15_master.png`
  },
  {
    id: "downLeft15",
    label: "左下15°",
    src: `${directionBase}/tsurara_down_left15_master.png`
  },
  {
    id: "downRight15",
    label: "右下15°",
    src: `${directionBase}/tsurara_down_right15_master.png`
  }
];


