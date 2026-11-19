import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  Check,
  Compass,
  Copy,
  Hash,
  Heart,
  HeartPulse,
  Palette,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { SajuResult } from '../types/saju';
import {
  copyToClipboard,
  ELEMENT_META,
  getElementBorder,
  getElementColor,
  getElementTint,
} from './elementUtils';

export interface FortuneInsightCardsProps {
  result: SajuResult;
}

export function FortuneInsightCards({ result }: FortuneInsightCardsProps) {
  const { interpretation, dayMaster } = result;
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = async (hex: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedHex(hex);
      window.setTimeout(() => {
        setCopiedHex((prev) => (prev === hex ? null : prev));
      }, 1800);
    }
  };

  return (
    <section className="space-y-4" aria-label="일주 심층 성향 및 라이프 인사이트">
      {/* Toast for HEX Copy */}
      <AnimatePresence>
        {copiedHex && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-2xl md:bottom-8"
            style={{
              backgroundColor: 'var(--accent-gold)',
              color: 'var(--bg-canvas)',
            }}
            role="status"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{copiedHex} 클립보드에 복사됨</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* 1. Ilju Archetype Hero (Span 12 or 7) */}
        <article
          className="md:col-span-7"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{
                backgroundColor: getElementTint(dayMaster.element, 14),
                border: `1px solid ${getElementBorder(dayMaster.element, 34)}`,
                color: getElementColor(dayMaster.element),
              }}
            >
              {interpretation.iljuTitle}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {interpretation.iljuAnimal}
            </span>
          </div>

          <h3
            className="font-serif text-xl font-bold leading-snug sm:text-2xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {interpretation.archetype}
          </h3>

          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {interpretation.coreSummary}
          </p>
        </article>

        {/* 2. Career & UX/Design Work Style (Span 5) */}
        <article
          className="flex flex-col justify-between md:col-span-5"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid color-mix(in srgb, var(--accent-gold) 32%, var(--border-subtle))',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Briefcase className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                커리어 &amp; UX/디자인 작업 스타일
              </h4>
            </div>
            <p className="text-xs leading-relaxed sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              {interpretation.careerDesignStyle}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {interpretation.luckyElements.map((el) => (
              <span
                key={el}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: getElementTint(el, 14),
                  color: getElementColor(el),
                }}
              >
                시너지 오행 · {ELEMENT_META[el].ko}({ELEMENT_META[el].hanja})
              </span>
            ))}
          </div>
        </article>

        {/* 3. Strengths vs Challenges (Span 6 + 6) */}
        <article
          className="md:col-span-6"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <h4
            className="mb-3 flex items-center gap-2 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <Sparkles className="h-4 w-4" style={{ color: 'var(--color-wood)' }} />
            타고난 핵심 강점
          </h4>
          <ul className="space-y-2">
            {interpretation.personalityStrengths.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs leading-relaxed sm:text-[13px]"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-wood)' }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article
          className="md:col-span-6"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <h4
            className="mb-3 flex items-center gap-2 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            성장을 위한 균형 포인트
          </h4>
          <ul className="space-y-2">
            {interpretation.growthChallenges.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs leading-relaxed sm:text-[13px]"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--accent-gold)' }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* 4. Love / Wealth / Health (Span 4 + 4 + 4) */}
        <article
          className="md:col-span-4"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <h4
            className="mb-2 flex items-center gap-2 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <Heart className="h-4 w-4" style={{ color: 'var(--color-fire)' }} />
            연애 · 파트너십
          </h4>
          <p className="text-xs leading-relaxed sm:text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {interpretation.loveStyle}
          </p>
        </article>

        <article
          className="md:col-span-4"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <h4
            className="mb-2 flex items-center gap-2 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <Wallet className="h-4 w-4" style={{ color: 'var(--color-earth)' }} />
            재물 · 자산 흐름
          </h4>
          <p className="text-xs leading-relaxed sm:text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {interpretation.wealthStyle}
          </p>
        </article>

        <article
          className="md:col-span-4"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <h4
            className="mb-2 flex items-center gap-2 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <HeartPulse className="h-4 w-4" style={{ color: 'var(--color-water)' }} />
            웰니스 · 컨디션 조언
          </h4>
          <p className="text-xs leading-relaxed sm:text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {interpretation.healthAdvice}
          </p>
        </article>

        {/* 5. Interactive Lucky Swatches + Direction + Numbers (Span 12) */}
        <article
          className="md:col-span-12"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h4
                className="flex items-center gap-2 text-sm font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <Palette className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
                나만의 행운 컬러 팔레트
                <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                  (클릭 시 HEX 복사)
                </span>
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {interpretation.luckyColors.map((swatch) => {
                  const isCopied = copiedHex === swatch.hex;
                  return (
                    <button
                      key={`${swatch.name}-${swatch.hex}`}
                      type="button"
                      onClick={() => handleCopyHex(swatch.hex)}
                      className="group flex items-center gap-2.5 rounded-2xl px-3 py-2 text-left transition-transform active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        className="h-7 w-7 shrink-0 rounded-xl shadow-inner"
                        style={{
                          backgroundColor: swatch.hex,
                          border: '1px solid var(--border-strong)',
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {swatch.name}
                        </div>
                        <div
                          className="flex items-center gap-1 font-mono text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <span>{swatch.hex}</span>
                          {isCopied ? (
                            <Check className="h-3 w-3" style={{ color: 'var(--color-wood)' }} />
                          ) : (
                            <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Compass className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    행운 방위
                  </div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {interpretation.luckyDirection}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Hash className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    행운 숫자
                  </div>
                  <div className="font-mono text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {interpretation.luckyNumbers.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
