// 日语变形生成器 - 基于日语语法规则

// 五段动词词尾变化表（五十音图的行）
const GODAN_CONJUGATIONS: Record<string, string[]> = {
  く: ["か", "き", "く", "け", "こ"], // カ行
  ぐ: ["が", "ぎ", "ぐ", "げ", "ご"], // ガ行
  す: ["さ", "し", "す", "せ", "そ"], // サ行
  つ: ["た", "ち", "つ", "て", "と"], // タ行
  ぬ: ["な", "に", "ぬ", "ね", "の"], // ナ行
  ぶ: ["ば", "び", "ぶ", "べ", "ぼ"], // バ行
  む: ["ま", "み", "む", "め", "も"], // マ行
  る: ["ら", "り", "る", "れ", "ろ"], // ラ行
  う: ["わ", "い", "う", "え", "お"], // ワ行
};

// 五段动词特殊音变规则
function applyGodanSoundChange(
  stem: string,
  baseChar: string,
  targetRow: number
): string {
  const conjugations = GODAN_CONJUGATIONS[baseChar];
  if (!conjugations || !conjugations[targetRow]) {
    return stem + baseChar;
  }

  // 促音变：つ、る + た/て → っ + た/て
  if ((baseChar === "つ" || baseChar === "る") && targetRow === 3) {
    return stem + "っ";
  }

  // 拨音变：ぶ、む、ぬ + た/て → ん + だ/で
  if ((baseChar === "ぶ" || baseChar === "む" || baseChar === "ぬ") && targetRow === 3) {
    return stem + "ん";
  }

  // い音变：く、ぐ + た/て → い + た/で
  if (baseChar === "く" && targetRow === 3) {
    return stem + "い";
  }
  if (baseChar === "ぐ" && targetRow === 3) {
    return stem + "い";
  }

  return stem + conjugations[targetRow];
}

// 生成五段动词变形
export function conjugateGodanVerb(
  word: string,
  reading: string
): {
  present: { plain: string; polite: string };
  negative: { plain: string; polite: string };
  past: { plain: string; polite: string };
  pastNegative: { plain: string; polite: string };
} {
  const lastChar = word.slice(-1);
  const stem = word.slice(0, -1);
  const conjugations = GODAN_CONJUGATIONS[lastChar] || [];

  // ます形词干（い段）
  const masuStem = stem + (conjugations[1] || lastChar);

  // ない形词干（あ段）
  const naiStem = stem + (conjugations[0] || lastChar);

  // た形词干（促音变、拨音变、い音变）
  let taStem = stem;
  if (lastChar === "つ" || lastChar === "る") {
    taStem = stem + "っ"; // 促音变
  } else if (lastChar === "ぶ" || lastChar === "む" || lastChar === "ぬ") {
    taStem = stem + "ん"; // 拨音变
  } else if (lastChar === "く") {
    taStem = stem + "い"; // い音变
  } else if (lastChar === "ぐ") {
    taStem = stem + "い"; // い音变
  } else {
    taStem = stem + (conjugations[3] || lastChar); // 其他情况用え段
  }

  // た形和て形的助词
  let taParticle = "た";
  let teParticle = "て";
  if (lastChar === "ぶ" || lastChar === "む" || lastChar === "ぬ" || lastChar === "ぐ") {
    taParticle = "だ";
    teParticle = "で";
  }

  return {
    present: {
      plain: word,
      polite: masuStem + "ます",
    },
    negative: {
      plain: naiStem + "ない",
      polite: masuStem + "ません",
    },
    past: {
      plain: taStem + taParticle,
      polite: masuStem + "ました",
    },
    pastNegative: {
      plain: naiStem + "なかった",
      polite: masuStem + "ませんでした",
    },
  };
}

// 生成一段动词变形
export function conjugateIchidanVerb(
  word: string,
  reading: string
): {
  present: { plain: string; polite: string };
  negative: { plain: string; polite: string };
  past: { plain: string; polite: string };
  pastNegative: { plain: string; polite: string };
} {
  // 一段动词去掉最后的"る"
  const stem = word.slice(0, -1);

  return {
    present: {
      plain: word,
      polite: stem + "ます",
    },
    negative: {
      plain: stem + "ない",
      polite: stem + "ません",
    },
    past: {
      plain: stem + "た",
      polite: stem + "ました",
    },
    pastNegative: {
      plain: stem + "なかった",
      polite: stem + "ませんでした",
    },
  };
}

// 生成不规则动词变形
export function conjugateIrregularVerb(
  word: string,
  reading: string
): {
  present: { plain: string; polite: string };
  negative: { plain: string; polite: string };
  past: { plain: string; polite: string };
  pastNegative: { plain: string; polite: string };
} {
  if (word === "する" || word.includes("する")) {
    // する动词（包括复合动词）
    const prefix = word === "する" ? "" : word.slice(0, -2);
    return {
      present: {
        plain: word,
        polite: prefix + "します",
      },
      negative: {
        plain: prefix + "しない",
        polite: prefix + "しません",
      },
      past: {
        plain: prefix + "した",
        polite: prefix + "しました",
      },
      pastNegative: {
        plain: prefix + "しなかった",
        polite: prefix + "しませんでした",
      },
    };
  } else if (word === "来る" || word === "くる") {
    return {
      present: {
        plain: "来る",
        polite: "来ます",
      },
      negative: {
        plain: "来ない",
        polite: "来ません",
      },
      past: {
        plain: "来た",
        polite: "来ました",
      },
      pastNegative: {
        plain: "来なかった",
        polite: "来ませんでした",
      },
    };
  }

  // 默认返回（不应该到这里）
  return {
    present: { plain: word, polite: word },
    negative: { plain: word, polite: word },
    past: { plain: word, polite: word },
    pastNegative: { plain: word, polite: word },
  };
}

// 生成一类形容词（い形容词）变形
export function conjugateIAdjective(
  word: string,
  reading: string
): {
  present: { plain: string; polite: string };
  negative: { plain: string; polite: string };
  past: { plain: string; polite: string };
  pastNegative: { plain: string; polite: string };
} {
  // 特殊处理：いい、よい
  if (word === "いい" || word === "よい") {
    const stem = word === "いい" ? "よ" : "よ";
    return {
      present: {
        plain: "いい",
        polite: "いいです",
      },
      negative: {
        plain: stem + "くない",
        polite: stem + "くないです / " + stem + "くありません",
      },
      past: {
        plain: stem + "かった",
        polite: stem + "かったです",
      },
      pastNegative: {
        plain: stem + "くなかった",
        polite: stem + "くなかったです / " + stem + "くありませんでした",
      },
    };
  }

  // 普通い形容词：去掉"い"
  const stem = word.slice(0, -1);

  return {
    present: {
      plain: word,
      polite: word + "です",
    },
    negative: {
      plain: stem + "くない",
      polite: stem + "くないです / " + stem + "くありません",
    },
    past: {
      plain: stem + "かった",
      polite: stem + "かったです",
    },
    pastNegative: {
      plain: stem + "くなかった",
      polite: stem + "くなかったです / " + stem + "くありませんでした",
    },
  };
}

// 生成二类形容词（な形容词）变形
export function conjugateNaAdjective(
  word: string,
  reading: string
): {
  present: { plain: string; polite: string };
  negative: { plain: string; polite: string };
  past: { plain: string; polite: string };
  pastNegative: { plain: string; polite: string };
} {
  return {
    present: {
      plain: word + "だ",
      polite: word + "です",
    },
    negative: {
      plain: word + "ではない / " + word + "じゃない",
      polite: word + "ではありません / " + word + "じゃありません",
    },
    past: {
      plain: word + "だった",
      polite: word + "でした",
    },
    pastNegative: {
      plain: word + "ではなかった / " + word + "じゃなかった",
      polite: word + "ではありませんでした / " + word + "じゃありませんでした",
    },
  };
}

// 生成名词变形
export function conjugateNoun(
  word: string
): {
  present: { plain: string; polite: string };
  negative: { plain: string; polite: string };
  past: { plain: string; polite: string };
  pastNegative: { plain: string; polite: string };
} {
  return {
    present: {
      plain: word + "だ",
      polite: word + "です",
    },
    negative: {
      plain: word + "ではない / " + word + "じゃない",
      polite: word + "ではありません / " + word + "じゃありません",
    },
    past: {
      plain: word + "だった",
      polite: word + "でした",
    },
    pastNegative: {
      plain: word + "ではなかった / " + word + "じゃなかった",
      polite: word + "ではありませんでした / " + word + "じゃありませんでした",
    },
  };
}
