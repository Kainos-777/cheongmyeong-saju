import type { BirthInput, SajuResult } from '../types/saju';
import {
  buildPillar,
  calculateElementScores,
  calculateGyeokguk,
  calculateInteractions,
  calculateShensha,
  calculateStrength,
  calculateYongshin,
} from './analysis';
import { resolveBirthLocation } from './birthPlace';
import { SOLAR_TERM_INDEX, STEMS } from './constants';
import {
  calculateDaewoon,
  calculateDailyFortune,
  calculateMonthlyFortune,
  calculateSewoon,
} from './daewoon';
import { getIljuInterpretation } from './interpretation';
import { lunarToSolar, solarToLunar } from './lunarTable';
import {
  calculateTrueSolarTime,
  getSolarTermContext,
  getSolarTermTime,
  gregorianToJdn,
} from './solarTerms';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function calculateSaju(
  input: BirthInput,
  referenceDate: Date = new Date()
): SajuResult {
  const resolvedPlace = resolveBirthLocation(input);

  // 1. Resolve solar & lunar calendar dates
  const solar =
    input.calendarType === 'lunar'
      ? lunarToSolar(input.year, input.month, input.day, input.isLeapMonth ?? false)
      : { year: input.year, month: input.month, day: input.day };

  const canonicalLunar = solarToLunar(solar.year, solar.month, solar.day);
  const lunarDate = {
    year: canonicalLunar.year,
    month: canonicalLunar.month,
    day: canonicalLunar.day,
    isLeapMonth: canonicalLunar.isLeapMonth,
  };

  // 2. Calculate True Solar Time (진태양시)
  const isUnknownTime = Boolean(input.unknownTime);
  const wallHour = isUnknownTime ? 12 : input.hour;
  const wallMinute = isUnknownTime ? 0 : input.minute;

  const tst = calculateTrueSolarTime(
    {
      year: solar.year,
      month: solar.month,
      day: solar.day,
      hour: wallHour,
      minute: wallMinute,
    },
    resolvedPlace.longitude,
    resolvedPlace.utcOffsetMinutes,
    input.useTrueSolarTime,
    input.useEquationOfTime ?? false
  );

  const trueSolarTimeOffsetMin = isUnknownTime ? 0 : tst.offsetMinutes;
  const adjustedTimeStr = isUnknownTime
    ? '시간 미상'
    : `${pad2(tst.adjusted.hour)}:${pad2(tst.adjusted.minute)}`;

  // 3. Year Pillar (switches strictly at exact 입춘 instant)
  const utcYear = tst.utcDate.getUTCFullYear();
  const ipchunUtc = getSolarTermTime(utcYear, SOLAR_TERM_INDEX.IPCHUN);
  const sajuYear =
    tst.utcDate.getTime() < ipchunUtc.getTime() ? utcYear - 1 : utcYear;

  const yearStemIndex = ((sajuYear - 4) % 10 + 10) % 10;
  const yearBranchIndex = ((sajuYear - 4) % 12 + 12) % 12;

  // 4. Month Pillar (switches strictly at exact 12 절입 instants + 오호둔법)
  const termCtx = getSolarTermContext(tst.utcDate);
  const monthBranchIndex = termCtx.monthBranchIndex;
  const inMonthStem = ((yearStemIndex % 5) * 2 + 2) % 10;
  const monthOffsetFromIn = (monthBranchIndex - 2 + 12) % 12;
  const monthStemIndex = (inMonthStem + monthOffsetFromIn) % 10;

  // 5. Day & Hour Pillars (야자시 vs 조자시 + 오서둔법)
  const baseJdn = gregorianToJdn(
    tst.adjusted.year,
    tst.adjusted.month,
    tst.adjusted.day
  );
  const isLateNight23 = !isUnknownTime && tst.adjusted.hour === 23;
  const dayJdn =
    isLateNight23 && input.jasiMode === 'jojasi' ? baseJdn + 1 : baseJdn;

  const dayGapjaIndex = ((dayJdn + 49) % 60 + 60) % 60;
  const dayStemIndex = dayGapjaIndex % 10;
  const dayBranchIndex = dayGapjaIndex % 12;

  const dayMaster = STEMS[dayStemIndex];

  const hourBranchIndex = isUnknownTime
    ? -1
    : Math.floor(((tst.adjusted.hour + 1) % 24) / 2);
  const hourStemIndex = isUnknownTime
    ? -1
    : ((dayStemIndex % 5) * 2 + hourBranchIndex) % 10;

  // 6. Construct Pillars & Analyze
  const pillars = {
    year: buildPillar(
      { key: 'year', stemIndex: yearStemIndex, branchIndex: yearBranchIndex },
      dayMaster
    ),
    month: buildPillar(
      { key: 'month', stemIndex: monthStemIndex, branchIndex: monthBranchIndex },
      dayMaster
    ),
    day: buildPillar(
      { key: 'day', stemIndex: dayStemIndex, branchIndex: dayBranchIndex },
      dayMaster
    ),
    hour: buildPillar(
      {
        key: 'hour',
        stemIndex: hourStemIndex,
        branchIndex: hourBranchIndex,
        isUnknown: isUnknownTime,
      },
      dayMaster
    ),
  };

  const { elements, dominantElement, lackingElement, yinYangRatio } =
    calculateElementScores(pillars);
  const strength = calculateStrength(pillars, dayMaster);
  const gyeokguk = calculateGyeokguk(pillars, dayMaster);
  const yongshin = calculateYongshin(
    dayMaster,
    monthBranchIndex,
    elements,
    strength
  );
  const interactions = calculateInteractions(pillars);
  const shensha = calculateShensha(pillars, dayGapjaIndex);

  // 7. Daewoon, Sewoon, Monthly, Daily
  const daewoonResult = calculateDaewoon({
    gender: input.gender,
    yearStem: pillars.year.stem,
    monthStemIndex,
    monthBranchIndex,
    dayMaster,
    dayBranchIndex,
    birthSolarYear: solar.year,
    utcDate: tst.utcDate,
    prevJieDate: termCtx.prevJieDate,
    nextJieDate: termCtx.nextJieDate,
    yongshin,
  });

  const currentYear = referenceDate.getFullYear();
  const sewoon = calculateSewoon({
    centerYear: currentYear,
    birthSolarYear: solar.year,
    dayMaster,
    dayBranchIndex,
    yongshin,
  });

  const monthly = calculateMonthlyFortune({
    targetYear: currentYear,
    dayMaster,
    dayBranchIndex,
    yongshin,
  });

  const today = calculateDailyFortune(
    { dayMaster, pillars, yongshin },
    referenceDate
  );

  const interpretation = getIljuInterpretation(dayGapjaIndex, yongshin);

  return {
    input,
    birthPlace: resolvedPlace,
    solarDate: {
      year: solar.year,
      month: solar.month,
      day: solar.day,
      hour: input.hour,
      minute: input.minute,
    },
    lunarDate,
    trueSolarTimeOffsetMin,
    adjustedTimeStr,
    solarTermName: termCtx.currentTermName,
    pillars,
    dayMaster,
    elements,
    dominantElement,
    lackingElement,
    yinYangRatio,
    strength,
    gyeokguk,
    yongshin,
    interactions,
    shensha,
    daewoonDirection: daewoonResult.direction,
    daewoonStartAge: daewoonResult.startAge,
    daewoon: daewoonResult.cycles,
    sewoon,
    monthly,
    today,
    interpretation,
  };
}
