import { Gauge, Play, Sparkles, Tag } from 'lucide-react';
import { useDesignerStudio } from './DesignerStudioProvider';
import { SpringCurvePlot } from './SpringCurvePlot';
import { MOTION_PRESET_LIST } from './themes';

const SPEED_OPTIONS = [0.1, 0.25, 0.5, 1, 1.5, 2];

export function MotionInspectorTab() {
  const { tokens, applyMotionPreset, updateMotion, triggerReplay } = useDesignerStudio();
  const { motion } = tokens;

  return (
    <div className="space-y-4">
      {/* Prominent Replay Choreography CTA */}
      <button
        type="button"
        onClick={triggerReplay}
        data-testid="studio-replay-btn"
        className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left font-semibold shadow-sm transition-transform active:scale-[0.99]"
        style={{
          background:
            'linear-gradient(135deg, var(--accent-gold-soft) 0%, rgba(227, 185, 99, 0.08) 100%)',
          borderColor: 'var(--accent-gold)',
          color: 'var(--accent-gold)',
        }}
      >
        <span className="flex items-center gap-2 text-xs">
          <Play className="h-4 w-4 fill-current" />
          <span>모션 다시 재생 (Replay Choreography)</span>
        </span>
        <span
          className="font-mono-spec rounded-full px-2 py-0.5 text-[10px]"
          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
        >
          #{motion.replayNonce}
        </span>
      </button>

      {/* Motion Preset Pills */}
      <section aria-labelledby="studio-motion-presets">
        <div className="mb-2 flex items-center justify-between">
          <h3
            id="studio-motion-presets"
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            물리 모션 프리셋 (Presets)
          </h3>
          <span className="font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {motion.preset}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MOTION_PRESET_LIST.map((preset) => {
            const active = motion.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyMotionPreset(preset.id)}
                aria-pressed={active}
                title={preset.description}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-gold)' : 'var(--surface-1)',
                  borderColor: active ? 'var(--accent-gold)' : 'var(--border-subtle)',
                  color: active ? '#111111' : 'var(--text-primary)',
                }}
              >
                <Sparkles className="h-3 w-3 opacity-80" />
                <span>{preset.nameEn}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Analytical Spring Step-Response Curve */}
      <SpringCurvePlot
        stiffness={motion.stiffness}
        damping={motion.damping}
        mass={motion.mass}
        speed={motion.speed}
        reducedMotion={motion.reducedMotion}
      />

      {/* Stiffness / Damping / Mass Sliders */}
      <section
        className="space-y-3 rounded-2xl border p-3.5"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
      >
        <h3
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          스프링 물리 파라미터 (Spring Physics)
        </h3>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="slider-stiffness" style={{ color: 'var(--text-primary)' }}>
              Stiffness (강성 k)
            </label>
            <span className="font-mono-spec font-semibold" style={{ color: 'var(--accent-gold)' }}>
              {motion.stiffness}
            </span>
          </div>
          <input
            id="slider-stiffness"
            type="range"
            min={60}
            max={700}
            step={5}
            value={motion.stiffness}
            onChange={(e) => updateMotion({ stiffness: Number(e.target.value) })}
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent-gold)' }}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="slider-damping" style={{ color: 'var(--text-primary)' }}>
              Damping (감쇠 c)
            </label>
            <span className="font-mono-spec font-semibold" style={{ color: 'var(--accent-gold)' }}>
              {motion.damping}
            </span>
          </div>
          <input
            id="slider-damping"
            type="range"
            min={6}
            max={70}
            step={1}
            value={motion.damping}
            onChange={(e) => updateMotion({ damping: Number(e.target.value) })}
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent-gold)' }}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label htmlFor="slider-mass" style={{ color: 'var(--text-primary)' }}>
              Mass (질량 m)
            </label>
            <span className="font-mono-spec font-semibold" style={{ color: 'var(--accent-gold)' }}>
              {motion.mass.toFixed(2)}
            </span>
          </div>
          <input
            id="slider-mass"
            type="range"
            min={0.4}
            max={2.5}
            step={0.05}
            value={motion.mass}
            onChange={(e) => updateMotion({ mass: Number(e.target.value) })}
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent-gold)' }}
          />
        </div>
      </section>

      {/* Global Time Scale Pills */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <Gauge className="h-3.5 w-3.5" />
            <span>전역 모션 속도 배율 (Time Scale)</span>
          </div>
          <span className="font-mono-spec text-[11px]" style={{ color: 'var(--accent-gold)' }}>
            {motion.speed}x
          </span>
        </div>

        <div
          className="grid grid-cols-6 gap-1 rounded-xl border p-1"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
        >
          {SPEED_OPTIONS.map((spd) => {
            const active = Math.abs(motion.speed - spd) < 0.01;
            return (
              <button
                key={spd}
                type="button"
                onClick={() => updateMotion({ speed: spd })}
                aria-pressed={active}
                className="font-mono-spec rounded-lg py-1.5 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-gold-soft)' : 'transparent',
                  color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                }}
              >
                {spd}x
              </button>
            );
          })}
        </div>
      </section>

      {/* Switches: Motion Spec Badges & Reduced Motion */}
      <section className="space-y-2">
        <div
          className="flex items-center justify-between rounded-xl border px-3 py-2.5"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="pr-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Tag className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
              <span>Motion Spec Badges</span>
            </div>
            <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              화면 컴포넌트 위에 스프링·지연시간 스펙 배지 표시
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={motion.showMotionSpecs}
            aria-label="Motion Spec Badges"
            onClick={() => updateMotion({ showMotionSpecs: !motion.showMotionSpecs })}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors"
            style={{
              backgroundColor: motion.showMotionSpecs ? 'var(--accent-gold)' : 'var(--surface-2)',
              borderColor: motion.showMotionSpecs ? 'var(--accent-gold)' : 'var(--border-strong)',
            }}
          >
            <span
              className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
              style={{
                transform: motion.showMotionSpecs ? 'translateX(22px)' : 'translateX(3px)',
              }}
            />
          </button>
        </div>

        <div
          className="flex items-center justify-between rounded-xl border px-3 py-2.5"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="pr-3">
            <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Reduced Motion (모션 감소)
            </div>
            <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              WCAG 접근성: 스프링·패럴랙스 대신 즉시 전환 적용
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={motion.reducedMotion}
            aria-label="Reduced Motion"
            onClick={() => updateMotion({ reducedMotion: !motion.reducedMotion })}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors"
            style={{
              backgroundColor: motion.reducedMotion ? 'var(--accent-gold)' : 'var(--surface-2)',
              borderColor: motion.reducedMotion ? 'var(--accent-gold)' : 'var(--border-strong)',
            }}
          >
            <span
              className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
              style={{
                transform: motion.reducedMotion ? 'translateX(22px)' : 'translateX(3px)',
              }}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
