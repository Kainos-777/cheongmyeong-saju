import type { ElementKey } from './saju';

export type ThemePresetId = 'obsidian' | 'hanji' | 'celadon' | 'dancheong';
export type ViewportMode = 'full' | 'desktop' | 'tablet' | 'mobile' | 'split';
export type MotionPresetId =
  | 'celestial'
  | 'swiss'
  | 'bouncy'
  | 'cinematic'
  | 'reduced';
export type DensityMode = 'compact' | 'comfortable' | 'editorial';
export type AppTab =
  | 'pillars'
  | 'elements'
  | 'luck'
  | 'compatibility'
  | 'design-system';

export type ElementPalette = Record<ElementKey, string>;

export interface MotionSettings {
  preset: MotionPresetId;
  speed: number;
  stiffness: number;
  damping: number;
  mass: number;
  reducedMotion: boolean;
  showMotionSpecs: boolean;
  replayNonce: number;
}

export interface GridSettings {
  showColumns: boolean;
  showBaseline: boolean;
  showSafeArea: boolean;
}

export interface DesignTokensState {
  theme: ThemePresetId;
  elementPalette: ElementPalette;
  radiusScale: number;
  glassBlur: number;
  fontScale: number;
  density: DensityMode;
  viewport: ViewportMode;
  motion: MotionSettings;
  grid: GridSettings;
  studioOpen: boolean;
  pillarOrder: 'traditional' | 'modern';
}
