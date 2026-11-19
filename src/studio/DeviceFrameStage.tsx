import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  Columns2,
  Grid3X3,
  Maximize2,
  Monitor,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Wifi,
  BatteryCharging,
  Signal,
} from 'lucide-react';
import type { ViewportMode } from '../types/design';
import { useDesignerStudio } from './DesignerStudioProvider';
import { GridOverlay } from './GridOverlay';
import { ELEMENT_META } from './themes';

export interface DeviceFrameStageProps {
  children: ReactNode;
}

interface ViewportOption {
  id: ViewportMode;
  label: string;
  dim: string;
  Icon: typeof Maximize2;
}

const VIEWPORT_OPTIONS: ViewportOption[] = [
  { id: 'full', label: 'Full', dim: '반응형', Icon: Maximize2 },
  { id: 'desktop', label: 'Desktop', dim: '1440px', Icon: Monitor },
  { id: 'tablet', label: 'Tablet', dim: '768px', Icon: Tablet },
  { id: 'mobile', label: 'Mobile', dim: '393px', Icon: Smartphone },
  { id: 'split', label: 'Split', dim: 'Web+Mob', Icon: Columns2 },
];

function useElementWidth(active: boolean): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(280, window.innerWidth - 32) : 1200,
  );

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const update = () => {
      if (node.clientWidth > 0) {
        setWidth(node.clientWidth);
      }
    };
    update();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            setWidth(entry.contentRect.width);
          }
        }
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [active]);

  return [ref, width];
}

function IPhoneStatusBar() {
  return (
    <div
      className="pointer-events-none sticky top-0 z-50 flex h-[50px] w-full shrink-0 items-center justify-between px-6 pt-2 select-none"
      style={{ color: 'var(--text-primary)' }}
    >
      <span className="font-mono-spec text-[12px] font-semibold tracking-tight">9:41</span>

      {/* Dynamic Island */}
      <div
        className="flex h-[28px] w-[104px] items-center justify-end rounded-full bg-black px-2.5 shadow-inner ring-1 ring-white/10"
        aria-hidden="true"
      >
        <div className="h-2.5 w-2.5 rounded-full bg-slate-900 ring-1 ring-sky-400/35" />
      </div>

      <div className="flex items-center gap-1.5 opacity-90">
        <Signal className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryCharging className="h-4 w-4" />
      </div>
    </div>
  );
}

function IPhoneHomeIndicator() {
  return (
    <div className="pointer-events-none sticky bottom-0 z-50 flex h-6 w-full shrink-0 items-center justify-center pb-1.5 select-none">
      <div
        className="h-[4.5px] w-[132px] rounded-full opacity-60"
        style={{ backgroundColor: 'var(--text-primary)' }}
      />
    </div>
  );
}

function MobileCompanionPreview({
  scale,
  onSwitchToMobile,
}: {
  scale: number;
  onSwitchToMobile: () => void;
}) {
  const { tokens, activeThemePreset } = useDesignerStudio();
  const radiusPx = Math.round(tokens.radiusScale * 18);

  const samplePillars =
    tokens.pillarOrder === 'traditional'
      ? [
          { label: '시주', stem: '戊', branch: '午', el: 'earth' as const },
          { label: '일주', stem: '戊', branch: '午', el: 'fire' as const },
          { label: '월주', stem: '丙', branch: '子', el: 'water' as const },
          { label: '년주', stem: '己', branch: '卯', el: 'wood' as const },
        ]
      : [
          { label: '년주', stem: '己', branch: '卯', el: 'wood' as const },
          { label: '월주', stem: '丙', branch: '子', el: 'water' as const },
          { label: '일주', stem: '戊', branch: '午', el: 'fire' as const },
          { label: '시주', stem: '戊', branch: '午', el: 'earth' as const },
        ];

  const outerW = Math.round(413 * scale);
  const outerH = Math.round(820 * scale);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-full items-center justify-between gap-2 px-1">
        <span className="font-mono-spec text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Mobile Companion · 393×852 ({Math.round(scale * 100)}%)
        </span>
        <button
          type="button"
          onClick={onSwitchToMobile}
          className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--accent-gold-soft)',
            borderColor: 'var(--accent-gold)',
            color: 'var(--accent-gold)',
          }}
        >
          모바일 프레임 전환 →
        </button>
      </div>

      <div style={{ width: `${outerW}px`, height: `${outerH}px` }} className="relative shrink-0">
        <div
          style={{
            width: '413px',
            height: '820px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="rounded-[48px] border-[3px] border-neutral-700/80 bg-neutral-950 p-[10px] shadow-2xl"
        >
          <div
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[38px]"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
            }}
          >
            <IPhoneStatusBar />
            <GridOverlay contained forceColumns={4} />

            <div className="flex-1 space-y-3 overflow-y-auto px-4 pt-1 pb-4">
              {/* Mini Mobile Header */}
              <div
                className="flex items-center justify-between border px-3 py-2"
                style={{
                  borderRadius: `${radiusPx}px`,
                  backgroundColor: 'var(--surface-glass)',
                  borderColor: 'var(--border-subtle)',
                  backdropFilter: `blur(${tokens.glassBlur}px)`,
                  WebkitBackdropFilter: `blur(${tokens.glassBlur}px)`,
                }}
              >
                <div>
                  <div className="font-serif-kr text-sm font-bold">청명 淸明</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {activeThemePreset.nameKo} · {tokens.density}
                  </div>
                </div>
                <span
                  className="font-mono-spec rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: 'var(--accent-gold-soft)',
                    color: 'var(--accent-gold)',
                  }}
                >
                  4-Col
                </span>
              </div>

              {/* Mobile 4-Pillar Preview */}
              <div
                className="border p-3"
                style={{
                  borderRadius: `${radiusPx}px`,
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                  padding: 'var(--density-pad)',
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold">사주팔자 프리뷰</span>
                  <span className="font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {tokens.pillarOrder === 'traditional' ? '우→좌 전통' : '좌→우 현대'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {samplePillars.map((p) => (
                    <div
                      key={p.label}
                      className="flex flex-col items-center border py-2.5"
                      style={{
                        borderRadius: `${Math.max(6, Math.round(radiusPx * 0.72))}px`,
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {p.label}
                      </span>
                      <span
                        className="font-serif-kr mt-1 text-lg font-bold"
                        style={{ color: tokens.elementPalette[p.el] }}
                      >
                        {p.stem}
                      </span>
                      <span className="font-serif-kr text-lg font-bold">{p.branch}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile 5-Element Swatch Strip */}
              <div
                className="border p-3"
                style={{
                  borderRadius: `${radiusPx}px`,
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="mb-2 text-xs font-semibold">오행 실시간 토큰</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {ELEMENT_META.map((el) => (
                    <div key={el.key} className="flex flex-col items-center gap-1">
                      <span
                        className="h-6 w-full rounded-md border border-white/15"
                        style={{ backgroundColor: tokens.elementPalette[el.key] }}
                      />
                      <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {el.labelKo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography & Motion Token Preview */}
              <div
                className="border p-3"
                style={{
                  borderRadius: `${radiusPx}px`,
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="text-xs font-semibold" style={{ color: 'var(--accent-gold)' }}>
                  모바일 타이포 · {Math.round(16 * tokens.fontScale)}px
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Radius {radiusPx}px · Blur {tokens.glassBlur}px · Speed {tokens.motion.speed}x
                </p>
              </div>
            </div>

            {/* Simulated Mobile Bottom Tab Bar */}
            <div
              className="mx-3 mb-1 grid grid-cols-5 border px-1 py-1.5 text-center text-[10px]"
              style={{
                borderRadius: `${Math.max(10, radiusPx)}px`,
                backgroundColor: 'var(--surface-glass)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {['만세력', '오행', '대운', '궁합', '시스템'].map((tab, i) => (
                <span
                  key={tab}
                  className="py-1 font-medium"
                  style={{ color: i === 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}
                >
                  {tab}
                </span>
              ))}
            </div>

            <IPhoneHomeIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeviceFrameStage({ children }: DeviceFrameStageProps) {
  const { tokens, setViewport, toggleStudio, updateGrid } = useDesignerStudio();
  const isFramed = tokens.viewport !== 'full';
  const [stageRef, stageWidth] = useElementWidth(isFramed);

  if (!isFramed) {
    return <div className="relative min-h-dvh w-full">{children}</div>;
  }

  const usableWidth = Math.max(260, stageWidth - 24);
  const anyGridOn = tokens.grid.showColumns || tokens.grid.showBaseline || tokens.grid.showSafeArea;

  const renderToolbar = (badgeText: string) => (
    <div className="sticky top-2.5 z-40 mx-auto mb-4 flex w-full max-w-4xl flex-wrap items-center justify-center gap-1.5 px-2">
      <div
        className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border px-2 py-1.5 shadow-xl backdrop-blur-md sm:rounded-full"
        style={{
          backgroundColor: 'var(--surface-glass)',
          borderColor: 'var(--border-strong)',
        }}
      >
        {VIEWPORT_OPTIONS.map((opt) => {
          const active = tokens.viewport === opt.id;
          const Icon = opt.Icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setViewport(opt.id)}
              aria-pressed={active}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: active ? 'var(--accent-gold)' : 'transparent',
                color: active ? '#111111' : 'var(--text-secondary)',
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{opt.label}</span>
              <span className="font-mono-spec hidden text-[10px] opacity-75 sm:inline">
                {opt.dim}
              </span>
            </button>
          );
        })}

        <div className="mx-0.5 hidden h-4 w-px sm:block" style={{ backgroundColor: 'var(--border-subtle)' }} />

        <span
          className="font-mono-spec hidden rounded-full px-2 py-0.5 text-[10px] md:inline-block"
          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          {badgeText}
        </span>

        <button
          type="button"
          onClick={() =>
            updateGrid({
              showColumns: !anyGridOn,
              showBaseline: !anyGridOn,
              showSafeArea: !anyGridOn,
            })
          }
          title="그리드 오버레이 토글"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-colors"
          style={{
            backgroundColor: anyGridOn ? 'var(--accent-gold-soft)' : 'transparent',
            color: anyGridOn ? 'var(--accent-gold)' : 'var(--text-muted)',
          }}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => toggleStudio()}
          title="스튜디오 열기 (⌘K)"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Studio</span>
        </button>
      </div>
    </div>
  );

  let frameContent: ReactNode = null;
  let badgeText = '';

  if (tokens.viewport === 'desktop') {
    const targetW = 1440;
    const viewportH = 860;
    const chromeH = 34;
    const scale = Math.min(1, usableWidth / targetW);
    const outerW = Math.round(targetW * scale);
    const outerH = Math.round((viewportH + chromeH) * scale);
    badgeText = `1440×860 · ${Math.round(scale * 100)}%`;

    frameContent = (
      <div style={{ width: `${outerW}px`, height: `${outerH}px` }} className="mx-auto shrink-0">
        <div
          style={{
            width: `${targetW}px`,
            height: `${viewportH + chromeH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            borderColor: 'var(--border-strong)',
            backgroundColor: 'var(--bg-canvas)',
          }}
          className="flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
        >
          <div
            className="flex h-[34px] shrink-0 items-center justify-between border-b px-4"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div
              className="font-mono-spec rounded-md px-3 py-0.5 text-[11px]"
              style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-muted)' }}
            >
              cheongmyeong.app — Desktop 1440px Canvas
            </div>
            <span className="font-mono-spec text-[11px]" style={{ color: 'var(--accent-gold)' }}>
              {Math.round(scale * 100)}%
            </span>
          </div>

          <div
            className="relative flex-1 overflow-x-hidden overflow-y-auto"
            style={{ transform: 'translateZ(0)' }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  } else if (tokens.viewport === 'tablet') {
    const innerW = 768;
    const innerH = 1024;
    const bezelPad = 14;
    const outerTargetW = innerW + bezelPad * 2;
    const outerTargetH = innerH + bezelPad * 2 + 24;
    const scale = Math.min(1, usableWidth / outerTargetW);
    const outerW = Math.round(outerTargetW * scale);
    const outerH = Math.round(outerTargetH * scale);
    badgeText = `768×1024 · ${Math.round(scale * 100)}%`;

    frameContent = (
      <div style={{ width: `${outerW}px`, height: `${outerH}px` }} className="mx-auto shrink-0">
        <div
          style={{
            width: `${outerTargetW}px`,
            height: `${outerTargetH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="flex flex-col rounded-[32px] border-[3px] border-neutral-700/80 bg-neutral-950 p-[14px] shadow-2xl"
        >
          <div className="mb-2 flex h-4 shrink-0 items-center justify-between px-3">
            <span className="font-mono-spec text-[10px] text-neutral-400">iPad · 768×1024</span>
            <span className="h-2 w-2 rounded-full bg-neutral-800 ring-1 ring-neutral-600" />
            <span className="font-mono-spec text-[10px] text-neutral-400">100%</span>
          </div>
          <div
            className="relative flex-1 overflow-x-hidden overflow-y-auto rounded-[20px]"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              transform: 'translateZ(0)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  } else if (tokens.viewport === 'mobile') {
    const innerW = 393;
    const innerH = 852;
    const bezelPad = 10;
    const outerTargetW = innerW + bezelPad * 2 + 6;
    const outerTargetH = innerH + bezelPad * 2 + 6;
    const scale = Math.min(1, usableWidth / outerTargetW);
    const outerW = Math.round(outerTargetW * scale);
    const outerH = Math.round(outerTargetH * scale);
    badgeText = `iPhone 16 Pro · 393×852 · ${Math.round(scale * 100)}%`;

    frameContent = (
      <div style={{ width: `${outerW}px`, height: `${outerH}px` }} className="mx-auto shrink-0">
        <div
          style={{
            width: `${outerTargetW}px`,
            height: `${outerTargetH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="rounded-[52px] border-[3px] border-neutral-700/90 bg-neutral-950 p-[10px] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        >
          <div
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[40px]"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              transform: 'translateZ(0)',
            }}
          >
            <IPhoneStatusBar />
            <div className="relative flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
            <IPhoneHomeIndicator />
          </div>
        </div>
      </div>
    );
  } else if (tokens.viewport === 'split') {
    const isWide = usableWidth >= 960;
    const companionScale = isWide
      ? Math.min(0.76, (usableWidth * 0.34) / 413)
      : Math.min(0.88, usableWidth / 413);
    const desktopPaneAvail = isWide
      ? Math.max(480, usableWidth - Math.round(413 * companionScale) - 36)
      : usableWidth;
    const desktopTargetW = 1280;
    const desktopTargetH = 780;
    const desktopScale = Math.min(1, desktopPaneAvail / desktopTargetW);
    const desktopOuterW = Math.round(desktopTargetW * desktopScale);
    const desktopOuterH = Math.round(desktopTargetH * desktopScale);

    badgeText = `Split · Web ${Math.round(desktopScale * 100)}% + Mob ${Math.round(companionScale * 100)}%`;

    frameContent = (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center gap-6 lg:flex-row lg:items-start">
        {/* Left: Live Web App Canvas */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex w-full items-center justify-between px-1">
            <span className="font-mono-spec text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Live Web Viewport · 1280px ({Math.round(desktopScale * 100)}%)
            </span>
            <span
              className="font-mono-spec rounded-full px-2 py-0.5 text-[10px]"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent-gold)' }}
            >
              Interactive
            </span>
          </div>

          <div
            style={{ width: `${desktopOuterW}px`, height: `${desktopOuterH}px` }}
            className="shrink-0"
          >
            <div
              style={{
                width: `${desktopTargetW}px`,
                height: `${desktopTargetH}px`,
                transform: `scale(${desktopScale})`,
                transformOrigin: 'top left',
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg-canvas)',
              }}
              className="flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
            >
              <div
                className="flex h-8 shrink-0 items-center justify-between border-b px-3"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono-spec text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Web Breakpoint · 1280px
                </span>
                <span className="font-mono-spec text-[10px]" style={{ color: 'var(--accent-gold)' }}>
                  12-Col
                </span>
              </div>
              <div
                className="relative flex-1 overflow-x-hidden overflow-y-auto"
                style={{ transform: 'translateZ(0)' }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Synchronized Mobile Companion Inspector */}
        <MobileCompanionPreview
          scale={companionScale}
          onSwitchToMobile={() => setViewport('mobile')}
        />
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      data-testid="device-frame-stage"
      data-viewport={tokens.viewport}
      className="relative min-h-dvh w-full overflow-x-hidden px-3 pt-2 pb-10 sm:px-6"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, var(--border-subtle) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      {renderToolbar(badgeText)}
      {frameContent}
    </div>
  );
}
