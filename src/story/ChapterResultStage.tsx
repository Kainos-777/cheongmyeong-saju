import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Download,
  Flame,
  HeartHandshake,
  Image as ImageIcon,
  LockOpen,
  RotateCcw,
  Share2,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useMediaAudio } from '../audio/mediaAudioEngine';
import {
  CompatibilityPanel,
  DaewoonExplorer,
  DailyFortuneWidget,
  FortuneInsightCards,
  FourPillarsBoard,
  OhaengBalancePanel,
} from '../components';
import { BIRTH_CITIES } from '../engine';
import {
  DaewoonTimelineMotion,
  KineticTypography,
  OhaengOrbitalViz,
  PillarRevealCard,
} from '../motion';
import type {
  BirthInput,
  CompatibilityResult,
  ElementKey,
  SajuResult,
} from '../types/saju';
import { SeohwaDialogueCard, SeohwaPortrait } from './SeohwaVisuals';
import {
  SAJU_PLAIN_GLOSSARY,
  buildChapterScripts,
  buildCompatibilityQuote,
  buildSeohwaRoasts,
  buildShareUrl,
  downloadViralCardPng,
  generateViralStoryCardSvg,
  type FocusTopic,
  type ResultChapter,
} from './storyCore';

export interface ChapterResultStageProps {
  sajuResult: SajuResult;
  focusTopic: FocusTopic;
  chapter: ResultChapter;
  onChangeChapter: (next: ResultChapter) => void;
  pillarOrder: 'traditional' | 'modern';
  onTogglePillarOrder: () => void;
  isSharedView: boolean;
  onClaimOwnReading: () => void;
  onStartNewReading: () => void;
  onReplayOpening: () => void;
  onOpenPosterModal: () => void;
  // Compatibility props
  compatibility: CompatibilityResult;
  profiles: BirthInput[];
  personAId: string;
  personBId: string;
  onSelectPersonA: (id: string) => void;
  onSelectPersonB: (id: string) => void;
  onCustomInputPersonA: (input: BirthInput) => void;
  onCustomInputPersonB: (input: BirthInput) => void;
}

export function ChapterResultStage({
  sajuResult,
  focusTopic,
  chapter,
  onChangeChapter,
  pillarOrder,
  onTogglePillarOrder,
  isSharedView,
  onClaimOwnReading,
  onStartNewReading,
  onReplayOpening,
  onOpenPosterModal,
  compatibility,
  profiles,
  personAId,
  personBId,
  onSelectPersonA,
  onSelectPersonB,
  onCustomInputPersonA,
  onCustomInputPersonB,
}: ChapterResultStageProps) {
  const {
    voiceEnabled,
    isSpeaking,
    speakClipOrText,
    stopVoice,
    playTap,
    playChime,
    playReveal,
  } = useMediaAudio();

  const [selectedElement, setSelectedElement] = useState<ElementKey | null>(
    sajuResult.dominantElement,
  );
  const currentAge = useMemo(() => {
    const nowYear = new Date().getFullYear();
    return Math.max(1, nowYear - sajuResult.solarDate.year + 1);
  }, [sajuResult.solarDate.year]);

  const initialDaewoonIdx = useMemo(() => {
    const idx = sajuResult.daewoon.findIndex(
      (d) => currentAge >= d.startAge && currentAge <= d.endAge,
    );
    return idx >= 0 ? idx : 0;
  }, [sajuResult.daewoon, currentAge]);

  const [activeDaewoonIdx, setActiveDaewoonIdx] =
    useState<number>(initialDaewoonIdx);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [unlockedSecrets, setUnlockedSecrets] = useState<
    Record<number, boolean>
  >({});
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [speakingTarget, setSpeakingTarget] = useState<'chapter' | 'secret'>(
    'chapter',
  );

  useEffect(() => {
    setSelectedElement(sajuResult.dominantElement);
    setActiveDaewoonIdx(initialDaewoonIdx);
    setUnlockedSecrets({});
  }, [sajuResult, initialDaewoonIdx]);

  const { chapters, viralOneLiner } = useMemo(
    () => buildChapterScripts(sajuResult, focusTopic),
    [sajuResult, focusTopic],
  );
  const roasts = useMemo(() => buildSeohwaRoasts(sajuResult), [sajuResult]);
  const compatQuote = useMemo(
    () => buildCompatibilityQuote(compatibility),
    [compatibility],
  );

  const currentScript = chapters[chapter] ?? chapters[0];
  const chapterDialogueText =
    chapter === 3 ? compatQuote : currentScript.dialogue;
  const chapterSpeechText = currentScript.headline
    ? `${currentScript.headline}. ${chapterDialogueText}`
    : chapterDialogueText;

  // Auto-speak chapter dialogue when voice is enabled; stop cleanly on chapter change/unmount
  useEffect(() => {
    if (voiceEnabled) {
      setSpeakingTarget('chapter');
      speakClipOrText({ text: chapterSpeechText });
    }
    return () => {
      stopVoice();
    };
  }, [voiceEnabled, chapter, chapterSpeechText, speakClipOrText, stopVoice]);

  const handleToggleChapterSpeak = () => {
    if (isSpeaking && speakingTarget === 'chapter') {
      stopVoice();
      return;
    }
    setSpeakingTarget('chapter');
    speakClipOrText({
      text: chapterSpeechText,
      force: true,
    });
  };

  const handleUnlockSecret = (targetChapter: ResultChapter) => {
    setUnlockedSecrets((prev) => ({ ...prev, [targetChapter]: true }));
    playChime();
    if (voiceEnabled && currentScript.secretReveal) {
      setSpeakingTarget('secret');
      speakClipOrText({ text: currentScript.secretReveal });
    }
  };

  const handleToggleSecretSpeak = () => {
    if (isSpeaking && speakingTarget === 'secret') {
      stopVoice();
      return;
    }
    setSpeakingTarget('secret');
    speakClipOrText({
      text: currentScript.secretReveal,
      force: true,
    });
  };

  const viralSvgMarkup = useMemo(
    () =>
      generateViralStoryCardSvg(
        sajuResult,
        viralOneLiner,
        roasts.map((r) => r.roast),
      ),
    [sajuResult, viralOneLiner, roasts],
  );

  const viralCardDataUrl = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(viralSvgMarkup)}`,
    [viralSvgMarkup],
  );

  const shareUrl = useMemo(
    () => buildShareUrl(sajuResult.input, focusTopic),
    [sajuResult.input, focusTopic],
  );

  const goChapter = (next: ResultChapter) => {
    playChime();
    onChangeChapter(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveViralCard = async () => {
    setDownloadingCard(true);
    playReveal();
    try {
      const kind = await downloadViralCardPng(
        viralSvgMarkup,
        sajuResult.input.name || 'cheongmyeong',
      );
      setShareStatus(
        kind === 'png'
          ? '9:16 인스타 스토리용 고해상도 PNG 카드가 저장되었습니다!'
          : '9:16 벡터 SVG 카드가 저장되었습니다!',
      );
    } finally {
      setDownloadingCard(false);
    }
  };

  const handleCopyShareLink = async () => {
    playTap();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedLink(true);
      setShareStatus(
        '공유 링크 복사 완료! 친구가 열면 로그인 없이 바로 이 사주와 궁합을 볼 수 있어요.',
      );
      window.setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setShareStatus(shareUrl);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${sajuResult.input.name}님의 사주 팩폭 · 청명각`,
          text: `${sajuResult.interpretation.iljuTitle} — ${viralOneLiner}`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to copy
      }
    }
    await handleCopyShareLink();
  };

  const iljuHangul = `${sajuResult.pillars.day.stem.hangul}${sajuResult.pillars.day.branch.hangul}일주`;
  const isChapterSpeaking = isSpeaking && speakingTarget === 'chapter';
  const isSecretSpeaking = isSpeaking && speakingTarget === 'secret';
  const isSecretUnlocked = Boolean(unlockedSecrets[chapter]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-3 pt-2 pb-16 sm:px-5">
      {/* Zero-Login Shared Link Visitor Banner */}
      {isSharedView && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-[20px] border p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            backgroundColor: 'rgba(229, 190, 109, 0.12)',
            borderColor: 'rgba(229, 190, 109, 0.42)',
          }}
        >
          <div className="space-y-0.5">
            <div
              className="flex items-center gap-1.5 text-xs font-bold"
              style={{ color: 'var(--accent-gold)' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              공유된 무료 사주 열람 중 (로그인·인증 없음)
            </div>
            <p
              className="text-xs sm:text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              지금 <strong>{sajuResult.input.name}</strong>님의 명식을 보고 있어요.
              내 생일 넣고 바로 비교해 볼까요?
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopVoice();
                playChime();
                onClaimOwnReading();
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold shadow"
              style={{
                backgroundColor: 'var(--accent-gold)',
                color: '#07080d',
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />내 사주 무료로 보기
            </button>
            <button
              type="button"
              onClick={() => goChapter(3)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: 'var(--surface-1)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <HeartHandshake className="h-3.5 w-3.5" />이 사람과 궁합 보기
            </button>
          </div>
        </motion.div>
      )}

      {/* Sticky 5-Chapter Progress Navigation */}
      <nav
        aria-label="사주 풀이 챕터 내비게이션"
        className="sticky top-16 z-30 rounded-full border p-1.5 shadow-xl"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="grid grid-cols-5 gap-1">
          {chapters.map((ch) => {
            const active = chapter === ch.chapter;
            return (
              <button
                key={ch.chapter}
                type="button"
                onClick={() => goChapter(ch.chapter)}
                aria-current={active ? 'step' : undefined}
                className="relative flex min-h-[40px] items-center justify-center rounded-full px-1.5 py-1.5 text-[11px] font-bold transition-colors sm:text-xs"
                style={{
                  color: active ? '#07080d' : 'var(--text-secondary)',
                }}
              >
                {active && (
                  <motion.span
                    layoutId="chapter-stepper-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: 'var(--accent-gold)' }}
                  />
                )}
                <span className="relative z-10 truncate">{ch.navLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Active Chapter Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`chapter-${chapter}-${sajuResult.input.id ?? sajuResult.input.name}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="space-y-6"
        >
          {/* Seohwa Chapter Dialogue Lead */}
          <SeohwaDialogueCard
            expression={currentScript.expression}
            moodLabel={currentScript.moodLabel}
            headline={currentScript.headline}
            text={chapterDialogueText}
            dominantElement={sajuResult.dominantElement}
            isSpeaking={isChapterSpeaking}
            onToggleSpeak={handleToggleChapterSpeak}
          />

          {/* "밀당" Curiosity Secret Reveal Card (Chapters 0, 1, 2, 3) */}
          {chapter <= 3 && currentScript.secretTease && (
            <div
              className="overflow-hidden rounded-[22px] border p-4 sm:p-5"
              style={{
                background:
                  'linear-gradient(135deg, rgba(229, 190, 109, 0.09) 0%, rgba(16, 20, 32, 0.86) 100%)',
                borderColor: isSecretUnlocked
                  ? 'rgba(229, 190, 109, 0.52)'
                  : 'rgba(229, 190, 109, 0.34)',
              }}
            >
              {!isSecretUnlocked ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide"
                      style={{ color: 'var(--accent-gold)' }}
                    >
                      <LockOpen className="h-3.5 w-3.5" />
                      서화의 밀당 시크릿 · 100% 무료 해금
                    </div>
                    <p
                      className="font-serif-kr text-sm leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {currentScript.secretTease}
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleUnlockSecret(chapter)}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-bold shadow-[0_8px_22px_rgba(229,190,109,0.22)] transition-opacity hover:opacity-95"
                    style={{
                      backgroundColor: 'var(--accent-gold)',
                      borderColor: 'rgba(246, 223, 157, 0.65)',
                      color: '#07080d',
                    }}
                  >
                    🔓 서화가 망설이다 꺼낸 비밀 한 줄 열어보기 (무료)
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className="space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
                      style={{
                        backgroundColor: 'rgba(229, 190, 109, 0.18)',
                        color: 'var(--accent-gold)',
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      비밀 한 줄 해금 완료
                    </span>

                    <button
                      type="button"
                      onClick={handleToggleSecretSpeak}
                      aria-label="해금된 비밀 한 줄 음성 재생/정지"
                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold"
                      style={{
                        backgroundColor: isSecretSpeaking
                          ? 'rgba(229, 190, 109, 0.2)'
                          : 'var(--surface-1)',
                        borderColor: isSecretSpeaking
                          ? 'rgba(229, 190, 109, 0.6)'
                          : 'var(--border-subtle)',
                        color: isSecretSpeaking
                          ? 'var(--accent-gold)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {isSecretSpeaking ? '⏹ 멈춤' : '🔊 비밀 듣기'}
                    </button>
                  </div>

                  <p
                    className="text-sm leading-relaxed sm:text-[15px]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentScript.secretReveal}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Beginner-Friendly "10초 사주 용어 쉽게 보기" Toggle (Chapters 0 & 1) */}
          {(chapter === 0 || chapter === 1) && (
            <div
              className="overflow-hidden rounded-[20px] border"
              style={{
                backgroundColor: 'var(--surface-1)',
                borderColor: glossaryOpen
                  ? 'rgba(229, 190, 109, 0.36)'
                  : 'var(--border-subtle)',
              }}
            >
              <button
                type="button"
                aria-expanded={glossaryOpen}
                onClick={() => {
                  playTap();
                  setGlossaryOpen((prev) => !prev);
                }}
                className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold sm:px-5 sm:text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <BookOpen
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--accent-gold)' }}
                  />
                  <span>💡 10초 사주 용어 쉽게 보기</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    초보용 치트키 {SAJU_PLAIN_GLOSSARY.length}선
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    glossaryOpen ? 'rotate-180' : ''
                  }`}
                  style={{ color: 'var(--text-muted)' }}
                />
              </button>

              <AnimatePresence initial={false}>
                {glossaryOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden border-t"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
                      {SAJU_PLAIN_GLOSSARY.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border p-3.5"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                              style={{
                                backgroundColor: 'var(--accent-gold-soft)',
                                color: 'var(--accent-gold)',
                              }}
                            >
                              {item.term} ({item.hanja})
                            </span>
                            <span
                              className="text-xs font-bold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {item.plainTitle}
                            </span>
                          </div>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {item.easyDesc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* CHAPTER 0: 1장 타고난 기질 팩폭 */}
          {chapter === 0 && (
            <div className="space-y-6">
              {/* Ilju Hero Card */}
              <div
                className="relative overflow-hidden rounded-[22px] border p-5 sm:p-6"
                style={{
                  backgroundColor: 'var(--surface-glass)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="rounded-full px-3 py-1 font-bold"
                    style={{
                      backgroundColor: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    {sajuResult.input.name} ·{' '}
                    {sajuResult.input.gender === 'female' ? '여성(坤)' : '남성(乾)'}
                  </span>
                  <span
                    className="rounded-full border px-3 py-1"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {sajuResult.solarDate.year}.
                    {String(sajuResult.solarDate.month).padStart(2, '0')}.
                    {String(sajuResult.solarDate.day).padStart(2, '0')} ·{' '}
                    {sajuResult.solarTermName} 절기
                  </span>
                  <span
                    className="rounded-full border px-3 py-1 font-semibold"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {sajuResult.strength.level} ({sajuResult.strength.score}점) ·{' '}
                    {sajuResult.gyeokguk.name}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <KineticTypography
                    text={sajuResult.interpretation.iljuTitle}
                    as="h1"
                    mode="word"
                    highlightWords={[iljuHangul]}
                    highlightClassName="underline decoration-[var(--accent-gold)] decoration-2 underline-offset-4"
                    className="font-serif-kr text-2xl font-bold tracking-tight sm:text-3xl"
                  />
                  <p
                    className="text-sm font-semibold sm:text-base"
                    style={{ color: 'var(--accent-gold)' }}
                  >
                    {sajuResult.interpretation.archetype} ·{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {sajuResult.interpretation.iljuAnimal}
                    </span>
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {sajuResult.interpretation.coreSummary}
                  </p>
                </div>

                {/* Strengths Chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sajuResult.interpretation.personalityStrengths.map((s) => (
                    <span
                      key={s}
                      className="rounded-xl border px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      ✦ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seohwa's 3 Sharp Roast Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {roasts.map((item, idx) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex flex-col justify-between rounded-[20px] border p-5"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="space-y-2.5">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        style={{
                          backgroundColor: 'var(--accent-gold-soft)',
                          color: 'var(--accent-gold)',
                        }}
                      >
                        <Flame className="h-3 w-3" />
                        {item.badge}
                      </span>
                      <h3
                        className="text-base font-bold leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.roast}
                      </p>
                    </div>

                    <div
                      className="mt-4 rounded-xl border p-3 text-xs leading-relaxed"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--accent-gold)',
                      }}
                    >
                      💡 서화의 한 수: {item.warmTip}
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Today's Fortune Strip */}
              <DailyFortuneWidget
                fortune={sajuResult.today}
                userName={sajuResult.input.name}
                onViewDetails={() => goChapter(2)}
              />
            </div>
          )}

          {/* CHAPTER 1: 2장 3D 사주팔자 & 오행 */}
          {chapter === 1 && (
            <div className="space-y-6">
              <FourPillarsBoard
                result={sajuResult}
                pillarOrder={pillarOrder}
                onTogglePillarOrder={onTogglePillarOrder}
                renderPillar={(pillar, index, isDayMaster) => (
                  <PillarRevealCard
                    key={pillar.key}
                    pillar={pillar}
                    index={index}
                    isDayMaster={isDayMaster}
                    onFlip={() => playTap()}
                  />
                )}
              />

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div
                  className="flex items-center justify-center rounded-[22px] border p-4 lg:col-span-5"
                  style={{
                    backgroundColor: 'var(--surface-glass)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <OhaengOrbitalViz
                    elements={sajuResult.elements}
                    yongshin={sajuResult.yongshin.primary}
                    avoidElement={sajuResult.yongshin.avoidElement}
                    selectedElement={selectedElement}
                    onSelectElement={(el) => {
                      playTap();
                      setSelectedElement(el);
                    }}
                  />
                </div>
                <div className="lg:col-span-7">
                  <OhaengBalancePanel
                    result={sajuResult}
                    selectedElement={selectedElement}
                    onSelectElement={(el) => {
                      playTap();
                      setSelectedElement(el);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 2: 3장 연애·재물 & 대운 */}
          {chapter === 2 && (
            <div className="space-y-6">
              <FortuneInsightCards result={sajuResult} />

              <div
                className="rounded-[22px] border p-4 sm:p-5"
                style={{
                  backgroundColor: 'var(--surface-glass)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3
                      className="text-base font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      10년 대운(大運) 파동 그래프
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      파동 위의 시기를 클릭하면 아래에서 그 시기의 상세 운세를 볼 수 있어요
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    현재 만 {currentAge}세 · {sajuResult.daewoonDirection}
                  </span>
                </div>

                <DaewoonTimelineMotion
                  daewoon={sajuResult.daewoon}
                  activeIndex={activeDaewoonIdx}
                  onSelect={(idx) => {
                    playTap();
                    setActiveDaewoonIdx(idx);
                  }}
                  currentAge={currentAge}
                />
              </div>

              <DaewoonExplorer
                result={sajuResult}
                activeDaewoonIndex={activeDaewoonIdx}
                onSelectDaewoon={(idx) => {
                  playTap();
                  setActiveDaewoonIdx(idx);
                }}
                currentAge={currentAge}
              />
            </div>
          )}

          {/* CHAPTER 3: 4장 우리 사이 궁합 */}
          {chapter === 3 && (
            <CompatibilityPanel
              compatibility={compatibility}
              profiles={profiles}
              selectedPersonAId={personAId}
              selectedPersonBId={personBId}
              onSelectPersonA={(id) => {
                playTap();
                onSelectPersonA(id);
              }}
              onSelectPersonB={(id) => {
                playTap();
                onSelectPersonB(id);
              }}
              onCustomInputPersonA={onCustomInputPersonA}
              onCustomInputPersonB={onCustomInputPersonB}
              cities={BIRTH_CITIES}
            />
          )}

          {/* CHAPTER 4: 5장 9:16 바이럴 카드 & 링크 공유 */}
          {chapter === 4 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Live 9:16 Story Card Preview */}
              <div
                className="flex flex-col items-center justify-center rounded-[24px] border p-5 lg:col-span-6"
                style={{
                  backgroundColor: 'var(--surface-glass)',
                  borderColor: 'rgba(229, 190, 109, 0.28)',
                }}
              >
                <div
                  className="mb-3 flex items-center gap-2 text-xs font-semibold"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  인스타 스토리 · 카카오톡 9:16 카드 (1080×1920)
                </div>
                <img
                  src={viralCardDataUrl}
                  alt={`${sajuResult.input.name}님 9:16 사주 요약 카드 미리보기`}
                  className="max-h-[540px] w-auto rounded-2xl border shadow-2xl"
                  style={{ borderColor: 'rgba(229, 190, 109, 0.3)' }}
                />
              </div>

              {/* Viral Share Actions */}
              <div
                className="flex flex-col justify-between gap-5 rounded-[24px] border p-5 sm:p-6 lg:col-span-6"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <SeohwaPortrait
                      expression="warm"
                      size="compact"
                      dominantElement={sajuResult.dominantElement}
                      isSpeaking={isSpeaking}
                    />
                    <div>
                      <h3
                        className="font-serif-kr text-lg font-bold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        저장하고 바로 공유해 봐!
                      </h3>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        인증 잠금도, 결제 유도도 없어. 링크를 받은 친구도 바로 네 사주를 보고 자기 사주·궁합까지 무료로 테스트할 수 있어.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      disabled={downloadingCard}
                      onClick={handleSaveViralCard}
                      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shadow-[0_10px_28px_rgba(229,190,109,0.25)] transition-transform active:scale-[0.98]"
                      style={{
                        backgroundColor: 'var(--accent-gold)',
                        color: '#07080d',
                      }}
                    >
                      <Download className="h-4 w-4" />
                      {downloadingCard
                        ? '고해상도 카드 굽는 중…'
                        : '9:16 스토리 이미지 저장 (PNG)'}
                    </button>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'rgba(229, 190, 109, 0.4)',
                          color: 'var(--accent-gold)',
                        }}
                      >
                        {copiedLink ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copiedLink ? '링크 복사됨!' : '무료 결과 링크 복사'}
                      </button>

                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                        카톡 · SNS 바로 공유
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playTap();
                        onOpenPosterModal();
                      }}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                      상세 아트워크 포스터(SVG / 텍스트 요약) 열기
                    </button>
                  </div>

                  {shareStatus && (
                    <div
                      className="rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed"
                      style={{
                        backgroundColor: 'var(--accent-gold-soft)',
                        borderColor: 'rgba(229, 190, 109, 0.36)',
                        color: 'var(--accent-gold)',
                      }}
                    >
                      {shareStatus}
                    </div>
                  )}
                </div>

                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-t pt-4"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      stopVoice();
                      playTap();
                      onStartNewReading();
                    }}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    다른 사람 사주도 보기
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopVoice();
                      playTap();
                      onReplayOpening();
                    }}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    서화 오프닝 다시 보기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Chapter Step Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {chapter > 0 ? (
              <button
                type="button"
                onClick={() => goChapter((chapter - 1) as ResultChapter)}
                className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold sm:text-sm"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                이전 장
              </button>
            ) : (
              <div />
            )}

            {chapter < 4 && (
              <button
                type="button"
                onClick={() => goChapter((chapter + 1) as ResultChapter)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full px-6 py-3 text-xs font-bold shadow-lg transition-transform active:scale-[0.98] sm:text-sm"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#07080d',
                }}
              >
                <span>
                  {chapter === 0 && '다음 장: 3D 사주팔자 & 오행 비밀'}
                  {chapter === 1 && '다음 장: 연애 · 재물 & 10년 대운'}
                  {chapter === 2 && '다음 장: 우리 사이 궁합 까발리기'}
                  {chapter === 3 && '마지막 장: 9:16 공유 카드 만들기'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
