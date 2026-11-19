import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Edit3, MapPin, Plus, Sparkles } from 'lucide-react';
import {
  DailyFortuneWidget,
  FortuneInsightCards,
  FourPillarsBoard,
} from '../components';
import { BIRTH_CITIES, ELEMENT_META } from '../engine';
import {
  KineticTypography,
  PillarRevealCard,
  YinYangLoader,
  useMotionSettings,
} from '../motion';
import { useSajuStore } from '../store/sajuStore';
import { useDesignerStudio } from '../studio';

export function PillarsPage() {
  const {
    sajuResult,
    isCalculating,
    setActiveTab,
    openBirthInput,
  } = useSajuStore();
  const { tokens, updateTokens } = useDesignerStudio();
  const motionSettings = useMotionSettings();

  const cityName =
    BIRTH_CITIES.find((c) => c.id === sajuResult.input.cityId)?.nameKo ?? '서울';
  const dmMeta = ELEMENT_META[sajuResult.dayMaster.element];
  const yongshinMeta = ELEMENT_META[sajuResult.yongshin.primary];
  const iljuName = `${sajuResult.pillars.day.stem.hangul}${sajuResult.pillars.day.branch.hangul}일주`;

  const togglePillarOrder = () => {
    updateTokens({
      pillarOrder: tokens.pillarOrder === 'traditional' ? 'modern' : 'traditional',
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Summary */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="사주 명식 요약 히어로"
      >
        {/* Subtle Element Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: dmMeta.colorToken }}
        />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold"
                style={{
                  backgroundColor: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {sajuResult.input.name}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Calendar className="h-3 w-3" />
                {sajuResult.input.gender === 'female' ? '여성(坤命)' : '남성(乾命)'} ·{' '}
                {sajuResult.solarDate.year}.
                {String(sajuResult.solarDate.month).padStart(2, '0')}.
                {String(sajuResult.solarDate.day).padStart(2, '0')}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <MapPin className="h-3 w-3" />
                {cityName} · {sajuResult.solarTermName} 절기
              </span>
            </div>

            <div className="space-y-1">
              <KineticTypography
                text={sajuResult.interpretation.iljuTitle}
                as="h1"
                mode="word"
                highlightWords={[iljuName, sajuResult.dayMaster.hangul]}
                className="font-serif-kr text-2xl font-bold tracking-tight sm:text-3xl"
                highlightClassName="underline decoration-[var(--accent-gold)] decoration-2 underline-offset-4"
              />
              <p
                className="text-sm font-medium sm:text-base"
                style={{ color: 'var(--accent-gold)' }}
              >
                {sajuResult.interpretation.archetype} ·{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {sajuResult.interpretation.iljuAnimal}
                </span>
              </p>
            </div>

            <p
              className="max-w-3xl text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {sajuResult.interpretation.coreSummary}
            </p>
          </div>

          {/* Quick Key Badges + Actions */}
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <div className="flex flex-wrap gap-1.5">
              <span
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                일간{' '}
                <strong style={{ color: dmMeta.colorToken }}>
                  {sajuResult.dayMaster.hangul}({sajuResult.dayMaster.hanja}) ·{' '}
                  {dmMeta.labelKo}
                </strong>
              </span>
              <span
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {sajuResult.strength.level} ({sajuResult.strength.score}점)
              </span>
              <span
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {sajuResult.gyeokguk.name}
              </span>
              <span
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                용신{' '}
                <strong style={{ color: yongshinMeta.colorToken }}>
                  {yongshinMeta.labelKo}({yongshinMeta.labelHanja})
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openBirthInput('edit')}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
                현재 명식 수정
              </button>
              <button
                type="button"
                onClick={() => openBirthInput('create')}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: 'var(--bg-canvas)',
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                새 명식 추가
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Fortune Widget */}
      <DailyFortuneWidget
        fortune={sajuResult.today}
        userName={sajuResult.input.name}
        onViewDetails={() => setActiveTab('luck')}
      />

      {/* Four Pillars Interactive Board + YinYang Calculation Overlay */}
      <div className="relative">
        <FourPillarsBoard
          result={sajuResult}
          pillarOrder={tokens.pillarOrder}
          onTogglePillarOrder={togglePillarOrder}
          replayKey={motionSettings.replayNonce}
          renderPillar={(pillar, index, isDayMaster) => (
            <PillarRevealCard
              key={pillar.key}
              pillar={pillar}
              index={index}
              isDayMaster={isDayMaster}
            />
          )}
        />

        <AnimatePresence>
          {isCalculating && !motionSettings.reducedMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-0 z-30 flex items-center justify-center rounded-[var(--radius-card)] backdrop-blur-md"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--bg-canvas) 76%, transparent)',
              }}
            >
              <YinYangLoader size={88} label="천문 만세력 · 사주팔자 산출 중" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Magazine-grade Deep Insights */}
      <FortuneInsightCards result={sajuResult} />
    </div>
  );
}
