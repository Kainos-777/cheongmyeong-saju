import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Compass, Sparkles, TrendingUp } from 'lucide-react';
import type { SajuResult } from '../types/saju';
import { getElementBorder, getElementColor, getElementTint } from './elementUtils';

export interface DaewoonExplorerProps {
  result: SajuResult;
  activeDaewoonIndex?: number;
  onSelectDaewoon?: (index: number) => void;
  currentAge?: number;
}

function getScoreAccent(score: number): { color: string; tint: string; border: string } {
  if (score >= 75) {
    return {
      color: 'var(--color-wood)',
      tint: getElementTint('wood', 14),
      border: getElementBorder('wood', 36),
    };
  }
  if (score >= 55) {
    return {
      color: 'var(--accent-gold)',
      tint: 'var(--accent-gold-soft)',
      border: 'color-mix(in srgb, var(--accent-gold) 36%, transparent)',
    };
  }
  return {
    color: 'var(--color-fire)',
    tint: getElementTint('fire', 12),
    border: getElementBorder('fire', 34),
  };
}

export function DaewoonExplorer({
  result,
  activeDaewoonIndex,
  onSelectDaewoon,
  currentAge,
}: DaewoonExplorerProps) {
  const computedCurrentAge =
    currentAge ?? Math.max(1, new Date().getFullYear() - result.solarDate.year + 1);

  const defaultDaewoonIdx = Math.max(
    0,
    result.daewoon.findIndex(
      (d) => computedCurrentAge >= d.startAge && computedCurrentAge <= d.endAge
    )
  );

  const [internalIdx, setInternalIdx] = useState<number>(defaultDaewoonIdx);
  const rawSelectedIdx = activeDaewoonIndex ?? internalIdx;
  const selectedDaewoonIdx = Math.min(
    Math.max(0, rawSelectedIdx),
    Math.max(0, result.daewoon.length - 1)
  );

  const setDaewoonIdx = (idx: number) => {
    const safe = Math.min(Math.max(0, idx), Math.max(0, result.daewoon.length - 1));
    if (onSelectDaewoon) {
      onSelectDaewoon(safe);
    } else {
      setInternalIdx(safe);
    }
  };

  const thisYear = new Date().getFullYear();
  const initialSewoonIdx = Math.max(
    0,
    result.sewoon.findIndex((s) => s.year === thisYear)
  );
  const [selectedSewoonIdx, setSelectedSewoonIdx] = useState<number>(initialSewoonIdx);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(new Date().getMonth());

  useEffect(() => {
    const found = result.sewoon.findIndex((s) => s.year === thisYear);
    setSelectedSewoonIdx(found >= 0 ? found : 0);
  }, [result.sewoon, thisYear]);

  const activeCycle = result.daewoon[selectedDaewoonIdx] ?? result.daewoon[0];
  const activeSewoon = result.sewoon[selectedSewoonIdx] ?? result.sewoon[0];

  return (
    <div className="space-y-5">
      {/* Active Daewoon Cycle Deep Dive */}
      {activeCycle && (
        <section
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
          aria-label="선택된 대운 상세"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Compass className="h-3.5 w-3.5" />
                {result.daewoonDirection} · 대운수 {result.daewoonStartAge}세
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                현재 {computedCurrentAge}세 기준
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDaewoonIdx(selectedDaewoonIdx - 1)}
                disabled={selectedDaewoonIdx <= 0}
                aria-label="이전 대운"
                className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-35"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span
                className="px-2 font-mono text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                {selectedDaewoonIdx + 1} / {result.daewoon.length}
              </span>
              <button
                type="button"
                onClick={() => setDaewoonIdx(selectedDaewoonIdx + 1)}
                disabled={selectedDaewoonIdx >= result.daewoon.length - 1}
                aria-label="다음 대운"
                className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-35"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Stem & Branch Pillar Tile */}
            <div
              className="flex shrink-0 items-center gap-4 rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <div className="text-center">
                <div
                  className="font-serif text-3xl font-bold leading-none"
                  style={{ color: getElementColor(activeCycle.stem.element) }}
                >
                  {activeCycle.stem.hanja}
                </div>
                <div className="mt-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeCycle.stem.hangul} · {activeCycle.stemTenGod}
                </div>
              </div>
              <div className="h-10 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
              <div className="text-center">
                <div
                  className="font-serif text-3xl font-bold leading-none"
                  style={{ color: getElementColor(activeCycle.branch.element) }}
                >
                  {activeCycle.branch.hanja}
                </div>
                <div className="mt-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeCycle.branch.hangul} · {activeCycle.branchTenGod}
                </div>
              </div>
            </div>

            {/* Narrative */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                  제{activeCycle.index}대운 ({activeCycle.startAge}~{activeCycle.endAge}세)
                </h3>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {activeCycle.startYear}–{activeCycle.endYear}년
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  12운성: {activeCycle.twelveStage}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-xs font-bold"
                  style={{
                    backgroundColor: getScoreAccent(activeCycle.favorabilityScore).tint,
                    color: getScoreAccent(activeCycle.favorabilityScore).color,
                  }}
                >
                  길흉 지수 {activeCycle.favorabilityScore}점
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {activeCycle.summary}
              </p>
            </div>
          </div>

          {/* Quick Cycle Selector Pills */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
            {result.daewoon.map((cycle, idx) => {
              const isSelected = idx === selectedDaewoonIdx;
              return (
                <button
                  key={cycle.index}
                  type="button"
                  onClick={() => setDaewoonIdx(idx)}
                  className="shrink-0 rounded-xl px-3 py-1.5 text-left transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-gold-soft)' : 'var(--surface-1)',
                    border: isSelected
                      ? '1px solid var(--accent-gold)'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    className="font-serif text-sm font-bold"
                    style={{
                      color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)',
                    }}
                  >
                    {cycle.stem.hanja}
                    {cycle.branch.hanja}
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {cycle.startAge}세~
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 10-Year Sewoon Selector */}
      <section
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="10년 세운 흐름"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3
            className="flex items-center gap-1.5 text-sm font-bold sm:text-base"
            style={{ color: 'var(--text-primary)' }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            10년 세운 (歲運)
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            연도 카드를 눌러 상세 운세를 확인하세요
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {result.sewoon.map((sw, idx) => {
            const isSelected = idx === selectedSewoonIdx;
            const isCurrent = sw.year === thisYear;
            const accent = getScoreAccent(sw.favorabilityScore);
            return (
              <button
                key={sw.year}
                type="button"
                onClick={() => setSelectedSewoonIdx(idx)}
                className="relative flex w-28 shrink-0 flex-col items-start rounded-2xl p-3 text-left transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: isSelected ? 'var(--surface-2)' : 'var(--surface-1)',
                  border: isSelected
                    ? '1.5px solid var(--accent-gold)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className="font-mono text-xs font-bold"
                    style={{
                      color: isCurrent ? 'var(--accent-gold)' : 'var(--text-primary)',
                    }}
                  >
                    {sw.year}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {sw.age}세
                  </span>
                </div>

                <div className="mt-1.5 flex items-baseline gap-1">
                  <span
                    className="font-serif text-lg font-bold"
                    style={{ color: getElementColor(sw.stem.element) }}
                  >
                    {sw.stem.hanja}
                  </span>
                  <span
                    className="font-serif text-lg font-bold"
                    style={{ color: getElementColor(sw.branch.element) }}
                  >
                    {sw.branch.hanja}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {sw.stem.hangul}
                    {sw.branch.hangul}
                  </span>
                </div>

                <div className="mt-1.5 flex w-full items-center justify-between text-[11px]">
                  <span className="truncate font-medium" style={{ color: 'var(--text-muted)' }}>
                    {sw.stemTenGod}
                  </span>
                  <span className="font-mono font-bold" style={{ color: accent.color }}>
                    {sw.favorabilityScore}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {activeSewoon && (
          <motion.div
            key={activeSewoon.year}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-3 rounded-2xl p-4"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent-gold)' }}>
                  {activeSewoon.year}년 ({activeSewoon.stem.hangul}
                  {activeSewoon.branch.hangul}년 · {activeSewoon.age}세)
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--accent-gold-soft)',
                    color: 'var(--accent-gold)',
                  }}
                >
                  {activeSewoon.keyword}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                천간 {activeSewoon.stemTenGod} · 지지 {activeSewoon.branchTenGod}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              {activeSewoon.summary}
            </p>
          </motion.div>
        )}
      </section>

      {/* 12-Month Calendar Heat Grid */}
      <section
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="12개월 월운 히트 그리드"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3
            className="flex items-center gap-1.5 text-sm font-bold sm:text-base"
            style={{ color: 'var(--text-primary)' }}
          >
            <Calendar className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            12개월 월운 히트 그리드 (月運)
          </h3>
          <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-wood)' }} />
              상승 (75+)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent-gold)' }} />
              안정 (55+)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-fire)' }} />
              신중 (&lt;55)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {result.monthly.map((m, idx) => {
            const accent = getScoreAccent(m.score);
            const isSelected = idx === selectedMonthIdx;
            return (
              <button
                key={m.month}
                type="button"
                onClick={() => setSelectedMonthIdx(idx)}
                className="flex flex-col justify-between rounded-2xl p-3 text-left transition-colors"
                style={{
                  backgroundColor: isSelected ? accent.tint : 'var(--surface-1)',
                  border: isSelected ? `1.5px solid ${accent.color}` : `1px solid ${accent.border}`,
                }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {m.month}월
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold"
                    style={{ backgroundColor: accent.tint, color: accent.color }}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {m.score}
                  </span>
                </div>

                <div className="my-2 flex items-baseline gap-1.5">
                  <span
                    className="font-serif text-lg font-bold"
                    style={{ color: getElementColor(m.stem.element) }}
                  >
                    {m.stem.hanja}
                  </span>
                  <span
                    className="font-serif text-lg font-bold"
                    style={{ color: getElementColor(m.branch.element) }}
                  >
                    {m.branch.hanja}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {m.stem.hangul}
                    {m.branch.hangul}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="truncate font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {m.keyword}
                  </span>
                  <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {m.stemTenGod}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
