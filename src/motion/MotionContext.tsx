import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Transition } from 'framer-motion';
import type { MotionSettings } from '../types/design';
import {
  DEFAULT_MOTION_SETTINGS,
  MOTION_PRESETS,
  clampMotionSpeed,
  isMotionReduced,
} from './presets';

const MotionSettingsContext = createContext<MotionSettings>(DEFAULT_MOTION_SETTINGS);

export interface MotionProviderProps {
  settings: MotionSettings;
  children: ReactNode;
}

export function MotionProvider({ settings, children }: MotionProviderProps) {
  const value = useMemo<MotionSettings>(
    () => ({
      preset: settings.preset,
      speed: clampMotionSpeed(settings.speed),
      stiffness: settings.stiffness,
      damping: settings.damping,
      mass: settings.mass,
      reducedMotion: settings.reducedMotion,
      showMotionSpecs: settings.showMotionSpecs,
      replayNonce: settings.replayNonce,
    }),
    [
      settings.preset,
      settings.speed,
      settings.stiffness,
      settings.damping,
      settings.mass,
      settings.reducedMotion,
      settings.showMotionSpecs,
      settings.replayNonce,
    ]
  );

  return (
    <MotionSettingsContext.Provider value={value}>
      {children}
    </MotionSettingsContext.Provider>
  );
}

export function useMotionSettings(): MotionSettings {
  return useContext(MotionSettingsContext);
}

export function buildSpringTransition(
  settings: MotionSettings,
  staggerIndex = 0,
  customStaggerMs?: number
): Transition {
  if (isMotionReduced(settings)) {
    return { duration: 0 };
  }

  const safeSpeed = clampMotionSpeed(settings.speed);
  const presetSpec = MOTION_PRESETS[settings.preset] ?? MOTION_PRESETS.celestial;
  const baseStaggerMs = customStaggerMs ?? presetSpec.staggerDelayMs;
  const delay = (Math.max(0, staggerIndex) * baseStaggerMs) / 1000 / safeSpeed;

  // Time-scale damped harmonic oscillator identically while preserving damping ratio zeta:
  // omega_n' = speed * omega_n => k' = k * speed^2, c' = c * speed
  return {
    type: 'spring',
    stiffness: Math.max(1, settings.stiffness * safeSpeed * safeSpeed),
    damping: Math.max(0.5, settings.damping * safeSpeed),
    mass: Math.max(0.1, settings.mass),
    delay,
    restDelta: 0.002,
    restSpeed: Math.max(0.05, 0.4 * safeSpeed),
  };
}

export function useSpringTransition(
  staggerIndex = 0,
  customStaggerMs?: number
): Transition {
  const settings = useMotionSettings();

  return useMemo(
    () => buildSpringTransition(settings, staggerIndex, customStaggerMs),
    [
      settings.preset,
      settings.speed,
      settings.stiffness,
      settings.damping,
      settings.mass,
      settings.reducedMotion,
      staggerIndex,
      customStaggerMs,
    ]
  );
}
