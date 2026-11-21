import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, ChevronDown, Info, ShieldAlert, Sparkles } from 'lucide-react';
import type { Pillar, PillarInteraction, SajuResult, ShenshaItem } from '../types/saju';
import {
  ELEMENT_META,
  getElementBorder,
  getElementColor,
  getElementTint,
  getOrderedPillars,
  pad2,
  PILLAR_LABEL_KO,
} from './elementUtils';

export interface FourPillarsBoardProps {
  result: SajuResult;
  pillarOrder: 'traditional' | 'modern';
  onTogglePillarOrder: () => void;
  renderPillar?: (pillar: Pillar, index: number, isDayMaster: boolean) => ReactNode;
  replayKey?: number;
}

function FallbackPillarCard({
  pillar,
  isDayMaster,
}: {
  pillar: Pillar;
  isDayMaster: boolean;
}) {
  const stemColor = getElementColor(pillar.stem.element);
  const branchColor = getElementColor(pillar.branch.element);

  return (
    <div
      className="flex h-full flex-col justify-between gap-3 p-4"
      style={{
        backgroundColor: 'var(--surface-1)',
        border: isDayMaster
          ? '1px solid var(--accent-gold)'
          : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {pillar.labelKo}{' '}
          <span className="font-serif text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {pillar.labelHanja}
          </span>
        </span>
        {isDayMaster && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: 'var(--accent-gold-soft)',
              color: 'var(--accent-gold)',
            }}
          >
            일간
          </span>
        )}
      </div>

      {pillar.isUnknown ? (
        <div
          className="flex flex-1 flex-col items-center justify-center rounded-xl py-8 text-center"
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <span className="font-serif text-xl" style={{ color: 'var(--text-muted)' }}>
            時未詳
          </span>
          <span className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            출생 시간 미상
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Stem */}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{
              backgroundColor: getElementTint(pillar.stem.element, 12),
              border: `1px solid ${getElementBorder(pillar.stem.element, 30)}`,
            }}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold" style={{ color: stemColor }}>
                {pillar.stem.hanja}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {pillar.stem.hangul}
              </span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {pillar.stemTenGod}
            </span>
          </div>

          {/* Branch */}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{
              backgroundColor: getElementTint(pillar.branch.element, 12),
              border: `1px solid ${getElementBorder(pillar.branch.element, 30)}`,
            }}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold" style={{ color: branchColor }}>
                {pillar.branch.hanja}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {pillar.branch.hangul}
              </span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {pillar.branchTenGod}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span>{pillar.isUnknown ? '—' : pillar.twelveStage}</span>
        <span>{pillar.isUnknown ? '' : pillar.branch.animal}</span>
      </div>
    </div>
  );
}

function getInteractionStyle(sentiment: PillarInteraction['sentiment']) {
  if (sentiment === 'positive') {
    return {
      color: 'var(--color-wood)',
      bg: getElementTint('wood', 12),
      border: getElementBorder('wood', 34),
      badge: '조화',
    };
  }
  if (sentiment === 'caution') {
    return {
      color: 'var(--color-fire)',
      bg: getElementTint('fire', 12),
      border: getElementBorder('fire', 34),
      badge: '주의',
    };
  }
  return {
    color: 'var(--accent-gold)',
    bg: 'var(--accent-gold-soft)',
    border: 'color-mix(in srgb, var(--accent-gold) 36%, transparent)',
    badge: '중성',
  };
}

function getShenshaStyle(category: ShenshaItem['category']) {
  if (category === '길신') {
    return {
      color: 'var(--color-wood)',
      bg: getElementTint('wood', 12),
      border: getElementBorder('wood', 34),
      label: '길신',
    };
  }
  if (category === '흉살') {
    return {
      color: 'var(--color-fire)',
      bg: getElementTint('fire', 12),
      border: getElementBorder('fire', 34),
      label: '주의',
    };
  }
  return {
    color: 'var(--accent-gold)',
    bg: 'var(--accent-gold-soft)',
    border: 'color-mix(in srgb, var(--accent-gold) 36%, transparent)',
    label: '중성',
  };
}

export function FourPillarsBoard({
  result,
  pillarOrder,
  onTogglePillarOrder,
  renderPillar,
  replayKey = 0,
}: FourPillarsBoardProps) {
  const [expandedInteractionIdx, setExpandedInteractionIdx] = useState<number | null>(0);
  const [expandedShenshaIdx, setExpandedShenshaIdx] = useState<number | null>(null);

  const orderedPillars = getOrderedPillars(result.pillars, pillarOrder);
  const { solarDate, lunarDate, dayMaster, gyeokguk, yongshin } = result;
  const dayMasterMeta = ELEMENT_META[dayMaster.element];
  const yongshinMeta = ELEMENT_META[yongshin.primary];

  return (
    <section className="space-y-4" aria-label="사주 원국 명식표">
      {/* Top Metadata Strip */}
      <div
        className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>양력 </span>
            <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
              {solarDate.year}.{pad2(solarDate.month)}.{pad2(solarDate.day)}{' '}
              {result.input.unknownTime
                ? '시간미상'
                : `${pad2(solarDate.hour)}:${pad2(solarDate.minute)}`}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>음력 </span>
            <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
              {lunarDate.year}.{pad2(lunarDate.month)}.{pad2(lunarDate.day)}
              {lunarDate.isLeapMonth ? ' (윤)' : ''}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>출생지 </span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {result.birthPlace.label}
            </strong>
            <span className="ml-1 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              ({Math.abs(result.birthPlace.longitude).toFixed(1)}°
              {result.birthPlace.longitude >= 0 ? 'E' : 'W'})
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>보정시각 </span>
            <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
              {result.input.unknownTime ? '—' : result.adjustedTimeStr}
            </strong>
            {result.input.useTrueSolarTime && !result.input.unknownTime && (
              <span className="ml-1 font-mono text-[11px]" style={{ color: 'var(--accent-gold)' }}>
                ({result.trueSolarTimeOffsetMin >= 0 ? '+' : ''}
                {result.trueSolarTimeOffsetMin}m)
              </span>
            )}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>절기 </span>
            <strong style={{ color: 'var(--text-primary)' }}>{result.solarTermName}</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{
                backgroundColor: getElementTint(dayMaster.element, 14),
                border: `1px solid ${getElementBorder(dayMaster.element, 34)}`,
                color: getElementColor(dayMaster.element),
              }}
            >
              일간 {dayMaster.hangul}({dayMaster.hanja}) · {dayMasterMeta.ko}
            </span>
            <span
              className="rounded-full px-2.5 py-1 font-medium"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              격국 {gyeokguk.name}
            </span>
            <span
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{
                backgroundColor: getElementTint(yongshin.primary, 14),
                border: `1px solid ${getElementBorder(yongshin.primary, 34)}`,
                color: getElementColor(yongshin.primary),
              }}
            >
              용신 {yongshinMeta.ko}({yongshinMeta.hanja})
            </span>
          </div>

          <button
            type="button"
            onClick={onTogglePillarOrder}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
            }}
            title="사주 배열 방향 전환"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
            {pillarOrder === 'traditional' ? '전통 (시·일·월·년)' : '현대 (년·월·일·시)'}
          </button>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {orderedPillars.map((pillar, index) => {
          const isDayMaster = pillar.key === 'day';
          return (
            <div key={`${pillar.key}-${replayKey}`} className="min-w-0">
              {renderPillar ? (
                renderPillar(pillar, index, isDayMaster)
              ) : (
                <FallbackPillarCard pillar={pillar} isDayMaster={isDayMaster} />
              )}
            </div>
          );
        })}
      </div>

      {/* Interactions (형충회합) & Shensha (신살) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 형충회합 */}
        <div
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3
              className="flex items-center gap-1.5 text-sm font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              형충회합 (간지 상호작용)
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {result.interactions.length}건
            </span>
          </div>

          {result.interactions.length === 0 ? (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              명식 내 뚜렷한 충·형이나 합이 적어 기운이 고요하고 안정적으로 흐릅니다.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {result.interactions.map((item, idx) => {
                  const style = getInteractionStyle(item.sentiment);
                  const isOpen = expandedInteractionIdx === idx;
                  return (
                    <button
                      key={`${item.type}-${item.label}-${idx}`}
                      type="button"
                      onClick={() => setExpandedInteractionIdx(isOpen ? null : idx)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-transform active:scale-[0.98]"
                      style={{
                        backgroundColor: style.bg,
                        border: isOpen ? `1.5px solid ${style.color}` : `1px solid ${style.border}`,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        {item.type}
                      </span>
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {expandedInteractionIdx !== null &&
                  result.interactions[expandedInteractionIdx] && (
                    <motion.div
                      key={expandedInteractionIdx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="rounded-xl p-3 text-xs leading-relaxed"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {result.interactions[expandedInteractionIdx].label}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          관련 기둥:{' '}
                          {result.interactions[expandedInteractionIdx].pillars
                            .map((p) => PILLAR_LABEL_KO[p])
                            .join(' · ')}
                        </span>
                      </div>
                      <p>{result.interactions[expandedInteractionIdx].description}</p>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* 주요 신살 */}
        <div
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3
              className="flex items-center gap-1.5 text-sm font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              <Info className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              주요 신살 (神殺 · 귀인)
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {result.shensha.length}종
            </span>
          </div>

          {result.shensha.length === 0 ? (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              특수 신살이 두드러지지 않아 기본 오행과 격국의 흐름이 순수하게 발현됩니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {result.shensha.map((item, idx) => {
                const st = getShenshaStyle(item.category);
                const isOpen = expandedShenshaIdx === idx;
                return (
                  <button
                    key={`${item.name}-${item.pillar}-${idx}`}
                    type="button"
                    onClick={() => setExpandedShenshaIdx(isOpen ? null : idx)}
                    className="flex flex-col items-start rounded-xl p-3 text-left transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      border: isOpen ? `1px solid ${st.color}` : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                        <span className="font-serif text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {item.hanja}
                        </span>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: st.bg,
                          border: `1px solid ${st.border}`,
                          color: st.color,
                        }}
                      >
                        {item.category === '흉살' && <ShieldAlert className="h-2.5 w-2.5" />}
                        {st.label}
                      </span>
                    </div>

                    <div className="mt-1 flex w-full items-center justify-between text-[11px]">
                      <span style={{ color: 'var(--text-muted)' }}>
                        위치: {PILLAR_LABEL_KO[item.pillar]}
                      </span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </div>

                    {isOpen && (
                      <p
                        className="mt-2 border-t pt-2 text-xs leading-relaxed"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
