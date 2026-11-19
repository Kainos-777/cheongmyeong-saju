import type {
  ElementKey,
  ElementScore,
  HiddenStemTenGod,
  Pillar,
  PillarInteraction,
  PillarKey,
  ShenshaItem,
  StemInfo,
} from '../types/saju';
import {
  BRANCHES,
  ELEMENT_CONTROLLED_BY,
  ELEMENT_CONTROLS,
  ELEMENT_GENERATED_BY,
  ELEMENT_GENERATES,
  ELEMENT_META,
  ELEMENT_ORDER,
  STEMS,
  getTenGodForBranch,
  getTenGodForStem,
  getTwelveStage,
} from './constants';

export interface RawPillarSpec {
  key: PillarKey;
  stemIndex: number;
  branchIndex: number;
  isUnknown?: boolean;
}

const PILLAR_LABELS: Record<PillarKey, { ko: string; hanja: string }> = {
  year: { ko: '년주', hanja: '年柱' },
  month: { ko: '월주', hanja: '月柱' },
  day: { ko: '일주', hanja: '日柱' },
  hour: { ko: '시주', hanja: '時柱' },
};

export function buildPillar(
  spec: RawPillarSpec,
  dayMaster: StemInfo
): Pillar {
  const { ko, hanja } = PILLAR_LABELS[spec.key];
  if (spec.isUnknown) {
    return {
      key: spec.key,
      labelKo: ko,
      labelHanja: hanja,
      stem: {
        index: -1,
        hanja: '?',
        hangul: '미상',
        element: dayMaster.element,
        polarity: dayMaster.polarity,
      },
      branch: {
        index: -1,
        hanja: '?',
        hangul: '미상',
        animal: '미상',
        element: dayMaster.element,
        polarity: dayMaster.polarity,
        hiddenStems: [],
      },
      stemTenGod: '미상',
      branchTenGod: '미상',
      twelveStage: '미상',
      hiddenStemTenGods: [],
      shensha: [],
      isUnknown: true,
    };
  }

  const stem = STEMS[((spec.stemIndex % 10) + 10) % 10];
  const branch = BRANCHES[((spec.branchIndex % 12) + 12) % 12];
  const stemTenGod =
    spec.key === 'day' ? '일간' : getTenGodForStem(dayMaster, stem);
  const branchTenGod = getTenGodForBranch(dayMaster, branch);
  const twelveStage = getTwelveStage(dayMaster.index, branch.index);

  const hiddenStemTenGods: HiddenStemTenGod[] = branch.hiddenStems.map((hs) => ({
    hangul: hs.hangul,
    hanja: hs.hanja,
    element: hs.element,
    tenGod: getTenGodForStem(dayMaster, STEMS[hs.stemIndex]),
    role: hs.role,
    weight: hs.weight,
  }));

  return {
    key: spec.key,
    labelKo: ko,
    labelHanja: hanja,
    stem,
    branch,
    stemTenGod,
    branchTenGod,
    twelveStage,
    hiddenStemTenGods,
    shensha: [],
    isUnknown: false,
  };
}

export function calculateElementScores(pillars: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}): {
  elements: ElementScore[];
  dominantElement: ElementKey;
  lackingElement: ElementKey;
  yinYangRatio: { yang: number; yin: number };
} {
  const rawMap: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  const countMap: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  let yangCount = 0;
  let yinCount = 0;

  const list: Pillar[] = [pillars.year, pillars.month, pillars.day];
  if (!pillars.hour.isUnknown) {
    list.push(pillars.hour);
  }

  for (const p of list) {
    countMap[p.stem.element] += 1;
    countMap[p.branch.element] += 1;

    rawMap[p.stem.element] += 10;
    const branchWeight = p.key === 'month' ? 24 : 12;
    for (const hs of p.branch.hiddenStems) {
      rawMap[hs.element] += branchWeight * hs.weight;
    }

    if (p.stem.polarity === 'yang') yangCount += 1;
    else yinCount += 1;
    if (p.branch.polarity === 'yang') yangCount += 1;
    else yinCount += 1;
  }

  const totalRaw = Object.values(rawMap).reduce((sum, v) => sum + v, 0) || 1;
  const rawPercentages = ELEMENT_ORDER.map((el) => (rawMap[el] / totalRaw) * 100);
  const roundedPercentages = rawPercentages.map((p) => Math.round(p));

  // Normalize rounded percentages so they sum cleanly to 100
  const pctSum = roundedPercentages.reduce((a, b) => a + b, 0);
  if (pctSum !== 100) {
    let maxIdx = 0;
    for (let i = 1; i < ELEMENT_ORDER.length; i++) {
      if (rawPercentages[i] > rawPercentages[maxIdx]) maxIdx = i;
    }
    roundedPercentages[maxIdx] += 100 - pctSum;
  }

  const elements: ElementScore[] = ELEMENT_ORDER.map((el, i) => {
    const percentage = Math.max(0, roundedPercentages[i]);
    const count = countMap[el];
    let status: ElementScore['status'];
    if (count === 0 && rawMap[el] < 3) {
      status = '결핍';
    } else if (percentage < 14) {
      status = '부족';
    } else if (percentage <= 30) {
      status = '적정';
    } else {
      status = '과다';
    }

    return {
      element: el,
      labelKo: ELEMENT_META[el].labelKo,
      labelHanja: ELEMENT_META[el].labelHanja,
      rawScore: Math.round(rawMap[el] * 10) / 10,
      percentage,
      count,
      status,
    };
  });

  // Dominant element: highest rawScore (tie-break: month branch element -> day stem element)
  let dominantElement: ElementKey = elements[0].element;
  let maxScore = -1;
  for (const item of elements) {
    const tieBoost =
      item.element === pillars.month.branch.element
        ? 0.02
        : item.element === pillars.day.stem.element
        ? 0.01
        : 0;
    if (item.rawScore + tieBoost > maxScore) {
      maxScore = item.rawScore + tieBoost;
      dominantElement = item.element;
    }
  }

  // Lacking element: lowest rawScore (tie-break: count === 0 prioritized)
  let lackingElement: ElementKey = elements[0].element;
  let minScore = Infinity;
  for (const item of elements) {
    const effective = item.rawScore + (item.count > 0 ? 0.5 : 0);
    if (effective < minScore) {
      minScore = effective;
      lackingElement = item.element;
    }
  }

  const totalPolarities = yangCount + yinCount || 1;
  const yangPct = Math.round((yangCount / totalPolarities) * 100);
  const yinPct = 100 - yangPct;

  return {
    elements,
    dominantElement,
    lackingElement,
    yinYangRatio: { yang: yangPct, yin: yinPct },
  };
}

export function calculateStrength(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  dayMaster: StemInfo
): {
  level: '극신강' | '신강' | '중화' | '신약' | '극신약';
  score: number;
  summary: string;
} {
  const support = new Set<ElementKey>([
    dayMaster.element,
    ELEMENT_GENERATED_BY[dayMaster.element],
  ]);

  const branchSupportRatio = (p: Pillar): number =>
    p.branch.hiddenStems.reduce(
      (sum, hs) => sum + (support.has(hs.element) ? hs.weight : 0),
      0
    );

  // 득령 (Month branch, max 35)
  const deukryeong = branchSupportRatio(pillars.month) * 35;
  // 득지 (Day branch, max 20)
  const deukji = branchSupportRatio(pillars.day) * 20;
  // 득세 (Remaining stems & branches)
  let deukse = 0;
  let maxPossible = 35 + 20 + 8 + 10 + 8;

  if (support.has(pillars.year.stem.element)) deukse += 8;
  if (support.has(pillars.month.stem.element)) deukse += 10;
  deukse += branchSupportRatio(pillars.year) * 8;

  if (!pillars.hour.isUnknown) {
    maxPossible += 10 + 9;
    if (support.has(pillars.hour.stem.element)) deukse += 10;
    deukse += branchSupportRatio(pillars.hour) * 9;
  }

  const normalized = ((deukryeong + deukji + deukse) / maxPossible) * 100;
  const score = Math.max(8, Math.min(95, Math.round(normalized)));

  let level: '극신강' | '신강' | '중화' | '신약' | '극신약';
  let summary: string;

  if (score >= 76) {
    level = '극신강';
    summary =
      '일간의 주체성과 생조 에너지가 매우 강렬합니다. 넘치는 추진력을 식상(표현)과 재성(결과물)·관성(조율)으로 흘려보낼 때 빛이 납니다.';
  } else if (score >= 58) {
    level = '신강';
    summary =
      '흔들리지 않는 자기 중심과 실행력을 갖춘 신강 명식입니다. 주도적인 리더십을 발휘하고 도전적인 과제를 직접 이끌 때 성취가 큽니다.';
  } else if (score >= 43) {
    level = '중화';
    summary =
      '내적 주체성과 외부 환경의 조화가 균형을 이룬 중화 사주입니다. 상황에 따라 유연하게 완급을 조절하며 안정적으로 성장하는 강점이 있습니다.';
  } else if (score >= 26) {
    level = '신약';
    summary =
      '섬세한 감수성과 환경 적응력이 뛰어난 신약 명식입니다. 인성(학습·멘토)과 비겁(협업 파트너)의 도움을 받을 때 잠재력이 크게 폭발합니다.';
  } else {
    level = '극신약';
    summary =
      '외부의 흐름과 시대적 요구를 민감하게 읽어내는 유연한 명식입니다. 든든한 시스템, 팀워크, 전문 지식 기반 위에서 일할 때 큰 성과를 냅니다.';
  }

  return { level, score, summary };
}

const GYEOKGUK_DESC: Record<string, { hanja: string; desc: string }> = {
  건록격: {
    hanja: '建祿格',
    desc: '스스로의 실력과 자립심으로 길을 여는 정통 개척형 격국입니다. 전문성과 성실함이 신뢰의 원천이 됩니다.',
  },
  양인격: {
    hanja: '羊刃格',
    desc: '강렬한 결단력과 카리스마로 난관을 돌파하는 승부사 격국입니다. 위기 상황에서 빛나는 추진력을 지닙니다.',
  },
  월겁격: {
    hanja: '月劫格',
    desc: '동료와의 선의의 경쟁 속에서 역량을 극대화하는 협동·도전형 격국입니다.',
  },
  정관격: {
    hanja: '正官格',
    desc: '품격과 원칙, 체계적인 시스템 설계에 강점을 지닌 리더십 격국입니다.',
  },
  편관격: {
    hanja: '偏官格',
    desc: '책임감과 개혁 의지가 뚜렷하며, 복잡한 문제를 구조적으로 해결하는 전략가 격국입니다.',
  },
  정재격: {
    hanja: '正財格',
    desc: '현실 감각과 디테일 관리가 뛰어나며 꾸준한 가치 축적에 능한 실용주의 격국입니다.',
  },
  편재격: {
    hanja: '偏財格',
    desc: '넓은 시야와 유동적인 감각으로 트렌드와 기회를 포착하는 프로듀서형 격국입니다.',
  },
  정인격: {
    hanja: '正印格',
    desc: '깊이 있는 학습력과 온화한 포용력으로 지혜와 콘텐츠를 생산하는 아키텍트형 격국입니다.',
  },
  편인격: {
    hanja: '偏印格',
    desc: '남다른 직관과 독창적 시선으로 새로운 패러다임을 제시하는 크리에이티브 격국입니다.',
  },
  식신격: {
    hanja: '食神格',
    desc: '장인정신과 꾸준한 몰입으로 완성도 높은 결과물을 만들어내는 메이커형 격국입니다.',
  },
  상관격: {
    hanja: '傷官格',
    desc: '예리한 미감과 파격적인 표현력으로 세상의 관습을 재해석하는 혁신가 격국입니다.',
  },
};

export function calculateGyeokguk(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  dayMaster: StemInfo
): { name: string; hanja: string; description: string } {
  const monthBranch = pillars.month.branch;
  const stage = getTwelveStage(dayMaster.index, monthBranch.index);

  if (stage === '건록') {
    return {
      name: '건록격',
      hanja: GYEOKGUK_DESC['건록격'].hanja,
      description: GYEOKGUK_DESC['건록격'].desc,
    };
  }
  if (dayMaster.polarity === 'yang' && stage === '제왕') {
    return {
      name: '양인격',
      hanja: GYEOKGUK_DESC['양인격'].hanja,
      description: GYEOKGUK_DESC['양인격'].desc,
    };
  }

  const visibleStemIndices = new Set<number>([
    pillars.year.stem.index,
    pillars.month.stem.index,
  ]);
  if (!pillars.hour.isUnknown) {
    visibleStemIndices.add(pillars.hour.stem.index);
  }

  // Prefer 정기 if protruding, else 중기/여기 if protruding, else fallback to 정기
  const hidden = [...monthBranch.hiddenStems].reverse(); // 정기 first
  let selectedStemIdx = hidden[0].stemIndex;
  for (const hs of hidden) {
    if (visibleStemIndices.has(hs.stemIndex)) {
      selectedStemIdx = hs.stemIndex;
      break;
    }
  }

  const tenGod = getTenGodForStem(dayMaster, STEMS[selectedStemIdx]);
  const gyeokName =
    tenGod === '비견'
      ? '건록격'
      : tenGod === '겁재'
      ? '월겁격'
      : `${tenGod}격`;
  const meta = GYEOKGUK_DESC[gyeokName] ?? GYEOKGUK_DESC['정관격'];

  return {
    name: gyeokName,
    hanja: meta.hanja,
    description: meta.desc,
  };
}

export function calculateYongshin(
  dayMaster: StemInfo,
  monthBranchIndex: number,
  elements: ElementScore[],
  strength: { level: string; score: number }
): {
  primary: ElementKey;
  secondary: ElementKey;
  avoidElement: ElementKey;
  reason: string;
} {
  const pctMap: Record<ElementKey, number> = {
    wood: 20,
    fire: 20,
    earth: 20,
    metal: 20,
    water: 20,
  };
  for (const e of elements) pctMap[e.element] = e.percentage;

  const dm = dayMaster.element;
  const parent = ELEMENT_GENERATED_BY[dm];
  const child = ELEMENT_GENERATES[dm];
  const wealth = ELEMENT_CONTROLS[dm];
  const officer = ELEMENT_CONTROLLED_BY[dm];

  const utility: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  if (strength.score >= 58) {
    utility[child] += 36;
    utility[wealth] += 32;
    utility[officer] += 28;
    utility[dm] -= 28;
    utility[parent] -= 24;
  } else if (strength.score < 43) {
    utility[parent] += 38;
    utility[dm] += 34;
    utility[officer] -= 26;
    utility[wealth] -= 20;
    utility[child] -= 16;
  } else {
    // 중화: slight flow balance toward missing or smooth output/resource
    utility[child] += 18;
    utility[wealth] += 16;
    utility[parent] += 14;
    utility[officer] += 12;
  }

  // 조후 (Seasonal climate balance)
  const isWinter = monthBranchIndex === 11 || monthBranchIndex === 0 || monthBranchIndex === 1;
  const isSummer = monthBranchIndex === 5 || monthBranchIndex === 6 || monthBranchIndex === 7;
  let climateNote = '';

  if (isWinter) {
    if (pctMap.fire < 36) {
      utility.fire += 26;
      utility.wood += 8;
    }
    climateNote = '추운 겨울 계절의 한기를 녹여주는 따뜻한 화(火)의 조후 기운을 중시하고, ';
  } else if (isSummer) {
    if (pctMap.water < 36) {
      utility.water += 26;
      utility.metal += 8;
    }
    climateNote = '열기가 강한 여름 계절의 균형을 맞추는 청량한 수(水)의 조후 기운을 살피며, ';
  }

  // Scarcity & excess adjustment
  for (const el of ELEMENT_ORDER) {
    if (pctMap[el] <= 10) utility[el] += 10;
    if (pctMap[el] >= 35) utility[el] -= 18;
  }

  const ranked = [...ELEMENT_ORDER].sort((a, b) => utility[b] - utility[a]);
  const primary = ranked[0];
  const secondary = ranked[1];
  const avoidElement = ranked[ranked.length - 1];

  const pKo = `${ELEMENT_META[primary].labelKo}(${ELEMENT_META[primary].labelHanja})`;
  const sKo = `${ELEMENT_META[secondary].labelKo}(${ELEMENT_META[secondary].labelHanja})`;
  const aKo = `${ELEMENT_META[avoidElement].labelKo}(${ELEMENT_META[avoidElement].labelHanja})`;

  const reason =
    `${climateNote}${strength.level}(${strength.score}점) 명식의 오행 순환을 매끄럽게 열기 위해 ${pKo}을 핵심 용신으로, ${sKo}을 희신으로 삼습니다. 반대로 과도하게 치우치거나 흐름을 막기 쉬운 ${aKo} 기운은 조절(기신)하는 것이 좋습니다.`;

  return {
    primary,
    secondary,
    avoidElement,
    reason,
  };
}

// Stem & Branch Interaction Rules
const STEM_COMBINE_PAIRS: [number, number, string][] = [
  [0, 5, '갑기합토(甲己合土)'],
  [1, 6, '을경합금(乙庚合金)'],
  [2, 7, '병신합수(丙辛合水)'],
  [3, 8, '정임합목(丁壬合木)'],
  [4, 9, '무계합화(戊癸合火)'],
];

const STEM_CLASH_PAIRS: [number, number, string][] = [
  [0, 6, '갑경충(甲庚沖)'],
  [1, 7, '을신충(乙辛沖)'],
  [2, 8, '병임충(丙壬沖)'],
  [3, 9, '정계충(丁癸沖)'],
];

const BRANCH_SIX_HARMONY: [number, number, string][] = [
  [0, 1, '자축합토(子丑合土)'],
  [2, 11, '인해합목(寅亥合木)'],
  [3, 10, '묘술합화(卯戌合火)'],
  [4, 9, '진유합금(辰酉合金)'],
  [5, 8, '사신합수(巳申合水)'],
  [6, 7, '오미합화(午未合火)'],
];

const BRANCH_TRINE: { branches: [number, number, number]; king: number; label: string }[] = [
  { branches: [8, 0, 4], king: 0, label: '신자진 수국(申子辰 水局)' },
  { branches: [11, 3, 7], king: 3, label: '해묘미 목국(亥卯未 木局)' },
  { branches: [2, 6, 10], king: 6, label: '인오술 화국(寅午戌 火局)' },
  { branches: [5, 9, 1], king: 9, label: '사유축 금국(巳酉丑 金局)' },
];

const BRANCH_SEASONAL: { branches: [number, number, number]; label: string }[] = [
  { branches: [2, 3, 4], label: '인묘진 동방목(寅卯辰 方合)' },
  { branches: [5, 6, 7], label: '사오미 남방화(巳午未 方合)' },
  { branches: [8, 9, 10], label: '신유술 서방금(申酉戌 方合)' },
  { branches: [11, 0, 1], label: '해자축 북방수(亥子丑 方合)' },
];

const BRANCH_CLASH_PAIRS: [number, number, string][] = [
  [0, 6, '자오충(子午沖)'],
  [1, 7, '축미충(丑未沖)'],
  [2, 8, '인신충(寅申沖)'],
  [3, 9, '묘유충(卯酉沖)'],
  [4, 10, '진술충(辰戌沖)'],
  [5, 11, '사해충(巳亥沖)'],
];

const BRANCH_BREAK_PAIRS: [number, number, string][] = [
  [0, 9, '자유파(子酉破)'],
  [6, 3, '오묘파(午卯破)'],
  [4, 1, '진축파(辰丑破)'],
  [10, 7, '술미파(戌未破)'],
  [2, 11, '인해파(寅亥破)'],
  [5, 8, '사신파(巳申破)'],
];

const BRANCH_HARM_PAIRS: [number, number, string][] = [
  [0, 7, '자미해(子未害)'],
  [1, 6, '축오해(丑午害)'],
  [2, 5, '인사해(寅巳害)'],
  [3, 4, '묘진해(卯辰害)'],
  [8, 11, '신해해(申亥害)'],
  [9, 10, '유술해(酉戌害)'],
];

const BRANCH_WONJIN_PAIRS: [number, number, string][] = [
  [0, 7, '자미원진(子未怨嗔)'],
  [1, 6, '축오원진(丑午怨嗔)'],
  [2, 9, '인유원진(寅酉怨嗔)'],
  [3, 8, '묘신원진(卯申怨嗔)'],
  [4, 11, '진해원진(辰亥怨嗔)'],
  [5, 10, '사술원진(巳戌怨嗔)'],
];

export function calculateInteractions(pillars: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}): PillarInteraction[] {
  const active: Pillar[] = [pillars.year, pillars.month, pillars.day];
  if (!pillars.hour.isUnknown) active.push(pillars.hour);

  const result: PillarInteraction[] = [];
  const seen = new Set<string>();

  const pushUnique = (item: PillarInteraction) => {
    const key = `${item.type}:${item.label}:${[...item.pillars].sort().join(',')}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  };

  // Pairwise stem & branch checks
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const sA = a.stem.index;
      const sB = b.stem.index;
      const bA = a.branch.index;
      const bB = b.branch.index;
      const pairKeys: PillarKey[] = [a.key, b.key];

      for (const [x, y, label] of STEM_COMBINE_PAIRS) {
        if ((sA === x && sB === y) || (sA === y && sB === x)) {
          pushUnique({
            type: '천간합',
            label,
            pillars: pairKeys,
            sentiment: 'positive',
            description: '두 천간이 조화롭게 결속하여 새로운 합의 시너지와 유연한 소통력을 만듭니다.',
          });
        }
      }

      for (const [x, y, label] of STEM_CLASH_PAIRS) {
        if ((sA === x && sB === y) || (sA === y && sB === x)) {
          pushUnique({
            type: '천간충',
            label,
            pillars: pairKeys,
            sentiment: 'caution',
            description: '외면적으로 드러나는 가치관의 긴장과 역동적인 변화 에너지를 의미합니다.',
          });
        }
      }

      for (const [x, y, label] of BRANCH_SIX_HARMONY) {
        if ((bA === x && bB === y) || (bA === y && bB === x)) {
          pushUnique({
            type: '지지육합',
            label,
            pillars: pairKeys,
            sentiment: 'positive',
            description: '친밀한 유대감과 실리적 협력을 끌어내는 안정적인 지지 결합입니다.',
          });
        }
      }

      for (const [x, y, label] of BRANCH_CLASH_PAIRS) {
        if ((bA === x && bB === y) || (bA === y && bB === x)) {
          pushUnique({
            type: '지지충',
            label,
            pillars: pairKeys,
            sentiment: 'caution',
            description: '정체된 틀을 깨고 이동·변혁·새로운 시작을 촉발하는 강한 충돌 에너지입니다.',
          });
        }
      }

      // 형 (Punishments)
      if ((bA === 0 && bB === 3) || (bA === 3 && bB === 0)) {
        pushUnique({
          type: '형',
          label: '자묘형(子卯刑 · 무례지형)',
          pillars: pairKeys,
          sentiment: 'caution',
          description: '감정 표현의 완급 조절과 관계의 경계 설정이 중요하게 작용하는 형살입니다.',
        });
      }
      if (bA === bB && (bA === 4 || bA === 6 || bA === 9 || bA === 11)) {
        const selfName = BRANCHES[bA].hangul;
        const selfHanja = BRANCHES[bA].hanja;
        pushUnique({
          type: '형',
          label: `${selfName}${selfName} 자형(${selfHanja}${selfHanja} 自刑)`,
          pillars: pairKeys,
          sentiment: 'caution',
          description: '완벽을 추구하는 내면의 기준이 높아 스스로를 엄격히 다듬는 성향이 나타납니다.',
        });
      }

      for (const [x, y, label] of BRANCH_BREAK_PAIRS) {
        if ((bA === x && bB === y) || (bA === y && bB === x)) {
          pushUnique({
            type: '파',
            label,
            pillars: pairKeys,
            sentiment: 'neutral',
            description: '기존 방식을 재정비하고 디테일을 다듬어 새 판을 짜게 만드는 미세 조정 작용입니다.',
          });
        }
      }

      for (const [x, y, label] of BRANCH_HARM_PAIRS) {
        if ((bA === x && bB === y) || (bA === y && bB === x)) {
          pushUnique({
            type: '해',
            label,
            pillars: pairKeys,
            sentiment: 'caution',
            description: '미묘한 오해나 심리적 거리감이 생길 수 있어 명확한 대화로 풀어야 하는 기운입니다.',
          });
        }
      }

      for (const [x, y, label] of BRANCH_WONJIN_PAIRS) {
        if ((bA === x && bB === y) || (bA === y && bB === x)) {
          pushUnique({
            type: '원진',
            label,
            pillars: pairKeys,
            sentiment: 'caution',
            description: '서로 끌리면서도 예민한 자극을 주고받는 복합적인 심리 긴장 작용입니다.',
          });
        }
      }
    }
  }

  // Group checks: 삼합, 방합, 삼형
  const branchToPillars = new Map<number, PillarKey[]>();
  for (const p of active) {
    const arr = branchToPillars.get(p.branch.index) ?? [];
    arr.push(p.key);
    branchToPillars.set(p.branch.index, arr);
  }

  for (const trine of BRANCH_TRINE) {
    const matchedBranches = trine.branches.filter((b) => branchToPillars.has(b));
    if (matchedBranches.length === 3) {
      const pKeys = matchedBranches.flatMap((b) => branchToPillars.get(b) ?? []);
      pushUnique({
        type: '삼합',
        label: trine.label,
        pillars: Array.from(new Set(pKeys)),
        sentiment: 'positive',
        description: '세 지지가 하나의 거대한 오행 국(局)으로 합심하여 강력한 추진력과 결실을 이룹니다.',
      });
    } else if (matchedBranches.length === 2 && matchedBranches.includes(trine.king)) {
      const pKeys = matchedBranches.flatMap((b) => branchToPillars.get(b) ?? []);
      const bNames = matchedBranches.map((b) => BRANCHES[b].hangul).join('');
      pushUnique({
        type: '삼합',
        label: `${bNames} 반합 (${trine.label.split(' ')[1]})`,
        pillars: Array.from(new Set(pKeys)),
        sentiment: 'positive',
        description: '왕지를 중심으로 두 지지가 결속하여 실용적인 추진력을 형성하는 반합 구조입니다.',
      });
    }
  }

  for (const seasonal of BRANCH_SEASONAL) {
    if (seasonal.branches.every((b) => branchToPillars.has(b))) {
      const pKeys = seasonal.branches.flatMap((b) => branchToPillars.get(b) ?? []);
      pushUnique({
        type: '방합',
        label: seasonal.label,
        pillars: Array.from(new Set(pKeys)),
        sentiment: 'positive',
        description: '같은 계절의 세 지지가 한 방향으로 모여 압도적인 순수 에너지와 전문성을 발휘합니다.',
      });
    }
  }

  // 삼형 (인사신, 축술미)
  const triplePunishments: { branches: [number, number, number]; label: string }[] = [
    { branches: [2, 5, 8], label: '인사신 삼형(寅巳申 三刑)' },
    { branches: [1, 10, 7], label: '축술미 삼형(丑戌未 三刑)' },
  ];
  for (const tp of triplePunishments) {
    const matched = tp.branches.filter((b) => branchToPillars.has(b));
    if (matched.length >= 2) {
      const pKeys = matched.flatMap((b) => branchToPillars.get(b) ?? []);
      pushUnique({
        type: '형',
        label: matched.length === 3 ? tp.label : `${matched.map((b) => BRANCHES[b].hangul).join('')} 형(${tp.label.split(' ')[0]})`,
        pillars: Array.from(new Set(pKeys)),
        sentiment: 'caution',
        description: '전문 분야(의료·법조·엔지니어링·디자인 리드 등)에서 까다로운 기준과 조정력을 발휘할 때 길하게 승화됩니다.',
      });
    }
  }

  return result;
}

const CHEONEUL_BY_STEM: Record<number, number[]> = {
  0: [1, 7], // 갑: 축, 미
  4: [1, 7], // 무: 축, 미
  6: [1, 7], // 경: 축, 미
  1: [0, 8], // 을: 자, 신
  5: [0, 8], // 기: 자, 신
  2: [11, 9], // 병: 해, 유
  3: [11, 9], // 정: 해, 유
  8: [3, 5], // 임: 묘, 사
  9: [3, 5], // 계: 묘, 사
  7: [2, 6], // 신: 인, 오
};

const MUNCHANG_BY_STEM: Record<number, number> = {
  0: 5, // 갑-사
  1: 6, // 을-오
  2: 8, // 병-신
  3: 9, // 정-유
  4: 8, // 무-신
  5: 9, // 기-유
  6: 11, // 경-해
  7: 0, // 신-자
  8: 2, // 임-인
  9: 3, // 계-묘
};

const HAKDANG_BY_STEM: Record<number, number> = {
  0: 11, // 갑-해
  1: 6,  // 을-오
  2: 2,  // 병-인
  3: 9,  // 정-유
  4: 2,  // 무-인
  5: 9,  // 기-유
  6: 5,  // 경-사
  7: 0,  // 신-자
  8: 8,  // 임-신
  9: 3,  // 계-묘
};

const GEUMYEO_BY_STEM: Record<number, number> = {
  0: 4, 1: 5, 2: 7, 3: 8, 4: 7, 5: 8, 6: 10, 7: 11, 8: 1, 9: 2,
};

const HONGYEOM_BY_STEM: Record<number, number[]> = {
  0: [6],
  1: [6],
  2: [2],
  3: [7],
  4: [4],
  5: [4],
  6: [10],
  7: [9],
  8: [0],
  9: [8],
};

const YANGIN_BY_STEM: Record<number, number> = {
  0: 3, // 갑-묘
  2: 6, // 병-오
  4: 6, // 무-오
  6: 9, // 경-유
  8: 0, // 임-자
};

const BAEKHO_GAPJA = new Set(['갑진', '을미', '병술', '정축', '무진', '임술', '계축']);
const GOEGANG_GAPJA = new Set(['무진', '무술', '경진', '경술', '임진', '임술']);

const GWIMUN_PAIRS: [number, number][] = [
  [0, 9], // 자유
  [1, 6], // 축오
  [2, 7], // 인미
  [3, 8], // 묘신
  [4, 11], // 진해
  [5, 10], // 사술
];

function getSamhapTargets(branchIdx: number): {
  dohwa: number;
  yeokma: number;
  hwagae: number;
} {
  if (branchIdx === 2 || branchIdx === 6 || branchIdx === 10) {
    return { dohwa: 3, yeokma: 8, hwagae: 10 }; // 인오술 -> 묘, 신, 술
  }
  if (branchIdx === 5 || branchIdx === 9 || branchIdx === 1) {
    return { dohwa: 6, yeokma: 11, hwagae: 1 }; // 사유축 -> 오, 해, 축
  }
  if (branchIdx === 8 || branchIdx === 0 || branchIdx === 4) {
    return { dohwa: 9, yeokma: 2, hwagae: 4 }; // 신자진 -> 유, 인, 진
  }
  return { dohwa: 0, yeokma: 5, hwagae: 7 }; // 해묘미 -> 자, 사, 미
}

export function calculateShensha(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  dayGapjaIndex: number
): ShenshaItem[] {
  const active: Pillar[] = [pillars.year, pillars.month, pillars.day];
  if (!pillars.hour.isUnknown) active.push(pillars.hour);

  const dmIdx = pillars.day.stem.index;
  const yearBranchIdx = pillars.year.branch.index;
  const dayBranchIdx = pillars.day.branch.index;

  const items: ShenshaItem[] = [];
  const seen = new Set<string>();

  const addShensha = (
    pillar: Pillar | 'chart',
    name: string,
    hanja: string,
    category: ShenshaItem['category'],
    description: string
  ) => {
    const pKey = pillar === 'chart' ? 'chart' : pillar.key;
    const dedupe = `${name}:${pKey}`;
    if (seen.has(dedupe)) return;
    seen.add(dedupe);
    if (pillar !== 'chart' && !pillar.shensha.includes(name)) {
      pillar.shensha.push(name);
    }
    items.push({ name, hanja, category, pillar: pKey, description });
  };

  // 공망 (by Day Pillar 60갑자 순)
  const xunStart = Math.floor(dayGapjaIndex / 10) * 10;
  const xunStartBranch = xunStart % 12;
  const gongmang1 = (xunStartBranch - 2 + 12) % 12;
  const gongmang2 = (xunStartBranch - 1 + 12) % 12;

  const cheoneulBranches = CHEONEUL_BY_STEM[dmIdx] ?? [];
  const munchangBranch = MUNCHANG_BY_STEM[dmIdx];
  const hakdangBranch = HAKDANG_BY_STEM[dmIdx];
  const geumyeoBranch = GEUMYEO_BY_STEM[dmIdx];
  const hongyeomBranches = HONGYEOM_BY_STEM[dmIdx] ?? [];
  const yanginBranch = YANGIN_BY_STEM[dmIdx];

  const dayGroup = getSamhapTargets(dayBranchIdx);
  const yearGroup = getSamhapTargets(yearBranchIdx);
  const dohwaSet = new Set([dayGroup.dohwa, yearGroup.dohwa]);
  const yeokmaSet = new Set([dayGroup.yeokma, yearGroup.yeokma]);
  const hwagaeSet = new Set([dayGroup.hwagae, yearGroup.hwagae]);

  for (const p of active) {
    const bIdx = p.branch.index;
    const pairHangul = `${p.stem.hangul}${p.branch.hangul}`;

    if (cheoneulBranches.includes(bIdx)) {
      addShensha(
        p,
        '천을귀인',
        '天乙貴人',
        '길신',
        '최고의 귀인성으로, 위기 시 뜻밖의 조력자와 품격 있는 해결의 기회를 부릅니다.'
      );
    }
    if (bIdx === munchangBranch) {
      addShensha(
        p,
        '문창귀인',
        '文昌貴人',
        '길신',
        '글쓰기, 기획, 디자인 문서화 및 시험·학업 성취를 돕는 영민한 지성 귀인입니다.'
      );
    }
    if (bIdx === hakdangBranch) {
      addShensha(
        p,
        '학당귀인',
        '學堂貴人',
        '길신',
        '배움을 즐기고 깊이 있는 전문성을 축적하여 스승이나 전문가로 성장하는 길신입니다.'
      );
    }
    if (bIdx === geumyeoBranch) {
      addShensha(
        p,
        '금여록',
        '金與祿',
        '길신',
        '안정적인 기반, 좋은 배우자 복, 품위 있는 생활 여건을 상징하는 길성입니다.'
      );
    }
    if (dohwaSet.has(bIdx)) {
      addShensha(
        p,
        '도화살',
        '桃花殺',
        '중성',
        '타고난 매력과 시선을 사로잡는 심미적 감각으로 예술·브랜딩·대중 호감도에 빛을 발합니다.'
      );
    }
    if (yeokmaSet.has(bIdx)) {
      addShensha(
        p,
        '역마살',
        '驛馬殺',
        '중성',
        '글로벌 이동, 출장, 빠른 트렌드 전환과 다채로운 환경 속에서 역동적으로 성장하는 기운입니다.'
      );
    }
    if (hwagaeSet.has(bIdx)) {
      addShensha(
        p,
        '화개살',
        '華蓋殺',
        '중성',
        '고독한 몰입과 깊은 철학적 사유, 순수 예술·인문학·크리에이티브 창작의 별입니다.'
      );
    }
    if (BAEKHO_GAPJA.has(pairHangul)) {
      addShensha(
        p,
        '백호대살',
        '白虎大殺',
        '중성',
        '압도적인 프로페셔널 에너지와 집중력을 지녀 전문 분야에서 독보적 성과를 내기 쉽습니다.'
      );
    }
    if (GOEGANG_GAPJA.has(pairHangul)) {
      addShensha(
        p,
        '괴강살',
        '魁罡殺',
        '중성',
        '총명하고 강직한 리더십과 카리스마로 큰 조직이나 프로젝트를 주도하는 기운입니다.'
      );
    }
    if (p.key !== 'day' && (bIdx === gongmang1 || bIdx === gongmang2)) {
      addShensha(
        p,
        '공망',
        '空亡',
        '중성',
        '세속적 집착을 비우고 정신적·창의적 가치와 새로운 패러다임을 탐구하게 만드는 여백의 기운입니다.'
      );
    }
    if (yanginBranch !== undefined && bIdx === yanginBranch) {
      addShensha(
        p,
        '양인살',
        '羊刃殺',
        '흉살',
        '날카로운 결단과 강렬한 승부욕을 상징하며, 정밀 기술·디자인 디렉팅·리더십으로 승화하면 강력합니다.'
      );
    }
    if (hongyeomBranches.includes(bIdx)) {
      addShensha(
        p,
        '홍염살',
        '紅艶殺',
        '중성',
        '다정하고 세련된 감성 매력으로 사람들에게 깊은 호감과 예술적 인상을 남깁니다.'
      );
    }
  }

  // 귀문관살 (Pair check across chart branches)
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const b1 = active[i].branch.index;
      const b2 = active[j].branch.index;
      for (const [x, y] of GWIMUN_PAIRS) {
        if ((b1 === x && b2 === y) || (b1 === y && b2 === x)) {
          addShensha(
            active[j],
            '귀문관살',
            '鬼門關殺',
            '중성',
            '예민한 직관력과 초감각적 아이디어, 천재적인 창의력을 발휘하게 만드는 영감의 별입니다.'
          );
        }
      }
    }
  }

  return items;
}
