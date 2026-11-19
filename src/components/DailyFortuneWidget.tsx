import { Compass, Sparkles, Sun } from 'lucide-react';
import type { DailyFortune } from '../types/saju';
import {
  ELEMENT_META,
  getElementBorder,
  getElementColor,
  getElementTint,
} from './elementUtils';

export interface DailyFortuneWidgetProps {
  fortune: DailyFortune;
  userName?: string;
  onViewDetails?: () => void;
}

export function DailyFortuneWidget({
  fortune,
  userName,
  onViewDetails,
}: DailyFortuneWidgetProps) {
  const luckyMeta = ELEMENT_META[fortune.luckyColor];
  const stemColor = getElementColor(fortune.stem.element);
  const branchColor = getElementColor(fortune.branch.element);

  return (
    <section
      className="relative overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--density-pad)',
      }}
      aria-label="오늘의 일진"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Today's Iljin Pillar + Headline */}
        <div className="flex items-start gap-3.5">
          <div
            className="flex shrink-0 flex-col items-center justify-center rounded-2xl px-3 py-2"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              오늘 일진
            </span>
            <div className="mt-0.5 flex items-baseline gap-0.5 font-serif text-xl font-bold leading-tight">
              <span style={{ color: stemColor }}>{fortune.stem.hanja}</span>
              <span style={{ color: branchColor }}>{fortune.branch.hanja}</span>
            </div>
            <span
              className="text-[11px] font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {fortune.stem.hangul}
              {fortune.branch.hangul} · {fortune.stemTenGod}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Sun className="h-3 w-3" />
                {fortune.dateStr}
              </span>
              {userName && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {userName}님의 오늘 기운
                </span>
              )}
            </div>
            <h3
              className="text-sm font-bold leading-snug sm:text-base"
              style={{ color: 'var(--text-primary)' }}
            >
              {fortune.headline}
            </h3>
            <p
              className="text-xs leading-relaxed sm:text-[13px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {fortune.advice}
            </p>
          </div>
        </div>

        {/* Right: Score + Lucky Element + Direction */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
              style={{
                backgroundColor: getElementTint(fortune.luckyColor, 14),
                border: `1px solid ${getElementBorder(fortune.luckyColor, 34)}`,
                color: getElementColor(fortune.luckyColor),
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getElementColor(fortune.luckyColor) }}
              />
              행운 오행 · {luckyMeta.ko}({luckyMeta.hanja})
            </span>

            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-strong)',
                color: 'var(--accent-gold)',
              }}
            >
              <Sparkles className="h-3 w-3" />
              {fortune.score}점
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <Compass className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
              행운 방위: <strong style={{ color: 'var(--text-primary)' }}>{fortune.luckyDirection}</strong>
            </span>
            {onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                className="rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                }}
              >
                세운·월운 →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
