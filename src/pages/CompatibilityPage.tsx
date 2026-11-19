import { HeartHandshake } from 'lucide-react';
import { CompatibilityPanel } from '../components';
import { BIRTH_CITIES } from '../engine';
import { KineticTypography } from '../motion';
import { useSajuStore } from '../store/sajuStore';

export function CompatibilityPage() {
  const {
    profiles,
    personAId,
    personBId,
    compatibility,
    setPersonAId,
    setPersonBId,
    saveCustomCompatibilityProfile,
  } = useSajuStore();

  return (
    <div className="space-y-6">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <KineticTypography
              text="사주 궁합 & 협업 시너지"
              as="h1"
              mode="word"
              className="font-serif-kr text-xl font-bold sm:text-2xl"
            />
            <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              두 사람의 일간 천간합, 일지 조화, 부족한 오행의 상호 보완 지수를 5가지 차원으로 정밀 분석합니다.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto"
            style={{
              backgroundColor: 'var(--accent-gold-soft)',
              color: 'var(--accent-gold)',
            }}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            {compatibility.grade} · {compatibility.overallScore}점
          </span>
        </div>
      </section>

      <CompatibilityPanel
        compatibility={compatibility}
        profiles={profiles}
        selectedPersonAId={personAId}
        selectedPersonBId={personBId}
        onSelectPersonA={setPersonAId}
        onSelectPersonB={setPersonBId}
        onCustomInputPersonA={(input) => saveCustomCompatibilityProfile('A', input)}
        onCustomInputPersonB={(input) => saveCustomCompatibilityProfile('B', input)}
        cities={BIRTH_CITIES}
      />
    </div>
  );
}
