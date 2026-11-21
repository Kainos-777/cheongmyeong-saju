import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import {
  BIRTH_PLACE_CATALOG,
  computeTrueSolarOffsetMinutes,
  formatLongitudeKo,
  resolveBirthPlaceText,
} from '../engine';
import type { BirthCity, BirthInput, CalendarType, Gender, JasiMode } from '../types/saju';
import { matchSijinKey, pad2, SIJIN_OPTIONS } from './elementUtils';

export interface BirthInputSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: BirthInput) => void;
  initialValue?: BirthInput;
  cities: BirthCity[];
  presets?: BirthInput[];
  mode?: 'create' | 'edit';
}

const DEFAULT_INPUT: BirthInput = {
  name: '새 프로필',
  gender: 'female',
  calendarType: 'solar',
  isLeapMonth: false,
  year: 1996,
  month: 5,
  day: 14,
  hour: 10,
  minute: 30,
  unknownTime: false,
  cityId: 'seoul',
  birthPlace: '서울',
  useTrueSolarTime: true,
  useEquationOfTime: false,
  jasiMode: 'yajasi',
};

function getDaysInSolarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function BirthInputSheet({
  open,
  onClose,
  onSubmit,
  initialValue,
  cities,
  presets = [],
  mode = 'create',
}: BirthInputSheetProps) {
  const [form, setForm] = useState<BirthInput>(() => ({
    ...DEFAULT_INPUT,
    ...initialValue,
  }));
  const [placeText, setPlaceText] = useState<string>(
    () =>
      initialValue?.birthPlace?.trim() ||
      cities.find((c) => c.id === initialValue?.cityId)?.nameKo ||
      '서울',
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [appliedPresetName, setAppliedPresetName] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const base = initialValue ?? DEFAULT_INPUT;
      const initialLabel =
        base.birthPlace?.trim() ||
        cities.find((c) => c.id === base.cityId)?.nameKo ||
        '서울';
      setForm({
        ...DEFAULT_INPUT,
        ...base,
        cityId: base.cityId || cities[0]?.id || 'seoul',
        birthPlace: initialLabel,
      });
      setPlaceText(initialLabel);
      setAppliedPresetName(null);
    }
  }, [open, initialValue, cities]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  const resolvedPlace = useMemo(
    () => resolveBirthPlaceText(placeText),
    [placeText],
  );

  const solarOffsetMin = useMemo(
    () =>
      computeTrueSolarOffsetMinutes(
        resolvedPlace.longitude,
        resolvedPlace.utcOffsetMinutes,
      ),
    [resolvedPlace.longitude, resolvedPlace.utcOffsetMinutes],
  );

  const maxDay = useMemo(() => {
    if (form.calendarType === 'lunar') return 30;
    const safeYear = Math.min(2100, Math.max(1900, form.year || 2000));
    return getDaysInSolarMonth(safeYear, form.month || 1);
  }, [form.calendarType, form.year, form.month]);

  const activeSijinKey = useMemo(() => matchSijinKey(form.hour), [form.hour]);

  const handleApplyPreset = (preset: BirthInput) => {
    const presetLabel =
      preset.birthPlace?.trim() ||
      cities.find((c) => c.id === preset.cityId)?.nameKo ||
      '서울';
    setForm({
      ...DEFAULT_INPUT,
      ...preset,
      id: mode === 'edit' ? form.id : undefined,
      birthPlace: presetLabel,
    });
    setPlaceText(presetLabel);
    setAppliedPresetName(preset.name);
  };

  const handleTimeChange = (value: string) => {
    const [hh, mm] = value.split(':').map((part) => Number(part));
    if (Number.isFinite(hh) && Number.isFinite(mm)) {
      setForm((prev) => ({
        ...prev,
        hour: Math.min(23, Math.max(0, hh)),
        minute: Math.min(59, Math.max(0, mm)),
        unknownTime: false,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedYear = Math.min(2100, Math.max(1900, Math.round(form.year || 2000)));
    const clampedMonth = Math.min(12, Math.max(1, Math.round(form.month || 1)));
    const maxValidDay =
      form.calendarType === 'lunar' ? 30 : getDaysInSolarMonth(clampedYear, clampedMonth);
    const clampedDay = Math.min(maxValidDay, Math.max(1, Math.round(form.day || 1)));

    onSubmit({
      ...form,
      id: mode === 'edit' ? form.id : undefined,
      name: form.name.trim() || '무명',
      year: clampedYear,
      month: clampedMonth,
      day: clampedDay,
      isLeapMonth: form.calendarType === 'lunar' ? Boolean(form.isLeapMonth) : false,
      hour: form.unknownTime ? 12 : Math.min(23, Math.max(0, form.hour)),
      minute: form.unknownTime ? 0 : Math.min(59, Math.max(0, form.minute)),
      cityId: resolvedPlace.cityId,
      birthPlace: resolvedPlace.label,
      birthLongitude: resolvedPlace.longitude,
      birthUtcOffsetMinutes: resolvedPlace.utcOffsetMinutes,
    });
    onClose();
  };

  const timeInputValue = `${pad2(form.hour)}:${pad2(form.minute)}`;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="birth-sheet-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
          />

          {/* Sheet / Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl shadow-2xl md:rounded-[var(--radius-card)]"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            {/* Mobile Drag Indicator */}
            <div className="flex justify-center pt-2.5 md:hidden">
              <span
                className="h-1 w-10 rounded-full"
                style={{ backgroundColor: 'var(--border-strong)' }}
              />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-5 py-3.5"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'var(--accent-gold-soft)',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h2 id="birth-sheet-title" className="text-base font-bold leading-tight">
                    {mode === 'edit' ? '출생 정보 수정' : '사주 명식 입력'}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    천문 절입 시각 · 진태양시 기반 정밀 만세력
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {/* Quick 1-Click Presets Strip */}
              {presets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      빠른 샘플 프리셋 (1-Click)
                    </span>
                    {appliedPresetName && (
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--accent-gold)' }}
                      >
                        ✓ {appliedPresetName} 적용됨
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {presets.map((preset) => {
                      const isSelected = appliedPresetName === preset.name;
                      return (
                        <button
                          key={preset.id ?? preset.name}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--accent-gold-soft)'
                              : 'var(--surface-1)',
                            border: isSelected
                              ? '1px solid var(--accent-gold)'
                              : '1px solid var(--border-subtle)',
                            color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          }}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Name & Gender */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                <div className="space-y-1.5 sm:col-span-3">
                  <label
                    htmlFor="birth-name"
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    이름 / 프로필 명칭
                  </label>
                  <input
                    id="birth-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 김청명"
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <span
                    className="block text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    성별 (대운 순역 기준)
                  </span>
                  <div
                    className="grid grid-cols-2 rounded-xl p-1"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {(
                      [
                        { id: 'male', label: '남성 (乾)' },
                        { id: 'female', label: '여성 (坤)' },
                      ] as { id: Gender; label: string }[]
                    ).map((g) => {
                      const active = form.gender === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, gender: g.id }))}
                          className="relative rounded-lg py-2 text-xs font-semibold transition-colors"
                          style={{
                            color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        >
                          {active && (
                            <motion.span
                              layoutId="birth-gender-pill"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              className="absolute inset-0 rounded-lg"
                              style={{
                                backgroundColor: 'var(--accent-gold-soft)',
                                border: '1px solid var(--accent-gold)',
                              }}
                            />
                          )}
                          <span className="relative z-10">{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Calendar Type + Date */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    생년월일 (1900–2100)
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="grid grid-cols-2 rounded-full p-0.5"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {(
                        [
                          { id: 'solar', label: '양력' },
                          { id: 'lunar', label: '음력' },
                        ] as { id: CalendarType; label: string }[]
                      ).map((cal) => {
                        const active = form.calendarType === cal.id;
                        return (
                          <button
                            key={cal.id}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                calendarType: cal.id,
                                isLeapMonth: cal.id === 'solar' ? false : prev.isLeapMonth,
                              }))
                            }
                            className="relative rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                            }}
                          >
                            {active && (
                              <motion.span
                                layoutId="birth-cal-pill"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                className="absolute inset-0 rounded-full"
                                style={{
                                  backgroundColor: 'var(--accent-gold-soft)',
                                  border: '1px solid var(--accent-gold)',
                                }}
                              />
                            )}
                            <span className="relative z-10">{cal.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {form.calendarType === 'lunar' && (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(form.isLeapMonth)}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, isLeapMonth: !prev.isLeapMonth }))
                        }
                        className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: form.isLeapMonth
                            ? 'var(--accent-gold-soft)'
                            : 'var(--surface-1)',
                          border: form.isLeapMonth
                            ? '1px solid var(--accent-gold)'
                            : '1px solid var(--border-subtle)',
                          color: form.isLeapMonth ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        }}
                      >
                        윤달 {form.isLeapMonth ? 'ON' : 'OFF'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label
                      htmlFor="birth-year"
                      className="mb-1 block text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      년 (Year)
                    </label>
                    <input
                      id="birth-year"
                      type="number"
                      min={1900}
                      max={2100}
                      value={form.year}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, year: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl px-3 py-2.5 font-mono text-sm outline-none"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="birth-month"
                      className="mb-1 block text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      월 (Month)
                    </label>
                    <select
                      id="birth-month"
                      value={form.month}
                      onChange={(e) => {
                        const nextMonth = Number(e.target.value);
                        const nextMax =
                          form.calendarType === 'lunar'
                            ? 30
                            : getDaysInSolarMonth(form.year || 2000, nextMonth);
                        setForm((prev) => ({
                          ...prev,
                          month: nextMonth,
                          day: Math.min(prev.day, nextMax),
                        }));
                      }}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
                        <option key={m} value={m}>
                          {m}월
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="birth-day"
                      className="mb-1 block text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      일 (Day)
                    </label>
                    <select
                      id="birth-day"
                      value={Math.min(form.day, maxDay)}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, day: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {Array.from({ length: maxDay }, (_, idx) => idx + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}일
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Birth Time + 12 Sijin Chips + Unknown Toggle */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="birth-time"
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    출생 시각 & 12시진
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(form.unknownTime)}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, unknownTime: !prev.unknownTime }))
                    }
                    className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: form.unknownTime
                        ? 'var(--accent-gold-soft)'
                        : 'var(--surface-1)',
                      border: form.unknownTime
                        ? '1px solid var(--accent-gold)'
                        : '1px solid var(--border-subtle)',
                      color: form.unknownTime ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    }}
                  >
                    출생시간 모름 {form.unknownTime ? '✓' : ''}
                  </button>
                </div>

                <div className={form.unknownTime ? 'pointer-events-none opacity-45' : ''}>
                  <div className="mb-2.5 flex items-center gap-3">
                    <input
                      id="birth-time"
                      type="time"
                      value={timeInputValue}
                      disabled={Boolean(form.unknownTime)}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="rounded-xl px-3.5 py-2 font-mono text-sm outline-none"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      직접 입력하거나 아래 12시진 칩을 선택하세요
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    {SIJIN_OPTIONS.map((sijin) => {
                      const isActive = !form.unknownTime && activeSijinKey === sijin.key;
                      return (
                        <button
                          key={sijin.key}
                          type="button"
                          disabled={Boolean(form.unknownTime)}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              hour: sijin.hour,
                              minute: sijin.minute,
                              unknownTime: false,
                            }))
                          }
                          className="flex flex-col items-center rounded-xl px-1.5 py-1.5 text-center transition-colors"
                          style={{
                            backgroundColor: isActive
                              ? 'var(--accent-gold-soft)'
                              : 'var(--surface-1)',
                            border: isActive
                              ? '1px solid var(--accent-gold)'
                              : '1px solid var(--border-subtle)',
                          }}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{
                              color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                            }}
                          >
                            {sijin.hangul}시{' '}
                            <span className="font-serif font-normal">{sijin.hanja}</span>
                          </span>
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {sijin.rangeLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Free-Text Birth Region + Live True Solar Time Preview */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="birth-city"
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    출생 지역 (자유 입력 · 경도 기반 진태양시)
                  </label>

                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium"
                    style={{
                      backgroundColor: form.useTrueSolarTime
                        ? 'var(--accent-gold-soft)'
                        : 'var(--surface-1)',
                      border: '1px solid var(--border-subtle)',
                      color: form.useTrueSolarTime
                        ? 'var(--accent-gold)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {resolvedPlace.label} ({formatLongitudeKo(resolvedPlace.longitude)}) ·{' '}
                    {solarOffsetMin >= 0 ? `+${solarOffsetMin}` : solarOffsetMin}분
                    {!form.useTrueSolarTime && ' (미적용)'}
                  </span>
                </div>

                <input
                  id="birth-city"
                  type="text"
                  list="sheet-birth-place-list"
                  value={placeText}
                  onChange={(e) => {
                    const next = e.target.value;
                    setPlaceText(next);
                    const resolved = resolveBirthPlaceText(next);
                    setForm((prev) => ({
                      ...prev,
                      cityId: resolved.cityId,
                      birthPlace: next.trim() || resolved.label,
                    }));
                  }}
                  placeholder="국내 시·군·구 또는 해외 도시 자유 입력 (예: 강릉, 대전 유성구, 도쿄)"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
                <datalist id="sheet-birth-place-list">
                  {BIRTH_PLACE_CATALOG.filter((p) => p.kind !== 'province')
                    .slice(0, 60)
                    .map((p) => (
                      <option key={p.id} value={p.nameKo}>
                        {p.regionLabel} ({p.country})
                      </option>
                    ))}
                </datalist>
              </div>

              {/* Expandable Advanced Astronomy Options */}
              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((prev) => !prev)}
                  aria-expanded={advancedOpen}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
                    고급 천문 · 명리 옵션
                    <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                      ({form.useTrueSolarTime ? '진태양시 ON' : '진태양시 OFF'} ·{' '}
                      {form.jasiMode === 'yajasi' ? '야자시' : '조자시'})
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      advancedOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {advancedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="space-y-3.5 p-4 text-xs">
                        {/* 진태양시 보정 ON/OFF */}
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              진태양시 보정
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>
                              표준자오선과 출생지 경도 차이를 보정합니다 (서울 -32분)
                            </div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-label="진태양시 보정"
                            aria-checked={form.useTrueSolarTime}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                useTrueSolarTime: !prev.useTrueSolarTime,
                              }))
                            }
                            className="shrink-0 rounded-full px-3 py-1.5 font-semibold transition-colors"
                            style={{
                              backgroundColor: form.useTrueSolarTime
                                ? 'var(--accent-gold)'
                                : 'var(--surface-2)',
                              color: form.useTrueSolarTime
                                ? 'var(--bg-canvas)'
                                : 'var(--text-secondary)',
                            }}
                          >
                            {form.useTrueSolarTime ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {/* 균시차 보정 ON/OFF */}
                        <div
                          className={`flex items-center justify-between gap-3 ${
                            !form.useTrueSolarTime ? 'opacity-50' : ''
                          }`}
                        >
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              균시차(EoT) 보정
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>
                              계절별 지구 공전 궤도 이심률 및 자전축 기울기 오차(±16분) 반영
                            </div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-label="균시차 보정"
                            aria-checked={Boolean(form.useEquationOfTime)}
                            disabled={!form.useTrueSolarTime}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                useEquationOfTime: !prev.useEquationOfTime,
                              }))
                            }
                            className="shrink-0 rounded-full px-3 py-1.5 font-semibold transition-colors"
                            style={{
                              backgroundColor: form.useEquationOfTime
                                ? 'var(--accent-gold)'
                                : 'var(--surface-2)',
                              color: form.useEquationOfTime
                                ? 'var(--bg-canvas)'
                                : 'var(--text-secondary)',
                            }}
                          >
                            {form.useEquationOfTime ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {/* 야자시 vs 조자시 */}
                        <div className="space-y-1.5">
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            자시(23:00–23:59) 일주 기준
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                {
                                  id: 'yajasi',
                                  title: '야자시 (夜子時)',
                                  desc: '23시도 당일 일주 유지',
                                },
                                {
                                  id: 'jojasi',
                                  title: '조자시 (早子時)',
                                  desc: '23시부터 익일 일주로 전환',
                                },
                              ] as { id: JasiMode; title: string; desc: string }[]
                            ).map((item) => {
                              const active = form.jasiMode === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() =>
                                    setForm((prev) => ({ ...prev, jasiMode: item.id }))
                                  }
                                  className="rounded-xl p-2.5 text-left transition-colors"
                                  style={{
                                    backgroundColor: active
                                      ? 'var(--accent-gold-soft)'
                                      : 'var(--surface-2)',
                                    border: active
                                      ? '1px solid var(--accent-gold)'
                                      : '1px solid var(--border-subtle)',
                                  }}
                                >
                                  <div
                                    className="font-semibold"
                                    style={{
                                      color: active
                                        ? 'var(--accent-gold)'
                                        : 'var(--text-primary)',
                                    }}
                                  >
                                    {item.title}
                                  </div>
                                  <div
                                    className="text-[11px]"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    {item.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2.5 text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-transform active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--accent-gold)',
                    color: 'var(--bg-canvas)',
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  사주 명식 분석하기
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
