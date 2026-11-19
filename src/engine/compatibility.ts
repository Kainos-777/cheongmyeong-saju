import type {
  CompatibilityResult,
  ElementKey,
  SajuResult,
} from '../types/saju';
import {
  ELEMENT_GENERATED_BY,
  ELEMENT_GENERATES,
  ELEMENT_META,
  getTenGodForStem,
} from './constants';

const STEM_COMBINE: [number, number][] = [
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
];
const STEM_CLASH: [number, number][] = [
  [0, 6], [1, 7], [2, 8], [3, 9],
];
const BRANCH_SIX: [number, number][] = [
  [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
];
const BRANCH_CLASH: [number, number][] = [
  [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
];
const BRANCH_WONJIN: [number, number][] = [
  [0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10],
];
const TRINE_GROUPS: number[][] = [
  [8, 0, 4],
  [11, 3, 7],
  [2, 6, 10],
  [5, 9, 1],
];

function matchPair(a: number, b: number, list: [number, number][]): boolean {
  return list.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function clamp(v: number, min = 35, max = 98): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function elementScoreFor(person: SajuResult, el: ElementKey): number {
  return person.elements.find((e) => e.element === el)?.percentage ?? 0;
}

export function calculateCompatibility(
  personA: SajuResult,
  personB: SajuResult
): CompatibilityResult {
  const dmA = personA.dayMaster;
  const dmB = personB.dayMaster;
  const dbA = personA.pillars.day.branch;
  const dbB = personB.pillars.day.branch;

  const highlights: CompatibilityResult['highlights'] = [];

  let valueScore = 66;
  let commScore = 68;
  let dailyScore = 65;
  let passionScore = 64;
  let growthScore = 67;

  // 1. Day Master Stem evaluation (일간 궁합)
  if (matchPair(dmA.index, dmB.index, STEM_COMBINE)) {
    valueScore += 18;
    passionScore += 16;
    commScore += 12;
    highlights.push({
      type: 'harmony',
      title: `천간합 · ${dmA.hangul}${dmB.hangul} 합(合)`,
      detail: `${personA.input.name}님의 ${dmA.hangul}(${dmA.hanja}) 일간과 ${personB.input.name}님의 ${dmB.hangul}(${dmB.hanja}) 일간이 천간합을 이루어 처음부터 자연스러운 이끌림과 정신적 결속이 강합니다.`,
    });
  } else if (
    ELEMENT_GENERATES[dmA.element] === dmB.element ||
    ELEMENT_GENERATES[dmB.element] === dmA.element
  ) {
    valueScore += 12;
    commScore += 11;
    growthScore += 12;
    const giver = ELEMENT_GENERATES[dmA.element] === dmB.element ? personA.input.name : personB.input.name;
    highlights.push({
      type: 'harmony',
      title: '일간 상생(相生)의 흐름',
      detail: `두 분의 일간이 서로 생(生)하는 관계로, ${giver}님이 자연스럽게 온기와 영감을 불어넣어 주며 편안한 대화가 이어집니다.`,
    });
  } else if (dmA.element === dmB.element) {
    valueScore += 8;
    commScore += 9;
    highlights.push({
      type: 'harmony',
      title: '같은 오행 · 깊은 공감 코드',
      detail: `두 분 모두 ${ELEMENT_META[dmA.element].labelKo}(${ELEMENT_META[dmA.element].labelHanja}) 일간으로, 세상을 바라보는 결이 비슷해 말하지 않아도 속뜻을 잘 이해합니다.`,
    });
  } else if (matchPair(dmA.index, dmB.index, STEM_CLASH)) {
    commScore -= 6;
    passionScore += 8;
    highlights.push({
      type: 'tension',
      title: `천간충 · ${dmA.hangul}${dmB.hangul} 긴장감`,
      detail: `의견을 표현하는 방식이 정반대라 초반에 묘한 긴장이나 스파크가 튑니다. 다름을 틀림이 아닌 자극으로 받아들이면 오히려 역동적 시너지가 됩니다.`,
    });
  }

  // 2. Day Branch evaluation (일지 배우자궁)
  if (matchPair(dbA.index, dbB.index, BRANCH_SIX)) {
    dailyScore += 20;
    passionScore += 15;
    valueScore += 10;
    highlights.push({
      type: 'harmony',
      title: `일지 육합 · ${dbA.hangul}${dbB.hangul} 합`,
      detail: `속마음과 일상 리듬을 관장하는 일지가 육합으로 만나 함께 있을 때 가장 편안하고 안정적인 생활 호흡을 맞춥니다.`,
    });
  } else if (
    TRINE_GROUPS.some(
      (g) => g.includes(dbA.index) && g.includes(dbB.index) && dbA.index !== dbB.index
    )
  ) {
    dailyScore += 13;
    growthScore += 12;
    highlights.push({
      type: 'harmony',
      title: `일지 삼합 · ${dbA.hangul}${dbB.hangul} 공명`,
      detail: '두 사람의 일지가 같은 삼합 국(局)으로 모여 공동의 목표나 프로젝트를 추진할 때 놀라운 팀워크를 발휘합니다.',
    });
  } else if (matchPair(dbA.index, dbB.index, BRANCH_CLASH)) {
    dailyScore -= 12;
    passionScore += 5;
    highlights.push({
      type: 'tension',
      title: `일지 충 · ${dbA.hangul}${dbB.hangul} 충(沖)`,
      detail: '생활 습관이나 휴식 방식이 달라 부딪힐 수 있습니다. 각자의 개인 공간과 시간 루틴을 명확히 존중하면 충돌이 크게 줄어듭니다.',
    });
  } else if (matchPair(dbA.index, dbB.index, BRANCH_WONJIN)) {
    dailyScore -= 7;
    commScore -= 5;
    highlights.push({
      type: 'tension',
      title: `일지 원진 · ${dbA.hangul}${dbB.hangul} 미세 자극`,
      detail: '강하게 끌리면서도 사소한 말투에 서운함을 느끼기 쉬운 기운입니다. 감정을 묵히지 않고 담백하게 즉시 소통하는 습관이 좋습니다.',
    });
  } else if (dbA.index === dbB.index) {
    dailyScore += 5;
  }

  // 3. Five-Element Complementarity (오행 및 용신 보완)
  const bBoostsA =
    elementScoreFor(personB, personA.yongshin.primary) >= 20 ||
    personB.dominantElement === personA.yongshin.primary ||
    personB.dominantElement === personA.lackingElement;
  const aBoostsB =
    elementScoreFor(personA, personB.yongshin.primary) >= 20 ||
    personA.dominantElement === personB.yongshin.primary ||
    personA.dominantElement === personB.lackingElement;

  if (bBoostsA && aBoostsB) {
    growthScore += 18;
    valueScore += 10;
    dailyScore += 8;
    highlights.push({
      type: 'complement',
      title: '쌍방 용신 보완 · 서로의 빈 조각을 채움',
      detail: `${personA.input.name}님의 필요한 ${ELEMENT_META[personA.yongshin.primary].labelKo}(${ELEMENT_META[personA.yongshin.primary].labelHanja}) 기운과 ${personB.input.name}님의 필요한 ${ELEMENT_META[personB.yongshin.primary].labelKo}(${ELEMENT_META[personB.yongshin.primary].labelHanja}) 기운을 서로 넉넉히 채워주는 최상의 상호보완 구조입니다.`,
    });
  } else if (bBoostsA || aBoostsB) {
    growthScore += 11;
    valueScore += 6;
    const receiver = bBoostsA ? personA : personB;
    const giver = bBoostsA ? personB : personA;
    highlights.push({
      type: 'complement',
      title: `오행 보완 · ${ELEMENT_META[receiver.yongshin.primary].labelKo} 기운 공급`,
      detail: `${giver.input.name}님이 ${receiver.input.name}님에게 부족하거나 꼭 필요한 ${ELEMENT_META[receiver.yongshin.primary].labelKo}(${ELEMENT_META[receiver.yongshin.primary].labelHanja}) 에너지를 자연스럽게 채워주어 함께 있으면 운의 흐름이 부드러워집니다.`,
    });
  }

  // 4. Ten Gods Role Dynamic (십성 역할 조화)
  const aToB = getTenGodForStem(dmA, dmB);
  const bToA = getTenGodForStem(dmB, dmA);
  if (
    ['식신', '정재', '정관', '정인'].includes(aToB) ||
    ['식신', '정재', '정관', '정인'].includes(bToA)
  ) {
    commScore += 9;
    growthScore += 8;
  }
  if (
    (ELEMENT_GENERATED_BY[dmA.element] === dmB.element && personA.strength.score < 48) ||
    (ELEMENT_GENERATED_BY[dmB.element] === dmA.element && personB.strength.score < 48)
  ) {
    dailyScore += 7;
  }

  // Ensure at least 2 meaningful highlights
  if (highlights.length === 0) {
    highlights.push({
      type: 'complement',
      title: '균형 잡힌 독립적 동반자 관계',
      detail: '강한 충돌이나 일방적 의존 없이 각자의 개성을 온전히 유지하며 건강하게 교류할 수 있는 담백한 인연입니다.',
    });
  }

  const dimensions = [
    {
      label: '가치관·정서',
      score: clamp(valueScore),
      summary:
        valueScore >= 78
          ? '삶의 방향성과 감정 온도가 자연스럽게 맞닿아 깊은 신뢰를 형성합니다.'
          : '서로 다른 시선이 새로운 관점을 열어주므로 솔직한 대화로 속도를 맞추면 좋습니다.',
    },
    {
      label: '소통·케미',
      score: clamp(commScore),
      summary:
        commScore >= 78
          ? '유머와 대화 호흡이 잘 통해 사소한 일상 이야기도 즐거운 영감이 됩니다.'
          : '핵심 의도를 한 번 더 부드럽게 확인하는 대화 습관이 오해를 예방합니다.',
    },
    {
      label: '일상·생활리듬',
      score: clamp(dailyScore),
      summary:
        dailyScore >= 78
          ? '생활 패턴과 휴식 감각이 조화로워 오랜 시간을 함께해도 편안합니다.'
          : '서로의 라이프스타일 차이를 인정하고 각자만의 루틴 공간을 보장하면 쾌적합니다.',
    },
    {
      label: '열정·끌림',
      score: clamp(passionScore),
      summary:
        passionScore >= 76
          ? '서로에게 설렘과 생기를 불어넣는 매력적인 케미가 돋보입니다.'
          : '함께 새로운 취미나 프로젝트를 경험할 때 관계의 스파크가 한층 살아납니다.',
    },
    {
      label: '성장·시너지',
      score: clamp(growthScore),
      summary:
        growthScore >= 78
          ? '서로의 부족한 오행을 메워주어 함께할수록 커리어와 운이 함께 확장됩니다.'
          : '각자의 강점을 분업하고 존중할 때 혼자보다 훨씬 큰 성취를 거둘 수 있습니다.',
    },
  ];

  const overallScore = clamp(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length,
    0,
    100
  );

  let grade: string;
  let headline: string;
  if (overallScore >= 86) {
    grade = '천생연분 S';
    headline = '서로의 모자란 결을 빛으로 채우는 환상의 파트너십';
  } else if (overallScore >= 76) {
    grade = '찰떡궁합 A+';
    headline = '정서적 안정과 성장의 시너지가 함께 흐르는 이상적 인연';
  } else if (overallScore >= 66) {
    grade = '조화로운 인연 A';
    headline = '배려와 소통을 더할수록 단단하게 영그는 균형 잡힌 궁합';
  } else if (overallScore >= 56) {
    grade = '보완적 인연 B+';
    headline = '다름 속에서 서로의 세계를 넓혀가는 역동적 성장 파트너';
  } else {
    grade = '성숙한 조율 B';
    headline = '존중과 경계의 지혜로 깊은 신뢰를 쌓아가는 관계';
  }

  const sharedYongshin = personA.yongshin.primary;
  const advice = `${personA.input.name}(${personA.pillars.day.stem.hangul}${personA.pillars.day.branch.hangul}일주)님과 ${personB.input.name}(${personB.pillars.day.stem.hangul}${personB.pillars.day.branch.hangul}일주)님의 조합은 ${grade} 등급으로 나타났습니다. 두 분이 함께할 때는 '${ELEMENT_META[sharedYongshin].labelKo}(${ELEMENT_META[sharedYongshin].labelHanja})' 기운이 담긴 데이트나 협업 테마(예: ${ELEMENT_META[sharedYongshin].luckyColors[0].name} 톤 공간, ${ELEMENT_META[sharedYongshin].directionKo} 방향 여행)가 정서적 유대감을 한층 높여줍니다.`;

  return {
    personA,
    personB,
    overallScore,
    grade,
    headline,
    dimensions,
    highlights,
    advice,
  };
}
