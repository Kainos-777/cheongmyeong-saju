import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  DensityMode,
  DesignTokensState,
  GridSettings,
  MotionPresetId,
  MotionSettings,
  ThemePresetId,
  ViewportMode,
} from '../types/design';
import type { ElementKey } from '../types/saju';
import {
  DEFAULT_DESIGN_TOKENS,
  DENSITY_PAD_MAP,
  MOTION_PRESET_CONFIGS,
  THEME_PRESETS,
  type ThemePreset,
} from './themes';

const STORAGE_KEY = 'cheongmyeong:design-tokens:v1';

const VALID_THEMES = new Set<ThemePresetId>(['obsidian', 'hanji', 'celadon', 'dancheong']);
const VALID_VIEWPORTS = new Set<ViewportMode>(['full', 'desktop', 'tablet', 'mobile', 'split']);
const VALID_DENSITIES = new Set<DensityMode>(['compact', 'comfortable', 'editorial']);
const VALID_MOTION_PRESETS = new Set<MotionPresetId>([
  'celestial',
  'swiss',
  'bouncy',
  'cinematic',
  'reduced',
]);

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function isValidHex(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

function sanitizeTokens(raw: unknown): DesignTokensState {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_DESIGN_TOKENS,
      elementPalette: { ...DEFAULT_DESIGN_TOKENS.elementPalette },
      motion: { ...DEFAULT_DESIGN_TOKENS.motion },
      grid: { ...DEFAULT_DESIGN_TOKENS.grid },
    };
  }

  const record = raw as Record<string, unknown>;
  const theme: ThemePresetId =
    typeof record.theme === 'string' && VALID_THEMES.has(record.theme as ThemePresetId)
      ? (record.theme as ThemePresetId)
      : DEFAULT_DESIGN_TOKENS.theme;

  const basePalette = THEME_PRESETS[theme].elementPalette;
  const rawPalette =
    record.elementPalette && typeof record.elementPalette === 'object'
      ? (record.elementPalette as Record<string, unknown>)
      : {};

  const elementPalette = {
    wood: isValidHex(rawPalette.wood) ? rawPalette.wood : basePalette.wood,
    fire: isValidHex(rawPalette.fire) ? rawPalette.fire : basePalette.fire,
    earth: isValidHex(rawPalette.earth) ? rawPalette.earth : basePalette.earth,
    metal: isValidHex(rawPalette.metal) ? rawPalette.metal : basePalette.metal,
    water: isValidHex(rawPalette.water) ? rawPalette.water : basePalette.water,
  };

  const density: DensityMode =
    typeof record.density === 'string' && VALID_DENSITIES.has(record.density as DensityMode)
      ? (record.density as DensityMode)
      : DEFAULT_DESIGN_TOKENS.density;

  const viewport: ViewportMode =
    typeof record.viewport === 'string' && VALID_VIEWPORTS.has(record.viewport as ViewportMode)
      ? (record.viewport as ViewportMode)
      : DEFAULT_DESIGN_TOKENS.viewport;

  const rawMotion =
    record.motion && typeof record.motion === 'object'
      ? (record.motion as Record<string, unknown>)
      : {};

  const motionPreset: MotionPresetId =
    typeof rawMotion.preset === 'string' &&
    VALID_MOTION_PRESETS.has(rawMotion.preset as MotionPresetId)
      ? (rawMotion.preset as MotionPresetId)
      : DEFAULT_DESIGN_TOKENS.motion.preset;

  const rawGrid =
    record.grid && typeof record.grid === 'object'
      ? (record.grid as Record<string, unknown>)
      : {};

  return {
    theme,
    elementPalette,
    radiusScale: clampNumber(record.radiusScale, 0, 2, DEFAULT_DESIGN_TOKENS.radiusScale),
    glassBlur: clampNumber(record.glassBlur, 0, 32, DEFAULT_DESIGN_TOKENS.glassBlur),
    fontScale: clampNumber(record.fontScale, 0.9, 1.15, DEFAULT_DESIGN_TOKENS.fontScale),
    density,
    viewport,
    motion: {
      preset: motionPreset,
      speed: clampNumber(rawMotion.speed, 0.1, 2, DEFAULT_DESIGN_TOKENS.motion.speed),
      stiffness: clampNumber(rawMotion.stiffness, 60, 700, DEFAULT_DESIGN_TOKENS.motion.stiffness),
      damping: clampNumber(rawMotion.damping, 6, 70, DEFAULT_DESIGN_TOKENS.motion.damping),
      mass: clampNumber(rawMotion.mass, 0.4, 2.5, DEFAULT_DESIGN_TOKENS.motion.mass),
      reducedMotion:
        typeof rawMotion.reducedMotion === 'boolean'
          ? rawMotion.reducedMotion
          : DEFAULT_DESIGN_TOKENS.motion.reducedMotion,
      showMotionSpecs:
        typeof rawMotion.showMotionSpecs === 'boolean'
          ? rawMotion.showMotionSpecs
          : DEFAULT_DESIGN_TOKENS.motion.showMotionSpecs,
      replayNonce:
        typeof rawMotion.replayNonce === 'number' && Number.isFinite(rawMotion.replayNonce)
          ? rawMotion.replayNonce
          : 0,
    },
    grid: {
      showColumns:
        typeof rawGrid.showColumns === 'boolean'
          ? rawGrid.showColumns
          : DEFAULT_DESIGN_TOKENS.grid.showColumns,
      showBaseline:
        typeof rawGrid.showBaseline === 'boolean'
          ? rawGrid.showBaseline
          : DEFAULT_DESIGN_TOKENS.grid.showBaseline,
      showSafeArea:
        typeof rawGrid.showSafeArea === 'boolean'
          ? rawGrid.showSafeArea
          : DEFAULT_DESIGN_TOKENS.grid.showSafeArea,
    },
    studioOpen: typeof record.studioOpen === 'boolean' ? record.studioOpen : false,
    pillarOrder: record.pillarOrder === 'modern' ? 'modern' : 'traditional',
  };
}

function loadInitialTokens(): DesignTokensState {
  if (typeof window === 'undefined') {
    return sanitizeTokens(null);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return sanitizeTokens(null);
    return sanitizeTokens(JSON.parse(raw));
  } catch {
    return sanitizeTokens(null);
  }
}

function syncTokensToDocument(tokens: DesignTokensState): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', tokens.theme);
  root.setAttribute('data-density', tokens.density);

  root.style.setProperty('--color-wood', tokens.elementPalette.wood);
  root.style.setProperty('--color-fire', tokens.elementPalette.fire);
  root.style.setProperty('--color-earth', tokens.elementPalette.earth);
  root.style.setProperty('--color-metal', tokens.elementPalette.metal);
  root.style.setProperty('--color-water', tokens.elementPalette.water);

  const radiusPx = Math.round(tokens.radiusScale * 18);
  root.style.setProperty('--radius-scale', String(tokens.radiusScale));
  root.style.setProperty('--radius-card', `${radiusPx}px`);
  root.style.setProperty('--glass-blur', `${tokens.glassBlur}px`);
  root.style.setProperty('--font-scale', String(tokens.fontScale));
  root.style.setProperty('--density-pad', DENSITY_PAD_MAP[tokens.density]);
  root.style.setProperty('--motion-speed', String(tokens.motion.speed));
}

export interface DesignerStudioContextValue {
  tokens: DesignTokensState;
  activeThemePreset: ThemePreset;
  setTheme: (theme: ThemePresetId) => void;
  setElementColor: (element: ElementKey, hex: string) => void;
  updateTokens: (patch: Partial<DesignTokensState>) => void;
  updateMotion: (patch: Partial<MotionSettings>) => void;
  applyMotionPreset: (preset: MotionPresetId) => void;
  updateGrid: (patch: Partial<GridSettings>) => void;
  setViewport: (viewport: ViewportMode) => void;
  toggleStudio: (open?: boolean) => void;
  triggerReplay: () => void;
  resetTokens: () => void;
}

const DesignerStudioContext = createContext<DesignerStudioContextValue | null>(null);

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function DesignerStudioProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<DesignTokensState>(loadInitialTokens);

  useIsomorphicLayoutEffect(() => {
    syncTokensToDocument(tokens);
  }, [tokens]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    } catch {
      // Ignore quota / private browsing errors
    }
  }, [tokens]);

  const toggleStudio = useCallback((open?: boolean) => {
    setTokens((prev) => ({
      ...prev,
      studioOpen: typeof open === 'boolean' ? open : !prev.studioOpen,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleStudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleStudio]);

  const setTheme = useCallback((theme: ThemePresetId) => {
    const preset = THEME_PRESETS[theme];
    setTokens((prev) => ({
      ...prev,
      theme,
      elementPalette: { ...preset.elementPalette },
    }));
  }, []);

  const setElementColor = useCallback((element: ElementKey, hex: string) => {
    setTokens((prev) => ({
      ...prev,
      elementPalette: {
        ...prev.elementPalette,
        [element]: hex,
      },
    }));
  }, []);

  const updateTokens = useCallback((patch: Partial<DesignTokensState>) => {
    setTokens((prev) => ({
      ...prev,
      ...patch,
      elementPalette: patch.elementPalette
        ? { ...prev.elementPalette, ...patch.elementPalette }
        : prev.elementPalette,
      motion: patch.motion ? { ...prev.motion, ...patch.motion } : prev.motion,
      grid: patch.grid ? { ...prev.grid, ...patch.grid } : prev.grid,
    }));
  }, []);

  const updateMotion = useCallback((patch: Partial<MotionSettings>) => {
    setTokens((prev) => ({
      ...prev,
      motion: {
        ...prev.motion,
        ...patch,
      },
    }));
  }, []);

  const applyMotionPreset = useCallback((presetId: MotionPresetId) => {
    const config = MOTION_PRESET_CONFIGS[presetId];
    setTokens((prev) => ({
      ...prev,
      motion: {
        ...prev.motion,
        preset: presetId,
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
        speed: config.speed,
        reducedMotion: config.reducedMotion,
      },
    }));
  }, []);

  const updateGrid = useCallback((patch: Partial<GridSettings>) => {
    setTokens((prev) => ({
      ...prev,
      grid: {
        ...prev.grid,
        ...patch,
      },
    }));
  }, []);

  const setViewport = useCallback((viewport: ViewportMode) => {
    setTokens((prev) => ({
      ...prev,
      viewport,
    }));
  }, []);

  const triggerReplay = useCallback(() => {
    setTokens((prev) => ({
      ...prev,
      motion: {
        ...prev.motion,
        replayNonce: prev.motion.replayNonce + 1,
      },
    }));
  }, []);

  const resetTokens = useCallback(() => {
    setTokens((prev) => ({
      ...DEFAULT_DESIGN_TOKENS,
      elementPalette: { ...DEFAULT_DESIGN_TOKENS.elementPalette },
      motion: {
        ...DEFAULT_DESIGN_TOKENS.motion,
        replayNonce: prev.motion.replayNonce,
      },
      grid: { ...DEFAULT_DESIGN_TOKENS.grid },
      studioOpen: prev.studioOpen,
    }));
  }, []);

  const value = useMemo<DesignerStudioContextValue>(
    () => ({
      tokens,
      activeThemePreset: THEME_PRESETS[tokens.theme],
      setTheme,
      setElementColor,
      updateTokens,
      updateMotion,
      applyMotionPreset,
      updateGrid,
      setViewport,
      toggleStudio,
      triggerReplay,
      resetTokens,
    }),
    [
      tokens,
      setTheme,
      setElementColor,
      updateTokens,
      updateMotion,
      applyMotionPreset,
      updateGrid,
      setViewport,
      toggleStudio,
      triggerReplay,
      resetTokens,
    ],
  );

  return (
    <DesignerStudioContext.Provider value={value}>
      {children}
    </DesignerStudioContext.Provider>
  );
}

export function useDesignerStudio(): DesignerStudioContextValue {
  const ctx = useContext(DesignerStudioContext);
  if (!ctx) {
    throw new Error('useDesignerStudio must be used inside a <DesignerStudioProvider>');
  }
  return ctx;
}
