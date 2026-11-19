export {
  MOTION_PRESETS,
  MOTION_PRESET_LIST,
  DEFAULT_MOTION_SETTINGS,
  clampMotionSpeed,
  isMotionReduced,
  computeStaggerDelayMs,
  formatSpringSpec,
} from './presets';
export type { MotionPresetConfig } from './presets';

export {
  MotionProvider,
  useMotionSettings,
  buildSpringTransition,
  useSpringTransition,
} from './MotionContext';
export type { MotionProviderProps } from './MotionContext';

export { MotionSpecBadge } from './MotionSpecBadge';
export type { MotionSpecBadgeProps } from './MotionSpecBadge';

export { AmbientCosmosCanvas } from './AmbientCosmosCanvas';
export type { AmbientCosmosCanvasProps } from './AmbientCosmosCanvas';

export { OhaengOrbitalViz } from './OhaengOrbitalViz';
export type { OhaengOrbitalVizProps } from './OhaengOrbitalViz';

export { PillarRevealCard } from './PillarRevealCard';
export type { PillarRevealCardProps } from './PillarRevealCard';

export { DaewoonTimelineMotion } from './DaewoonTimelineMotion';
export type { DaewoonTimelineMotionProps } from './DaewoonTimelineMotion';

export { YinYangLoader } from './YinYangLoader';
export type { YinYangLoaderProps } from './YinYangLoader';

export { KineticTypography } from './KineticTypography';
export type { KineticTypographyProps } from './KineticTypography';
