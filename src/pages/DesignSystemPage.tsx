import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Check,
  Columns2,
  Copy,
  Download,
  Grid3X3,
  Maximize2,
  Monitor,
  Palette,
  Play,
  RotateCcw,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  Tag,
  Type,
} from 'lucide-react';
import {
  KineticTypography,
  PillarRevealCard,
  YinYangLoader,
  formatSpringSpec,
  useMotionSettings,
  useSpringTransition,
} from '../motion';
import { useSajuStore } from '../store/sajuStore';
import {
  ELEMENT_META as STUDIO_ELEMENT_META,
  MOTION_PRESET_LIST,
  SpringCurvePlot,
  THEME_PRESET_LIST,
  useDesignerStudio,
} from '../studio';
import type { ViewportMode } from '../types/design';
import type { Pillar } from '../types/saju';

const VIEWPORT_ITEMS: {
  id: ViewportMode;
  label: string;
  spec: string;
  Icon: typeof Maximize2;
}[] = [
  { id: 'full', label: 'Full', spec: '반응형', Icon: Maximize2 },
  { id: 'desktop', label: 'Desktop', spec: '1440px', Icon: Monitor },
  { id: 'tablet', label: 'Tablet', spec: '768px', Icon: Tablet },
  { id: 'mobile', label: 'Mobile', spec: '393px', Icon: Smartphone },
  { id: 'split', label: 'Split', spec: 'Web+Mob', Icon: Columns2 },
];

const SEMANTIC_TOKENS = [
  { name: '--bg-canvas', label: '캔버스 배경' },
  { name: '--bg-elevated', label: '상승 표면' },
  { name: '--surface-1', label: '카드 서피스 1' },
  { name: '--surface-2', label: '카드 서피스 2' },
  { name: '--accent-gold', label: '청명 골드 포인트' },
  { name: '--text-primary', label: '주 본문 텍스트' },
  { name: '--text-secondary', label: '보조 텍스트' },
  { name: '--border-strong', label: '강조 경계선' },
];

export function DesignSystemPage() {
  const { sajuResult, openExportModal } = useSajuStore();
  const {
    tokens,
    activeThemePreset,
    setTheme,
    setElementColor,
    updateTokens,
    applyMotionPreset,
    updateMotion,
    updateGrid,
    setViewport,
    toggleStudio,
    triggerReplay,
    resetTokens,
  } = useDesignerStudio();
  const motionSettings = useMotionSettings();
  const demoSpring = useSpringTransition(0);

  const [compactCards, setCompactCards] = useState(false);
  const [springActive, setSpringActive] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const radiusPx = Math.round(tokens.radiusScale * 18);

  const unknownDemoPillar: Pillar = {
    ...sajuResult.pillars.hour,
    key: 'hour',
    labelKo: '시주',
    labelHanja: '時柱',
    isUnknown: true,
  };

  const handleCopyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedToken(value);
      window.setTimeout(() => {
        setCopiedToken((prev) => (prev === value ? null : prev));
      }, 1500);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Hero */}
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold"
                style={{
                  backgroundColor: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                UX/UI Design System &amp; Motion Gallery
              </span>
              <span className="font-mono-spec text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {activeThemePreset.nameKo} · {tokens.motion.preset} · {Math.round(16 * tokens.fontScale)}px
              </span>
            </div>

            <KineticTypography
              text="청명 디자인 토큰 & 모션 아키텍처"
              as="h1"
              mode="word"
              className="font-serif-kr text-2xl font-bold tracking-tight sm:text-3xl"
            />
            <p className="max-w-2xl text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              4개 테마의 실시간 CSS 변수, 오행 컬러 토큰, 타이포그래피 스케일, 사주 기둥 카드 상태,
              스프링 물리 곡선과 반응형 브레이크포인트 프레임을 한곳에서 검증하고 내보낼 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={triggerReplay}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--accent-gold)',
                color: 'var(--bg-canvas)',
              }}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              모션 다시 재생
            </button>

            <button
              type="button"
              onClick={() =>
                updateMotion({ showMotionSpecs: !tokens.motion.showMotionSpecs })
              }
              aria-pressed={tokens.motion.showMotionSpecs}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: tokens.motion.showMotionSpecs
                  ? 'var(--accent-gold-soft)'
                  : 'var(--surface-1)',
                border: tokens.motion.showMotionSpecs
                  ? '1px solid var(--accent-gold)'
                  : '1px solid var(--border-subtle)',
                color: tokens.motion.showMotionSpecs
                  ? 'var(--accent-gold)'
                  : 'var(--text-primary)',
              }}
            >
              <Tag className="h-3.5 w-3.5" />
              Motion Specs
            </button>

            <button
              type="button"
              onClick={() => toggleStudio(true)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
              Studio ⌘K
            </button>

            <button
              type="button"
              onClick={openExportModal}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <Download className="h-3.5 w-3.5" />
              SVG 포스터
            </button>
          </div>
        </div>
      </section>

      {/* Section 1: Color Tokens & 5-Element Swatches */}
      <section
        className="space-y-4"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="컬러 토큰 및 오행 팔레트"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            <Palette className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            테마 &amp; 오행 컬러 토큰
          </h2>
          <button
            type="button"
            onClick={resetTokens}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <RotateCcw className="h-3 w-3" />
            토큰 초기화
          </button>
        </div>

        {/* 4 Themes */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {THEME_PRESET_LIST.map((preset) => {
            const active = tokens.theme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme(preset.id)}
                aria-pressed={active}
                className="flex flex-col justify-between rounded-2xl border p-3 text-left transition-all"
                style={{
                  backgroundColor: preset.tokens.bgCanvas,
                  borderColor: active ? preset.tokens.accentGold : preset.tokens.borderStrong,
                  boxShadow: active ? `0 0 0 1px ${preset.tokens.accentGold}` : 'none',
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{
                      backgroundColor: preset.tokens.surface2,
                      color: preset.tokens.textSecondary,
                    }}
                  >
                    {preset.mode}
                  </span>
                  {active && (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: preset.tokens.accentGold, color: '#111111' }}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: preset.tokens.textPrimary }}>
                    {preset.nameKo}
                  </div>
                  <div className="text-[11px]" style={{ color: preset.tokens.textMuted }}>
                    {preset.nameEn}
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  {STUDIO_ELEMENT_META.map((el) => (
                    <span
                      key={el.key}
                      className="h-2.5 flex-1 rounded-full"
                      style={{ backgroundColor: preset.elementPalette[el.key] }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* 5-Element Live Color Tokens */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {STUDIO_ELEMENT_META.map((el) => {
            const hex = tokens.elementPalette[el.key];
            const isCopied = copiedToken === hex;
            return (
              <div
                key={el.key}
                className="flex flex-col justify-between rounded-2xl border p-3"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {el.labelKo} · {el.labelHanja}
                  </span>
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => setElementColor(el.key, e.target.value)}
                    aria-label={`${el.labelKo} 오행 색상 변경`}
                    className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <span className="font-mono-spec text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    --color-{el.key}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyValue(hex)}
                    className="inline-flex items-center gap-1 font-mono-spec text-[11px] font-semibold"
                    style={{ color: hex }}
                  >
                    {hex.toUpperCase()}
                    {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-60" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Semantic Token Strip */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SEMANTIC_TOKENS.map((tok) => (
            <div
              key={tok.name}
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2"
              style={{
                backgroundColor: 'var(--surface-1)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-lg border"
                style={{
                  backgroundColor: `var(${tok.name})`,
                  borderColor: 'var(--border-strong)',
                }}
              />
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {tok.label}
                </div>
                <div className="truncate font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {tok.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Typography Scale & Surface Specs */}
      <section
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        aria-label="타이포그래피 스케일 및 서피스 토큰"
      >
        <div
          className="space-y-4 lg:col-span-7"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              <Type className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              타이포그래피 스케일 (Hanja + Hangul + Mono)
            </h2>
            <span className="font-mono-spec text-xs" style={{ color: 'var(--accent-gold)' }}>
              scale {tokens.fontScale.toFixed(2)}x ({Math.round(16 * tokens.fontScale)}px)
            </span>
          </div>

          <div className="space-y-3">
            <div
              className="rounded-2xl border p-3.5"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span>Display Serif · Noto Serif KR</span>
                <span className="font-mono-spec">30px / 700</span>
              </div>
              <div className="font-serif-kr text-2xl font-bold sm:text-3xl">
                淸明萬歲曆 · 청명 사주 명리
              </div>
            </div>

            <div
              className="rounded-2xl border p-3.5"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span>UI Sans · Pretendard Variable</span>
                <span className="font-mono-spec">14px / 400–600</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                정밀 천문 절입 시각과 진태양시 보정 알고리즘 위에 한국적 서예 미학과
                유체 물리 모션을 결합한 차세대 명리학 디자인 시스템입니다.
              </p>
            </div>

            <div
              className="rounded-2xl border p-3.5"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span>Technical Spec · JetBrains Mono</span>
                <span className="font-mono-spec">12px / 500</span>
              </div>
              <div className="font-mono-spec text-xs" style={{ color: 'var(--accent-gold)' }}>
                {formatSpringSpec(tokens.motion)} · radius:{radiusPx}px · blur:{tokens.glassBlur}px
              </div>
            </div>
          </div>
        </div>

        {/* Surface & Geometry Live Specs */}
        <div
          className="space-y-4 lg:col-span-5"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            형태·밀도·배열 실시간 조정
          </h2>

          <div className="space-y-3">
            <label className="block space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>모서리 라운드 (Radius)</span>
                <span className="font-mono-spec">{radiusPx}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={28}
                step={1}
                value={radiusPx}
                onChange={(e) => updateTokens({ radiusScale: Number(e.target.value) / 18 })}
                className="w-full accent-[var(--accent-gold)]"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>글래스 블러 (Glass Blur)</span>
                <span className="font-mono-spec">{tokens.glassBlur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                step={1}
                value={tokens.glassBlur}
                onChange={(e) => updateTokens({ glassBlur: Number(e.target.value) })}
                className="w-full accent-[var(--accent-gold)]"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>폰트 스케일 (Font Scale)</span>
                <span className="font-mono-spec">{tokens.fontScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.9}
                max={1.15}
                step={0.01}
                value={tokens.fontScale}
                onChange={(e) => updateTokens({ fontScale: Number(e.target.value) })}
                className="w-full accent-[var(--accent-gold)]"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              {(['compact', 'comfortable', 'editorial'] as const).map((d) => {
                const active = tokens.density === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateTokens({ density: d })}
                    className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--accent-gold)' : 'var(--surface-1)',
                      border: '1px solid var(--border-subtle)',
                      color: active ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Pillar Card Component States Playground */}
      <section
        className="space-y-4"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="기둥 카드 컴포넌트 상태 플레이그라운드"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Pillar Card 컴포넌트 상태 (States Playground)
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              카드를 클릭하면 3D 뒤집기(지장간·십이운성·신살) 상태를 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompactCards((prev) => !prev)}
              aria-pressed={compactCards}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: compactCards ? 'var(--accent-gold-soft)' : 'var(--surface-1)',
                border: compactCards
                  ? '1px solid var(--accent-gold)'
                  : '1px solid var(--border-subtle)',
                color: compactCards ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              Compact 모드: {compactCards ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="font-mono-spec text-[11px]" style={{ color: 'var(--accent-gold)' }}>
              State 01 · 일간 (Day Master)
            </div>
            <PillarRevealCard
              pillar={sajuResult.pillars.day}
              index={0}
              isDayMaster
              compact={compactCards}
            />
          </div>

          <div className="space-y-2">
            <div className="font-mono-spec text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              State 02 · 표준 월주 (Standard)
            </div>
            <PillarRevealCard
              pillar={sajuResult.pillars.month}
              index={1}
              compact={compactCards}
            />
          </div>

          <div className="space-y-2">
            <div className="font-mono-spec text-[11px]" style={{ color: 'var(--text-muted)' }}>
              State 03 · 시간 미상 (Unknown Time)
            </div>
            <PillarRevealCard
              pillar={unknownDemoPillar}
              index={2}
              compact={compactCards}
            />
          </div>
        </div>
      </section>

      {/* Section 4: Motion Choreography & Spring Physics Lab */}
      <section
        className="space-y-4"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="모션 안무 및 스프링 물리 실험실"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            <Activity className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            모션 물리 &amp; 안무 갤러리
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {MOTION_PRESET_LIST.map((preset) => {
              const active = tokens.motion.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyMotionPreset(preset.id)}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent-gold)' : 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    color: active ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  }}
                >
                  {preset.nameEn}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SpringCurvePlot
              stiffness={motionSettings.stiffness}
              damping={motionSettings.damping}
              mass={motionSettings.mass}
              speed={motionSettings.speed}
              reducedMotion={motionSettings.reducedMotion}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            {/* Interactive Spring Ball Test */}
            <div
              className="flex flex-col justify-between rounded-2xl border p-4"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  인터랙티브 스프링 응답 테스트
                </div>
                <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  카드를 클릭해 현재 k·d·m 물리 반동을 즉시 체감하세요.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSpringActive((prev) => !prev)}
                className="relative my-4 flex h-16 w-full items-center rounded-2xl border px-3"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <motion.div
                  animate={{
                    x: springActive ? 120 : 0,
                    scale: springActive ? 1.08 : 1,
                  }}
                  transition={demoSpring}
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-serif-kr text-sm font-bold shadow-lg"
                  style={{
                    backgroundColor: 'var(--accent-gold)',
                    color: 'var(--bg-canvas)',
                  }}
                >
                  氣
                </motion.div>
                <span className="ml-auto font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  클릭하여 토글
                </span>
              </button>

              <div className="font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {formatSpringSpec(motionSettings)}
              </div>
            </div>

            {/* YinYang Loader & Kinetic Demo */}
            <div
              className="flex flex-col items-center justify-center rounded-2xl border p-4 text-center"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
            >
              <YinYangLoader size={80} label="태극 팔괘 · 실시간 회전" />
              <div className="mt-2 font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Speed {motionSettings.speed}x · Replay #{motionSettings.replayNonce}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Viewport & Grid Overlay Showcase */}
      <section
        className="space-y-4"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="반응형 뷰포트 및 그리드 레드라인 쇼케이스"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              반응형 디바이스 스테이지 &amp; 그리드 레드라인
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              웹과 모바일(iPhone 16 Pro · 393×852)을 전환하거나 Split 모드로 동시에 비교하세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {VIEWPORT_ITEMS.map(({ id, label, spec, Icon }) => {
              const active = tokens.viewport === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewport(id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent-gold)' : 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    color: active ? 'var(--bg-canvas)' : 'var(--text-primary)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                  <span className="font-mono-spec text-[10px] opacity-75">{spec}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => updateGrid({ showColumns: !tokens.grid.showColumns })}
            className="flex items-center justify-between rounded-2xl border px-3.5 py-3 text-left text-xs font-semibold"
            style={{
              backgroundColor: tokens.grid.showColumns ? 'var(--accent-gold-soft)' : 'var(--surface-1)',
              borderColor: tokens.grid.showColumns ? 'var(--accent-gold)' : 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              12-Col / 4-Col 컬럼 가이드
            </span>
            <span>{tokens.grid.showColumns ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => updateGrid({ showBaseline: !tokens.grid.showBaseline })}
            className="flex items-center justify-between rounded-2xl border px-3.5 py-3 text-left text-xs font-semibold"
            style={{
              backgroundColor: tokens.grid.showBaseline ? 'var(--accent-gold-soft)' : 'var(--surface-1)',
              borderColor: tokens.grid.showBaseline ? 'var(--accent-gold)' : 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="flex items-center gap-2">
              <Ruler className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              8px 베이스라인 그리드
            </span>
            <span>{tokens.grid.showBaseline ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => updateGrid({ showSafeArea: !tokens.grid.showSafeArea })}
            className="flex items-center justify-between rounded-2xl border px-3.5 py-3 text-left text-xs font-semibold"
            style={{
              backgroundColor: tokens.grid.showSafeArea ? 'var(--accent-gold-soft)' : 'var(--surface-1)',
              borderColor: tokens.grid.showSafeArea ? 'var(--accent-gold)' : 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
              Safe Area &amp; 44px 터치 타겟
            </span>
            <span>{tokens.grid.showSafeArea ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
