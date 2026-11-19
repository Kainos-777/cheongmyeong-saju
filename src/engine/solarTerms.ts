import { SOLAR_TERMS } from './constants';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const UNIX_EPOCH_JD = 2440587.5;
const MS_PER_DAY = 86400000;

const solarTermCache = new Map<string, number>();

export function normalizeDeg(deg: number): number {
  const mod = deg % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Signed angular difference (target - current) normalized to (-180, 180].
 */
export function signedAngleDiffDeg(targetDeg: number, currentDeg: number): number {
  let diff = normalizeDeg(targetDeg - currentDeg);
  if (diff > 180) diff -= 360;
  return diff;
}

/**
 * Julian Day Number (integer at 12:00 UT) for a proleptic Gregorian calendar date.
 * Verify: gregorianToJdn(2000, 1, 1) === 2451545.
 */
export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Convert an integer Julian Day Number (noon UT) to a Gregorian date.
 */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

export function dateToJd(date: Date): number {
  return date.getTime() / MS_PER_DAY + UNIX_EPOCH_JD;
}

export function jdToDate(jd: number): Date {
  return new Date(Math.round((jd - UNIX_EPOCH_JD) * MS_PER_DAY));
}

/**
 * Approximate decimal year from Julian Day.
 */
export function jdToDecimalYear(jd: number): number {
  return 2000 + (jd - 2451545.0) / 365.25;
}

/**
 * Espenak & Meeus polynomial approximations for Delta-T = TD - UT (in seconds)
 * covering 1900-2100 within a few seconds.
 */
export function deltaTSeconds(decimalYear: number): number {
  if (decimalYear < 1900) {
    const t = (decimalYear - 1820) / 100;
    return -20 + 32 * t * t;
  }
  if (decimalYear < 1920) {
    const t = decimalYear - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  if (decimalYear < 1941) {
    const t = decimalYear - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t ** 3;
  }
  if (decimalYear < 1961) {
    const t = decimalYear - 1950;
    return 29.07 + 0.407 * t - (t * t) / 233 + t ** 3 / 2547;
  }
  if (decimalYear < 1986) {
    const t = decimalYear - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - t ** 3 / 718;
  }
  if (decimalYear < 2005) {
    const t = decimalYear - 2000;
    return (
      63.86 +
      0.3345 * t -
      0.060374 * t * t +
      0.0017275 * t ** 3 +
      0.000651814 * t ** 4 +
      0.00002373599 * t ** 5
    );
  }
  if (decimalYear < 2050) {
    const t = decimalYear - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }
  const u = (decimalYear - 1820) / 100;
  return -20 + 32 * u * u - 0.5628 * (2150 - decimalYear);
}

export function jdToJde(jd: number): number {
  return jd + deltaTSeconds(jdToDecimalYear(jd)) / 86400;
}

export function jdeToJd(jde: number): number {
  return jde - deltaTSeconds(jdToDecimalYear(jde)) / 86400;
}

/**
 * Jean Meeus (Astronomical Algorithms, Ch. 25, Eq. 25.2-25.8) apparent solar ecliptic longitude
 * in degrees [0, 360), accurate to < 0.01 degree across 1900-2100.
 */
export function solarLongitudeDeg(jde: number): number {
  const T = (jde - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = normalizeDeg(M) * DEG_TO_RAD;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  const trueLon = L0 + C;
  const omega = (125.04 - 1934.136 * T) * DEG_TO_RAD;
  const apparentLon = trueLon - 0.00569 - 0.00478 * Math.sin(omega);

  return normalizeDeg(apparentLon);
}

/**
 * Compute exact UTC Date for the given Gregorian year and solar term index (0..23,
 * where 0 = 춘분 0°, ..., 19 = 소한 285°, 21 = 입춘 315°, 23 = 경칩 345°).
 * Solved via Newton-Raphson on apparent solar ecliptic longitude.
 */
export function getSolarTermTime(year: number, termIndex: number): Date {
  const normalizedIdx = ((termIndex % 24) + 24) % 24;
  const cacheKey = `${year}:${normalizedIdx}`;
  const cached = solarTermCache.get(cacheKey);
  if (cached !== undefined) {
    return new Date(cached);
  }

  const targetLon = SOLAR_TERMS[normalizedIdx].longitudeDeg;
  const jan1Jd = gregorianToJdn(year, 1, 1) - 0.5;
  const daysOffset = ((targetLon / 360) * 365.2422 + 79.5) % 365.2422;
  let jde = jan1Jd + daysOffset;

  for (let iter = 0; iter < 10; iter++) {
    const lon = solarLongitudeDeg(jde);
    const diff = signedAngleDiffDeg(targetLon, lon);
    if (Math.abs(diff) < 1e-7) break;

    const lonPlus = solarLongitudeDeg(jde + 0.01);
    const lonMinus = solarLongitudeDeg(jde - 0.01);
    const rate = signedAngleDiffDeg(lonPlus, lonMinus) / 0.02;
    jde += diff / (rate || 0.9856);
  }

  const utcDate = jdToDate(jdeToJd(jde));
  solarTermCache.set(cacheKey, utcDate.getTime());
  return utcDate;
}

/**
 * Equation of Time in minutes (Meeus Ch. 28, Eq. 28.3): apparent solar time minus mean solar time.
 */
export function equationOfTimeMinutes(date: Date): number {
  const jd = dateToJd(date);
  const jde = jdToJde(jd);
  const T = (jde - 2451545.0) / 36525;

  const eps0Deg =
    23.4392911 - (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  const omega = (125.04 - 1934.136 * T) * DEG_TO_RAD;
  const epsRad = (eps0Deg + 0.00256 * Math.cos(omega)) * DEG_TO_RAD;
  const y = Math.tan(epsRad / 2) ** 2;

  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T) * DEG_TO_RAD;
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG_TO_RAD;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  const E =
    y * Math.sin(2 * L0) -
    2 * e * Math.sin(M) +
    4 * e * y * Math.sin(M) * Math.cos(2 * L0) -
    0.5 * y * y * Math.sin(4 * L0) -
    1.25 * e * e * Math.sin(2 * M);

  return E * RAD_TO_DEG * 4;
}

export interface TrueSolarTimeResult {
  offsetMinutes: number;
  longitudeOffsetMinutes: number;
  eotMinutes: number;
  adjusted: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  utcDate: Date;
}

/**
 * Adjust local standard clock time to True Solar Time (진태양시).
 * Standard meridian = (utcOffsetMinutes / 60) * 15°.
 * Longitude offset = (cityLongitude - stdMeridian) * 4 minutes.
 * Optionally includes Equation of Time (균시차).
 */
export function calculateTrueSolarTime(
  localWall: { year: number; month: number; day: number; hour: number; minute: number },
  cityLongitude: number,
  utcOffsetMinutes: number,
  useTrueSolarTime = true,
  useEquationOfTime = false
): TrueSolarTimeResult {
  const localWallMs = Date.UTC(
    localWall.year,
    localWall.month - 1,
    localWall.day,
    localWall.hour,
    localWall.minute
  );
  const utcDate = new Date(localWallMs - utcOffsetMinutes * 60000);

  if (!useTrueSolarTime) {
    return {
      offsetMinutes: 0,
      longitudeOffsetMinutes: 0,
      eotMinutes: 0,
      adjusted: { ...localWall },
      utcDate,
    };
  }

  const standardMeridian = (utcOffsetMinutes / 60) * 15;
  const longitudeOffsetMinutes = (cityLongitude - standardMeridian) * 4;
  const eotMinutes = useEquationOfTime ? equationOfTimeMinutes(utcDate) : 0;
  const offsetMinutes = Math.round(longitudeOffsetMinutes + eotMinutes);

  const adjustedDate = new Date(localWallMs + offsetMinutes * 60000);
  return {
    offsetMinutes,
    longitudeOffsetMinutes,
    eotMinutes,
    adjusted: {
      year: adjustedDate.getUTCFullYear(),
      month: adjustedDate.getUTCMonth() + 1,
      day: adjustedDate.getUTCDate(),
      hour: adjustedDate.getUTCHours(),
      minute: adjustedDate.getUTCMinutes(),
    },
    utcDate,
  };
}

/**
 * Find the active 12-month boundary 절입 (isJie = true) and the most recent 24절기 name at utcDate.
 */
export function getSolarTermContext(utcDate: Date): {
  currentTermName: string;
  activeJieTermName: string;
  monthBranchIndex: number;
  prevJieDate: Date;
  nextJieDate: Date;
} {
  const targetMs = utcDate.getTime();
  const baseYear = utcDate.getUTCFullYear();

  const allTerms: { name: string; isJie: boolean; monthBranchIndex?: number; time: number }[] = [];
  for (let y = baseYear - 1; y <= baseYear + 1; y++) {
    for (const term of SOLAR_TERMS) {
      allTerms.push({
        name: term.name,
        isJie: term.isJie,
        monthBranchIndex: term.monthBranchIndex,
        time: getSolarTermTime(y, term.index).getTime(),
      });
    }
  }
  allTerms.sort((a, b) => a.time - b.time);

  let currentTermName = allTerms[0].name;
  for (const t of allTerms) {
    if (t.time <= targetMs) {
      currentTermName = t.name;
    } else {
      break;
    }
  }

  const jieTerms = allTerms.filter((t) => t.isJie);
  let activeIdx = 0;
  for (let i = 0; i < jieTerms.length; i++) {
    if (jieTerms[i].time <= targetMs) {
      activeIdx = i;
    } else {
      break;
    }
  }

  const activeJie = jieTerms[activeIdx];
  const nextJie = jieTerms[Math.min(activeIdx + 1, jieTerms.length - 1)];

  return {
    currentTermName,
    activeJieTermName: activeJie.name,
    monthBranchIndex: activeJie.monthBranchIndex ?? 2,
    prevJieDate: new Date(activeJie.time),
    nextJieDate: new Date(nextJie.time),
  };
}
