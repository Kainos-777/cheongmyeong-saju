import type { ElementPalette, ThemePresetId } from '../types/design';
import type { SajuResult } from '../types/saju';
import { ELEMENT_META, getOrderedPillars, pad2 } from './elementUtils';

export interface SajuPosterOptions {
  theme?: ThemePresetId;
  elementPalette?: Partial<ElementPalette>;
  pillarOrder?: 'traditional' | 'modern';
}

interface ThemeColors {
  bg: string;
  bgInner: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  gold: string;
  goldSoft: string;
  elements: ElementPalette;
}

const THEME_MAP: Record<ThemePresetId, ThemeColors> = {
  obsidian: {
    bg: '#0b0d12',
    bgInner: '#12151e',
    surface: '#161a24',
    surfaceSoft: '#1e2433',
    border: '#2c3345',
    textPrimary: '#f4f1ea',
    textSecondary: '#c6c1b6',
    textMuted: '#939aa8',
    gold: '#e3b963',
    goldSoft: '#2b2416',
    elements: {
      wood: '#38c988',
      fire: '#ff6b5b',
      earth: '#e8b14a',
      metal: '#cbd5e1',
      water: '#4fa3ff',
    },
  },
  hanji: {
    bg: '#f7f3ea',
    bgInner: '#fffdf8',
    surface: '#ffffff',
    surfaceSoft: '#efe9dc',
    border: '#d9d0be',
    textPrimary: '#181612',
    textSecondary: '#484239',
    textMuted: '#696154',
    gold: '#966510',
    goldSoft: '#f2e6cf',
    elements: {
      wood: '#177e52',
      fire: '#c93b2b',
      earth: '#9f6710',
      metal: '#4f5968',
      water: '#1e5eb8',
    },
  },
  celadon: {
    bg: '#0a1413',
    bgInner: '#101e1c',
    surface: '#142624',
    surfaceSoft: '#1c3330',
    border: '#2b4742',
    textPrimary: '#edf6f3',
    textSecondary: '#b9d4cc',
    textMuted: '#86aa9f',
    gold: '#dec27a',
    goldSoft: '#252b1f',
    elements: {
      wood: '#54d69d',
      fire: '#f87567',
      earth: '#e7ba5a',
      metal: '#d1e0dc',
      water: '#5cb8f2',
    },
  },
  dancheong: {
    bg: '#120b0f',
    bgInner: '#1b1117',
    surface: '#23161e',
    surfaceSoft: '#2f1d28',
    border: '#472c3d',
    textPrimary: '#faf2ec',
    textSecondary: '#d9c3b8',
    textMuted: '#b69a93',
    gold: '#f2b84b',
    goldSoft: '#332319',
    elements: {
      wood: '#3cd194',
      fire: '#ff6e5c',
      earth: '#f0bc52',
      metal: '#e2d9d5',
      water: '#5cb2ff',
    },
  },
};

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTextLines(text: string, maxChars: number, maxLines: number): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const lines: string[] = [];
  let remaining = clean;
  while (remaining.length > 0 && lines.length < maxLines) {
    if (remaining.length <= maxChars) {
      lines.push(remaining);
      break;
    }
    let sliceIdx = maxChars;
    const spaceIdx = remaining.lastIndexOf(' ', maxChars);
    if (spaceIdx > Math.floor(maxChars * 0.55)) {
      sliceIdx = spaceIdx;
    }
    const chunk = remaining.slice(0, sliceIdx).trim();
    remaining = remaining.slice(sliceIdx).trim();
    if (lines.length === maxLines - 1 && remaining.length > 0) {
      lines.push(`${chunk.slice(0, Math.max(1, maxChars - 1))}…`);
      break;
    }
    lines.push(chunk);
  }
  return lines;
}

export function generateSajuPosterSvg(
  result: SajuResult,
  options: SajuPosterOptions = {}
): string {
  const themeId = options.theme ?? 'obsidian';
  const basePalette = THEME_MAP[themeId] ?? THEME_MAP.obsidian;
  const palette: ThemeColors = {
    ...basePalette,
    elements: {
      ...basePalette.elements,
      ...options.elementPalette,
    },
  };

  const pillarOrder = options.pillarOrder ?? 'traditional';
  const orderedPillars = getOrderedPillars(result.pillars, pillarOrder);
  const { solarDate, lunarDate, interpretation, strength, gyeokguk, yongshin } = result;

  const solarLabel = `${solarDate.year}.${pad2(solarDate.month)}.${pad2(solarDate.day)} ${
    result.input.unknownTime
      ? '시간미상'
      : `${pad2(solarDate.hour)}:${pad2(solarDate.minute)}`
  }`;
  const lunarLabel = `음력 ${lunarDate.year}.${pad2(lunarDate.month)}.${pad2(lunarDate.day)}${
    lunarDate.isLeapMonth ? ' 윤' : ''
  }`;

  const pillarCardsSvg = orderedPillars
    .map((pillar, idx) => {
      const cardW = 160;
      const gap = 16;
      const startX = 56 + idx * (cardW + gap);
      const isDay = pillar.key === 'day';
      const stemColor = palette.elements[pillar.stem.element];
      const branchColor = palette.elements[pillar.branch.element];
      const borderStroke = isDay ? palette.gold : palette.border;

      if (pillar.isUnknown) {
        return `
      <g id="pillar-${pillar.key}" transform="translate(${startX}, 236)">
        <rect x="0" y="0" width="${cardW}" height="310" rx="18" fill="${palette.surface}" stroke="${borderStroke}" stroke-width="1.5" />
        <text x="18" y="30" fill="${palette.textSecondary}" font-family="'Noto Sans KR', sans-serif" font-size="13" font-weight="700">${escapeXml(pillar.labelKo)} ${escapeXml(pillar.labelHanja)}</text>
        <text x="${cardW / 2}" y="156" text-anchor="middle" fill="${palette.textMuted}" font-family="'Noto Serif KR', serif" font-size="34" font-weight="700">時未詳</text>
        <text x="${cardW / 2}" y="192" text-anchor="middle" fill="${palette.textMuted}" font-family="'Noto Sans KR', sans-serif" font-size="12">출생시간 미상</text>
      </g>`;
      }

      return `
      <g id="pillar-${pillar.key}" transform="translate(${startX}, 236)">
        <rect x="0" y="0" width="${cardW}" height="310" rx="18" fill="${palette.surface}" stroke="${borderStroke}" stroke-width="${isDay ? 2 : 1.25}" />
        <text x="18" y="30" fill="${palette.textSecondary}" font-family="'Noto Sans KR', sans-serif" font-size="13" font-weight="700">${escapeXml(pillar.labelKo)} ${escapeXml(pillar.labelHanja)}</text>
        ${
          isDay
            ? `<rect x="104" y="13" width="40" height="22" rx="11" fill="${palette.goldSoft}" />
               <text x="124" y="28" text-anchor="middle" fill="${palette.gold}" font-family="'Noto Sans KR', sans-serif" font-size="11" font-weight="700">일간</text>`
            : ''
        }

        <rect x="14" y="48" width="${cardW - 28}" height="104" rx="14" fill="${palette.surfaceSoft}" stroke="${stemColor}" stroke-opacity="0.35" stroke-width="1" />
        <text x="${cardW / 2}" y="106" text-anchor="middle" fill="${stemColor}" font-family="'Noto Serif KR', serif" font-size="52" font-weight="700">${escapeXml(pillar.stem.hanja)}</text>
        <text x="26" y="138" fill="${palette.textPrimary}" font-family="'Noto Sans KR', sans-serif" font-size="13" font-weight="700">${escapeXml(pillar.stem.hangul)}</text>
        <text x="${cardW - 26}" y="138" text-anchor="end" fill="${palette.textSecondary}" font-family="'Noto Sans KR', sans-serif" font-size="12">${escapeXml(pillar.stemTenGod)}</text>

        <rect x="14" y="164" width="${cardW - 28}" height="104" rx="14" fill="${palette.surfaceSoft}" stroke="${branchColor}" stroke-opacity="0.35" stroke-width="1" />
        <text x="${cardW / 2}" y="222" text-anchor="middle" fill="${branchColor}" font-family="'Noto Serif KR', serif" font-size="52" font-weight="700">${escapeXml(pillar.branch.hanja)}</text>
        <text x="26" y="254" fill="${palette.textPrimary}" font-family="'Noto Sans KR', sans-serif" font-size="13" font-weight="700">${escapeXml(pillar.branch.hangul)}</text>
        <text x="${cardW - 26}" y="254" text-anchor="end" fill="${palette.textSecondary}" font-family="'Noto Sans KR', sans-serif" font-size="12">${escapeXml(pillar.branchTenGod)}</text>

        <text x="18" y="293" fill="${palette.textMuted}" font-family="'Noto Sans KR', sans-serif" font-size="11">${escapeXml(pillar.twelveStage)}</text>
        <text x="${cardW - 18}" y="293" text-anchor="end" fill="${palette.textMuted}" font-family="'Noto Sans KR', sans-serif" font-size="11">${escapeXml(pillar.branch.animal)}</text>
      </g>`;
    })
    .join('\n');

  const ohaengBarsSvg = result.elements
    .map((el, idx) => {
      const y = idx * 34;
      const color = palette.elements[el.element];
      const maxBarW = 420;
      const fillW = Math.max(8, Math.round((Math.min(100, el.percentage) / 100) * maxBarW));
      return `
      <g transform="translate(0, ${y})">
        <text x="0" y="16" fill="${color}" font-family="'Noto Serif KR', serif" font-size="15" font-weight="700">${escapeXml(el.labelHanja)}</text>
        <text x="24" y="16" fill="${palette.textPrimary}" font-family="'Noto Sans KR', sans-serif" font-size="13" font-weight="700">${escapeXml(el.labelKo)}</text>
        <rect x="64" y="5" width="${maxBarW}" height="12" rx="6" fill="${palette.surfaceSoft}" />
        <rect x="64" y="5" width="${fillW}" height="12" rx="6" fill="${color}" />
        <text x="502" y="16" fill="${palette.textPrimary}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">${Math.round(el.percentage)}%</text>
        <text x="556" y="16" fill="${palette.textMuted}" font-family="'Noto Sans KR', sans-serif" font-size="11">${escapeXml(el.status)}</text>
      </g>`;
    })
    .join('\n');

  const summaryLines = wrapTextLines(interpretation.coreSummary, 44, 3);
  const summarySvg = summaryLines
    .map(
      (line, idx) =>
        `<text x="80" y="${884 + idx * 24}" fill="${palette.textSecondary}" font-family="'Noto Sans KR', sans-serif" font-size="14">${escapeXml(line)}</text>`
    )
    .join('\n');

  const swatchesSvg = interpretation.luckyColors
    .slice(0, 4)
    .map((swatch, idx) => {
      const x = 56 + idx * 174;
      return `
      <g transform="translate(${x}, 976)">
        <rect x="0" y="0" width="162" height="54" rx="14" fill="${palette.surface}" stroke="${palette.border}" stroke-width="1" />
        <rect x="10" y="10" width="34" height="34" rx="10" fill="${escapeXml(swatch.hex)}" stroke="${palette.border}" stroke-width="1" />
        <text x="54" y="25" fill="${palette.textPrimary}" font-family="'Noto Sans KR', sans-serif" font-size="12" font-weight="700">${escapeXml(swatch.name)}</text>
        <text x="54" y="42" fill="${palette.textMuted}" font-family="'JetBrains Mono', monospace" font-size="11">${escapeXml(swatch.hex)}</text>
      </g>`;
    })
    .join('\n');

  const yongshinMeta = ELEMENT_META[yongshin.primary];
  const dominantMeta = ELEMENT_META[result.dominantElement];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1120" viewBox="0 0 800 1120" fill="none">
  <g id="bg-layer">
    <rect x="0" y="0" width="800" height="1120" fill="${palette.bg}" />
    <rect x="24" y="24" width="752" height="1072" rx="28" fill="${palette.bgInner}" stroke="${palette.border}" stroke-width="1.5" />
    <rect x="34" y="34" width="732" height="1052" rx="22" fill="none" stroke="${palette.gold}" stroke-opacity="0.22" stroke-width="1" />
  </g>

  <g id="celestial-ornament" opacity="0.28">
    <circle cx="676" cy="128" r="92" stroke="${palette.gold}" stroke-width="1" stroke-dasharray="4 6" />
    <circle cx="676" cy="128" r="60" stroke="${palette.gold}" stroke-width="0.8" />
    <line x1="56" y1="206" x2="744" y2="206" stroke="${palette.border}" stroke-width="1" />
  </g>

  <g id="header-group">
    <rect x="56" y="56" width="124" height="30" rx="15" fill="${palette.goldSoft}" />
    <text x="118" y="75" text-anchor="middle" fill="${palette.gold}" font-family="'Noto Serif KR', serif" font-size="13" font-weight="700">청명 · 淸明</text>

    <text x="56" y="132" fill="${palette.textPrimary}" font-family="'Noto Serif KR', serif" font-size="34" font-weight="700">${escapeXml(result.input.name)} 사주 명식</text>
    <text x="56" y="164" fill="${palette.textSecondary}" font-family="'JetBrains Mono', monospace" font-size="13">${escapeXml(solarLabel)} · ${escapeXml(lunarLabel)} · 절기 ${escapeXml(result.solarTermName)}</text>
    <text x="56" y="188" fill="${palette.textMuted}" font-family="'Noto Sans KR', sans-serif" font-size="12">격국 ${escapeXml(gyeokguk.name)}(${escapeXml(gyeokguk.hanja)}) · 용신 ${escapeXml(yongshinMeta.ko)}(${escapeXml(yongshinMeta.hanja)}) · 주력오행 ${escapeXml(dominantMeta.ko)} · ${escapeXml(strength.level)}</text>
  </g>

  <g id="four-pillars-group">
    ${pillarCardsSvg}
  </g>

  <g id="ohaeng-bars-group" transform="translate(56, 574)">
    <rect x="0" y="0" width="688" height="202" rx="18" fill="${palette.surface}" stroke="${palette.border}" stroke-width="1" />
    <text x="24" y="30" fill="${palette.gold}" font-family="'Noto Sans KR', sans-serif" font-size="13" font-weight="700">오행 에너지 균형 (五行)</text>
    <text x="664" y="30" text-anchor="end" fill="${palette.textMuted}" font-family="'JetBrains Mono', monospace" font-size="12">신강도 ${strength.score}점 (${escapeXml(strength.level)})</text>
    <g transform="translate(24, 46)">
      ${ohaengBarsSvg}
    </g>
  </g>

  <g id="archetype-group">
    <rect x="56" y="796" width="688" height="160" rx="18" fill="${palette.surface}" stroke="${palette.gold}" stroke-opacity="0.45" stroke-width="1.2" />
    <text x="80" y="828" fill="${palette.gold}" font-family="'Noto Sans KR', sans-serif" font-size="12" font-weight="700">${escapeXml(interpretation.iljuTitle)} · ${escapeXml(interpretation.iljuAnimal)}</text>
    <text x="80" y="856" fill="${palette.textPrimary}" font-family="'Noto Serif KR', serif" font-size="20" font-weight="700">${escapeXml(interpretation.archetype)}</text>
    ${summarySvg}
  </g>

  <g id="lucky-palette-group">
    ${swatchesSvg}
  </g>

  <g id="footer-signature">
    <text x="56" y="1068" fill="${palette.textMuted}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="1.5">CHEONGMYEONG SAJU STUDIO · VECTOR POSTER EDITION</text>
    <text x="744" y="1068" text-anchor="end" fill="${palette.gold}" font-family="'Noto Serif KR', serif" font-size="12" font-weight="700">淸明 印</text>
  </g>
</svg>`;
}
