import { useEffect, useRef, useState } from 'react';
import { useDesignerStudio } from './DesignerStudioProvider';

export interface GridOverlayProps {
  forceColumns?: 4 | 12;
  contained?: boolean;
  className?: string;
}

export function GridOverlay({ forceColumns, contained = false, className = '' }: GridOverlayProps) {
  const { tokens } = useDesignerStudio();
  const { showColumns, showBaseline, showSafeArea } = tokens.grid;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(() => {
    if (tokens.viewport === 'mobile') return 393;
    if (tokens.viewport === 'tablet') return 768;
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1280;
  });

  const anyEnabled = showColumns || showBaseline || showSafeArea;

  useEffect(() => {
    if (!anyEnabled || forceColumns) return;
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      setMeasuredWidth(node.clientWidth || window.innerWidth);
    };
    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            setMeasuredWidth(entry.contentRect.width);
          }
        }
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [anyEnabled, forceColumns, tokens.viewport]);

  if (!anyEnabled) return null;

  const columnCount: 4 | 12 =
    forceColumns ?? (tokens.viewport === 'mobile' || measuredWidth < 768 ? 4 : 12);
  const gutterPx = columnCount === 4 ? 16 : 24;
  const marginPx = columnCount === 4 ? 16 : 24;

  const activeTags = [
    showColumns ? `${columnCount}-Col (${gutterPx}px)` : null,
    showBaseline ? '8px Baseline' : null,
    showSafeArea ? 'Safe Area · 44px' : null,
  ].filter(Boolean);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="studio-grid-overlay"
      className={`pointer-events-none ${contained ? 'absolute' : 'fixed'} inset-0 z-40 overflow-hidden select-none ${className}`}
    >
      {/* 8px Baseline Grid */}
      {showBaseline && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(to bottom, rgba(56, 189, 248, 0.24) 0px, rgba(56, 189, 248, 0.24) 1px, transparent 1px, transparent 32px)',
              'repeating-linear-gradient(to bottom, rgba(56, 189, 248, 0.11) 0px, rgba(56, 189, 248, 0.11) 1px, transparent 1px, transparent 8px)',
            ].join(', '),
          }}
        />
      )}

      {/* 12-Col / 4-Col Guide Grid */}
      {showColumns && (
        <div
          className="mx-auto grid h-full w-full max-w-7xl"
          style={{
            paddingLeft: `${marginPx}px`,
            paddingRight: `${marginPx}px`,
            gap: `${gutterPx}px`,
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columnCount }, (_, idx) => (
            <div
              key={idx}
              className="relative h-full border-x border-rose-400/25 bg-rose-500/[0.07]"
            >
              <span className="font-mono-spec absolute top-2 left-1 rounded bg-rose-600/85 px-1 py-0.5 text-[9px] leading-none font-medium text-white shadow-xs">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Safe Area & 44px Touch Target Guides */}
      {showSafeArea && (
        <>
          <div
            className="absolute inset-x-0 top-0 flex items-end justify-center border-b border-dashed border-amber-500/75 bg-amber-500/12 pb-1"
            style={{ height: 'max(44px, env(safe-area-inset-top))' }}
          >
            <span className="font-mono-spec rounded bg-amber-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
              SAFE AREA TOP · 44px
            </span>
          </div>

          <div
            className="absolute inset-x-0 bottom-0 flex items-start justify-center border-t border-dashed border-amber-500/75 bg-amber-500/12 pt-1"
            style={{ height: 'max(34px, env(safe-area-inset-bottom))' }}
          >
            <span className="font-mono-spec rounded bg-amber-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
              SAFE AREA BOTTOM · 34px HOME BAR
            </span>
          </div>

          <div className="absolute right-4 bottom-12 flex items-center gap-2">
            <span className="font-mono-spec rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
              MIN TOUCH 44×44px
            </span>
            <div className="relative flex h-[44px] w-[44px] items-center justify-center border border-dashed border-emerald-500/85 bg-emerald-500/15">
              <div className="h-2.5 w-2.5 rounded-full border border-emerald-500" />
            </div>
          </div>
        </>
      )}

      {/* Active Grid Redline Telemetry Badge */}
      <div className="font-mono-spec absolute top-14 left-3 flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-black/70 px-2.5 py-1 text-[10px] text-rose-200 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        <span>{activeTags.join(' · ')}</span>
      </div>
    </div>
  );
}
