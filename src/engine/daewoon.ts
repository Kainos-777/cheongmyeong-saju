import type {
  DaewoonCycle,
  DailyFortune,
  ElementKey,
  Gender,
  MonthlyFortune,
  SajuResult,
  SewoonYear,
  StemInfo,
} from '../types/saju';
import {
  BRANCHES,
  ELEMENT_META,
  STEMS,
  getTenGodForBranch,
  getTenGodForStem,
  getTwelveStage,
} from './constants';
import { gregorianToJdn } from './solarTerms';

function clampScore(val: number, min = 35, max = 96): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function scoreElementPair(
  stemEl: ElementKey,
  branchEl: ElementKey,
  branchIndex: number,
  dayBranchIndex: number,
  yongshin: { primary: ElementKey; secondary: ElementKey; avoidElement: ElementKey },
  seedOffset = 0
): number {
  let score = 62;

  if (stemEl === yongshin.primary) score += 16;
  else if (stemEl === yongshin.secondary) score += 10;
  else if (stemEl === yongshin.avoidElement) score -= 14;

  if (branchEl === yongshin.primary) score += 18;
  else if (branchEl === yongshin.secondary) score += 12;
  else if (branchEl === yongshin.avoidElement) score -= 15;

  // Day branch harmony (육합) vs clash (충)
  const sixHarmonies: [number, number][] = [
    [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
  ];
  const clashes: [number, number][] = [
    [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
  ];

  for (const [a, b] of sixHarmonies) {
    if (
      (branchIndex === a && dayBranchIndex === b) ||
      (branchIndex === b && dayBranchIndex === a)
    ) {
      score += 7;
    }
  }
  for (const [a, b] of clashes) {
    if (
      (branchIndex === a && dayBranchIndex === b) ||
      (branchIndex === b && dayBranchIndex === a)
    ) {
      score -= 8;
    }
  }

  return clampScore(score + seedOffset, 35, 96);
}

const TEN_GOD_KEYWORDS: Record<string, string> = {
  비견: '주도적 확장',
  겁재: '도전과 돌파',
  식신: '창작과 결실',
  상관: '혁신과 표현',
  편재: '기회 포착',
  정재: '안정적 축적',
  편관: '책임과 도약',
  정관: '질서와 승진',
  편인: '직관적 통찰',
  정인: '학습과 귀인',
};

export function calculateDaewoon(params: {
  gender: Gender;
  yearStem: StemInfo;
  monthStemIndex: number;
  monthBranchIndex: number;
  dayMaster: StemInfo;
  dayBranchIndex: number;
  birthSolarYear: number;
  utcDate: Date;
  prevJieDate: Date;
  nextJieDate: Date;
  yongshin: { primary: ElementKey; secondary: ElementKey; avoidElement: ElementKey };
}): {
  direction: '순행' | '역행';
  startAge: number;
  cycles: DaewoonCycle[];
} {
  const {
    gender,
    yearStem,
    monthStemIndex,
    monthBranchIndex,
    dayMaster,
    dayBranchIndex,
    birthSolarYear,
    utcDate,
    prevJieDate,
    nextJieDate,
    yongshin,
  } = params;

  const isYangYear = yearStem.polarity === 'yang';
  const direction: '순행' | '역행' =
    (isYangYear && gender === 'male') || (!isYangYear && gender === 'female')
      ? '순행'
      : '역행';

  const diffMs =
    direction === '순행'
      ? nextJieDate.getTime() - utcDate.getTime()
      : utcDate.getTime() - prevJieDate.getTime();
  const diffDays = Math.max(0, diffMs / 86400000);
  const startAge = Math.max(1, Math.round(diffDays / 3));

  const cycles: DaewoonCycle[] = [];
  for (let i = 0; i < 9; i++) {
    const step = direction === '순행' ? i + 1 : -(i + 1);
    const stemIdx = ((monthStemIndex + step) % 10 + 10) % 10;
    const branchIdx = ((monthBranchIndex + step) % 12 + 12) % 12;
    const stem = STEMS[stemIdx];
    const branch = BRANCHES[branchIdx];

    const stemTenGod = getTenGodForStem(dayMaster, stem);
    const branchTenGod = getTenGodForBranch(dayMaster, branch);
    const twelveStage = getTwelveStage(dayMaster.index, branchIdx);
    const cycleStartAge = startAge + i * 10;
    const cycleEndAge = cycleStartAge + 9;
    const startYear = birthSolarYear + cycleStartAge - 1;
    const endYear = startYear + 9;

    const favorabilityScore = scoreElementPair(
      stem.element,
      branch.element,
      branchIdx,
      dayBranchIndex,
      yongshin,
      ((i % 3) - 1) * 2
    );

    const tone =
      favorabilityScore >= 78
        ? '용신과 호응하여 추진력이 크게 배가되는 황금기입니다.'
        : favorabilityScore >= 60
        ? '균형 잡힌 흐름 속에서 실력을 축적하며 도약하기 좋은 시기입니다.'
        : '변수가 많아 속도를 조절하고 내실을 다지며 기반을 점검해야 하는 시기입니다.';

    const summary = `${stem.hangul}${branch.hangul}(${stem.hanja}${branch.hanja}) 대운은 ${stemTenGod}·${branchTenGod}과 ${twelveStage}의 기운이 겹쳐 '${TEN_GOD_KEYWORDS[stemTenGod] ?? '전환'}'이 테마가 됩니다. ${tone}`;

    cycles.push({
      index: i,
      startAge: cycleStartAge,
      endAge: cycleEndAge,
      startYear,
      endYear,
      stem,
      branch,
      stemTenGod,
      branchTenGod,
      twelveStage,
      favorabilityScore,
      summary,
    });
  }

  return { direction, startAge, cycles };
}

export function calculateSewoon(params: {
  centerYear: number;
  birthSolarYear: number;
  dayMaster: StemInfo;
  dayBranchIndex: number;
  yongshin: { primary: ElementKey; secondary: ElementKey; avoidElement: ElementKey };
}): SewoonYear[] {
  const { centerYear, birthSolarYear, dayMaster, dayBranchIndex, yongshin } = params;
  const years: SewoonYear[] = [];

  for (let offset = -3; offset <= 6; offset++) {
    const year = centerYear + offset;
    const stemIdx = ((year - 4) % 10 + 10) % 10;
    const branchIdx = ((year - 4) % 12 + 12) % 12;
    const stem = STEMS[stemIdx];
    const branch = BRANCHES[branchIdx];
    const stemTenGod = getTenGodForStem(dayMaster, stem);
    const branchTenGod = getTenGodForBranch(dayMaster, branch);
    const age = Math.max(1, year - birthSolarYear + 1);
    const favorabilityScore = scoreElementPair(
      stem.element,
      branch.element,
      branchIdx,
      dayBranchIndex,
      yongshin,
      ((year % 5) - 2)
    );
    const keyword = TEN_GOD_KEYWORDS[stemTenGod] ?? '변화와 조율';
    const summary =
      favorabilityScore >= 75
        ? `${year}년(${stem.hangul}${branch.hangul}년)은 ${stemTenGod}의 에너지가 유리하게 작용해 '${keyword}'에서 가시적인 성과가 기대됩니다.`
        : favorabilityScore >= 58
        ? `${year}년(${stem.hangul}${branch.hangul}년)은 ${stemTenGod}·${branchTenGod}의 흐름 아래 꾸준한 협업과 리듬 관리가 빛나는 해입니다.`
        : `${year}년(${stem.hangul}${branch.hangul}년)은 성급한 확장보다 리스크 점검과 선택과 집중이 유리한 전환기입니다.`;

    years.push({
      year,
      age,
      stem,
      branch,
      stemTenGod,
      branchTenGod,
      favorabilityScore,
      keyword,
      summary,
    });
  }

  return years;
}

export function calculateMonthlyFortune(params: {
  targetYear: number;
  dayMaster: StemInfo;
  dayBranchIndex: number;
  yongshin: { primary: ElementKey; secondary: ElementKey; avoidElement: ElementKey };
}): MonthlyFortune[] {
  const { targetYear, dayMaster, dayBranchIndex, yongshin } = params;
  const list: MonthlyFortune[] = [];

  for (let month = 1; month <= 12; month++) {
    // Jan (month 1) -> 축월(branch 1) under previous Saju year stem; Feb..Dec (2..12) -> 인월..자월
    const effectiveYear = month === 1 ? targetYear - 1 : targetYear;
    const yearStemIdx = ((effectiveYear - 4) % 10 + 10) % 10;
    const inMonthStem = ((yearStemIdx % 5) * 2 + 2) % 10;
    const branchIdx = month % 12; // 1->1(축), 2->2(인), ..., 11->11(해), 12->0(자)
    const offsetFromIn = (branchIdx - 2 + 12) % 12;
    const stemIdx = (inMonthStem + offsetFromIn) % 10;

    const stem = STEMS[stemIdx];
    const branch = BRANCHES[branchIdx];
    const stemTenGod = getTenGodForStem(dayMaster, stem);
    const score = scoreElementPair(
      stem.element,
      branch.element,
      branchIdx,
      dayBranchIndex,
      yongshin,
      ((month % 4) - 1) * 2
    );
    const keyword = TEN_GOD_KEYWORDS[stemTenGod] ?? '균형';

    list.push({
      month,
      stem,
      branch,
      stemTenGod,
      score,
      keyword,
    });
  }

  return list;
}

export function calculateDailyFortune(
  saju: Pick<SajuResult, 'dayMaster' | 'pillars' | 'yongshin'>,
  date: Date = new Date()
): DailyFortune {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${year}-${pad(month)}-${pad(day)}`;

  const jdn = gregorianToJdn(year, month, day);
  const gapjaIdx = ((jdn + 49) % 60 + 60) % 60;
  const stem = STEMS[gapjaIdx % 10];
  const branch = BRANCHES[gapjaIdx % 12];
  const stemTenGod = getTenGodForStem(saju.dayMaster, stem);

  const score = scoreElementPair(
    stem.element,
    branch.element,
    branch.index,
    saju.pillars.day.branch.index,
    saju.yongshin,
    (gapjaIdx % 7) - 3
  );

  const luckyColor = saju.yongshin.primary;
  const luckyDirection = ELEMENT_META[luckyColor].directionKo;

  const headlineMap: Record<string, string> = {
    비견: `나만의 기준이 선명해지는 ${stem.hangul}${branch.hangul}일, 주도적인 실행이 답입니다`,
    겁재: `경쟁 속에서 아이디어가 번뜩이는 ${stem.hangul}${branch.hangul}일, 과감히 제안해 보세요`,
    식신: `창작 몰입도와 섬세한 감각이 살아나는 ${stem.hangul}${branch.hangul}일`,
    상관: `틀을 깨는 관점이 돋보이는 ${stem.hangul}${branch.hangul}일, 직관적 표현을 믿으세요`,
    편재: `예상치 못한 접점과 기회가 열리는 ${stem.hangul}${branch.hangul}일`,
    정재: `차분한 정리와 디테일 마감이 완성도를 높이는 ${stem.hangul}${branch.hangul}일`,
    편관: `핵심 과제를 정면 돌파해 신뢰를 얻는 ${stem.hangul}${branch.hangul}일`,
    정관: `균형과 프로토콜이 빛을 발하는 ${stem.hangul}${branch.hangul}일`,
    편인: `깊은 영감과 독창적 통찰이 찾아오는 ${stem.hangul}${branch.hangul}일`,
    정인: `든든한 조언자와 배움의 흐름이 따르는 ${stem.hangul}${branch.hangul}일`,
  };

  const advice =
    score >= 80
      ? `오늘은 용신 기운(${ELEMENT_META[luckyColor].labelKo})과 흐름이 잘 맞물립니다. 미뤄둔 핵심 의사결정이나 중요한 프레젠테이션을 오전 중에 과감히 추진해 보세요.`
      : score >= 60
      ? `${stemTenGod}의 에너지가 부드럽게 흐르는 날입니다. 협업 파트너와의 짧은 싱크업과 디테일 점검이 하루의 완성도를 크게 끌어올립니다.`
      : `기운의 교차가 빠른 날이니 무리한 확장보다는 루틴을 지키고 여백을 확보하세요. ${ELEMENT_META[luckyColor].luckyColors[0].name} 포인트 아이템이 안정감을 더해줍니다.`;

  return {
    dateStr,
    stem,
    branch,
    stemTenGod,
    score,
    headline: headlineMap[stemTenGod] ?? `${stem.hangul}${branch.hangul}일 · 조화로운 하루`,
    advice,
    luckyColor,
    luckyDirection,
  };
}
