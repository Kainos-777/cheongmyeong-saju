import type { MotionPresetId, MotionSettings } from '../types/design';

export interface MotionPresetConfig {
  id: MotionPresetId;
  nameKo: string;
  nameEn: string;
  tagline: string;
  description: string;
  stiffness: number;
  damping: number;
  mass: number;
  staggerDelayMs: number;
  snippet: string;
}

export const MOTION_PRESETS: Record<MotionPresetId, MotionPresetConfig> = {
  celestial: {
    id: 'celestial',
    nameKo: '천체 유영',
    nameEn: 'Celestial Silk',
    tagline: '우아한 궤도 감속과 매끄러운 천명 리듬',
    description:
      '별자리가 궤도를 따라 안착하듯 부드럽고 균형 잡힌 오버슈트 없는 스프링 모션입니다.',
    stiffness: 210,
    damping: 26,
    mass: 1.0,
    staggerDelayMs: 75,
    snippet: "{ type: 'spring', stiffness: 210, damping: 26, mass: 1 }",
  },
  swiss: {
    id: 'swiss',
    nameKo: '스위스 정밀',
    nameEn: 'Swiss Snappy',
    tagline: '명확한 에디토리얼 그리드 전환',
    description:
      '잔진동을 극도로 억제하고 빠르게 정지하는 고밀도 타이포그래피·데이터 인터페이스용 프리셋입니다.',
    stiffness: 380,
    damping: 34,
    mass: 0.8,
    staggerDelayMs: 45,
    snippet: "{ type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }",
  },
  bouncy: {
    id: 'bouncy',
    nameKo: '생동 탄성',
    nameEn: 'Bouncy Spring',
    tagline: '경쾌한 리바운드와 살아있는 인터랙션',
    description:
      '카드 플립과 오행 노드에 생동감 있는 탄성 여운을 더하는 인터랙티브 프리셋입니다.',
    stiffness: 300,
    damping: 16,
    mass: 0.9,
    staggerDelayMs: 65,
    snippet: "{ type: 'spring', stiffness: 300, damping: 16, mass: 0.9 }",
  },
  cinematic: {
    id: 'cinematic',
    nameKo: '시네마틱 여운',
    nameEn: 'Cinematic Slow',
    tagline: '묵직한 질량감과 깊은 의식적 전개',
    description:
      '관성 질량을 높여 사주 명반이 장엄하게 펼쳐지는 럭셔리 에디토리얼 연출에 적합합니다.',
    stiffness: 120,
    damping: 24,
    mass: 1.4,
    staggerDelayMs: 110,
    snippet: "{ type: 'spring', stiffness: 120, damping: 24, mass: 1.4 }",
  },
  reduced: {
    id: 'reduced',
    nameKo: '모션 최소화',
    nameEn: 'Reduced',
    tagline: '즉각 전환 · 접근성 우선 모드',
    description:
      '전정기관 민감도를 고려하여 모든 이동·회전·펄스 효과를 즉시 전환 또는 정지 상태로 제공합니다.',
    stiffness: 1000,
    damping: 100,
    mass: 1.0,
    staggerDelayMs: 0,
    snippet: '{ duration: 0 }',
  },
};

export const MOTION_PRESET_LIST: MotionPresetConfig[] = [
  MOTION_PRESETS.celestial,
  MOTION_PRESETS.swiss,
  MOTION_PRESETS.bouncy,
  MOTION_PRESETS.cinematic,
  MOTION_PRESETS.reduced,
];

export const DEFAULT_MOTION_SETTINGS: MotionSettings = {
  preset: 'celestial',
  speed: 1,
  stiffness: MOTION_PRESETS.celestial.stiffness,
  damping: MOTION_PRESETS.celestial.damping,
  mass: MOTION_PRESETS.celestial.mass,
  reducedMotion: false,
  showMotionSpecs: false,
  replayNonce: 0,
};

export function clampMotionSpeed(speed: number): number {
  if (!Number.isFinite(speed) || speed <= 0) {
    return 1;
  }
  return Math.max(0.1, Math.min(4, speed));
}

export function isMotionReduced(settings: MotionSettings): boolean {
  return settings.reducedMotion || settings.preset === 'reduced';
}

export function computeStaggerDelayMs(
  settings: MotionSettings,
  staggerIndex = 0,
  customStaggerMs?: number
): number {
  if (isMotionReduced(settings)) {
    return 0;
  }
  const presetSpec = MOTION_PRESETS[settings.preset] ?? MOTION_PRESETS.celestial;
  const baseMs = customStaggerMs ?? presetSpec.staggerDelayMs;
  const safeSpeed = clampMotionSpeed(settings.speed);
  return Math.round((Math.max(0, staggerIndex) * baseMs) / safeSpeed);
}

export function formatSpringSpec(
  settings: MotionSettings,
  staggerIndex = 0,
  customDelayMs?: number
): string {
  if (isMotionReduced(settings)) {
    return 'reduced({ duration: 0 })';
  }
  const safeSpeed = clampMotionSpeed(settings.speed);
  const k = Math.round(settings.stiffness);
  const d = Math.round(settings.damping);
  const m = Number(settings.mass.toFixed(1));
  const delayMs =
    customDelayMs !== undefined
      ? Math.round(customDelayMs / safeSpeed)
      : computeStaggerDelayMs(settings, staggerIndex);
  const speedSuffix = Math.abs(safeSpeed - 1) > 0.01 ? ` @${safeSpeed}x` : '';
  return `spring(k:${k} d:${d} m:${m}) · +${delayMs}ms${speedSuffix}`;
}
