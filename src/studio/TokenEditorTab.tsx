import { Check, RotateCcw } from 'lucide-react';
import type { DensityMode } from '../types/design';
import { useDesignerStudio } from './DesignerStudioProvider';
import { ELEMENT_META, THEME_PRESET_LIST } from './themes';

const DENSITY_OPTIONS: { id: DensityMode; label: string; sub: string }[] = [
  { id: 'compact', label: '컴팩트', sub: '14px' },
  { id: 'comfortable', label: '컴포터블', sub: '20px' },
  { id: 'editorial', label: '에디토리얼', sub: '28px' },
];

export function TokenEditorTab() {
  const { tokens, setTheme, setElementColor, updateTokens, resetTokens } = useDesignerStudio();
  const radiusPx = Math.round(tokens.radiusScale * 18);

  return (
    <div className="space-y-5">
      {/* 4-Theme Swatch Cards */}
      <section aria-labelledby="studio-theme-heading">
        <div className="mb-2.5 flex items-center justify-between">
          <h3
            id="studio-theme-heading"
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            테마 프리셋 (4 Themes)
          </h3>
          <span className="font-mono-spec text-[11px]" style={{ color: 'var(--text-muted)' }}>
            data-theme=&quot;{tokens.theme}&quot;
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {THEME_PRESET_LIST.map((preset) => {
            const active = tokens.theme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme(preset.id)}
                aria-pressed={active}
                data-testid={`theme-preset-${preset.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border p-2.5 text-left transition-all"
                style={{
                  backgroundColor: preset.tokens.bgCanvas,
                  borderColor: active ? preset.tokens.accentGold : preset.tokens.borderStrong,
                  boxShadow: active ? `0 0 0 1px ${preset.tokens.accentGold}` : 'none',
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase"
                    style={{
                      backgroundColor: preset.tokens.surface2,
                      color: preset.tokens.textSecondary,
                    }}
                  >
                    {preset.mode}
                  </span>
                  {active && (
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ backgroundColor: preset.tokens.accentGold, color: '#111111' }}
                    >
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Mini UI Card Swatch */}
                <div
                  className="mb-2 flex items-center justify-between rounded-lg border px-2 py-1.5"
                  style={{
                    backgroundColor: preset.tokens.surface1,
                    borderColor: preset.tokens.borderSubtle,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {ELEMENT_META.map((el) => (
                      <span
                        key={el.key}
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: preset.elementPalette[el.key] }}
                      />
                    ))}
                  </div>
                  <span
                    className="h-2 w-5 rounded-full"
                    style={{ backgroundColor: preset.tokens.accentGold }}
                  />
                </div>

                <div className="text-xs font-semibold" style={{ color: preset.tokens.textPrimary }}>
                  {preset.nameKo}
                </div>
                <div className="truncate text-[10px]" style={{ color: preset.tokens.textMuted }}>
                  {preset.nameEn}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5-Element Live Color Pickers */}
      <section aria-labelledby="studio-elements-heading">
        <div className="mb-2.5 flex items-center justify-between">
          <h3
            id="studio-elements-heading"
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            오행 컬러 토큰 (--color-*)
          </h3>
          <span className="font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
            LIVE CSS VARS
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {ELEMENT_META.map((el) => {
            const hex = tokens.elementPalette[el.key];
            return (
              <div
                key={el.key}
                className="flex items-center justify-between rounded-xl border px-3 py-2"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-white/20 shadow-inner">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => setElementColor(el.key, e.target.value)}
                      aria-label={`${el.labelKo} (${el.labelEn}) 색상 선택`}
                      className="absolute inset-0 h-10 w-10 -translate-x-1 -translate-y-1 cursor-pointer border-0 bg-transparent p-0 opacity-0"
                    />
                    <span className="h-full w-full" style={{ backgroundColor: hex }} />
                  </label>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span style={{ color: 'var(--text-primary)' }}>
                        {el.labelKo} {el.labelHanja}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        --color-{el.key}
                      </span>
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {el.role}
                    </div>
                  </div>
                </div>

                <span
                  className="font-mono-spec rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {hex}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Geometry, Glass, Typography Sliders */}
      <section className="space-y-3.5 rounded-2xl border p-3.5" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
        <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
          형태 · 유리 질감 · 스케일
        </h3>

        {/* Corner Radius 0-28px */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="slider-radius" style={{ color: 'var(--text-primary)' }}>
              모서리 반경 (--radius-card)
            </label>
            <span className="font-mono-spec font-semibold" style={{ color: 'var(--accent-gold)' }}>
              {radiusPx}px
            </span>
          </div>
          <input
            id="slider-radius"
            type="range"
            min={0}
            max={28}
            step={1}
            value={radiusPx}
            onChange={(e) =>
              updateTokens({ radiusScale: Number((Number(e.target.value) / 18).toFixed(3)) })
            }
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent-gold)' }}
          />
        </div>

        {/* Glass Blur 0-32px */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="slider-blur" style={{ color: 'var(--text-primary)' }}>
              글래스 블러 (--glass-blur)
            </label>
            <span className="font-mono-spec font-semibold" style={{ color: 'var(--accent-gold)' }}>
              {tokens.glassBlur}px
            </span>
          </div>
          <input
            id="slider-blur"
            type="range"
            min={0}
            max={32}
            step={1}
            value={tokens.glassBlur}
            onChange={(e) => updateTokens({ glassBlur: Number(e.target.value) })}
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent-gold)' }}
          />
        </div>

        {/* Font Scale 0.9-1.15x */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="slider-font-scale" style={{ color: 'var(--text-primary)' }}>
              타이포 배율 (--font-scale)
            </label>
            <span className="font-mono-spec font-semibold" style={{ color: 'var(--accent-gold)' }}>
              {tokens.fontScale.toFixed(2)}x ({Math.round(16 * tokens.fontScale)}px)
            </span>
          </div>
          <input
            id="slider-font-scale"
            type="range"
            min={0.9}
            max={1.15}
            step={0.01}
            value={tokens.fontScale}
            onChange={(e) => updateTokens({ fontScale: Number(e.target.value) })}
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent-gold)' }}
          />
        </div>
      </section>

      {/* Density & Pillar Order */}
      <section className="space-y-3">
        <div>
          <div className="mb-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            밀도 (Density)
          </div>
          <div
            className="grid grid-cols-3 gap-1 rounded-xl border p-1"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
          >
            {DENSITY_OPTIONS.map((opt) => {
              const active = tokens.density === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateTokens({ density: opt.id })}
                  aria-pressed={active}
                  className="rounded-lg px-2 py-1.5 text-center transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent-gold-soft)' : 'transparent',
                    color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  <div className="text-[11px] font-semibold">{opt.label}</div>
                  <div className="font-mono-spec text-[9px] opacity-75">{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            명식 표기 방향 (Pillar Order)
          </div>
          <div
            className="grid grid-cols-2 gap-1 rounded-xl border p-1"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
          >
            {[
              { id: 'traditional' as const, label: '전통 우→좌', sub: '시 · 일 · 월 · 년' },
              { id: 'modern' as const, label: '현대 좌→우', sub: '년 · 월 · 일 · 시' },
            ].map((opt) => {
              const active = tokens.pillarOrder === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateTokens({ pillarOrder: opt.id })}
                  aria-pressed={active}
                  className="rounded-lg px-2.5 py-1.5 text-center transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent-gold-soft)' : 'transparent',
                    color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  <div className="text-[11px] font-semibold">{opt.label}</div>
                  <div className="text-[10px] opacity-75">{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reset Defaults */}
      <button
        type="button"
        onClick={resetTokens}
        className="flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors hover:opacity-90"
        style={{
          backgroundColor: 'var(--surface-1)',
          borderColor: 'var(--border-strong)',
          color: 'var(--text-primary)',
        }}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>기본값 초기화 (Reset Defaults)</span>
      </button>
    </div>
  );
}
