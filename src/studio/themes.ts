import type {
  DensityMode,
  DesignTokensState,
  ElementPalette,
  MotionPresetId,
  ThemePresetId,
} from '../types/design';
import type { ElementKey } from '../types/saju';

export interface ThemeTokenValues {
  bgCanvas: string;
  bgElevated: string;
  surface1: string;
  surface2: string;
  surfaceGlass: string;
  borderSubtle: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentGold: string;
  accentGoldSoft: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  nameKo: string;
  nameEn: string;
  subtitle: string;
  mode: 'dark' | 'light';
  description: string;
  tokens: ThemeTokenValues;
  elementPalette: ElementPalette;
}

export interface MotionPresetConfig {
  id: MotionPresetId;
  nameKo: string;
  nameEn: string;
  description: string;
  stiffness: number;
  damping: number;
  mass: number;
  speed: number;
  reducedMotion: boolean;
}

export interface ElementMeta {
  key: ElementKey;
  labelKo: string;
  labelHanja: string;
  labelEn: string;
  role: string;
}

export const ELEMENT_META: ElementMeta[] = [
  { key: 'wood', labelKo: '목', labelHanja: '木', labelEn: 'Wood', role: '성장 · 청룡' },
  { key: 'fire', labelKo: '화', labelHanja: '火', labelEn: 'Fire', role: '열정 · 주작' },
  { key: 'earth', labelKo: '토', labelHanja: '土', labelEn: 'Earth', role: '균형 · 황룡' },
  { key: 'metal', labelKo: '금', labelHanja: '金', labelEn: 'Metal', role: '결단 · 백호' },
  { key: 'water', labelKo: '수', labelHanja: '水', labelEn: 'Water', role: '지혜 · 현무' },
];

export const DENSITY_PAD_MAP: Record<DensityMode, string> = {
  compact: '0.875rem',
  comfortable: '1.25rem',
  editorial: '1.75rem',
};

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  obsidian: {
    id: 'obsidian',
    nameKo: '현무 흑요석',
    nameEn: 'Midnight Ink & Celestial Gold',
    subtitle: 'Midnight Obsidian',
    mode: 'dark',
    description: '깊은 밤하늘 먹빛과 천체 금박 포인트의 시그니처 다크 팔레트',
    tokens: {
      bgCanvas: '#0b0d12',
      bgElevated: '#12151e',
      surface1: '#161a24',
      surface2: '#1e2433',
      surfaceGlass: 'rgba(22, 26, 36, 0.72)',
      borderSubtle: 'rgba(255, 255, 255, 0.09)',
      borderStrong: 'rgba(255, 255, 255, 0.22)',
      textPrimary: '#f4f1ea',
      textSecondary: '#c6c1b6',
      textMuted: '#939aa8',
      accentGold: '#e3b963',
      accentGoldSoft: 'rgba(227, 185, 99, 0.16)',
    },
    elementPalette: {
      wood: '#38c988',
      fire: '#ff6b5b',
      earth: '#e8b14a',
      metal: '#cbd5e1',
      water: '#4fa3ff',
    },
  },
  hanji: {
    id: 'hanji',
    nameKo: '한지 수묵',
    nameEn: 'Warm Paper Editorial',
    subtitle: 'Hanji Ink Paper',
    mode: 'light',
    description: '따뜻한 한지 질감과 농담 깊은 수묵 대비의 에디토리얼 라이트 모드',
    tokens: {
      bgCanvas: '#f7f3ea',
      bgElevated: '#fffdf8',
      surface1: '#ffffff',
      surface2: '#efe9dc',
      surfaceGlass: 'rgba(255, 253, 248, 0.82)',
      borderSubtle: 'rgba(30, 26, 20, 0.11)',
      borderStrong: 'rgba(30, 26, 20, 0.24)',
      textPrimary: '#181612',
      textSecondary: '#484239',
      textMuted: '#696154',
      accentGold: '#966510',
      accentGoldSoft: 'rgba(150, 101, 16, 0.13)',
    },
    elementPalette: {
      wood: '#177e52',
      fire: '#c93b2b',
      earth: '#9f6710',
      metal: '#4f5968',
      water: '#1e5eb8',
    },
  },
  celadon: {
    id: 'celadon',
    nameKo: '청자 비취',
    nameEn: 'Goryeo Jade & Mist',
    subtitle: 'Goryeo Celadon',
    mode: 'dark',
    description: '고려청자 비색과 안개 낀 산수의 고요한 청록 톤 팔레트',
    tokens: {
      bgCanvas: '#0a1413',
      bgElevated: '#101e1c',
      surface1: '#142624',
      surface2: '#1c3330',
      surfaceGlass: 'rgba(20, 38, 36, 0.74)',
      borderSubtle: 'rgba(167, 225, 210, 0.12)',
      borderStrong: 'rgba(167, 225, 210, 0.26)',
      textPrimary: '#edf6f3',
      textSecondary: '#b9d4cc',
      textMuted: '#86aa9f',
      accentGold: '#dec27a',
      accentGoldSoft: 'rgba(222, 194, 122, 0.16)',
    },
    elementPalette: {
      wood: '#54d69d',
      fire: '#f87567',
      earth: '#e7ba5a',
      metal: '#d1e0dc',
      water: '#5cb8f2',
    },
  },
  dancheong: {
    id: 'dancheong',
    nameKo: '네오 단청',
    nameEn: 'Modern Royal Lacquer',
    subtitle: 'Neo Dancheong',
    mode: 'dark',
    description: '전통 단청의 칠보 옻칠과 자금빛 위엄을 현대화한 하이엔드 다크 테마',
    tokens: {
      bgCanvas: '#120b0f',
      bgElevated: '#1b1117',
      surface1: '#23161e',
      surface2: '#2f1d28',
      surfaceGlass: 'rgba(35, 22, 30, 0.74)',
      borderSubtle: 'rgba(247, 212, 168, 0.12)',
      borderStrong: 'rgba(247, 212, 168, 0.28)',
      textPrimary: '#faf2ec',
      textSecondary: '#d9c3b8',
      textMuted: '#b69a93',
      accentGold: '#f2b84b',
      accentGoldSoft: 'rgba(242, 184, 75, 0.18)',
    },
    elementPalette: {
      wood: '#3cd194',
      fire: '#ff6e5c',
      earth: '#f0bc52',
      metal: '#e2d9d5',
      water: '#5cb2ff',
    },
  },
};

export const THEME_PRESET_LIST: ThemePreset[] = [
  THEME_PRESETS.obsidian,
  THEME_PRESETS.hanji,
  THEME_PRESETS.celadon,
  THEME_PRESETS.dancheong,
];

export const MOTION_PRESET_CONFIGS: Record<MotionPresetId, MotionPresetConfig> = {
  celestial: {
    id: 'celestial',
    nameKo: '천체 실크',
    nameEn: 'Celestial Silk',
    description: '부드러운 감쇠와 기품 있는 정착감의 기본 시그니처 물리 곡선',
    stiffness: 220,
    damping: 26,
    mass: 0.9,
    speed: 1,
    reducedMotion: false,
  },
  swiss: {
    id: 'swiss',
    nameKo: '스위스 스내피',
    nameEn: 'Swiss Snappy',
    description: '오버슈트 없이 정밀하고 즉각적으로 안착하는 모던 타이포그래피 감각',
    stiffness: 440,
    damping: 34,
    mass: 0.8,
    speed: 1,
    reducedMotion: false,
  },
  bouncy: {
    id: 'bouncy',
    nameKo: '탄성 스프링',
    nameEn: 'Bouncy Spring',
    description: '생동감 있는 오버슈트와 탄력으로 촉각적 즐거움을 강조한 커브',
    stiffness: 320,
    damping: 14,
    mass: 1,
    speed: 1,
    reducedMotion: false,
  },
  cinematic: {
    id: 'cinematic',
    nameKo: '시네마틱 슬로우',
    nameEn: 'Cinematic Slow',
    description: '무게감 있는 질량과 여유로운 호흡으로 서사를 전달하는 시네마틱 모션',
    stiffness: 120,
    damping: 22,
    mass: 1.4,
    speed: 0.75,
    reducedMotion: false,
  },
  reduced: {
    id: 'reduced',
    nameKo: '모션 최소화',
    nameEn: 'Reduced',
    description: '전정기관 민감도를 배려해 이동·회전을 억제하고 즉각 전환',
    stiffness: 500,
    damping: 50,
    mass: 0.5,
    speed: 1,
    reducedMotion: true,
  },
};

export const MOTION_PRESET_LIST: MotionPresetConfig[] = [
  MOTION_PRESET_CONFIGS.celestial,
  MOTION_PRESET_CONFIGS.swiss,
  MOTION_PRESET_CONFIGS.bouncy,
  MOTION_PRESET_CONFIGS.cinematic,
  MOTION_PRESET_CONFIGS.reduced,
];

export const DEFAULT_DESIGN_TOKENS: DesignTokensState = {
  theme: 'obsidian',
  elementPalette: { ...THEME_PRESETS.obsidian.elementPalette },
  radiusScale: 1,
  glassBlur: 16,
  fontScale: 1,
  density: 'comfortable',
  viewport: 'full',
  motion: {
    preset: 'celestial',
    speed: MOTION_PRESET_CONFIGS.celestial.speed,
    stiffness: MOTION_PRESET_CONFIGS.celestial.stiffness,
    damping: MOTION_PRESET_CONFIGS.celestial.damping,
    mass: MOTION_PRESET_CONFIGS.celestial.mass,
    reducedMotion: false,
    showMotionSpecs: false,
    replayNonce: 0,
  },
  grid: {
    showColumns: false,
    showBaseline: false,
    showSafeArea: false,
  },
  studioOpen: false,
  pillarOrder: 'traditional',
};
