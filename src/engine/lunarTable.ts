import { SOLAR_TERM_INDEX } from './constants';
import {
  getSolarTermTime,
  gregorianToJdn,
  jdToDate,
  jdnToGregorian,
  jdeToJd,
  normalizeDeg,
} from './solarTerms';

const DEG_TO_RAD = Math.PI / 180;

export interface LunarDateResult {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  monthDays: number;
}

export interface SolarDateResult {
  year: number;
  month: number;
  day: number;
}

export interface LunarMonthEntry {
  lunarYear: number;
  lunarMonth: number;
  isLeapMonth: boolean;
  startJdn: number;
  days: number;
}

/**
 * Jean Meeus (Astronomical Algorithms Ch. 49) New Moon JDE for lunation index k
 * (k = 0 corresponds to 2000-01-06 New Moon).
 */
function newMoonJde(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  const JDE0 =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T2 -
    0.00000015 * T3 +
    0.00000000073 * T4;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;

  const M =
    normalizeDeg(2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) *
    DEG_TO_RAD;
  const Mp =
    normalizeDeg(
      201.5643 +
        385.81693528 * k +
        0.0107582 * T2 +
        0.00001238 * T3 -
        0.000000058 * T4
    ) * DEG_TO_RAD;
  const F =
    normalizeDeg(
      160.7108 +
        390.67050284 * k -
        0.0016118 * T2 -
        0.00000227 * T3 +
        0.000000011 * T4
    ) * DEG_TO_RAD;
  const Omega =
    normalizeDeg(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) *
    DEG_TO_RAD;

  const corr =
    -0.4072 * Math.sin(Mp) +
    0.17241 * E * Math.sin(M) +
    0.01608 * Math.sin(2 * Mp) +
    0.01039 * Math.sin(2 * F) +
    0.00739 * E * Math.sin(Mp - M) -
    0.00514 * E * Math.sin(Mp + M) +
    0.00208 * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) -
    0.00057 * Math.sin(Mp + 2 * F) +
    0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) +
    0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) -
    0.00017 * Math.sin(Omega) -
    0.00007 * Math.sin(Mp + 2 * M) +
    0.00004 * Math.sin(2 * Mp - 2 * F) +
    0.00004 * Math.sin(3 * M) +
    0.00003 * Math.sin(Mp + M - 2 * F) +
    0.00003 * Math.sin(2 * Mp + 2 * F) -
    0.00003 * Math.sin(Mp + M + 2 * F) +
    0.00003 * Math.sin(Mp - M + 2 * F) -
    0.00002 * Math.sin(Mp - M - 2 * F) -
    0.00002 * Math.sin(3 * Mp + M) +
    0.00002 * Math.sin(4 * Mp);

  return JDE0 + corr;
}

function dateToKstJdn(date: Date): number {
  const kstDate = new Date(date.getTime() + 9 * 3600000);
  return gregorianToJdn(
    kstDate.getUTCFullYear(),
    kstDate.getUTCMonth() + 1,
    kstDate.getUTCDate()
  );
}

const PRINCIPAL_TERM_INDICES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22] as const;

let cachedMonths: LunarMonthEntry[] | null = null;
let cachedMonthLookup: Map<string, LunarMonthEntry> | null = null;
let cachedLeapMonths: Map<number, number> | null = null;

function ensureLunarTable(): {
  months: LunarMonthEntry[];
  lookup: Map<string, LunarMonthEntry>;
  leapByYear: Map<number, number>;
} {
  if (cachedMonths && cachedMonthLookup && cachedLeapMonths) {
    return {
      months: cachedMonths,
      lookup: cachedMonthLookup,
      leapByYear: cachedLeapMonths,
    };
  }

  const startYear = 1898;
  const endYear = 2102;

  // 1. Collect all Principal Solar Terms (중기) KST JDNs and Winter Solstice JDNs
  const principalJdnSet = new Set<number>();
  const dongjiByYear: { year: number; jdn: number }[] = [];

  for (let y = startYear; y <= endYear; y++) {
    for (const termIdx of PRINCIPAL_TERM_INDICES) {
      const dt = getSolarTermTime(y, termIdx);
      const jdn = dateToKstJdn(dt);
      principalJdnSet.add(jdn);
      if (termIdx === SOLAR_TERM_INDEX.DONGJI) {
        dongjiByYear.push({ year: y, jdn });
      }
    }
  }

  // 2. Collect New Moon KST JDNs spanning 1898..2102
  const nmJdns: number[] = [];
  for (let k = -1265; k <= 1275; k++) {
    const jde = newMoonJde(k);
    const jd = jdeToJd(jde);
    // Ensure Date-consistent KST JDN
    const dt = jdToDate(jd);
    nmJdns.push(dateToKstJdn(dt));
  }

  const hasPrincipalTerm = (startJdn: number, endJdn: number): boolean => {
    for (let j = startJdn; j < endJdn; j++) {
      if (principalJdnSet.has(j)) return true;
    }
    return false;
  };

  // 3. Locate the lunation containing each year's Winter Solstice (Month 11)
  const dongjiLunations: { suiYear: number; lunIdx: number }[] = [];
  for (const { year, jdn } of dongjiByYear) {
    let idx = -1;
    for (let i = 0; i < nmJdns.length - 1; i++) {
      if (nmJdns[i] <= jdn && jdn < nmJdns[i + 1]) {
        idx = i;
        break;
      }
    }
    if (idx !== -1) {
      dongjiLunations.push({ suiYear: year, lunIdx: idx });
    }
  }

  // 4. Number months between consecutive Winter Solstices
  const months: LunarMonthEntry[] = [];
  const lookup = new Map<string, LunarMonthEntry>();
  const leapByYear = new Map<number, number>();

  for (let s = 0; s < dongjiLunations.length - 1; s++) {
    const startSui = dongjiLunations[s];
    const endSui = dongjiLunations[s + 1];
    const count = endSui.lunIdx - startSui.lunIdx;
    const hasLeap = count === 13;

    let leapAssigned = false;
    let monthNum = 11;
    let lunarYear = startSui.suiYear;

    for (let offset = 0; offset < count; offset++) {
      const i = startSui.lunIdx + offset;
      const startJdn = nmJdns[i];
      const endJdn = nmJdns[i + 1];
      const days = endJdn - startJdn;

      const isLeapMonth =
        offset > 0 &&
        hasLeap &&
        !leapAssigned &&
        !hasPrincipalTerm(startJdn, endJdn);

      if (isLeapMonth) {
        leapAssigned = true;
        leapByYear.set(lunarYear, monthNum);
      } else if (offset > 0) {
        if (monthNum === 12) {
          monthNum = 1;
          lunarYear += 1;
        } else {
          monthNum += 1;
        }
      }

      const entry: LunarMonthEntry = {
        lunarYear,
        lunarMonth: monthNum,
        isLeapMonth,
        startJdn,
        days,
      };
      months.push(entry);
      lookup.set(`${lunarYear}-${monthNum}-${isLeapMonth ? 1 : 0}`, entry);
    }
  }

  cachedMonths = months;
  cachedMonthLookup = lookup;
  cachedLeapMonths = leapByYear;
  return { months, lookup, leapByYear };
}

/**
 * Returns the leap month number (1..12) for the given lunar year, or 0 if none.
 */
export function getLeapMonthOfYear(lunarYear: number): number {
  const { leapByYear } = ensureLunarTable();
  const clampedYear = Math.max(1900, Math.min(2100, Math.trunc(lunarYear)));
  return leapByYear.get(clampedYear) ?? 0;
}

/**
 * Returns the number of days (29 or 30) in the specified lunar month.
 */
export function getLunarMonthDays(
  lunarYear: number,
  lunarMonth: number,
  isLeapMonth = false
): number {
  const { lookup } = ensureLunarTable();
  const entry =
    lookup.get(`${lunarYear}-${lunarMonth}-${isLeapMonth ? 1 : 0}`) ??
    lookup.get(`${lunarYear}-${lunarMonth}-0`);
  return entry?.days ?? 29;
}

/**
 * Return the full generated 1900-2100 lunar month entries (for inspection/testing).
 */
export function getLunarTableEntries(
  startYear = 1900,
  endYear = 2100
): LunarMonthEntry[] {
  const { months } = ensureLunarTable();
  return months.filter(
    (m) => m.lunarYear >= startYear && m.lunarYear <= endYear
  );
}

/**
 * Convert Solar (Gregorian) date to East Asian Lunisolar date (1900-2100).
 */
export function solarToLunar(
  year: number,
  month: number,
  day: number
): LunarDateResult {
  const { months } = ensureLunarTable();
  const clampedYear = Math.max(1900, Math.min(2100, Math.trunc(year)));
  const clampedMonth = Math.max(1, Math.min(12, Math.trunc(month)));
  const clampedDay = Math.max(1, Math.min(31, Math.trunc(day)));
  const targetJdn = gregorianToJdn(clampedYear, clampedMonth, clampedDay);

  // Binary search in sorted months array
  let lo = 0;
  let hi = months.length - 1;
  let foundIdx = 0;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const entry = months[mid];
    if (targetJdn < entry.startJdn) {
      hi = mid - 1;
    } else if (targetJdn >= entry.startJdn + entry.days) {
      lo = mid + 1;
    } else {
      foundIdx = mid;
      break;
    }
  }

  const entry = months[foundIdx];
  const lunarDay = Math.max(1, Math.min(entry.days, targetJdn - entry.startJdn + 1));

  return {
    year: entry.lunarYear,
    month: entry.lunarMonth,
    day: lunarDay,
    isLeapMonth: entry.isLeapMonth,
    monthDays: entry.days,
  };
}

/**
 * Convert East Asian Lunisolar date to Solar (Gregorian) date (1900-2100).
 * Handles nonexistent leap months and out-of-range days cleanly without crashing.
 */
export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth = false
): SolarDateResult {
  const { lookup } = ensureLunarTable();
  const clampedYear = Math.max(1900, Math.min(2100, Math.trunc(year)));
  const clampedMonth = Math.max(1, Math.min(12, Math.trunc(month)));

  const entry =
    lookup.get(`${clampedYear}-${clampedMonth}-${isLeapMonth ? 1 : 0}`) ??
    lookup.get(`${clampedYear}-${clampedMonth}-0`);

  if (!entry) {
    return { year: clampedYear, month: clampedMonth, day: Math.max(1, Math.min(28, Math.trunc(day))) };
  }

  const clampedDay = Math.max(1, Math.min(entry.days, Math.trunc(day)));
  const targetJdn = entry.startJdn + clampedDay - 1;
  return jdnToGregorian(targetJdn);
}
