import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Clock3, Crown, RotateCw, Sparkles } from 'lucide-react';
import type { ElementKey, Pillar } from '../types/saju';
import { buildSpringTransition, useMotionSettings, useSpringTransition } from './MotionContext';
import { isMotionReduced } from './presets';
import { MotionSpecBadge } from './MotionSpecBadge';

export interface PillarRevealCardProps {
  pillar: Pillar;
  index: number;
  isDayMaster?: boolean;
  compact?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
}

const ELEMENT_INFO: Record<
  ElementKey,
  { ko: string; hanja: string; cssVar: string }
> = {
  wood: { ko: '목', hanja: '木', cssVar: 'var(--color-wood)' },
  fire: { ko: '화', hanja: '火', cssVar: 'var(--color-fire)' },
  earth: { ko: '토', hanja: '土', cssVar: 'var(--color-earth)' },
  metal: { ko: '금', hanja: '金', cssVar: 'var(--color-metal)' },
  water: { ko: '수', hanja: '水', cssVar: 'var(--color-water)' },
};

function elementTintBg(cssVar: string, pct = 12): string {
  return `color-mix(in srgb, ${cssVar} ${pct}%, var(--surface-2))`;
}

function elementTintBorder(cssVar: string, pct = 42): string {
  return `color-mix(in srgb, ${cssVar} ${pct}%, var(--border-subtle))`;
}

export function PillarRevealCard({
  pillar,
  index,
  isDayMaster = false,
  compact = false,
  onFlip,
  className = '',
}: PillarRevealCardProps) {
  const settings = useMotionSettings();
  const reduced = isMotionReduced(settings);
  const entranceTransition = useSpringTransition(index);
  const flipTransition = buildSpringTransition(settings, 0, 0);

  const [isFlipped, setIsFlipped] = useState(false);
  const effectiveFlipped = !pillar.isUnknown && isFlipped;

  // Desktop 3D tilt (zero React re-renders via MotionValues)
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 260, damping: 24, mass: 0.6 });
  const tiltY = useSpring(rawTiltY, { stiffness: 260, damping: 24, mass: 0.6 });

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || pillar.isUnknown || e.pointerType === 'touch') return;
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)')?.matches === false
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawTiltY.set(nx * 10);
    rawTiltX.set(-ny * 10);
  };

  const handlePointerLeave = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  const toggleFlip = () => {
    if (pillar.isUnknown) return;
    const next = !isFlipped;
    setIsFlipped(next);
    onFlip?.(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (pillar.isUnknown) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
  };

  const cardMinHeightClass = compact
    ? 'min-h-[246px]'
    : 'min-h-[304px] sm:min-h-[324px]';

  // Unknown Birth Time State
  if (pillar.isUnknown) {
    return (
      <motion.div
        key={`${pillar.key}-unknown-${settings.replayNonce}`}
        initial={
          reduced
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 20, scale: 0.96 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={entranceTransition}
        className={`relative flex flex-col justify-between border border-dashed p-3.5 sm:p-4 ${cardMinHeightClass} ${className}`}
        style={{
          borderRadius: 'var(--radius-card)',
          background: 'var(--surface-glass)',
          borderColor: 'var(--border-strong)',
          backdropFilter: 'blur(var(--glass-blur))',
        }}
        data-testid={`pillar-card-${pillar.key}`}
      >
        {settings.showMotionSpecs ? (
          <MotionSpecBadge
            staggerIndex={index}
            className="absolute top-2 right-2 z-30"
          />
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {pillar.labelKo}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {pillar.labelHanja}
            </span>
          </div>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            미상
          </span>
        </div>

        <div className="my-auto flex flex-col items-center justify-center gap-2 py-4 text-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full border"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <Clock3 className="h-5 w-5" />
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            시간 미상
          </p>
          <p
            className="max-w-[16ch] text-[11px] leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            출생시각 미입력으로 시주는 비워두었습니다
          </p>
        </div>

        <div
          className="text-center text-[10px]"
          style={{ color: 'var(--text-muted)' }}
        >
          삼주(년·월·일) 기준 분석 적용
        </div>
      </motion.div>
    );
  }

  const stemEl = ELEMENT_INFO[pillar.stem.element];
  const branchEl = ELEMENT_INFO[pillar.branch.element];

  const totalHiddenWeight =
    pillar.hiddenStemTenGods.reduce((acc, item) => acc + (item.weight || 0), 0) ||
    1;

  return (
    <motion.div
      key={`${pillar.key}-${settings.replayNonce}`}
      initial={
        reduced
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 24, scale: 0.94 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={entranceTransition}
      className={`relative select-none ${cardMinHeightClass} ${className}`}
      style={{ perspective: 1200 }}
      data-testid={`pillar-card-${pillar.key}`}
    >
      {settings.showMotionSpecs ? (
        <MotionSpecBadge
          staggerIndex={index}
          className="absolute top-2 right-2 z-30"
        />
      ) : null}

      {/* Desktop 3D tilt shell */}
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        style={{
          rotateX: reduced ? 0 : tiltX,
          rotateY: reduced ? 0 : tiltY,
          transformStyle: 'preserve-3d',
        }}
        className="h-full w-full"
      >
        {/* Interactive 3D Flip Container */}
        <motion.div
          role="button"
          tabIndex={0}
          aria-pressed={effectiveFlipped}
          aria-label={`${pillar.labelKo} ${pillar.stem.hangul}${pillar.branch.hangul} 카드 ${
            effectiveFlipped ? '앞면으로 뒤집기' : '지장간·신살 상세 뒤집기'
          }`}
          onClick={toggleFlip}
          onKeyDown={handleKeyDown}
          animate={{ rotateY: effectiveFlipped ? 180 : 0 }}
          transition={flipTransition}
          style={{ transformStyle: 'preserve-3d' }}
          className={`relative h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${cardMinHeightClass}`}
        >
          {/* FRONT FACE */}
          <div
            className="relative flex h-full w-full flex-col justify-between gap-2.5 border p-3 sm:p-4 shadow-sm transition-shadow"
            style={{
              minHeight: 'inherit',
              borderRadius: 'var(--radius-card)',
              background: 'var(--surface-glass)',
              borderColor: isDayMaster
                ? 'var(--accent-gold)'
                : 'var(--border-subtle)',
              boxShadow: isDayMaster
                ? '0 10px 30px -12px var(--accent-gold-soft)'
                : undefined,
              backdropFilter: 'blur(var(--glass-blur))',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: effectiveFlipped ? 'none' : 'auto',
            }}
          >
            {/* Header Row */}
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="text-sm font-bold tracking-tight truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {pillar.labelKo}
                </span>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {pillar.labelHanja}
                </span>
              </div>

              {isDayMaster ? (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: 'var(--accent-gold-soft)',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)',
                  }}
                >
                  <Crown className="h-2.5 w-2.5" />
                  일간
                </span>
              ) : (
                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {pillar.twelveStage}
                </span>
              )}
            </div>

            {/* Stem & Branch Tiles */}
            <div className="grid grid-cols-1 gap-2 flex-1">
              {/* 천간 (Heavenly Stem) */}
              <div
                className="flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 min-w-0"
                style={{
                  background: elementTintBg(stemEl.cssVar, 13),
                  borderColor: elementTintBorder(stemEl.cssVar, 44),
                }}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span
                    className="inline-block h-7 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: stemEl.cssVar }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`${
                          compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                        } font-bold leading-none`}
                        style={{
                          fontFamily: "'Noto Serif KR', serif",
                          color: 'var(--text-primary)',
                        }}
                      >
                        {pillar.stem.hanja}
                      </span>
                      <span
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {pillar.stem.hangul}
                      </span>
                    </div>
                    <div
                      className="mt-0.5 text-[10px] font-medium"
                      style={{ color: stemEl.cssVar }}
                    >
                      {stemEl.ko}({stemEl.hanja}) ·{' '}
                      {pillar.stem.polarity === 'yang' ? '양' : '음'}
                    </div>
                  </div>
                </div>

                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: isDayMaster
                      ? 'var(--accent-gold-soft)'
                      : 'var(--surface-1)',
                    borderColor: isDayMaster
                      ? 'var(--accent-gold)'
                      : 'var(--border-subtle)',
                    color: isDayMaster
                      ? 'var(--accent-gold)'
                      : 'var(--text-secondary)',
                  }}
                >
                  {isDayMaster ? '본원(일간)' : pillar.stemTenGod}
                </span>
              </div>

              {/* 지지 (Earthly Branch) */}
              <div
                className="flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 min-w-0"
                style={{
                  background: elementTintBg(branchEl.cssVar, 13),
                  borderColor: elementTintBorder(branchEl.cssVar, 44),
                }}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span
                    className="inline-block h-7 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: branchEl.cssVar }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`${
                          compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                        } font-bold leading-none`}
                        style={{
                          fontFamily: "'Noto Serif KR', serif",
                          color: 'var(--text-primary)',
                        }}
                      >
                        {pillar.branch.hanja}
                      </span>
                      <span
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {pillar.branch.hangul}
                      </span>
                    </div>
                    <div
                      className="mt-0.5 text-[10px] font-medium truncate"
                      style={{ color: branchEl.cssVar }}
                    >
                      {branchEl.ko}({branchEl.hanja}) · {pillar.branch.animal}
                    </div>
                  </div>
                </div>

                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: 'var(--surface-1)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {pillar.branchTenGod}
                </span>
              </div>
            </div>

            {/* Footer Flip Affordance */}
            <div
              className="flex items-center justify-between gap-2 pt-1 text-[10.5px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="truncate">
                {pillar.shensha.length > 0
                  ? `신살 ${pillar.shensha.length}개`
                  : pillar.twelveStage}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-medium">
                <RotateCw className="h-3 w-3" />
                상세 뒤집기
              </span>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 flex h-full w-full flex-col justify-between gap-2 overflow-y-auto border p-3 sm:p-4 shadow-md"
            style={{
              borderRadius: 'var(--radius-card)',
              background: 'var(--surface-1)',
              borderColor: isDayMaster
                ? 'var(--accent-gold)'
                : 'var(--border-strong)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              pointerEvents: effectiveFlipped ? 'auto' : 'none',
            }}
          >
            {/* Back Header */}
            <div className="flex items-center justify-between gap-2 border-b pb-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="text-xs font-bold truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {pillar.labelKo} 심층
                </span>
                <span
                  className="text-xs font-semibold shrink-0"
                  style={{
                    fontFamily: "'Noto Serif KR', serif",
                    color: 'var(--accent-gold)',
                  }}
                >
                  {pillar.stem.hanja}
                  {pillar.branch.hanja}
                </span>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                <RotateCw className="h-2.5 w-2.5" />
                앞면
              </span>
            </div>

            {/* 지장간 (Hidden Stems) Weighted Proportion Bars */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  지장간 (藏干)
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 font-semibold"
                  style={{
                    background: 'var(--accent-gold-soft)',
                    color: 'var(--accent-gold)',
                  }}
                >
                  12운성 · {pillar.twelveStage}
                </span>
              </div>

              {/* Combined Stacked Bar */}
              <div
                className="flex h-2 w-full overflow-hidden rounded-full"
                style={{ background: 'var(--surface-2)' }}
              >
                {pillar.hiddenStemTenGods.map((hs, hsIdx) => {
                  const pct = Math.max(
                    8,
                    Math.round((hs.weight / totalHiddenWeight) * 100)
                  );
                  const hsEl = ELEMENT_INFO[hs.element];
                  return (
                    <div
                      key={`${hs.hanja}-${hsIdx}`}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: hsEl.cssVar,
                      }}
                      title={`${hs.role} ${hs.hangul}(${hs.hanja}) ${pct}%`}
                    />
                  );
                })}
              </div>

              {/* Hidden Stem Rows */}
              <div className="space-y-1">
                {pillar.hiddenStemTenGods.map((hs, hsIdx) => {
                  const pct = Math.round((hs.weight / totalHiddenWeight) * 100);
                  const hsEl = ELEMENT_INFO[hs.element];
                  return (
                    <div
                      key={`${hs.role}-${hs.hanja}-${hsIdx}`}
                      className="flex items-center justify-between gap-1.5 rounded-lg px-2 py-1 text-[10.5px]"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: hsEl.cssVar }}
                        />
                        <span
                          className="shrink-0 text-[9.5px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {hs.role}
                        </span>
                        <span
                          className="font-bold shrink-0"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {hs.hangul}({hs.hanja})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {hs.tenGod}
                        </span>
                        <span
                          className="tabular-nums text-[9.5px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 신살 Chips */}
            <div className="space-y-1">
              <div
                className="flex items-center gap-1 text-[10px] font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Sparkles className="h-3 w-3" style={{ color: 'var(--accent-gold)' }} />
                주요 신살
              </div>
              {pillar.shensha.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {pillar.shensha.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: 'var(--surface-2)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  특이 신살 없음
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
