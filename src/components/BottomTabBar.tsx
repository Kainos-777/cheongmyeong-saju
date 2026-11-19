import { motion } from 'framer-motion';
import { CalendarClock, Compass, Flame, HeartHandshake, Palette } from 'lucide-react';
import type { AppTab } from '../types/design';

export interface BottomTabBarProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
}

const MOBILE_TABS: {
  id: AppTab;
  label: string;
  Icon: typeof Compass;
}[] = [
  { id: 'pillars', label: '만세력', Icon: Compass },
  { id: 'elements', label: '오행', Icon: Flame },
  { id: 'luck', label: '대운', Icon: CalendarClock },
  { id: 'compatibility', label: '궁합', Icon: HeartHandshake },
  { id: 'design-system', label: '스튜디오', Icon: Palette },
];

export function BottomTabBar({ activeTab, onChangeTab }: BottomTabBarProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 md:hidden"
      style={{
        paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))',
      }}
      aria-label="모바일 하단 내비게이션"
    >
      <div
        className="mx-auto grid max-w-md grid-cols-5 items-center gap-1 p-1.5 shadow-2xl"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        {MOBILE_TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeTab(id)}
              data-tab={id}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors"
              style={{
                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-tab-active-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-xl"
                  style={{
                    backgroundColor: 'var(--accent-gold-soft)',
                    border: '1px solid color-mix(in srgb, var(--accent-gold) 38%, transparent)',
                  }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10 text-[11px] font-semibold leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
