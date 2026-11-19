import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Download,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import type { AppTab } from '../types/design';
import type { BirthInput, ElementKey } from '../types/saju';
import { getElementColor, pad2 } from './elementUtils';

export interface HeaderNavProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  profiles: BirthInput[];
  activeProfile: BirthInput;
  onSelectProfile: (profileId: string) => void;
  onDeleteProfile?: (profileId: string) => void;
  onOpenBirthInput: () => void;
  onOpenExport: () => void;
  onToggleStudio: () => void;
  studioOpen?: boolean;
  dayMasterElement?: ElementKey;
  iljuTitle?: string;
}

const NAV_TABS: { id: AppTab; label: string }[] = [
  { id: 'pillars', label: '만세력' },
  { id: 'elements', label: '오행·심층' },
  { id: 'luck', label: '대운·세운' },
  { id: 'compatibility', label: '궁합' },
  { id: 'design-system', label: '디자인 시스템' },
];

function getProfileKey(profile: BirthInput): string {
  return profile.id ?? profile.name;
}

export function HeaderNav({
  activeTab,
  onChangeTab,
  profiles,
  activeProfile,
  onSelectProfile,
  onDeleteProfile,
  onOpenBirthInput,
  onOpenExport,
  onToggleStudio,
  studioOpen = false,
  dayMasterElement = 'earth',
  iljuTitle,
}: HeaderNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const activeKey = getProfileKey(activeProfile);
  const dotColor = getElementColor(dayMasterElement);

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-2.5 sm:px-5 sm:pt-3">
      <div
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-4"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Brand Emblem */}
        <button
          type="button"
          onClick={() => onChangeTab('pillars')}
          className="group flex shrink-0 items-center gap-1.5 rounded-xl px-1 py-1 text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 sm:gap-2 sm:px-1.5"
          style={{ color: 'var(--text-primary)' }}
          aria-label="청명 만세력 홈으로"
        >
          <span
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border"
            style={{
              backgroundColor: 'var(--accent-gold-soft)',
              borderColor: 'var(--border-strong)',
              color: 'var(--accent-gold)',
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none">
              <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.4" opacity="0.85" />
              <circle cx="14" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M14 2.5V6M14 22V25.5M2.5 14H6M22 14H25.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="flex items-baseline gap-1.5">
              <span className="font-serif-kr text-[15px] font-bold tracking-tight sm:text-[17px]">
                청명
              </span>
              <span
                className="hidden font-serif-kr text-xs font-medium sm:inline"
                style={{ color: 'var(--accent-gold)' }}
              >
                淸明
              </span>
            </span>
            <span
              className="hidden text-[10px] tracking-wider xl:block"
              style={{ color: 'var(--text-muted)' }}
            >
              SAJU STUDIO
            </span>
          </span>
        </button>

        {/* Desktop Navigation Tabs */}
        <nav
          className="hidden items-center gap-0.5 rounded-full p-1 md:flex lg:gap-1"
          style={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
          }}
          aria-label="주요 메뉴"
        >
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className="relative whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors lg:px-3.5 lg:text-[13px]"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="header-active-tab"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: 'var(--accent-gold-soft)',
                      border: '1px solid color-mix(in srgb, var(--accent-gold) 42%, transparent)',
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Profile Switcher + CTAs */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {/* Active Profile Switcher */}
          <div className="relative min-w-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              aria-label="프로필 전환"
              className="flex min-h-[36px] max-w-[88px] items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors sm:min-h-[38px] sm:max-w-[160px] sm:gap-1.5 sm:px-2.5 sm:py-1.5"
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: dotColor }}
                aria-hidden="true"
              />
              <span className="truncate">{activeProfile.name || '무명'}</span>
              {iljuTitle && (
                <span
                  className="hidden truncate text-[11px] xl:inline"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · {iljuTitle.replace(/\s*일주.*/, '')}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-64 overflow-hidden p-1.5 shadow-2xl"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-card)',
                  }}
                  role="listbox"
                  aria-label="저장된 사주 프로필"
                >
                  <div
                    className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    프로필 선택 ({profiles.length})
                  </div>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {profiles.map((profile) => {
                      const key = getProfileKey(profile);
                      const isCurrent = key === activeKey;
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-1 rounded-xl px-2 py-1.5 transition-colors"
                          style={{
                            backgroundColor: isCurrent ? 'var(--accent-gold-soft)' : 'transparent',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProfile(key);
                              setDropdownOpen(false);
                            }}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <UserRound
                              className="h-3.5 w-3.5 shrink-0"
                              style={{
                                color: isCurrent ? 'var(--accent-gold)' : 'var(--text-muted)',
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className="truncate text-xs font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {profile.name}
                              </div>
                              <div
                                className="truncate text-[11px]"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {profile.calendarType === 'lunar' ? '음' : '양'}{' '}
                                {profile.year}.{pad2(profile.month)}.{pad2(profile.day)}{' '}
                                {profile.unknownTime
                                  ? '시간미상'
                                  : `${pad2(profile.hour)}:${pad2(profile.minute)}`}
                              </div>
                            </div>
                            {isCurrent && (
                              <Check
                                className="h-3.5 w-3.5 shrink-0"
                                style={{ color: 'var(--accent-gold)' }}
                              />
                            )}
                          </button>

                          {onDeleteProfile && profiles.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProfile(key);
                              }}
                              aria-label={`${profile.name} 삭제`}
                              className="rounded-lg p-1 opacity-65 transition-opacity hover:opacity-100"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="mt-1.5 border-t pt-1.5"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenBirthInput();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      새 사주 프로필 추가
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 사주 입력 CTA */}
          <button
            type="button"
            onClick={onOpenBirthInput}
            className="flex min-h-[36px] shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-transform active:scale-[0.97] sm:min-h-[38px] sm:gap-1.5 sm:px-3"
            style={{
              backgroundColor: 'var(--accent-gold)',
              color: 'var(--bg-canvas)',
            }}
            aria-label="사주 입력"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="sm:hidden">입력</span>
            <span className="hidden sm:inline">사주 입력</span>
          </button>

          {/* 내보내기 Button */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium transition-colors sm:min-h-[38px] sm:min-w-[38px] sm:px-2.5"
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            aria-label="내보내기"
            title="SVG 포스터 / 이미지 내보내기"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">내보내기</span>
          </button>

          {/* Studio ⌘K Toggle */}
          <button
            type="button"
            onClick={onToggleStudio}
            aria-pressed={studioOpen}
            aria-label="Designer Studio 열기 (Ctrl+K)"
            className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold transition-colors sm:min-h-[38px] sm:min-w-[38px] sm:px-2.5"
            style={{
              backgroundColor: studioOpen ? 'var(--accent-gold-soft)' : 'var(--surface-1)',
              border: studioOpen
                ? '1px solid var(--accent-gold)'
                : '1px solid var(--border-subtle)',
              color: studioOpen ? 'var(--accent-gold)' : 'var(--text-primary)',
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Studio</span>
            <kbd
              className="hidden rounded px-1 py-0.5 font-mono text-[10px] lg:inline"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-muted)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
