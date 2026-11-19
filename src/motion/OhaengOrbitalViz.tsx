import { useId, useMemo, useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import type { ElementKey, ElementScore } from '../types/saju';
import { buildSpringTransition, useMotionSettings } from './MotionContext';
import { clampMotionSpeed, isMotionReduced } from './presets';
import { MotionSpecBadge } from './MotionSpecBadge';

export interface OhaengOrbitalVizProps {
  elements: ElementScore[];
  yongshin?: ElementKey;
  avoidElement?: ElementKey;
  selectedElement?: ElementKey | null;
  onSelectElement?: (el: ElementKey) => void;
  className?: string;
}

const ELEMENT_ORDER: readonly ElementKey[] = [
  'wood',
  'fire',
  'earth',
  'metal',
  'water',
];

const ELEMENT_META: Record<
  ElementKey,
  { ko: string; hanja: string; cssVar: string; roleNote: string }
> = {
  wood: {
    ko: '목',
    hanja: '木',
    cssVar: 'var(--color-wood)',
    roleNote: '성장 · 창의 · 확장',
  },
  fire: {
    ko: '화',
    hanja: '火',
    cssVar: 'var(--color-fire)',
    roleNote: '열정 · 표현 · 발산',
  },
  earth: {
    ko: '토',
    hanja: '土',
    cssVar: 'var(--color-earth)',
    roleNote: '중재 · 신뢰 · 안정',
  },
  metal: {
    ko: '금',
    hanja: '金',
    cssVar: 'var(--color-metal)',
    roleNote: '결단 · 정교 · 수렴',
  },
  water: {
    ko: '수',
    hanja: '水',
    cssVar: 'var(--color-water)',
    roleNote: '지혜 · 유연 · 통찰',
  },
};

const VIEWBOX_SIZE = 460;
const CENTER = VIEWBOX_SIZE / 2;
const ORBIT_RADIUS = 138;

interface Point2D {
  x: number;
  y: number;
}

function getPentagonPoint(index: number): Point2D {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  return {
    x: CENTER + Math.cos(angle) * ORBIT_RADIUS,
    y: CENTER + Math.sin(angle) * ORBIT_RADIUS,
  };
}

function getRadialUnit(p: Point2D): Point2D {
  const dx = p.x - CENTER;
  const dy = p.y - CENTER;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function getQuadraticControl(a: Point2D, b: Point2D, outwardPush: number): Point2D {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const u = getRadialUnit({ x: mx, y: my });
  return {
    x: mx + u.x * outwardPush,
    y: my + u.y * outwardPush,
  };
}

function evalQuadratic(p0: Point2D, p1: Point2D, p2: Point2D, t: number): Point2D {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

export function OhaengOrbitalViz({
  elements,
  yongshin,
  avoidElement,
  selectedElement = null,
  onSelectElement,
  className = '',
}: OhaengOrbitalVizProps) {
  const uid = useId().replace(/:/g, '');
  const settings = useMotionSettings();
  const reduced = isMotionReduced(settings);
  const safeSpeed = clampMotionSpeed(settings.speed);

  const [hoveredElement, setHoveredElement] = useState<ElementKey | null>(null);
  const focusedElement = hoveredElement ?? selectedElement ?? null;

  const scoreByElement = useMemo(() => {
    const map = new Map<ElementKey, ElementScore>();
    for (const item of elements) {
      map.set(item.element, item);
    }
    return map;
  }, [elements]);

  const nodes = useMemo(() => {
    return ELEMENT_ORDER.map((el, idx) => {
      const score = scoreByElement.get(el);
      const pct = score ? Math.max(0, Math.min(100, score.percentage)) : 0;
      const radius = 25 + Math.min(45, pct) * 0.33;
      const ringRadius = radius + 5.5;
      const pos = getPentagonPoint(idx);
      const radial = getRadialUnit(pos);
      return {
        element: el,
        index: idx,
        meta: ELEMENT_META[el],
        score,
        pct,
        radius,
        ringRadius,
        circumference: 2 * Math.PI * ringRadius,
        pos,
        radial,
      };
    });
  }, [scoreByElement]);

  const generatingEdges = useMemo(() => {
    return ELEMENT_ORDER.map((fromEl, idx) => {
      const nextIdx = (idx + 1) % 5;
      const toEl = ELEMENT_ORDER[nextIdx];
      const p0 = nodes[idx].pos;
      const p2 = nodes[nextIdx].pos;
      const ctrl = getQuadraticControl(p0, p2, 34);
      const d = `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Q ${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      return {
        key: `gen-${fromEl}-${toEl}`,
        from: fromEl,
        to: toEl,
        p0,
        ctrl,
        p2,
        d,
      };
    });
  }, [nodes]);

  const controllingEdges = useMemo(() => {
    return ELEMENT_ORDER.map((fromEl, idx) => {
      const targetIdx = (idx + 2) % 5;
      const toEl = ELEMENT_ORDER[targetIdx];
      const p0 = nodes[idx].pos;
      const p2 = nodes[targetIdx].pos;
      const d = `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      return {
        key: `ctrl-${fromEl}-${toEl}`,
        from: fromEl,
        to: toEl,
        d,
      };
    });
  }, [nodes]);

  // Refs for GPU-light traveling energy orbs along generating cycle
  const orbRefs = useRef<(SVGCircleElement | null)[]>([]);
  const genPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const phaseRef = useRef(0);

  useAnimationFrame((_time, delta) => {
    if (reduced) return;
    const dtSec = Math.min(0.05, Math.max(0, delta / 1000));
    phaseRef.current = (phaseRef.current + dtSec * 0.22 * safeSpeed) % 1;

    for (let i = 0; i < generatingEdges.length; i++) {
      const edge = generatingEdges[i];
      const orbEl = orbRefs.current[i];
      if (orbEl) {
        const t = (phaseRef.current + i * 0.2) % 1;
        const pt = evalQuadratic(edge.p0, edge.ctrl, edge.p2, t);
        orbEl.setAttribute('cx', pt.x.toFixed(2));
        orbEl.setAttribute('cy', pt.y.toFixed(2));
      }

      const pathEl = genPathRefs.current[i];
      if (pathEl) {
        pathEl.style.strokeDashoffset = `${-(phaseRef.current * 44).toFixed(2)}`;
      }
    }
  });

  const focusedRelations = useMemo(() => {
    if (!focusedElement) return null;
    const idx = ELEMENT_ORDER.indexOf(focusedElement);
    return {
      self: focusedElement,
      nourishedBy: ELEMENT_ORDER[(idx + 4) % 5],
      nourishes: ELEMENT_ORDER[(idx + 1) % 5],
      controlledBy: ELEMENT_ORDER[(idx + 3) % 5],
      controls: ELEMENT_ORDER[(idx + 2) % 5],
    };
  }, [focusedElement]);

  return (
    <div
      className={`relative flex flex-col items-center gap-3 ${className}`}
      data-testid="ohaeng-orbital-viz"
    >
      {settings.showMotionSpecs ? (
        <MotionSpecBadge
          label="orbital"
          staggerIndex={0}
          className="self-end"
        />
      ) : null}

      <div className="relative w-full max-w-[440px]">
        <svg
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          className="h-auto w-full overflow-visible select-none"
          role="img"
          aria-label="오행 상생 상극 궤도 다이어그램"
        >
          <defs>
            <radialGradient id={`${uid}-core-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.14" />
              <stop offset="70%" stopColor="var(--accent-gold)" stopOpacity="0.03" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle astronomical background rings */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={ORBIT_RADIUS + 26}
            fill={`url(#${uid}-core-glow)`}
            stroke="var(--border-subtle)"
            strokeWidth="0.8"
            strokeDasharray="3 6"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={ORBIT_RADIUS * 0.52}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="0.7"
          />

          {/* Center Emblem */}
          <text
            x={CENTER}
            y={CENTER - 4}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="12"
            fontWeight="600"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            五行
          </text>
          <text
            x={CENTER}
            y={CENTER + 12}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="9.5"
          >
            상생·상극
          </text>

          {/* Controlling (상극) inner pentagram chords */}
          <g>
            {controllingEdges.map((edge, idx) => {
              const isRelated =
                focusedElement !== null &&
                (edge.from === focusedElement || edge.to === focusedElement);
              const isOutgoing = focusedElement === edge.from;
              const isIncoming = focusedElement === edge.to;

              const stroke = isIncoming
                ? 'var(--color-fire)'
                : isOutgoing
                  ? ELEMENT_META[edge.from].cssVar
                  : 'var(--border-strong)';

              const opacity =
                focusedElement === null ? 0.35 : isRelated ? 0.92 : 0.12;

              return (
                <motion.path
                  key={`${edge.key}-${settings.replayNonce}`}
                  d={edge.d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isRelated ? 2 : 1.15}
                  strokeDasharray={isRelated ? '6 4' : '3 5'}
                  strokeLinecap="round"
                  initial={
                    reduced ? { opacity } : { opacity: 0 }
                  }
                  animate={{ opacity }}
                  transition={buildSpringTransition(settings, idx, 55)}
                />
              );
            })}
          </g>

          {/* Generating (상생) perimeter orbital arcs */}
          <g>
            {generatingEdges.map((edge, idx) => {
              const isRelated =
                focusedElement !== null &&
                (edge.from === focusedElement || edge.to === focusedElement);

              const stroke = isRelated
                ? ELEMENT_META[edge.from].cssVar
                : 'var(--accent-gold)';

              const opacity =
                focusedElement === null ? 0.72 : isRelated ? 0.98 : 0.2;

              const midOrbPt = evalQuadratic(edge.p0, edge.ctrl, edge.p2, 0.5);
              const tangentDeg =
                (Math.atan2(edge.p2.y - edge.p0.y, edge.p2.x - edge.p0.x) *
                  180) /
                Math.PI;

              return (
                <g key={`${edge.key}-${settings.replayNonce}`}>
                  {/* Spring pathLength reveal track */}
                  <motion.path
                    d={edge.d}
                    fill="none"
                    stroke={ELEMENT_META[edge.from].cssVar}
                    strokeOpacity={isRelated ? 0.34 : 0.16}
                    strokeWidth={isRelated ? 4.5 : 2.5}
                    strokeLinecap="round"
                    initial={
                      reduced
                        ? { pathLength: 1, opacity: 1 }
                        : { pathLength: 0, opacity: 0 }
                    }
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={buildSpringTransition(settings, idx, 60)}
                  />

                  {/* Flowing dashed energy overlay (independent of pathLength) */}
                  <path
                    ref={(el) => {
                      genPathRefs.current[idx] = el;
                    }}
                    d={edge.d}
                    fill="none"
                    stroke={stroke}
                    strokeOpacity={opacity}
                    strokeWidth={isRelated ? 2.4 : 1.5}
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                  />

                  {/* Directional chevron indicator at midpoint */}
                  <path
                    d="M -3.2 -2.8 L 3.4 0 L -3.2 2.8"
                    fill="none"
                    stroke={stroke}
                    strokeOpacity={opacity}
                    strokeWidth={isRelated ? 1.8 : 1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform={`translate(${midOrbPt.x.toFixed(1)}, ${midOrbPt.y.toFixed(1)}) rotate(${tangentDeg.toFixed(1)})`}
                  />

                  {/* Traveling energy orb along generating arc */}
                  <circle
                    ref={(el) => {
                      orbRefs.current[idx] = el;
                    }}
                    cx={midOrbPt.x}
                    cy={midOrbPt.y}
                    r={isRelated ? 4 : 3}
                    fill={ELEMENT_META[edge.from].cssVar}
                    opacity={focusedElement === null || isRelated ? 0.95 : 0.2}
                  />
                </g>
              );
            })}
          </g>

          {/* Five Element Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedElement === node.element;
            const isHovered = hoveredElement === node.element;
            const isActive = isSelected || isHovered;
            const isYongshin = yongshin === node.element;
            const isAvoid = avoidElement === node.element && !isYongshin;

            const isDimmed =
              focusedElement !== null &&
              focusedElement !== node.element &&
              focusedRelations?.nourishes !== node.element &&
              focusedRelations?.nourishedBy !== node.element &&
              focusedRelations?.controls !== node.element &&
              focusedRelations?.controlledBy !== node.element;

            const dashOffset =
              node.circumference * (1 - Math.min(100, node.pct) / 100);

            const badgeX = node.pos.x + node.radial.x * (node.ringRadius + 15);
            const badgeY = node.pos.y + node.radial.y * (node.ringRadius + 15);

            return (
              <g
                key={node.element}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${node.meta.ko}(${node.meta.hanja}) ${Math.round(node.pct)}%${isYongshin ? ' 용신' : ''}`}
                className="cursor-pointer focus:outline-none"
                style={{ opacity: isDimmed ? 0.5 : 1, transition: 'opacity 180ms ease' }}
                onMouseEnter={() => setHoveredElement(node.element)}
                onMouseLeave={() => setHoveredElement(null)}
                onFocus={() => setHoveredElement(node.element)}
                onBlur={() => setHoveredElement(null)}
                onClick={() =>
                  onSelectElement?.(node.element)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectElement?.(node.element);
                  }
                }}
              >
                {/* Selection / hover outer halo */}
                {isActive ? (
                  <motion.circle
                    cx={node.pos.x}
                    cy={node.pos.y}
                    fill="none"
                    stroke={node.meta.cssVar}
                    strokeWidth="1.75"
                    strokeOpacity="0.65"
                    initial={
                      reduced
                        ? { r: node.ringRadius + 5, opacity: 1 }
                        : { r: node.ringRadius + 1, opacity: 0 }
                    }
                    animate={{ r: node.ringRadius + 5, opacity: 1 }}
                    transition={buildSpringTransition(settings, 0)}
                  />
                ) : null}

                {/* Base solid surface backing (ensures WCAG contrast on both Hanji & dark themes) */}
                <circle
                  cx={node.pos.x}
                  cy={node.pos.y}
                  r={node.radius}
                  fill="var(--surface-1)"
                />

                {/* Tinted elemental glow fill */}
                <circle
                  cx={node.pos.x}
                  cy={node.pos.y}
                  r={node.radius}
                  fill={node.meta.cssVar}
                  fillOpacity={isActive ? 0.24 : 0.13}
                  stroke={node.meta.cssVar}
                  strokeWidth={isActive || isYongshin ? 2 : 1.25}
                  strokeOpacity={isActive ? 1 : 0.7}
                />

                {/* Progress Ring Track */}
                <circle
                  cx={node.pos.x}
                  cy={node.pos.y}
                  r={node.ringRadius}
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="2.8"
                />

                {/* Animated Progress Ring Arc */}
                <motion.circle
                  key={`ring-${node.element}-${settings.replayNonce}`}
                  cx={node.pos.x}
                  cy={node.pos.y}
                  r={node.ringRadius}
                  fill="none"
                  stroke={node.meta.cssVar}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray={node.circumference}
                  initial={
                    reduced
                      ? { strokeDashoffset: dashOffset }
                      : { strokeDashoffset: node.circumference }
                  }
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={buildSpringTransition(settings, node.index, 70)}
                  transform={`rotate(-90 ${node.pos.x} ${node.pos.y})`}
                />

                {/* Hanja + Hangul + Percentage */}
                <text
                  x={node.pos.x}
                  y={node.pos.y - 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize="16"
                  fontWeight="700"
                  style={{ fontFamily: "'Noto Serif KR', serif" }}
                >
                  {node.meta.hanja}
                </text>
                <text
                  x={node.pos.x}
                  y={node.pos.y + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize="10.5"
                  fontWeight="600"
                >
                  {node.meta.ko} · {Math.round(node.pct)}%
                </text>

                {/* Yongshin / Avoid radial badge */}
                {isYongshin || isAvoid ? (
                  <g transform={`translate(${badgeX}, ${badgeY})`}>
                    <rect
                      x="-20"
                      y="-9.5"
                      width="40"
                      height="19"
                      rx="9.5"
                      fill={isYongshin ? 'var(--accent-gold)' : 'var(--surface-2)'}
                      stroke={
                        isYongshin ? 'var(--accent-gold)' : 'var(--border-strong)'
                      }
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="0.5"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9.5"
                      fontWeight="700"
                      fill={
                        isYongshin ? 'var(--bg-canvas)' : 'var(--text-secondary)'
                      }
                    >
                      {isYongshin ? '★ 용신' : '기신'}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Relationship Readout Strip */}
      <div
        className="w-full rounded-xl border px-3.5 py-2.5 text-xs backdrop-blur-md"
        style={{
          background: 'var(--surface-glass)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        {focusedRelations ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ELEMENT_META[focusedRelations.self].cssVar }}
              />
              <span>
                {ELEMENT_META[focusedRelations.self].ko}(
                {ELEMENT_META[focusedRelations.self].hanja})
              </span>
              <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                {ELEMENT_META[focusedRelations.self].roleNote}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span
                className="rounded-full border px-2 py-0.5"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                생조: {ELEMENT_META[focusedRelations.nourishedBy].ko}→
                {ELEMENT_META[focusedRelations.self].ko}
              </span>
              <span
                className="rounded-full border px-2 py-0.5"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                설기: {ELEMENT_META[focusedRelations.self].ko}→
                {ELEMENT_META[focusedRelations.nourishes].ko}
              </span>
              <span
                className="rounded-full border px-2 py-0.5"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                제극: {ELEMENT_META[focusedRelations.controlledBy].ko}⇥
                {ELEMENT_META[focusedRelations.self].ko} /{' '}
                {ELEMENT_META[focusedRelations.self].ko}⇥
                {ELEMENT_META[focusedRelations.controls].ko}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>오행 노드를 클릭하거나 올려 상생(외곽 궤도)·상극(내부 성선) 관계를 탐색하세요.</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              목 → 화 → 토 → 금 → 수
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
