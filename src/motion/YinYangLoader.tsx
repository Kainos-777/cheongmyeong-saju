import { motion } from 'framer-motion';
import { useMotionSettings } from './MotionContext';
import { clampMotionSpeed, isMotionReduced } from './presets';

export interface YinYangLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

// Traditional Xian-Tian Bagua (선천 팔괘) lines [inner, middle, outer]: 1 = Yang (solid), 0 = Yin (broken)
const BAGUA_TRIGRAMS: ReadonlyArray<{
  name: string;
  angleDeg: number;
  lines: readonly [0 | 1, 0 | 1, 0 | 1];
}> = [
  { name: '건 ☰', angleDeg: 0, lines: [1, 1, 1] },
  { name: '손 ☴', angleDeg: 45, lines: [0, 1, 1] },
  { name: '감 ☵', angleDeg: 90, lines: [0, 1, 0] },
  { name: '간 ☶', angleDeg: 135, lines: [0, 0, 1] },
  { name: '곤 ☷', angleDeg: 180, lines: [0, 0, 0] },
  { name: '진 ☳', angleDeg: 225, lines: [1, 0, 0] },
  { name: '리 ☲', angleDeg: 270, lines: [1, 0, 1] },
  { name: '태 ☱', angleDeg: 315, lines: [1, 1, 0] },
];

export function YinYangLoader({
  size = 96,
  label,
  className = '',
}: YinYangLoaderProps) {
  const settings = useMotionSettings();
  const reduced = isMotionReduced(settings);
  const safeSpeed = clampMotionSpeed(settings.speed);

  const outerDuration = 22 / safeSpeed;
  const innerDuration = 11 / safeSpeed;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center gap-2.5 ${className}`}
      role="status"
      aria-label={label ?? '사주 명반 연산 중'}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="overflow-visible"
          aria-hidden="true"
        >
          {/* Subtle outer compass ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            strokeDasharray="2 3"
          />

          {/* 8 Trigrams (팔괘) Ring */}
          <motion.g
            style={{ transformOrigin: '50px 50px', transformBox: 'view-box' }}
            animate={reduced ? { rotate: 0 } : { rotate: 360 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    repeat: Infinity,
                    ease: 'linear',
                    duration: outerDuration,
                  }
            }
          >
            <rect x="0" y="0" width="100" height="100" fill="none" />
            {BAGUA_TRIGRAMS.map((trigram) => (
              <g
                key={trigram.name}
                transform={`rotate(${trigram.angleDeg} 50 50)`}
              >
                {trigram.lines.map((isYang, lineIdx) => {
                  // Inner line at y=16.5, middle y=13, outer y=9.5 (distances 33.5, 37, 40.5 from center 50)
                  const y = 17 - lineIdx * 3.5;
                  if (isYang === 1) {
                    return (
                      <rect
                        key={lineIdx}
                        x="42.5"
                        y={y}
                        width="15"
                        height="1.7"
                        rx="0.85"
                        fill="var(--accent-gold)"
                        opacity={0.9}
                      />
                    );
                  }
                  return (
                    <g key={lineIdx}>
                      <rect
                        x="42.5"
                        y={y}
                        width="6.3"
                        height="1.7"
                        rx="0.85"
                        fill="var(--text-secondary)"
                        opacity={0.85}
                      />
                      <rect
                        x="51.2"
                        y={y}
                        width="6.3"
                        height="1.7"
                        rx="0.85"
                        fill="var(--text-secondary)"
                        opacity={0.85}
                      />
                    </g>
                  );
                })}
              </g>
            ))}
          </motion.g>

          {/* Inner Taiji (태극) Disc */}
          <motion.g
            style={{ transformOrigin: '50px 50px', transformBox: 'view-box' }}
            animate={reduced ? { rotate: 0 } : { rotate: -360 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    repeat: Infinity,
                    ease: 'linear',
                    duration: innerDuration,
                  }
            }
          >
            <rect x="0" y="0" width="100" height="100" fill="none" />
            {/* Yin base */}
            <circle
              cx="50"
              cy="50"
              r="22.5"
              fill="var(--surface-2)"
              stroke="var(--border-strong)"
              strokeWidth="1.1"
            />
            {/* Yang S-curve right + bottom lobe */}
            <path
              d="M 50 27.5 A 22.5 22.5 0 1 1 50 72.5 A 11.25 11.25 0 1 1 50 50 A 11.25 11.25 0 1 0 50 27.5 Z"
              fill="var(--accent-gold)"
            />
            {/* Top Yin lobe -> Yang eye */}
            <circle cx="50" cy="38.75" r="3.1" fill="var(--accent-gold)" />
            {/* Bottom Yang lobe -> Yin eye */}
            <circle cx="50" cy="61.25" r="3.1" fill="var(--surface-2)" />
            {/* Subtle outer sheen ring */}
            <circle
              cx="50"
              cy="50"
              r="22.5"
              fill="none"
              stroke="var(--accent-gold)"
              strokeOpacity="0.45"
              strokeWidth="0.9"
            />
          </motion.g>
        </svg>
      </div>

      {label ? (
        <span
          className="text-xs font-medium tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
