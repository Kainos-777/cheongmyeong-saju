import { motion } from 'framer-motion';
import { Award, Scale, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import type { ElementKey, ElementScore, SajuResult } from '../types/saju';
import {
  ELEMENT_META,
  getElementBorder,
  getElementColor,
  getElementTint,
} from './elementUtils';

export interface OhaengBalancePanelProps {
  result: SajuResult;
  selectedElement?: ElementKey | null;
  onSelectElement?: (element: ElementKey | null) => void;
}

const STRENGTH_STEPS: SajuResult['strength']['level'][] = [
  '극신약',
  '신약',
  '중화',
  '신강',
  '극신강',
];

function getStatusBadgeStyle(status: ElementScore['status']) {
  if (status === '과다') {
    return {
      color: 'var(--color-fire)',
      bg: getElementTint('fire', 14),
      border: getElementBorder('fire', 34),
    };
  }
  if (status === '적정') {
    return {
      color: 'var(--color-wood)',
      bg: getElementTint('wood', 14),
      border: getElementBorder('wood', 34),
    };
  }
  if (status === '부족') {
    return {
      color: 'var(--color-earth)',
      bg: getElementTint('earth', 14),
      border: getElementBorder('earth', 34),
    };
  }
  return {
    color: 'var(--text-muted)',
    bg: 'var(--surface-2)',
    border: 'var(--border-subtle)',
  };
}

export function OhaengBalancePanel({
  result,
  selectedElement = null,
  onSelectElement,
}: OhaengBalancePanelProps) {
  const { elements, yinYangRatio, strength, gyeokguk, yongshin } = result;
  const totalYY = Math.max(1, yinYangRatio.yang + yinYangRatio.yin);
  const yangPct = Math.round((yinYangRatio.yang / totalYY) * 100);
  const yinPct = 100 - yangPct;
  const clampedStrength = Math.min(100, Math.max(0, strength.score));

  return (
    <div className="space-y-4">
      {/* Five Elements Progress Bars */}
      <section
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="오행 분포 및 균형"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              오행 세력 분포 (五行)
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              천간·지지·월지·지장간 가중치를 반영한 실제 에너지 비중입니다
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{
                backgroundColor: getElementTint(result.dominantElement, 14),
                color: getElementColor(result.dominantElement),
              }}
            >
              주력: {ELEMENT_META[result.dominantElement].ko}
            </span>
            <span
              className="rounded-full px-2.5 py-1 font-medium"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              보완: {ELEMENT_META[result.lackingElement].ko}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {elements.map((item, idx) => {
            const meta = ELEMENT_META[item.element];
            const elColor = getElementColor(item.element);
            const statusStyle = getStatusBadgeStyle(item.status);
            const isSelected = selectedElement === item.element;
            const barWidth = Math.min(100, Math.max(2, item.percentage));

            return (
              <button
                key={item.element}
                type="button"
                onClick={() =>
                  onSelectElement?.(isSelected ? null : item.element)
                }
                className="block w-full rounded-2xl p-2.5 text-left transition-colors"
                style={{
                  backgroundColor: isSelected
                    ? getElementTint(item.element, 12)
                    : 'var(--surface-1)',
                  border: isSelected
                    ? `1.5px solid ${elColor}`
                    : '1px solid var(--border-subtle)',
                }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg font-serif text-sm font-bold"
                      style={{
                        backgroundColor: getElementTint(item.element, 16),
                        color: elColor,
                      }}
                    >
                      {item.labelHanja}
                    </span>
                    <div>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {item.labelKo} ({meta.en})
                      </span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.count}자
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: statusStyle.bg,
                        border: `1px solid ${statusStyle.border}`,
                        color: statusStyle.color,
                      }}
                    >
                      {item.status}
                    </span>
                    <span
                      className="w-11 text-right font-mono text-sm font-bold tabular-nums"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div
                  className="h-2.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--surface-2)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      damping: 26,
                      delay: idx * 0.05,
                    }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: elColor }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Yin-Yang Ratio & Strength Spectrum */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 음양 비율 */}
        <section
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
              <Scale className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              음양 조화 비율 (陰陽)
            </h3>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              양 {yangPct}% : 음 {yinPct}%
            </span>
          </div>

          <div
            className="flex h-4 w-full overflow-hidden rounded-full"
            style={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${yangPct}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              className="h-full"
              style={{ backgroundColor: 'var(--accent-gold)' }}
            />
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${yinPct}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              className="h-full"
              style={{ backgroundColor: 'var(--color-water)' }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <div>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--accent-gold)' }}
              />{' '}
              <strong style={{ color: 'var(--text-primary)' }}>양(陽) {yangPct}%</strong>
              <span className="ml-1" style={{ color: 'var(--text-muted)' }}>
                발산 · 추진 · 외향
              </span>
            </div>
            <div>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-water)' }}
              />{' '}
              <strong style={{ color: 'var(--text-primary)' }}>음(陰) {yinPct}%</strong>
              <span className="ml-1" style={{ color: 'var(--text-muted)' }}>
                수렴 · 사유 · 내면
              </span>
            </div>
          </div>
        </section>

        {/* 신강 / 신약 스펙트럼 */}
        <section
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3
              className="flex items-center gap-1.5 text-sm font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              일간 신강 · 신약 지수
            </h3>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: 'var(--accent-gold-soft)',
                color: 'var(--accent-gold)',
              }}
            >
              {strength.level} · {strength.score}점
            </span>
          </div>

          {/* 5-segment spectrum */}
          <div className="relative pt-2 pb-1">
            <div className="grid grid-cols-5 gap-1">
              {STRENGTH_STEPS.map((lvl) => {
                const active = lvl === strength.level;
                return (
                  <div
                    key={lvl}
                    className="rounded-lg py-1.5 text-center text-[11px] font-semibold"
                    style={{
                      backgroundColor: active ? 'var(--accent-gold-soft)' : 'var(--surface-1)',
                      border: active
                        ? '1px solid var(--accent-gold)'
                        : '1px solid var(--border-subtle)',
                      color: active ? 'var(--accent-gold)' : 'var(--text-muted)',
                    }}
                  >
                    {lvl}
                  </div>
                );
              })}
            </div>

            <div
              className="relative mt-2.5 h-2.5 w-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-water) 0%, var(--color-wood) 50%, var(--color-fire) 100%)',
                opacity: 0.85,
              }}
            >
              <motion.div
                initial={{ left: '50%' }}
                animate={{ left: `${clampedStrength}%` }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '2.5px solid var(--accent-gold)',
                }}
              />
            </div>
          </div>

          <p className="mt-2.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {strength.summary}
          </p>
        </section>
      </div>

      {/* 격국 & 용신·희신·기신 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 격국 카드 */}
        <section
          className="lg:col-span-5"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              명식 격국 (格局)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {gyeokguk.name}
            </h4>
            <span className="font-serif text-sm" style={{ color: 'var(--accent-gold)' }}>
              {gyeokguk.hanja}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {gyeokguk.description}
          </p>
        </section>

        {/* 용신 · 희신 · 기신 */}
        <section
          className="lg:col-span-7"
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
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              용신 · 희신 · 기신 (균형 처방)
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                {
                  role: '용신 (用神)',
                  sub: '핵심 조율 기운',
                  el: yongshin.primary,
                  Icon: ShieldCheck,
                },
                {
                  role: '희신 (喜神)',
                  sub: '보조 생조 기운',
                  el: yongshin.secondary,
                  Icon: Sparkles,
                },
                {
                  role: '기신 (忌神)',
                  sub: '과잉 경계 기운',
                  el: yongshin.avoidElement,
                  Icon: TriangleAlert,
                },
              ] as const
            ).map(({ role, sub, el, Icon }) => {
              const meta = ELEMENT_META[el];
              const color = getElementColor(el);
              return (
                <div
                  key={role}
                  className="rounded-2xl p-3"
                  style={{
                    backgroundColor: getElementTint(el, 11),
                    border: `1px solid ${getElementBorder(el, 32)}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {role}
                    </span>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="font-serif text-xl font-bold" style={{ color }}>
                      {meta.hanja}
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {meta.ko}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {sub}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {yongshin.reason}
          </p>
        </section>
      </div>
    </div>
  );
}
