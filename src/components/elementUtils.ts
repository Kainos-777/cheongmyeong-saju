import type { ElementKey, Pillar, PillarKey, SajuResult } from '../types/saju';

export interface ElementMeta {
  key: ElementKey;
  ko: string;
  hanja: string;
  en: string;
  cssVar: string;
  defaultHex: string;
  trait: string;
}

export const ELEMENT_META: Record<ElementKey, ElementMeta> = {
  wood: {
    key: 'wood',
    ko: '목',
    hanja: '木',
    en: 'Wood',
    cssVar: 'var(--color-wood)',
    defaultHex: '#38c988',
    trait: '성장 · 발아 · 창의 · 기획',
  },
  fire: {
    key: 'fire',
    ko: '화',
    hanja: '火',
    en: 'Fire',
    cssVar: 'var(--color-fire)',
    defaultHex: '#ff6b5b',
    trait: '확산 · 표현 · 직관 · 열정',
  },
  earth: {
    key: 'earth',
    ko: '토',
    hanja: '土',
    en: 'Earth',
    cssVar: 'var(--color-earth)',
    defaultHex: '#e8b14a',
    trait: '조율 · 포용 · 기반 · 신뢰',
  },
  metal: {
    key: 'metal',
    ko: '금',
    hanja: '金',
    en: 'Metal',
    cssVar: 'var(--color-metal)',
    defaultHex: '#cbd5e1',
    trait: '결단 · 정밀 · 완성 · 원칙',
  },
  water: {
    key: 'water',
    ko: '수',
    hanja: '水',
    en: 'Water',
    cssVar: 'var(--color-water)',
    defaultHex: '#4fa3ff',
    trait: '지혜 · 유연 · 통찰 · 흐름',
  },
};

export const ELEMENT_ORDER: ElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export function getElementColor(element: ElementKey): string {
  return ELEMENT_META[element].cssVar;
}

export function getElementTint(element: ElementKey, percent = 14): string {
  return `color-mix(in srgb, ${ELEMENT_META[element].cssVar} ${percent}%, transparent)`;
}

export function getElementBorder(element: ElementKey, percent = 34): string {
  return `color-mix(in srgb, ${ELEMENT_META[element].cssVar} ${percent}%, transparent)`;
}

export const PILLAR_LABEL_KO: Record<PillarKey | 'chart', string> = {
  year: '년주',
  month: '월주',
  day: '일주',
  hour: '시주',
  chart: '명식 전체',
};

export interface SijinOption {
  key: string;
  hanja: string;
  hangul: string;
  rangeLabel: string;
  hour: number;
  minute: number;
}

export const SIJIN_OPTIONS: SijinOption[] = [
  { key: 'ja', hanja: '子', hangul: '자', rangeLabel: '23:00–00:59', hour: 0, minute: 0 },
  { key: 'chuk', hanja: '丑', hangul: '축', rangeLabel: '01:00–02:59', hour: 2, minute: 0 },
  { key: 'in', hanja: '寅', hangul: '인', rangeLabel: '03:00–04:59', hour: 4, minute: 0 },
  { key: 'myo', hanja: '卯', hangul: '묘', rangeLabel: '05:00–06:59', hour: 6, minute: 0 },
  { key: 'jin', hanja: '辰', hangul: '진', rangeLabel: '07:00–08:59', hour: 8, minute: 0 },
  { key: 'sa', hanja: '巳', hangul: '사', rangeLabel: '09:00–10:59', hour: 10, minute: 0 },
  { key: 'o', hanja: '午', hangul: '오', rangeLabel: '11:00–12:59', hour: 12, minute: 0 },
  { key: 'mi', hanja: '未', hangul: '미', rangeLabel: '13:00–14:59', hour: 14, minute: 0 },
  { key: 'sin', hanja: '申', hangul: '신', rangeLabel: '15:00–16:59', hour: 16, minute: 0 },
  { key: 'yu', hanja: '酉', hangul: '유', rangeLabel: '17:00–18:59', hour: 18, minute: 0 },
  { key: 'sul', hanja: '戌', hangul: '술', rangeLabel: '19:00–20:59', hour: 20, minute: 0 },
  { key: 'hae', hanja: '亥', hangul: '해', rangeLabel: '21:00–22:59', hour: 22, minute: 0 },
];

export function matchSijinKey(hour: number): string {
  if (hour === 23 || hour === 0) return 'ja';
  const idx = Math.floor((hour + 1) / 2);
  return SIJIN_OPTIONS[idx]?.key ?? 'ja';
}

export function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

export function getOrderedPillars(
  pillars: SajuResult['pillars'],
  order: 'traditional' | 'modern'
): Pillar[] {
  if (order === 'traditional') {
    return [pillars.hour, pillars.day, pillars.month, pillars.year];
  }
  return [pillars.year, pillars.month, pillars.day, pillars.hour];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function formatKoreanBirthSummary(result: SajuResult): string {
  const { solarDate, lunarDate, pillars, interpretation, strength, gyeokguk, yongshin } = result;
  const formatPillar = (p: Pillar) =>
    p.isUnknown
      ? `${p.labelKo}: 시간미상`
      : `${p.labelKo}: ${p.stem.hangul}${p.branch.hangul}(${p.stem.hanja}${p.branch.hanja})`;

  const elemLine = result.elements
    .map((e) => `${e.labelKo}(${e.labelHanja}) ${e.percentage}%`)
    .join(' · ');

  return [
    `[청명 淸明 · 사주 명리 리포트] ${result.input.name}`,
    `• 양력: ${solarDate.year}.${pad2(solarDate.month)}.${pad2(solarDate.day)} ${
      result.input.unknownTime ? '시간 미상' : `${pad2(solarDate.hour)}:${pad2(solarDate.minute)}`
    } (진태양시 보정: ${result.adjustedTimeStr})`,
    `• 음력: ${lunarDate.year}.${pad2(lunarDate.month)}.${pad2(lunarDate.day)}${
      lunarDate.isLeapMonth ? ' (윤달)' : ''
    } · 절기: ${result.solarTermName}`,
    `• 사주팔자: ${formatPillar(pillars.year)} | ${formatPillar(pillars.month)} | ${formatPillar(
      pillars.day
    )} | ${formatPillar(pillars.hour)}`,
    `• 일주: ${interpretation.iljuTitle} — ${interpretation.archetype}`,
    `• 신강/신약: ${strength.level} (${strength.score}점) · 격국: ${gyeokguk.name}(${gyeokguk.hanja})`,
    `• 용신/희신/기신: ${ELEMENT_META[yongshin.primary].ko}(用) / ${ELEMENT_META[yongshin.secondary].ko}(喜) / ${ELEMENT_META[yongshin.avoidElement].ko}(忌)`,
    `• 오행 분포: ${elemLine}`,
    `• 핵심 요약: ${interpretation.coreSummary}`,
  ].join('\n');
}
