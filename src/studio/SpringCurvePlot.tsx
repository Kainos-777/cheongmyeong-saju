import { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';

export interface SpringCurvePoint {
  tMs: number;
  value: number;
}

export interface SpringCurveMetrics {
  dampingRatio: number;
  overshootPct: number;
  settlingMs: number;
  peakTimeMs: number;
  maxVal: number;
  minVal: number;
  durationMs: number;
  regime: 'underdamped' | 'critical' | 'overdamped';
  points: SpringCurvePoint[];
}

export function computeSpringCurve(
  stiffness: number,
  damping: number,
  mass: number,
): SpringCurveMetrics {
  const k = Math.max(1, stiffness);
  const c = Math.max(0.5, damping);
  const m = Math.max(0.1, mass);

  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(m * k));

  const regime: SpringCurveMetrics['regime'] =
    zeta < 0.999 ? 'underdamped' : zeta > 1.001 ? 'overdamped' : 'critical';

  const evaluateAt = (tSec: number): number => {
    if (tSec <= 0) return 0;
    if (regime === 'underdamped') {
      const sqrtTerm = Math.sqrt(Math.max(1e-6, 1 - zeta * zeta));
      const omegaD = omega0 * sqrtTerm;
      const decay = Math.exp(-zeta * omega0 * tSec);
      return 1 - decay * (Math.cos(omegaD * tSec) + (zeta / sqrtTerm) * Math.sin(omegaD * tSec));
    }
    if (regime === 'critical') {
      const decay = Math.exp(-omega0 * tSec);
      return 1 - decay * (1 + omega0 * tSec);
    }
    const gamma = omega0 * Math.sqrt(Math.max(1e-6, zeta * zeta - 1));
    const r1 = -omega0 * zeta + gamma;
    const r2 = -omega0 * zeta - gamma;
    const denom = r2 - r1;
    if (Math.abs(denom) < 1e-8) {
      const decay = Math.exp(-omega0 * tSec);
      return 1 - decay * (1 + omega0 * tSec);
    }
    return 1 - (r2 * Math.exp(r1 * tSec) - r1 * Math.exp(r2 * tSec)) / denom;
  };

  let overshootPct = 0;
  let peakTimeMs = 0;
  if (regime === 'underdamped') {
    const sqrtTerm = Math.sqrt(Math.max(1e-6, 1 - zeta * zeta));
    overshootPct = 100 * Math.exp((-zeta * Math.PI) / sqrtTerm);
    peakTimeMs = (Math.PI / (omega0 * sqrtTerm)) * 1000;
  }

  // Numerical 2% settling time scan up to 5 seconds
  const scanStepSec = 0.002;
  const maxScanSec = 5.0;
  let settlingSec = 0;
  for (let t = 0; t <= maxScanSec; t += scanStepSec) {
    const val = evaluateAt(t);
    if (Math.abs(val - 1) > 0.02) {
      settlingSec = t;
    }
  }
  const settlingMs = Math.max(40, Math.round(settlingSec * 1000));
  const durationMs = Math.max(600, Math.min(2800, Math.ceil((settlingMs * 1.25) / 100) * 100));

  const sampleCount = 120;
  const points: SpringCurvePoint[] = [];
  let maxVal = 1;
  let minVal = 0;

  for (let i = 0; i <= sampleCount; i++) {
    const tMs = (i / sampleCount) * durationMs;
    const value = evaluateAt(tMs / 1000);
    if (value > maxVal) maxVal = value;
    if (value < minVal) minVal = value;
    points.push({ tMs, value });
  }

  return {
    dampingRatio: zeta,
    overshootPct,
    settlingMs,
    peakTimeMs,
    maxVal,
    minVal,
    durationMs,
    regime,
    points,
  };
}

export interface SpringCurvePlotProps {
  stiffness: number;
  damping: number;
  mass: number;
  speed?: number;
  reducedMotion?: boolean;
  className?: string;
}

export function SpringCurvePlot({
  stiffness,
  damping,
  mass,
  speed = 1,
  reducedMotion = false,
  className = '',
}: SpringCurvePlotProps) {
  const gradientId = useId();
  const [testNonce, setTestNonce] = useState(0);

  const metrics = useMemo(
    () => computeSpringCurve(stiffness, damping, mass),
    [stiffness, damping, mass],
  );

  const svgWidth = 340;
  const svgHeight = 144;
  const padLeft = 28;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 22;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const yMin = Math.min(-0.08, metrics.minVal - 0.05);
  const yMax = Math.max(1.22, metrics.maxVal + 0.08);

  const mapX = (tMs: number) => padLeft + (tMs / metrics.durationMs) * plotW;
  const mapY = (val: number) => padTop + (1 - (val - yMin) / (yMax - yMin)) * plotH;

  const pathD = metrics.points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${mapX(pt.tMs).toFixed(2)} ${mapY(pt.value).toFixed(2)}`)
    .join(' ');

  const baselineY = mapY(0);
  const areaD = `${pathD} L ${mapX(metrics.durationMs).toFixed(2)} ${baselineY.toFixed(2)} L ${mapX(0).toFixed(2)} ${baselineY.toFixed(2)} Z`;

  const settlingX = mapX(Math.min(metrics.durationMs, metrics.settlingMs));
  const peakPoint =
    metrics.regime === 'underdamped' && metrics.peakTimeMs > 0 && metrics.peakTimeMs <= metrics.durationMs
      ? {
          x: mapX(metrics.peakTimeMs),
          y: mapY(1 + metrics.overshootPct / 100),
        }
      : null;

  const regimeLabel =
    metrics.regime === 'underdamped'
      ? '미감쇠 (Underdamped)'
      : metrics.regime === 'critical'
        ? '임계감쇠 (Critical)'
        : '과감쇠 (Overdamped)';

  const effectiveSpeed = Math.max(0.1, speed);
  const effectiveSettlingMs = Math.round(metrics.settlingMs / effectiveSpeed);

  const triggerTest = () => setTestNonce((n) => n + 1);

  return (
    <div
      className={`rounded-2xl border p-3 ${className}`}
      style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Header Metrics */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--accent-gold)' }}
          />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            스텝 응답 곡선 x(t)
          </span>
        </div>
        <span
          className="font-mono-spec rounded-full px-2 py-0.5 text-[10px]"
          style={{
            backgroundColor: 'var(--accent-gold-soft)',
            color: 'var(--accent-gold)',
          }}
        >
          {regimeLabel}
        </span>
      </div>

      {/* Analytical Harmonic Oscillator SVG Plot */}
      <div
        role="button"
        tabIndex={0}
        onClick={triggerTest}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerTest();
          }
        }}
        title="클릭하여 스프링 테스트 볼 실행"
        className="group relative cursor-pointer overflow-hidden rounded-xl border transition-colors"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block h-36 w-full select-none"
          aria-label={`스프링 감쇠 응답 곡선: 감쇠비 ${metrics.dampingRatio.toFixed(2)}, 오버슈트 ${metrics.overshootPct.toFixed(1)}%`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal reference grid */}
          {[0, 0.5, 1].map((tick) => {
            const y = mapY(tick);
            const isTarget = tick === 1;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={isTarget ? 'var(--accent-gold)' : 'var(--border-subtle)'}
                  strokeOpacity={isTarget ? 0.55 : 0.8}
                  strokeDasharray={isTarget ? '4 3' : '2 3'}
                  strokeWidth={isTarget ? 1.1 : 0.8}
                />
                <text
                  x={padLeft - 5}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fill="var(--text-muted)"
                  className="font-mono-spec"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Settling Time Vertical Marker */}
          <line
            x1={settlingX}
            y1={padTop}
            x2={settlingX}
            y2={baselineY}
            stroke="var(--color-wood)"
            strokeOpacity="0.65"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={Math.min(svgWidth - padRight - 2, settlingX + 3)}
            y={padTop + 9}
            fontSize="8"
            fill="var(--color-wood)"
            className="font-mono-spec"
          >
            Ts {metrics.settlingMs}ms
          </text>

          {/* Area & Response Curve */}
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent-gold)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Peak Overshoot Dot */}
          {peakPoint && metrics.overshootPct >= 0.4 && (
            <g>
              <circle
                cx={peakPoint.x}
                cy={peakPoint.y}
                r="3.5"
                fill="var(--color-fire)"
                stroke="var(--bg-elevated)"
                strokeWidth="1.2"
              />
              <text
                x={Math.min(svgWidth - 46, peakPoint.x + 6)}
                y={Math.max(11, peakPoint.y - 4)}
                fontSize="8"
                fill="var(--color-fire)"
                className="font-mono-spec"
              >
                +{metrics.overshootPct.toFixed(1)}%
              </text>
            </g>
          )}

          {/* Time axis labels */}
          <text
            x={padLeft}
            y={svgHeight - 6}
            fontSize="8.5"
            fill="var(--text-muted)"
            className="font-mono-spec"
          >
            0ms
          </text>
          <text
            x={padLeft + plotW / 2}
            y={svgHeight - 6}
            textAnchor="middle"
            fontSize="8.5"
            fill="var(--text-muted)"
            className="font-mono-spec"
          >
            {Math.round(metrics.durationMs / 2)}ms
          </text>
          <text
            x={svgWidth - padRight}
            y={svgHeight - 6}
            textAnchor="end"
            fontSize="8.5"
            fill="var(--text-muted)"
            className="font-mono-spec"
          >
            {metrics.durationMs}ms
          </text>
        </svg>
      </div>

      {/* Telemetry Pills */}
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <div
          className="rounded-lg border px-2 py-1.5"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            감쇠비 ζ
          </div>
          <div className="font-mono-spec text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {metrics.dampingRatio.toFixed(2)}
          </div>
        </div>
        <div
          className="rounded-lg border px-2 py-1.5"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            오버슈트
          </div>
          <div
            className="font-mono-spec text-xs font-semibold"
            style={{ color: metrics.overshootPct > 0.5 ? 'var(--color-fire)' : 'var(--color-wood)' }}
          >
            {metrics.overshootPct.toFixed(1)}%
          </div>
        </div>
        <div
          className="rounded-lg border px-2 py-1.5"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            정착 시간
          </div>
          <div className="font-mono-spec text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {effectiveSettlingMs}ms
          </div>
        </div>
      </div>

      {/* Interactive Physics Ball Playground */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={triggerTest}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--accent-gold-soft)',
            borderColor: 'var(--accent-gold)',
            color: 'var(--accent-gold)',
          }}
        >
          {testNonce === 0 ? <Play className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
          <span>테스트</span>
        </button>

        <div
          onClick={triggerTest}
          role="presentation"
          className="relative flex h-8 flex-1 cursor-pointer items-center overflow-hidden rounded-lg border px-5"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="relative flex h-full w-full items-center">
            <div
              className="h-0.5 w-full rounded-full"
              style={{ backgroundColor: 'var(--border-subtle)' }}
            />
            <motion.div
              key={testNonce}
              initial={{ left: '0%' }}
              animate={{ left: '100%' }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: stiffness * effectiveSpeed * effectiveSpeed,
                      damping: damping * effectiveSpeed,
                      mass,
                    }
              }
              className="absolute top-1/2 -ml-2.5 h-5 w-5 -translate-y-1/2 rounded-full shadow-md"
              style={{
                background:
                  'radial-gradient(circle at 35% 35%, #fff8dc 0%, var(--accent-gold) 70%)',
                boxShadow: '0 0 12px var(--accent-gold-soft)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
