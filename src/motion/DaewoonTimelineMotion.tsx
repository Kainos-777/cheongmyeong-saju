import { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { DaewoonCycle, ElementKey } from '../types/saju';
import { buildSpringTransition, useMotionSettings } from './MotionContext';
import { isMotionReduced } from './presets';
import { MotionSpecBadge } from './MotionSpecBadge';

export interface DaewoonTimelineMotionProps {
  daewoon: DaewoonCycle[];
  activeIndex: number;
  onSelect: (idx: number) => void;
  currentAge?: number;
  className?: string;
}

const ELEMENT_CSS: Record<ElementKey, string> = {
  wood: 'var(--color-wood)',
  fire: 'var(--color-fire)',
  earth: 'var(--color-earth)',
  metal: 'var(--color-metal)',
  water: 'var(--color-water)',
};

const SVG_W = 760;
const SVG_H = 216;
const PAD_X = 48;
const TOP_Y = 44;
const BOTTOM_Y = 148;
const BASELINE_Y = 166;

interface WavePoint {
  x: number;
  y: number;
  cycle: DaewoonCycle;
  index: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function buildSmoothCubicPath(pts: WavePoint[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = clamp(p1.y + (p2.y - p0.y) / 6, TOP_Y - 10, BOTTOM_Y + 8);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = clamp(p2.y - (p3.y - p1.y) / 6, TOP_Y - 10, BOTTOM_Y + 8);

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export function DaewoonTimelineMotion({
  daewoon,
  activeIndex,
  onSelect,
  currentAge,
  className = '',
}: DaewoonTimelineMotionProps) {
  const uid = useId().replace(/:/g, '');
  const settings = useMotionSettings();
  const reduced = isMotionReduced(settings);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points = useMemo<WavePoint[]>(() => {
    if (daewoon.length === 0) return [];
    const usableW = SVG_W - PAD_X * 2;
    const stepX = daewoon.length > 1 ? usableW / (daewoon.length - 1) : 0;

    return daewoon.map((cycle, index) => {
      const x =
        daewoon.length === 1 ? SVG_W / 2 : PAD_X + index * stepX;
      const clampedScore = clamp(cycle.favorabilityScore, 20, 100);
      const ratio = (clampedScore - 20) / 80;
      const y = BOTTOM_Y - ratio * (BOTTOM_Y - TOP_Y);
      return { x, y, cycle, index };
    });
  }, [daewoon]);

  const { strokePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { strokePath: '', areaPath: '' };
    const line = buildSmoothCubicPath(points);
    const first = points[0];
    const last = points[points.length - 1];
    const area = `${line} L ${last.x.toFixed(1)} ${BASELINE_Y} L ${first.x.toFixed(1)} ${BASELINE_Y} Z`;
    return { strokePath: line, areaPath: area };
  }, [points]);

  const currentAgeMarkerX = useMemo<number | null>(() => {
    if (currentAge === undefined || !Number.isFinite(currentAge) || points.length === 0) {
      return null;
    }

    if (currentAge <= points[0].cycle.startAge) {
      return Math.max(PAD_X - 16, points[0].x - 10);
    }

    const lastIdx = points.length - 1;
    if (currentAge >= points[lastIdx].cycle.endAge) {
      return points[lastIdx].x;
    }

    for (let i = 0; i < points.length; i++) {
      const cur = points[i].cycle;
      const next = points[i + 1]?.cycle;
      const upperAge = next ? next.startAge : cur.endAge + 1;
      if (currentAge >= cur.startAge && currentAge < upperAge) {
        const span = Math.max(1, upperAge - cur.startAge);
        const frac = clamp((currentAge - cur.startAge) / span, 0, 1);
        const nextX = next ? points[i + 1].x : points[i].x;
        return points[i].x + frac * (nextX - points[i].x);
      }
    }

    return points[0].x;
  }, [currentAge, points]);

  if (daewoon.length === 0) {
    return null;
  }

  const safeActiveIdx = clamp(activeIndex, 0, daewoon.length - 1);
  const curveTransition = buildSpringTransition(settings, 0);
  const pillTransition = buildSpringTransition(settings, 0, 0);

  return (
    <div
      className={`relative rounded-2xl border p-3 sm:p-4 backdrop-blur-md ${className}`}
      style={{
        borderRadius: 'var(--radius-card)',
        background: 'var(--surface-glass)',
        borderColor: 'var(--border-subtle)',
        backdropFilter: 'blur(var(--glass-blur))',
      }}
      data-testid="daewoon-timeline-motion"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            대운 흐름 곡선 (大運波動)
          </span>
          {currentAge !== undefined ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: 'var(--accent-gold-soft)',
                color: 'var(--accent-gold)',
              }}
            >
              현재 {currentAge}세
            </span>
          ) : null}
        </div>

        {settings.showMotionSpecs ? (
          <MotionSpecBadge label="curve" staggerIndex={0} />
        ) : (
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            노드를 클릭하여 시기별 운세 탐색
          </span>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[660px] space-y-2">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="h-auto w-full overflow-visible select-none"
            role="img"
            aria-label="대운 길흉 파동 그래프"
          >
            <defs>
              <linearGradient id={`${uid}-wave-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.28" />
                <stop offset="75%" stopColor="var(--color-water)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="var(--color-water)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`${uid}-wave-stroke`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-wood)" />
                <stop offset="50%" stopColor="var(--accent-gold)" />
                <stop offset="100%" stopColor="var(--color-water)" />
              </linearGradient>
            </defs>

            {/* Horizontal score guide lines */}
            {[85, 60, 35].map((guideScore) => {
              const ratio = (guideScore - 20) / 80;
              const y = BOTTOM_Y - ratio * (BOTTOM_Y - TOP_Y);
              return (
                <g key={guideScore}>
                  <line
                    x1={PAD_X - 18}
                    y1={y}
                    x2={SVG_W - PAD_X + 18}
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeWidth="0.8"
                    strokeDasharray="3 5"
                  />
                  <text
                    x={PAD_X - 24}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    fill="var(--text-muted)"
                    fontSize="9.5"
                    className="tabular-nums"
                  >
                    {guideScore}
                  </text>
                </g>
              );
            })}

            {/* Baseline */}
            <line
              x1={PAD_X - 18}
              y1={BASELINE_Y}
              x2={SVG_W - PAD_X + 18}
              y2={BASELINE_Y}
              stroke="var(--border-strong)"
              strokeWidth="0.9"
            />

            {/* Area fill under luck wave */}
            {areaPath ? (
              <motion.path
                key={`area-${settings.replayNonce}-${points.length}`}
                d={areaPath}
                fill={`url(#${uid}-wave-area)`}
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={curveTransition}
              />
            ) : null}

            {/* Animated Cubic-Bezier Luck Wave */}
            {strokePath ? (
              <motion.path
                key={`stroke-${settings.replayNonce}-${points.length}`}
                d={strokePath}
                fill="none"
                stroke={`url(#${uid}-wave-stroke)`}
                strokeWidth="3"
                strokeLinecap="round"
                initial={
                  reduced
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0.25 }
                }
                animate={{ pathLength: 1, opacity: 1 }}
                transition={curveTransition}
              />
            ) : null}

            {/* Current Age Vertical Marker */}
            {currentAgeMarkerX !== null && currentAge !== undefined ? (
              <g>
                <line
                  x1={currentAgeMarkerX}
                  y1={TOP_Y - 14}
                  x2={currentAgeMarkerX}
                  y2={BASELINE_Y}
                  stroke="var(--accent-gold)"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />
                <rect
                  x={currentAgeMarkerX - 26}
                  y={8}
                  width="52"
                  height="18"
                  rx="9"
                  fill="var(--accent-gold)"
                />
                <text
                  x={currentAgeMarkerX}
                  y={17.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--bg-canvas)"
                  fontSize="9.5"
                  fontWeight="700"
                >
                  현재 {currentAge}세
                </text>
              </g>
            ) : null}

            {/* Interactive Cycle Nodes */}
            {points.map((pt) => {
              const isSelected = pt.index === safeActiveIdx;
              const isHovered = pt.index === hoveredIdx;
              const isHighlighted = isSelected || isHovered;
              const stemColor = ELEMENT_CSS[pt.cycle.stem.element];

              return (
                <g
                  key={pt.cycle.index}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${pt.cycle.startAge}세 대운 ${pt.cycle.stem.hangul}${pt.cycle.branch.hangul} 점수 ${pt.cycle.favorabilityScore}점`}
                  className="cursor-pointer focus:outline-none"
                  onMouseEnter={() => setHoveredIdx(pt.index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelect(pt.index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(pt.index);
                    }
                  }}
                >
                  {/* Generous invisible hit area */}
                  <circle cx={pt.x} cy={pt.y} r="20" fill="transparent" />

                  {/* Vertical stem to baseline */}
                  <line
                    x1={pt.x}
                    y1={pt.y + 8}
                    x2={pt.x}
                    y2={BASELINE_Y}
                    stroke={isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}
                    strokeWidth={isSelected ? 1.4 : 0.8}
                    strokeOpacity={isSelected ? 0.85 : 0.6}
                  />

                  {/* Outer glow ring when active/hovered */}
                  {isHighlighted ? (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 12 : 10}
                      fill={stemColor}
                      fillOpacity="0.2"
                      stroke={isSelected ? 'var(--accent-gold)' : stemColor}
                      strokeWidth="1.6"
                    />
                  ) : null}

                  {/* Node Core Dot */}
                  <motion.circle
                    key={`node-${pt.index}-${settings.replayNonce}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6.5 : 4.8}
                    fill={isSelected ? 'var(--accent-gold)' : 'var(--surface-1)'}
                    stroke={isSelected ? 'var(--bg-canvas)' : stemColor}
                    strokeWidth="2.2"
                    initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={buildSpringTransition(settings, pt.index, 38)}
                  />

                  {/* Score Callout above highlighted node */}
                  {isHighlighted ? (
                    <g transform={`translate(${pt.x}, ${pt.y - 18})`}>
                      <rect
                        x="-18"
                        y="-9"
                        width="36"
                        height="17"
                        rx="8.5"
                        fill="var(--surface-1)"
                        stroke={
                          isSelected ? 'var(--accent-gold)' : 'var(--border-strong)'
                        }
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="var(--text-primary)"
                        fontSize="9.5"
                        fontWeight="700"
                        className="tabular-nums"
                      >
                        {pt.cycle.favorabilityScore}점
                      </text>
                    </g>
                  ) : null}

                  {/* Axis label below baseline */}
                  <text
                    x={pt.x}
                    y={BASELINE_Y + 18}
                    textAnchor="middle"
                    fill={
                      isSelected ? 'var(--accent-gold)' : 'var(--text-primary)'
                    }
                    fontSize="12"
                    fontWeight="700"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {pt.cycle.stem.hanja}
                    {pt.cycle.branch.hanja}
                  </text>
                  <text
                    x={pt.x}
                    y={BASELINE_Y + 34}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="9.5"
                    className="tabular-nums"
                  >
                    {pt.cycle.startAge}세~
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Scrubber Pill Rail with Framer Motion layoutId Selection Ring */}
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${daewoon.length}, minmax(0, 1fr))`,
            }}
          >
            {daewoon.map((cycle, idx) => {
              const isSelected = idx === safeActiveIdx;
              const stemColor = ELEMENT_CSS[cycle.stem.element];
              return (
                <button
                  key={cycle.index}
                  type="button"
                  onClick={() => onSelect(idx)}
                  aria-pressed={isSelected}
                  className="relative flex min-h-[44px] flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-center transition-colors focus-visible:outline-2"
                  style={{
                    background: isSelected
                      ? 'var(--surface-2)'
                      : 'var(--surface-1)',
                    borderColor: isSelected
                      ? 'transparent'
                      : 'var(--border-subtle)',
                  }}
                >
                  {isSelected ? (
                    <motion.span
                      layoutId={`${uid}-daewoon-active-ring`}
                      transition={pillTransition}
                      className="pointer-events-none absolute inset-0 rounded-xl border-2"
                      style={{
                        borderColor: 'var(--accent-gold)',
                        boxShadow: '0 0 16px -4px var(--accent-gold-soft)',
                      }}
                    />
                  ) : null}
                  <span
                    className="relative z-10 flex items-center gap-1 text-[11px] font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: stemColor }}
                    />
                    {cycle.stem.hangul}
                    {cycle.branch.hangul}
                  </span>
                  <span
                    className="relative z-10 text-[10px] tabular-nums"
                    style={{
                      color: isSelected
                        ? 'var(--accent-gold)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {cycle.startYear} · {cycle.startAge}세
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
