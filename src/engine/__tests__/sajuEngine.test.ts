import { describe, expect, it } from 'vitest';
import type { BirthInput } from '../../types/saju';
import {
  BIRTH_CITIES,
  PRESET_PROFILES,
  SIXTY_GAPJA,
  SOLAR_TERM_INDEX,
  calculateCompatibility,
  calculateDailyFortune,
  calculateSaju,
  equationOfTimeMinutes,
  getIljuInterpretation,
  getLeapMonthOfYear,
  getLunarTableEntries,
  getSolarTermTime,
  jdToJde,
  dateToJd,
  lunarToSolar,
  solarLongitudeDeg,
  solarToLunar,
} from '../index';

function makeInput(overrides: Partial<BirthInput> = {}): BirthInput {
  return {
    name: '테스트',
    gender: 'male',
    calendarType: 'solar',
    isLeapMonth: false,
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    unknownTime: false,
    cityId: 'seoul',
    useTrueSolarTime: false,
    useEquationOfTime: false,
    jasiMode: 'yajasi',
    ...overrides,
  };
}

describe('Manseryeok Saju Engine', () => {
  it('computes 2000-01-01 12:00 Seoul (TST OFF) as 기묘년 병자월 무오일 무오시', () => {
    const res = calculateSaju(
      makeInput({
        year: 2000,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        cityId: 'seoul',
        useTrueSolarTime: false,
      }),
      new Date(2025, 0, 15)
    );

    expect(`${res.pillars.year.stem.hangul}${res.pillars.year.branch.hangul}`).toBe('기묘');
    expect(`${res.pillars.month.stem.hangul}${res.pillars.month.branch.hangul}`).toBe('병자');
    expect(`${res.pillars.day.stem.hangul}${res.pillars.day.branch.hangul}`).toBe('무오');
    expect(`${res.pillars.hour.stem.hangul}${res.pillars.hour.branch.hangul}`).toBe('무오');

    expect(res.dayMaster.hangul).toBe('무');
    expect(res.lunarDate).toEqual({
      year: 1999,
      month: 11,
      day: 25,
      isLeapMonth: false,
    });
    expect(res.trueSolarTimeOffsetMin).toBe(0);
    expect(res.adjustedTimeStr).toBe('12:00');
    expect(res.elements.reduce((s, e) => s + e.percentage, 0)).toBe(100);
    expect(res.yinYangRatio.yang + res.yinYangRatio.yin).toBe(100);
    expect(res.interactions.some((i) => i.type === '지지충')).toBe(true);
    expect(res.shensha.length).toBeGreaterThan(0);
  });

  it('accurately converts Lunar 1999-11-25 <-> Solar 2000-01-01 and handles leap months 1900-2100', () => {
    expect(solarToLunar(2000, 1, 1)).toMatchObject({
      year: 1999,
      month: 11,
      day: 25,
      isLeapMonth: false,
    });
    expect(lunarToSolar(1999, 11, 25, false)).toEqual({
      year: 2000,
      month: 1,
      day: 1,
    });

    // 1900-01-31 = Lunar 1900-01-01
    expect(solarToLunar(1900, 1, 31)).toMatchObject({
      year: 1900,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });

    // Known leap months: 2020 (leap 4), 2023 (leap 2), 2025 (leap 6), 2033 (leap 11)
    expect(getLeapMonthOfYear(2020)).toBe(4);
    expect(getLeapMonthOfYear(2023)).toBe(2);
    expect(getLeapMonthOfYear(2025)).toBe(6);
    expect(getLeapMonthOfYear(2033)).toBe(11);

    // Round-trip leap month date: 2023 leap month 2 day 15
    const solar2023Leap = lunarToSolar(2023, 2, 15, true);
    const backLunar2023 = solarToLunar(
      solar2023Leap.year,
      solar2023Leap.month,
      solar2023Leap.day
    );
    expect(backLunar2023).toMatchObject({
      year: 2023,
      month: 2,
      day: 15,
      isLeapMonth: true,
    });

    // Table continuity across 1900-2100
    const entries = getLunarTableEntries(1900, 2100);
    expect(entries.length).toBeGreaterThan(2400);
    for (let i = 0; i < entries.length - 1; i++) {
      expect(entries[i].startJdn + entries[i].days).toBe(entries[i + 1].startJdn);
      expect(entries[i].days === 29 || entries[i].days === 30).toBe(true);
    }

    // Nonexistent leap month & out-of-range fallback must not crash
    expect(() => lunarToSolar(2024, 5, 10, true)).not.toThrow();
    expect(() => lunarToSolar(1880, 1, 1, false)).not.toThrow();
    expect(() => solarToLunar(2120, 12, 31)).not.toThrow();
  });

  it('computes astronomical solar terms accurately and switches strictly at 입춘', () => {
    // Verify solarLongitudeDeg at solved 2024 입춘 (315 deg)
    const ipchun2024 = getSolarTermTime(2024, SOLAR_TERM_INDEX.IPCHUN);
    const lon = solarLongitudeDeg(jdToJde(dateToJd(ipchun2024)));
    expect(Math.abs(lon - 315)).toBeLessThan(0.001);
    expect(ipchun2024.getUTCFullYear()).toBe(2024);
    expect(ipchun2024.getUTCMonth()).toBe(1); // Feb
    expect(ipchun2024.getUTCDate()).toBe(4);

    // 2024-02-04 16:30 KST (before 입춘) -> 계묘년 을축월
    const beforeIpchun = calculateSaju(
      makeInput({
        year: 2024,
        month: 2,
        day: 4,
        hour: 16,
        minute: 30,
        useTrueSolarTime: false,
      })
    );
    expect(`${beforeIpchun.pillars.year.stem.hangul}${beforeIpchun.pillars.year.branch.hangul}`).toBe('계묘');

    // 2024-02-04 18:30 KST (after 입춘) -> 갑진년 병인월
    const afterIpchun = calculateSaju(
      makeInput({
        year: 2024,
        month: 2,
        day: 4,
        hour: 18,
        minute: 30,
        useTrueSolarTime: false,
      })
    );
    expect(`${afterIpchun.pillars.year.stem.hangul}${afterIpchun.pillars.year.branch.hangul}`).toBe('갑진');
    expect(`${afterIpchun.pillars.month.stem.hangul}${afterIpchun.pillars.month.branch.hangul}`).toBe('병인');

    // Equation of Time sanity bounds (-16 to +17 minutes)
    const eotNov = equationOfTimeMinutes(new Date(Date.UTC(2024, 10, 3, 12, 0)));
    expect(eotNov).toBeGreaterThan(14);
    expect(eotNov).toBeLessThan(18);
  });

  it('handles yajasi vs jojasi at 23:30 accurately', () => {
    const yajasi = calculateSaju(
      makeInput({
        year: 2000,
        month: 1,
        day: 1,
        hour: 23,
        minute: 30,
        useTrueSolarTime: false,
        jasiMode: 'yajasi',
      })
    );
    expect(`${yajasi.pillars.day.stem.hangul}${yajasi.pillars.day.branch.hangul}`).toBe('무오');
    expect(`${yajasi.pillars.hour.stem.hangul}${yajasi.pillars.hour.branch.hangul}`).toBe('임자');

    const jojasi = calculateSaju(
      makeInput({
        year: 2000,
        month: 1,
        day: 1,
        hour: 23,
        minute: 30,
        useTrueSolarTime: false,
        jasiMode: 'jojasi',
      })
    );
    expect(`${jojasi.pillars.day.stem.hangul}${jojasi.pillars.day.branch.hangul}`).toBe('기미');
    expect(`${jojasi.pillars.hour.stem.hangul}${jojasi.pillars.hour.branch.hangul}`).toBe('갑자');
  });

  it('applies True Solar Time (-32m for Seoul) across hour boundaries', () => {
    const standard = calculateSaju(
      makeInput({
        year: 2000,
        month: 1,
        day: 1,
        hour: 9,
        minute: 15,
        cityId: 'seoul',
        useTrueSolarTime: false,
      })
    );
    expect(standard.pillars.hour.branch.hangul).toBe('사');
    expect(`${standard.pillars.hour.stem.hangul}${standard.pillars.hour.branch.hangul}`).toBe('정사');

    const trueSolar = calculateSaju(
      makeInput({
        year: 2000,
        month: 1,
        day: 1,
        hour: 9,
        minute: 15,
        cityId: 'seoul',
        useTrueSolarTime: true,
        useEquationOfTime: false,
      })
    );
    expect(trueSolar.trueSolarTimeOffsetMin).toBe(-32);
    expect(trueSolar.adjustedTimeStr).toBe('08:43');
    expect(trueSolar.pillars.hour.branch.hangul).toBe('진');
    expect(`${trueSolar.pillars.hour.stem.hangul}${trueSolar.pillars.hour.branch.hangul}`).toBe('병진');
  });

  it('handles unknownTime: true gracefully', () => {
    const res = calculateSaju(
      makeInput({
        year: 1995,
        month: 5,
        day: 14,
        unknownTime: true,
      })
    );
    expect(res.pillars.hour.isUnknown).toBe(true);
    expect(res.pillars.hour.stemTenGod).toBe('미상');
    expect(res.adjustedTimeStr).toBe('시간 미상');
    expect(res.elements.reduce((s, e) => s + e.percentage, 0)).toBe(100);
    expect(res.strength.score).toBeGreaterThanOrEqual(8);
    expect(res.strength.score).toBeLessThanOrEqual(95);
  });

  it('computes Daewoon direction (양남음녀 순행, 음남양녀 역행) and 9 cycles', () => {
    // 2024-06-15: 갑진년 (양간)
    const yangMale = calculateSaju(makeInput({ year: 2024, month: 6, day: 15, gender: 'male' }));
    const yangFemale = calculateSaju(makeInput({ year: 2024, month: 6, day: 15, gender: 'female' }));
    expect(yangMale.daewoonDirection).toBe('순행');
    expect(yangFemale.daewoonDirection).toBe('역행');

    // 2000-01-01: 기묘년 (음간)
    const yinMale = calculateSaju(makeInput({ year: 2000, month: 1, day: 1, gender: 'male' }));
    const yinFemale = calculateSaju(makeInput({ year: 2000, month: 1, day: 1, gender: 'female' }));
    expect(yinMale.daewoonDirection).toBe('역행');
    expect(yinFemale.daewoonDirection).toBe('순행');

    expect(yangMale.daewoon.length).toBe(9);
    expect(yangMale.daewoonStartAge).toBeGreaterThanOrEqual(1);
    expect(yangMale.sewoon.length).toBe(10);
    expect(yangMale.monthly.length).toBe(12);
  });

  it('populates all 60 Ilju interpretations, presets, daily fortune, and compatibility', () => {
    const seenTitles = new Set<string>();
    const seenSummaries = new Set<string>();

    for (let i = 0; i < SIXTY_GAPJA.length; i++) {
      const interp = getIljuInterpretation(i, {
        primary: 'wood',
        secondary: 'fire',
        avoidElement: 'metal',
      });
      expect(interp.iljuTitle).toContain(SIXTY_GAPJA[i].hangul);
      expect(interp.iljuAnimal.length).toBeGreaterThan(2);
      expect(interp.archetype.length).toBeGreaterThan(5);
      expect(interp.coreSummary.length).toBeGreaterThan(20);
      expect(interp.personalityStrengths.length).toBeGreaterThanOrEqual(3);
      expect(interp.growthChallenges.length).toBeGreaterThanOrEqual(3);
      expect(interp.careerDesignStyle.length).toBeGreaterThan(15);
      expect(interp.luckyColors.length).toBeGreaterThanOrEqual(2);
      seenTitles.add(interp.iljuTitle);
      seenSummaries.add(interp.coreSummary);
    }

    expect(seenTitles.size).toBe(60);
    expect(seenSummaries.size).toBe(60);
    expect(BIRTH_CITIES.length).toBeGreaterThanOrEqual(15);
    expect(PRESET_PROFILES.length).toBe(5);

    const sajuA = calculateSaju(PRESET_PROFILES[0]);
    const sajuB = calculateSaju(PRESET_PROFILES[4]);
    const compat = calculateCompatibility(sajuA, sajuB);

    expect(compat.overallScore).toBeGreaterThanOrEqual(0);
    expect(compat.overallScore).toBeLessThanOrEqual(100);
    expect(compat.dimensions.length).toBe(5);
    expect(compat.highlights.length).toBeGreaterThanOrEqual(1);

    const daily = calculateDailyFortune(sajuA, new Date(2025, 4, 20));
    expect(daily.score).toBeGreaterThanOrEqual(35);
    expect(daily.score).toBeLessThanOrEqual(96);
    expect(daily.headline.length).toBeGreaterThan(5);
  });
});
