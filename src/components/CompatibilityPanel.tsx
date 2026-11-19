import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  HeartHandshake,
  Scale,
  Sparkles,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import type { BirthCity, BirthInput, CompatibilityResult, Gender } from '../types/saju';
import {
  ELEMENT_META,
  getElementBorder,
  getElementColor,
  getElementTint,
  pad2,
} from './elementUtils';

export interface CompatibilityPanelProps {
  compatibility: CompatibilityResult;
  profiles: BirthInput[];
  selectedPersonAId: string;
  selectedPersonBId: string;
  onSelectPersonA: (profileId: string) => void;
  onSelectPersonB: (profileId: string) => void;
  onCustomInputPersonA?: (input: BirthInput) => void;
  onCustomInputPersonB?: (input: BirthInput) => void;
  cities?: BirthCity[];
}

function getProfileKey(profile: BirthInput): string {
  return profile.id ?? profile.name;
}

function QuickInlineEditor({
  initial,
  cities,
  onSave,
  onCancel,
}: {
  initial: BirthInput;
  cities: BirthCity[];
  onSave: (input: BirthInput) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [gender, setGender] = useState<Gender>(initial.gender);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [hour, setHour] = useState(initial.hour);
  const [cityId, setCityId] = useState(initial.cityId || cities[0]?.id || 'seoul');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initial,
      name: name.trim() || initial.name,
      gender,
      year: Math.min(2100, Math.max(1900, year)),
      month: Math.min(12, Math.max(1, month)),
      day: Math.min(31, Math.max(1, day)),
      hour: Math.min(23, Math.max(0, hour)),
      minute: 0,
      unknownTime: false,
      cityId,
    });
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-2.5 rounded-2xl p-3 text-xs"
      style={{
        backgroundColor: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          aria-label="이름"
          className="rounded-lg px-2.5 py-1.5 outline-none"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          aria-label="성별"
          className="rounded-lg px-2.5 py-1.5 outline-none"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="female">여성</option>
          <option value="male">남성</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <input
          type="number"
          min={1900}
          max={2100}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="출생 연도"
          className="rounded-lg px-2 py-1.5 font-mono outline-none"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
        <input
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          aria-label="출생 월"
          className="rounded-lg px-2 py-1.5 font-mono outline-none"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
        <input
          type="number"
          min={1}
          max={31}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          aria-label="출생 일"
          className="rounded-lg px-2 py-1.5 font-mono outline-none"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
        <input
          type="number"
          min={0}
          max={23}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          aria-label="출생 시"
          className="rounded-lg px-2 py-1.5 font-mono outline-none"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {cities.length > 0 && (
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          aria-label="출생 지역"
          className="w-full rounded-lg px-2.5 py-1.5 outline-none"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameKo} ({c.country})
            </option>
          ))}
        </select>
      )}

      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1 font-medium"
          style={{
            backgroundColor: 'var(--surface-1)',
            color: 'var(--text-secondary)',
          }}
        >
          취소
        </button>
        <button
          type="submit"
          className="rounded-full px-3 py-1 font-bold"
          style={{
            backgroundColor: 'var(--accent-gold)',
            color: 'var(--bg-canvas)',
          }}
        >
          적용
        </button>
      </div>
    </form>
  );
}

function getHighlightStyle(type: CompatibilityResult['highlights'][number]['type']) {
  if (type === 'harmony') {
    return {
      label: '조화 Harmony',
      color: 'var(--color-wood)',
      bg: getElementTint('wood', 12),
      border: getElementBorder('wood', 32),
      Icon: HeartHandshake,
    };
  }
  if (type === 'complement') {
    return {
      label: '상호보완 Complement',
      color: 'var(--accent-gold)',
      bg: 'var(--accent-gold-soft)',
      border: 'color-mix(in srgb, var(--accent-gold) 36%, transparent)',
      Icon: Scale,
    };
  }
  return {
    label: '주의 Tension',
    color: 'var(--color-fire)',
    bg: getElementTint('fire', 12),
    border: getElementBorder('fire', 32),
    Icon: TriangleAlert,
  };
}

export function CompatibilityPanel({
  compatibility,
  profiles,
  selectedPersonAId,
  selectedPersonBId,
  onSelectPersonA,
  onSelectPersonB,
  onCustomInputPersonA,
  onCustomInputPersonB,
  cities = [],
}: CompatibilityPanelProps) {
  const [editingSide, setEditingSide] = useState<'A' | 'B' | null>(null);

  const { personA, personB, overallScore, grade, headline, dimensions, highlights, advice } =
    compatibility;

  const clampedScore = Math.min(100, Math.max(0, overallScore));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clampedScore / 100);

  const handleSwap = () => {
    onSelectPersonA(selectedPersonBId);
    onSelectPersonB(selectedPersonAId);
  };

  return (
    <div className="space-y-5">
      {/* Two-Person Selector Strip */}
      <section
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="궁합 대상 선택"
      >
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_auto_1fr]">
          {/* Person A */}
          <div
            className="rounded-2xl p-3.5"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold"
                style={{ color: 'var(--accent-gold)' }}
              >
                <UserRound className="h-3.5 w-3.5" />
                인물 A (기준 명식)
              </span>
              {onCustomInputPersonA && (
                <button
                  type="button"
                  onClick={() => setEditingSide((s) => (s === 'A' ? null : 'A'))}
                  className="text-[11px] font-semibold underline-offset-2 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {editingSide === 'A' ? '닫기' : '직접 입력'}
                </button>
              )}
            </div>

            <select
              value={selectedPersonAId}
              onChange={(e) => onSelectPersonA(e.target.value)}
              aria-label="인물 A 프로필 선택"
              className="w-full rounded-xl px-3 py-2 text-sm font-medium outline-none"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {profiles.map((p) => {
                const key = getProfileKey(p);
                return (
                  <option key={key} value={key}>
                    {p.name} ({p.year}.{pad2(p.month)}.{pad2(p.day)})
                  </option>
                );
              })}
            </select>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span
                className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{
                  backgroundColor: getElementTint(personA.dayMaster.element, 14),
                  color: getElementColor(personA.dayMaster.element),
                }}
              >
                {personA.pillars.day.stem.hangul}
                {personA.pillars.day.branch.hangul} 일주 (
                {personA.pillars.day.stem.hanja}
                {personA.pillars.day.branch.hanja})
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                주력 {ELEMENT_META[personA.dominantElement].ko} · {personA.strength.level}
              </span>
            </div>

            <AnimatePresence>
              {editingSide === 'A' && onCustomInputPersonA && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <QuickInlineEditor
                    initial={personA.input}
                    cities={cities}
                    onSave={onCustomInputPersonA}
                    onCancel={() => setEditingSide(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center md:pt-8">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="인물 A와 B 서로 바꾸기"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-strong)',
                color: 'var(--accent-gold)',
              }}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* Person B */}
          <div
            className="rounded-2xl p-3.5"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold"
                style={{ color: 'var(--color-water)' }}
              >
                <UserRound className="h-3.5 w-3.5" />
                인물 B (파트너 명식)
              </span>
              {onCustomInputPersonB && (
                <button
                  type="button"
                  onClick={() => setEditingSide((s) => (s === 'B' ? null : 'B'))}
                  className="text-[11px] font-semibold underline-offset-2 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {editingSide === 'B' ? '닫기' : '직접 입력'}
                </button>
              )}
            </div>

            <select
              value={selectedPersonBId}
              onChange={(e) => onSelectPersonB(e.target.value)}
              aria-label="인물 B 프로필 선택"
              className="w-full rounded-xl px-3 py-2 text-sm font-medium outline-none"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {profiles.map((p) => {
                const key = getProfileKey(p);
                return (
                  <option key={key} value={key}>
                    {p.name} ({p.year}.{pad2(p.month)}.{pad2(p.day)})
                  </option>
                );
              })}
            </select>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span
                className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{
                  backgroundColor: getElementTint(personB.dayMaster.element, 14),
                  color: getElementColor(personB.dayMaster.element),
                }}
              >
                {personB.pillars.day.stem.hangul}
                {personB.pillars.day.branch.hangul} 일주 (
                {personB.pillars.day.stem.hanja}
                {personB.pillars.day.branch.hanja})
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                주력 {ELEMENT_META[personB.dominantElement].ko} · {personB.strength.level}
              </span>
            </div>

            <AnimatePresence>
              {editingSide === 'B' && onCustomInputPersonB && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <QuickInlineEditor
                    initial={personB.input}
                    cities={cities}
                    onSave={onCustomInputPersonB}
                    onCancel={() => setEditingSide(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Score Gauge + 5-Dimension Progress Bars */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Gauge Card */}
        <section
          className="flex flex-col items-center justify-center text-center lg:col-span-5"
          style={{
            backgroundColor: 'var(--surface-glass)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--density-pad)',
          }}
        >
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
              <circle
                cx="66"
                cy="66"
                r={radius}
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth="10"
              />
              <motion.circle
                cx="66"
                cy="66"
                r={radius}
                fill="none"
                stroke="var(--accent-gold)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                조화 지수
              </span>
              <span
                className="font-mono text-4xl font-extrabold tabular-nums leading-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {clampedScore}
              </span>
              <span
                className="mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{
                  backgroundColor: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                }}
              >
                {grade}
              </span>
            </div>
          </div>

          <h3
            className="mt-3 font-serif text-base font-bold leading-snug sm:text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            {headline}
          </h3>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {personA.input.name}님({personA.pillars.day.stem.hanja}
            {personA.pillars.day.branch.hanja})과 {personB.input.name}님(
            {personB.pillars.day.stem.hanja}
            {personB.pillars.day.branch.hanja})의 오행 및 일주 시너지 분석입니다.
          </p>
        </section>

        {/* 5 Dimensions */}
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
          <h4
            className="mb-3 flex items-center gap-2 text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
            5대 궁합 세부 지표
          </h4>

          <div className="space-y-3">
            {dimensions.map((dim, idx) => {
              const barColor =
                dim.score >= 78
                  ? 'var(--color-wood)'
                  : dim.score >= 58
                  ? 'var(--accent-gold)'
                  : 'var(--color-fire)';
              return (
                <div
                  key={dim.label}
                  className="rounded-xl p-2.5"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {dim.label}
                    </span>
                    <span className="font-mono font-bold tabular-nums" style={{ color: barColor }}>
                      {dim.score} / 100
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(4, dim.score))}%` }}
                      transition={{
                        type: 'spring',
                        stiffness: 180,
                        damping: 26,
                        delay: idx * 0.06,
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {dim.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Highlights + Advice */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {highlights.map((hl, idx) => {
          const st = getHighlightStyle(hl.type);
          const Icon = st.Icon;
          return (
            <article
              key={`${hl.title}-${idx}`}
              style={{
                backgroundColor: 'var(--surface-glass)',
                backdropFilter: 'blur(var(--glass-blur))',
                WebkitBackdropFilter: 'blur(var(--glass-blur))',
                border: `1px solid ${st.border}`,
                borderRadius: 'var(--radius-card)',
                padding: 'var(--density-pad)',
              }}
            >
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: st.bg, color: st.color }}
              >
                <Icon className="h-3 w-3" />
                {st.label}
              </span>
              <h5 className="mt-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {hl.title}
              </h5>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {hl.detail}
              </p>
            </article>
          );
        })}
      </div>

      <section
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid color-mix(in srgb, var(--accent-gold) 34%, var(--border-subtle))',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
      >
        <h4
          className="mb-1.5 flex items-center gap-2 text-sm font-bold"
          style={{ color: 'var(--accent-gold)' }}
        >
          <HeartHandshake className="h-4 w-4" />
          청명 관계 조율 가이드
        </h4>
        <p className="text-xs leading-relaxed sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
          {advice}
        </p>
      </section>
    </div>
  );
}
