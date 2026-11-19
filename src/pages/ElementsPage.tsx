import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Flame, HeartPulse, Palette, Sparkles } from 'lucide-react';
import { OhaengBalancePanel } from '../components';
import {
  ELEMENT_CONTROLLED_BY,
  ELEMENT_CONTROLS,
  ELEMENT_GENERATED_BY,
  ELEMENT_GENERATES,
  ELEMENT_META,
} from '../engine';
import { KineticTypography, OhaengOrbitalViz } from '../motion';
import { useSajuStore } from '../store/sajuStore';
import type { ElementKey } from '../types/saju';

const ELEMENT_DESIGN_MOOD: Record<
  ElementKey,
  { archetype: string; uxTip: string; lifestyleTip: string }
> = {
  wood: {
    archetype: '성장과 확장의 생명력',
    uxTip: '유기적 여백, 생동감 있는 마이크로 인터랙션, 성장형 네비게이션 구조에서 강점이 빛납니다.',
    lifestyleTip: '아침 산책, 식물·원목 소품, 새로운 프로젝트의 첫 프로토타입을 여는 활동이 기운을 북돋웁니다.',
  },
  fire: {
    archetype: '발산과 표현의 광채',
    uxTip: '대담한 키 비주얼, 감정선을 자극하는 타이포그래피와 스토리텔링 화면 설계에 탁월합니다.',
    lifestyleTip: '따뜻한 조명, 사람들과의 활발한 아이디어 교류, 규칙적인 심호흡과 수분 보충이 균형을 잡습니다.',
  },
  earth: {
    archetype: '중재와 신뢰의 중심축',
    uxTip: '탄탄한 그리드 시스템, 안정적인 정보 구조(IA), 사용자 신뢰를 주는 일관된 디자인 언어에 강합니다.',
    lifestyleTip: '따뜻한 식사와 규칙적 루틴, 도자기·테라코타 질감의 휴식 공간이 집중력을 높여줍니다.',
  },
  metal: {
    archetype: '정교함과 결단의 구조미',
    uxTip: '정밀한 토큰 체계, 미니멀한 타이포 대비, 불필요한 노이즈를 덜어내는 시스템 아키텍처에 강합니다.',
    lifestyleTip: '공간 정돈, 단정한 메탈·화이트 톤 워크스페이스, 호흡 명상이 사고의 선명함을 지킵니다.',
  },
  water: {
    archetype: '통찰과 유연함의 흐름',
    uxTip: '깊이 있는 리서치, 데이터 시각화, 사용자 맥락에 따라 매끄럽게 적응하는 플로우 설계에 강합니다.',
    lifestyleTip: '물가 산책이나 반신욕, 충분한 수면과 기록 루틴이 직관과 창의성을 깊게 만듭니다.',
  },
};

export function ElementsPage() {
  const { sajuResult } = useSajuStore();
  const [selectedElement, setSelectedElement] = useState<ElementKey | null>(
    sajuResult.dominantElement,
  );

  useEffect(() => {
    setSelectedElement(sajuResult.dominantElement);
  }, [sajuResult.input.id, sajuResult.dominantElement]);

  const activeElement = selectedElement ?? sajuResult.dominantElement;
  const meta = ELEMENT_META[activeElement];
  const scoreItem = sajuResult.elements.find((e) => e.element === activeElement);
  const designMood = ELEMENT_DESIGN_MOOD[activeElement];

  const generatesEl = ELEMENT_META[ELEMENT_GENERATES[activeElement]];
  const generatedByEl = ELEMENT_META[ELEMENT_GENERATED_BY[activeElement]];
  const controlsEl = ELEMENT_META[ELEMENT_CONTROLS[activeElement]];
  const controlledByEl = ELEMENT_META[ELEMENT_CONTROLLED_BY[activeElement]];

  const isYongshin =
    sajuResult.yongshin.primary === activeElement ||
    sajuResult.yongshin.secondary === activeElement;
  const isAvoid = sajuResult.yongshin.avoidElement === activeElement;

  const handleToggleElement = (el: ElementKey | null) => {
    if (!el) {
      setSelectedElement(null);
      return;
    }
    setSelectedElement((prev) => (prev === el ? null : el));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
              text="오행 역학 & 용신·격국 심층 분석"
              as="h1"
              mode="word"
              className="font-serif-kr text-xl font-bold sm:text-2xl"
            />
            <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              다섯 원소(목·화·토·금·수)의 상생·상극 순환 노드를 클릭하여 세부 역학과 보완 전략을 확인하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className="rounded-full px-3 py-1 font-semibold"
              style={{
                backgroundColor: 'var(--accent-gold-soft)',
                color: 'var(--accent-gold)',
              }}
            >
              주력 {ELEMENT_META[sajuResult.dominantElement].labelKo}(
              {ELEMENT_META[sajuResult.dominantElement].labelHanja})
            </span>
            <span
              className="rounded-full px-3 py-1 font-semibold"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              부족 {ELEMENT_META[sajuResult.lackingElement].labelKo}(
              {ELEMENT_META[sajuResult.lackingElement].labelHanja})
            </span>
          </div>
        </div>
      </section>

      {/* Main Split: Orbital Diagram + Balance Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <OhaengOrbitalViz
            elements={sajuResult.elements}
            yongshin={sajuResult.yongshin.primary}
            avoidElement={sajuResult.yongshin.avoidElement}
            selectedElement={selectedElement}
            onSelectElement={(el) => handleToggleElement(el)}
          />
        </div>

        <div className="lg:col-span-7">
          <OhaengBalancePanel
            result={sajuResult}
            selectedElement={selectedElement}
            onSelectElement={handleToggleElement}
          />
        </div>
      </div>

      {/* Selected Element Deep-Dive Callout */}
      <motion.section
        key={activeElement}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: `1px solid color-mix(in srgb, ${meta.colorToken} 42%, var(--border-subtle))`,
          borderRadius: 'var(--radius-card)',
          padding: 'var(--density-pad)',
        }}
        aria-label="선택 오행 상세 분석"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl font-serif-kr text-lg font-bold"
                style={{
                  backgroundColor: `color-mix(in srgb, ${meta.colorToken} 18%, var(--surface-1))`,
                  color: meta.colorToken,
                  border: `1px solid color-mix(in srgb, ${meta.colorToken} 45%, transparent)`,
                }}
              >
                {meta.labelHanja}
              </span>
              <div>
                <h2 className="text-base font-bold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                  {meta.labelKo}({meta.labelHanja}) 오행 · {designMood.archetype}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>비중 {scoreItem?.percentage ?? 0}%</span>
                  <span>·</span>
                  <span>상태: {scoreItem?.status ?? '적정'}</span>
                  <span>·</span>
                  <span>계절 {meta.seasonKo}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {sajuResult.dayMaster.element === activeElement && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{
                  backgroundColor: 'var(--accent-gold-soft)',
                  color: 'var(--accent-gold)',
                }}
              >
                일간(본원) 오행
              </span>
            )}
            {isYongshin && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-wood) 16%, transparent)',
                  color: 'var(--color-wood)',
                }}
              >
                <Sparkles className="h-3 w-3" />
                {sajuResult.yongshin.primary === activeElement ? '핵심 용신' : '보조 희신'}
              </span>
            )}
            {isAvoid && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-fire) 15%, transparent)',
                  color: 'var(--color-fire)',
                }}
              >
                기신 (과잉 조절)
              </span>
            )}
          </div>
        </div>

        {/* 상생/상극 & 메타 그리드 */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div
            className="rounded-2xl p-3.5 text-xs"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="mb-2 flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
              <Flame className="h-3.5 w-3.5" style={{ color: meta.colorToken }} />
              상생·상극 흐름
            </div>
            <div className="space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1.5">
                <span style={{ color: generatedByEl.colorToken }}>{generatedByEl.labelKo}({generatedByEl.labelHanja})</span>
                <ArrowRight className="h-3 w-3 opacity-60" />
                <strong style={{ color: meta.colorToken }}>{meta.labelKo}</strong>
                <ArrowRight className="h-3 w-3 opacity-60" />
                <span style={{ color: generatesEl.colorToken }}>{generatesEl.labelKo}({generatesEl.labelHanja})</span>
                <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  상생
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: controlledByEl.colorToken }}>{controlledByEl.labelKo}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>극▶</span>
                <strong style={{ color: meta.colorToken }}>{meta.labelKo}</strong>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>극▶</span>
                <span style={{ color: controlsEl.colorToken }}>{controlsEl.labelKo}</span>
                <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  상극
                </span>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-3.5 text-xs"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="mb-2 flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
              <Palette className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
              UX·디자인 & 컬러 감각
            </div>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {designMood.uxTip}
            </p>
          </div>

          <div
            className="rounded-2xl p-3.5 text-xs"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="mb-2 flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
              <HeartPulse className="h-3.5 w-3.5" style={{ color: meta.colorToken }} />
              방위·건강 & 조율 가이드
            </div>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {designMood.lifestyleTip}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="inline-flex items-center gap-1">
                <Compass className="h-3 w-3" /> {meta.directionKo}
              </span>
              <span>·</span>
              <span>신체: {meta.organKo}</span>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
