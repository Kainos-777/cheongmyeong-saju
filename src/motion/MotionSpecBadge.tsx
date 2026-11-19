import { useMotionSettings } from './MotionContext';
import { formatSpringSpec } from './presets';

export interface MotionSpecBadgeProps {
  staggerIndex?: number;
  label?: string;
  customDelayMs?: number;
  className?: string;
}

export function MotionSpecBadge({
  staggerIndex = 0,
  label,
  customDelayMs,
  className = '',
}: MotionSpecBadgeProps) {
  const settings = useMotionSettings();

  if (!settings.showMotionSpecs) {
    return null;
  }

  const formula = formatSpringSpec(settings, staggerIndex, customDelayMs);

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none select-none inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] leading-tight tracking-tight shadow-sm backdrop-blur-md ${className}`}
      style={{
        fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
        background: 'var(--surface-glass)',
        borderColor: 'var(--border-strong)',
        color: 'var(--text-primary)',
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: 'var(--accent-gold)' }}
      />
      {label ? (
        <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
          {label}
        </span>
      ) : null}
      <span className="tabular-nums opacity-90">{formula}</span>
    </span>
  );
}
