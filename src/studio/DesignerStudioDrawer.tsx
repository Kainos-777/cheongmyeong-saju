import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Code2,
  Columns2,
  Grid3X3,
  LayoutGrid,
  Maximize2,
  Monitor,
  Palette,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import type { ViewportMode } from '../types/design';
import { useDesignerStudio } from './DesignerStudioProvider';
import { ExportTokensTab } from './ExportTokensTab';
import { MotionInspectorTab } from './MotionInspectorTab';
import { TokenEditorTab } from './TokenEditorTab';

type StudioTabId = 'viewport' | 'tokens' | 'motion' | 'export';

export interface DesignerStudioDrawerProps {
  showFloatingTrigger?: boolean;
}

const STUDIO_TABS: { id: StudioTabId; label: string; Icon: typeof LayoutGrid }[] = [
  { id: 'viewport', label: '뷰포트·그리드', Icon: LayoutGrid },
  { id: 'tokens', label: '테마·토큰', Icon: Palette },
  { id: 'motion', label: '모션 랩', Icon: Activity },
  { id: 'export', label: '코드 익스포트', Icon: Code2 },
];

const VIEWPORT_CARDS: {
  id: ViewportMode;
  title: string;
  spec: string;
  desc: string;
  Icon: typeof Maximize2;
}[] = [
  {
    id: 'full',
    title: 'Full Responsive',
    spec: '100% × Auto',
    desc: '브라우저 전체 화면 기본 반응형 모드',
    Icon: Maximize2,
  },
  {
    id: 'desktop',
    title: 'Desktop Canvas',
    spec: '1440 × 860',
    desc: '와이드 웹 데스크톱 12컬럼 기준 스테이지',
    Icon: Monitor,
  },
  {
    id: 'tablet',
    title: 'Tablet Bezel',
    spec: '768 × 1024',
    desc: 'iPad 세로 중단점 레이아웃 검사',
    Icon: Tablet,
  },
  {
    id: 'mobile',
    title: 'iPhone 16 Pro',
    spec: '393 × 852',
    desc: 'Dynamic Island · 홈 인디케이터 실기기 프레임',
    Icon: Smartphone,
  },
  {
    id: 'split',
    title: 'Split Web + Mobile',
    spec: 'Dual View',
    desc: '데스크톱 라이브 화면과 모바일 프리뷰 동시 비교',
    Icon: Columns2,
  },
];

function StudioSwitch({
  checked,
  label,
  description,
  icon,
  onToggle,
}: {
  checked: boolean;
  label: string;
  description: string;
  icon: ReactNode;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border px-3 py-2.5"
      style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-start gap-2.5 pr-3">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: checked ? 'var(--accent-gold-soft)' : 'var(--surface-2)',
            color: checked ? 'var(--accent-gold)' : 'var(--text-muted)',
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {description}
          </div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors"
        style={{
          backgroundColor: checked ? 'var(--accent-gold)' : 'var(--surface-2)',
          borderColor: checked ? 'var(--accent-gold)' : 'var(--border-strong)',
        }}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{
            transform: checked ? 'translateX(22px)' : 'translateX(3px)',
          }}
        />
      </button>
    </div>
  );
}

export function DesignerStudioDrawer({
  showFloatingTrigger = true,
}: DesignerStudioDrawerProps) {
  const { tokens, activeThemePreset, setViewport, updateGrid, toggleStudio } =
    useDesignerStudio();
  const [activeTab, setActiveTab] = useState<StudioTabId>('tokens');

  useEffect(() => {
    if (!tokens.studioOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        toggleStudio(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [tokens.studioOpen, toggleStudio]);

  const anyGridActive =
    tokens.grid.showColumns || tokens.grid.showBaseline || tokens.grid.showSafeArea;

  return (
    <>
      {/* Subtle Desktop Floating Pill Trigger when closed */}
      <AnimatePresence>
        {showFloatingTrigger && !tokens.studioOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={tokens.motion.reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            onClick={() => toggleStudio(true)}
            aria-label="UX/UI 디자인 스튜디오 열기"
            data-testid="studio-floating-trigger"
            className="fixed right-5 bottom-5 z-40 hidden items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-md transition-transform hover:scale-[1.03] md:inline-flex"
            style={{
              backgroundColor: 'var(--surface-glass)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
            <span>Studio</span>
            <kbd
              className="font-mono-spec rounded px-1.5 py-0.5 text-[10px]"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-muted)',
              }}
            >
              ⌘K
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Workbench Drawer (Desktop Right 400px / Mobile Bottom Sheet) */}
      <AnimatePresence>
        {tokens.studioOpen && (
          <>
            {/* Mobile-only Backdrop (Desktop keeps left app canvas interactive) */}
            <motion.div
              key="studio-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={tokens.motion.reducedMotion ? { duration: 0 } : { duration: 0.18 }}
              onClick={() => toggleStudio(false)}
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] md:hidden"
              aria-hidden="true"
            />

            <motion.aside
              key="studio-drawer"
              role="dialog"
              aria-label="청명 UX/UI 디자인 스튜디오"
              data-testid="designer-studio-drawer"
              initial={
                tokens.motion.reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 32, y: 16 }
              }
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={
                tokens.motion.reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 32, y: 16 }
              }
              transition={
                tokens.motion.reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 360, damping: 32, mass: 0.85 }
              }
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col overflow-hidden rounded-t-3xl border shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-[400px] md:rounded-none md:border-y-0 md:border-r-0 md:border-l"
              style={{
                backgroundColor: 'var(--surface-glass)',
                borderColor: 'var(--border-strong)',
                backdropFilter: `blur(${Math.max(16, tokens.glassBlur)}px)`,
                WebkitBackdropFilter: `blur(${Math.max(16, tokens.glassBlur)}px)`,
                color: 'var(--text-primary)',
              }}
            >
              {/* Mobile Drag Handle */}
              <div className="flex justify-center pt-2.5 pb-1 md:hidden">
                <span
                  className="h-1 w-10 rounded-full opacity-40"
                  style={{ backgroundColor: 'var(--text-muted)' }}
                />
              </div>

              {/* Drawer Header */}
              <div
                className="flex shrink-0 items-center justify-between border-b px-4 py-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl border"
                    style={{
                      backgroundColor: 'var(--accent-gold-soft)',
                      borderColor: 'var(--accent-gold)',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold tracking-tight">UX/UI Studio</h2>
                      <kbd
                        className="font-mono-spec rounded px-1.5 py-0.5 text-[10px]"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        ⌘K
                      </kbd>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {activeThemePreset.nameKo} · {tokens.viewport} · {tokens.motion.speed}x
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStudio(false)}
                  aria-label="스튜디오 닫기"
                  className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 4-Tab Navigation */}
              <div
                className="grid shrink-0 grid-cols-4 gap-1 border-b p-2"
                role="tablist"
                aria-label="스튜디오 기능 탭"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                {STUDIO_TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  const Icon = tab.Icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-semibold transition-colors"
                      style={{
                        backgroundColor: active ? 'var(--accent-gold-soft)' : 'transparent',
                        color: active ? 'var(--accent-gold)' : 'var(--text-muted)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 pb-safe">
                {activeTab === 'viewport' && (
                  <div className="space-y-5">
                    <section>
                      <div className="mb-2.5 flex items-center justify-between">
                        <h3
                          className="text-xs font-semibold tracking-wide uppercase"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          디바이스 프레임 (Viewport)
                        </h3>
                        <span
                          className="font-mono-spec text-[10px]"
                          style={{ color: 'var(--accent-gold)' }}
                        >
                          {tokens.viewport.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {VIEWPORT_CARDS.map((card) => {
                          const active = tokens.viewport === card.id;
                          const Icon = card.Icon;
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => setViewport(card.id)}
                              aria-pressed={active}
                              data-testid={`viewport-mode-${card.id}`}
                              className="flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors"
                              style={{
                                backgroundColor: active
                                  ? 'var(--accent-gold-soft)'
                                  : 'var(--surface-1)',
                                borderColor: active
                                  ? 'var(--accent-gold)'
                                  : 'var(--border-subtle)',
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                  style={{
                                    backgroundColor: active
                                      ? 'var(--accent-gold)'
                                      : 'var(--surface-2)',
                                    color: active ? '#111111' : 'var(--text-secondary)',
                                  }}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div
                                    className="text-xs font-semibold"
                                    style={{
                                      color: active ? 'var(--accent-gold)' : 'var(--text-primary)',
                                    }}
                                  >
                                    {card.title}
                                  </div>
                                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    {card.desc}
                                  </div>
                                </div>
                              </div>
                              <span
                                className="font-mono-spec shrink-0 rounded-md px-2 py-0.5 text-[10px]"
                                style={{
                                  backgroundColor: 'var(--bg-elevated)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {card.spec}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <div className="mb-1 flex items-center justify-between">
                        <h3
                          className="text-xs font-semibold tracking-wide uppercase"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          레이아웃 레드라인 & 그리드
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            updateGrid({
                              showColumns: !anyGridActive,
                              showBaseline: !anyGridActive,
                              showSafeArea: !anyGridActive,
                            })
                          }
                          className="text-[11px] font-medium hover:underline"
                          style={{ color: 'var(--accent-gold)' }}
                        >
                          {anyGridActive ? '모두 끄기' : '모두 켜기'}
                        </button>
                      </div>

                      <StudioSwitch
                        checked={tokens.grid.showColumns}
                        label="컬럼 가이드 (12-Col / 4-Col)"
                        description="데스크톱 12컬럼 · 모바일 4컬럼 반투명 가이드"
                        icon={<Grid3X3 className="h-4 w-4" />}
                        onToggle={() => updateGrid({ showColumns: !tokens.grid.showColumns })}
                      />

                      <StudioSwitch
                        checked={tokens.grid.showBaseline}
                        label="8px 베이스라인 리듬 그리드"
                        description="8px / 32px 수직 타이포·간격 리듬 라인"
                        icon={<Ruler className="h-4 w-4" />}
                        onToggle={() => updateGrid({ showBaseline: !tokens.grid.showBaseline })}
                      />

                      <StudioSwitch
                        checked={tokens.grid.showSafeArea}
                        label="Safe Area & 44px 터치 타겟"
                        description="노치·홈바 안전 영역 및 최소 44×44px 히트 타겟 표시"
                        icon={<ShieldCheck className="h-4 w-4" />}
                        onToggle={() => updateGrid({ showSafeArea: !tokens.grid.showSafeArea })}
                      />
                    </section>
                  </div>
                )}

                {activeTab === 'tokens' && <TokenEditorTab />}
                {activeTab === 'motion' && <MotionInspectorTab />}
                {activeTab === 'export' && <ExportTokensTab />}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
