import { motion } from 'framer-motion';
import { buildSpringTransition, useMotionSettings } from './MotionContext';
import { isMotionReduced } from './presets';
import { MotionSpecBadge } from './MotionSpecBadge';

export interface KineticTypographyProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  mode?: 'word' | 'char';
  className?: string;
  staggerMs?: number;
  baseDelayIndex?: number;
  highlightWords?: string[];
  highlightClassName?: string;
  showSpecBadge?: boolean;
}

export function KineticTypography({
  text,
  as: Tag = 'h2',
  mode = 'word',
  className = '',
  staggerMs,
  baseDelayIndex = 0,
  highlightWords = [],
  highlightClassName = '',
  showSpecBadge = false,
}: KineticTypographyProps) {
  const settings = useMotionSettings();
  const reduced = isMotionReduced(settings);

  const tokens =
    mode === 'char'
      ? Array.from(text)
      : text.split(/\s+/).filter((token) => token.length > 0);

  const effectiveStaggerMs = staggerMs ?? (mode === 'char' ? 22 : 52);

  return (
    <div className="relative inline-block max-w-full">
      <Tag
        key={`${settings.replayNonce}-${mode}-${text}`}
        className={className}
        aria-label={text}
      >
        {tokens.map((token, idx) => {
          const isHighlight = highlightWords.some(
            (target) => target.length > 0 && token.includes(target)
          );
          const transition = buildSpringTransition(
            settings,
            baseDelayIndex + idx,
            effectiveStaggerMs
          );

          if (mode === 'char' && token === ' ') {
            return (
              <span key={`space-${idx}`} aria-hidden="true">
                {' '}
              </span>
            );
          }

          return (
            <span
              key={`${idx}-${token}`}
              className="inline-block overflow-hidden align-bottom"
              style={{
                marginRight:
                  mode === 'word' && idx < tokens.length - 1 ? '0.28em' : undefined,
              }}
            >
              <motion.span
                aria-hidden="true"
                className={`inline-block will-change-transform ${
                  isHighlight ? highlightClassName : ''
                }`}
                style={
                  isHighlight && !highlightClassName
                    ? { color: 'var(--accent-gold)' }
                    : undefined
                }
                initial={
                  reduced
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: '0.85em', rotateX: 16 }
                }
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={transition}
              >
                {token}
              </motion.span>
            </span>
          );
        })}
      </Tag>

      {showSpecBadge && settings.showMotionSpecs ? (
        <MotionSpecBadge
          label="kinetic"
          staggerIndex={baseDelayIndex}
          customDelayMs={effectiveStaggerMs}
          className="mt-1.5"
        />
      ) : null}
    </div>
  );
}
