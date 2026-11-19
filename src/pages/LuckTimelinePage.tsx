import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Compass, Sparkles } from 'lucide-react';
import { DaewoonExplorer } from '../components';
import { DaewoonTimelineMotion, KineticTypography } from '../motion';
import { useSajuStore } from '../store/sajuStore';

export function LuckTimelinePage() {
  const { sajuResult } = useSajuStore();

  const currentAge = useMemo(() => {
    const yearNow = new Date().getFullYear();
    return Math.max(1, yearNow - sajuResult.solarDate.year + 1);
  }, [sajuResult.solarDate.year]);

  const initialCycleIndex = useMemo(() => {
    const idx = sajuResult.daewoon.findIndex(
      (d) => currentAge >= d.startAge && currentAge <= d.endAge,
    );
    return idx >= 0 ? idx : 0;
  }, [sajuResult.daewoon, currentAge]);

  const [activeIndex, setActiveIndex] = useState<number>(initialCycleIndex);

  useEffect(() => {
    setActiveIndex(initialCycleIndex);
  }, [initialCycleIndex, sajuResult.input.id]);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <KineticTypography
              text="대운·세운·월운 시간 궤적"
              as="h1"
              mode="word"
              className="font-serif-kr text-xl font-bold sm:text-2xl"
            />
            <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              10년 단위의 대운 파동을 드래그·선택하여 인생 전반의 기운 변화와 올해 세운·월운 흐름을 탐색하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
              style={{
                backgroundColor: 'var(--accent-gold-soft)',
                color: 'var(--accent-gold)',
              }}
            >
              <Compass className="h-3.5 w-3.5" />
              {sajuResult.daewoonDirection} 대운
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              대운수 {sajuResult.daewoonStartAge}세 입운
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
              현재 {currentAge}세
            </span>
          </div>
        </div>
      </section>

      {/* Interactive SVG Wave Scrubber */}
      <DaewoonTimelineMotion
        daewoon={sajuResult.daewoon}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        currentAge={currentAge}
      />

      {/* Detailed Daewoon / Sewoon / Monthly Explorer */}
      <DaewoonExplorer
        result={sajuResult}
        activeDaewoonIndex={activeIndex}
        onSelectDaewoon={setActiveIndex}
        currentAge={currentAge}
      />
    </div>
  );
}
