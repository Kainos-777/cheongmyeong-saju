import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Clock,
  Compass,
  FastForward,
  History,
  MapPin,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useMediaAudio } from '../audio/mediaAudioEngine';
import { BIRTH_CITIES, PRESET_PROFILES } from '../engine';
import { KineticTypography, YinYangLoader } from '../motion';
import type {
  BirthInput,
  CalendarType,
  Gender,
  JasiMode,
} from '../types/saju';
import { SeohwaDialogueCard, SeohwaPortrait } from './SeohwaVisuals';
import {
  FOCUS_TOPIC_META,
  INTRO_BEATS,
  type FocusTopic,
} from './storyCore';
import voiceLines from './voiceLines.json';

// ============================================================================
// 1. Landing Stage
// ============================================================================

export interface LandingStageProps {
  onStartStory: () => void;
  onSkipToInput: () => void;
  onResumeSaved?: () => void;
  savedProfileName?: string;
}

export function LandingStage({
  onStartStory,
  onSkipToInput,
  onResumeSaved,
  savedProfileName,
}: LandingStageProps) {
  const {
    isSpeaking,
    enableExperienceAudio,
    speakClipOrText,
    stopVoice,
    playTap,
    playChime,
  } = useMediaAudio();

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  const handleToggleTeaseVoice = () => {
    if (isSpeaking) {
      stopVoice();
      return;
    }
    speakClipOrText({
      voiceKey: 'landing-tease',
      text: voiceLines['landing-tease'],
      force: true,
    });
  };

  return (
    <section
      aria-label="청명각 오프닝"
      className="mx-auto flex min-h-[calc(100dvh-76px)] w-full max-w-4xl flex-col items-center justify-center px-4 py-6 text-center"
    >
      {/* Hero Living Portrait */}
      <SeohwaPortrait
        expression="mystic"
        size="hero"
        dominantElement="earth"
        isSpeaking={isSpeaking}
      />

      {/* Title & Hook */}
      <div className="mt-2 max-w-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {['100% 무료', '로그인 없음', '1분 팩폭 완독', '9:16 카드 공유'].map(
            (badge) => (
              <span
                key={badge}
                className="rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight"
                style={{
                  backgroundColor: 'rgba(229, 190, 109, 0.1)',
                  borderColor: 'rgba(229, 190, 109, 0.28)',
                  color: 'var(--accent-gold)',
                }}
              >
                {badge}
              </span>
            ),
          )}
        </div>

        <KineticTypography
          text="네가 숨겨둔 여덟 글자, 오늘 밤 다 들켜 볼래?"
          as="h1"
          mode="word"
          highlightWords={['여덟', '들켜']}
          highlightClassName="underline decoration-[var(--accent-gold)] decoration-2 underline-offset-4"
          className="font-serif-kr text-2xl font-bold leading-snug tracking-tight sm:text-4xl"
        />

        <p
          className="mx-auto max-w-lg text-sm leading-relaxed sm:text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          복채도 회원가입도 필요 없어. 월하 여도사{' '}
          <strong style={{ color: 'var(--accent-gold)' }}>서화(瑞花)</strong>가
          정통 천문 만세력으로 풀어주는 촌철살인 기질 팩폭, 3D 사주·오행,
          대운과 궁합 이야기.
        </p>

        {/* Subtle Audio Experience Preview Badge */}
        <div className="flex justify-center pt-0.5">
          <button
            type="button"
            onClick={handleToggleTeaseVoice}
            aria-label="서화 오프닝 보이스 미리 듣기"
            aria-pressed={isSpeaking}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors hover:opacity-95"
            style={{
              backgroundColor: isSpeaking
                ? 'rgba(229, 190, 109, 0.16)'
                : 'rgba(19, 23, 36, 0.72)',
              borderColor: isSpeaking
                ? 'rgba(229, 190, 109, 0.52)'
                : 'rgba(255, 255, 255, 0.12)',
              color: isSpeaking ? 'var(--accent-gold)' : 'var(--text-secondary)',
            }}
          >
            <span>🎵 국악 BGM · 🎙️ 서화 보이스 지원</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: 'rgba(229, 190, 109, 0.14)',
                color: 'var(--accent-gold)',
              }}
            >
              {isSpeaking ? '⏹ 멈춤' : '미리듣기'}
            </span>
          </button>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="mt-6 flex w-full max-w-md flex-col items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            stopVoice();
            enableExperienceAudio();
            playChime();
            onStartStory();
          }}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold shadow-[0_12px_32px_rgba(229,190,109,0.28)] transition-opacity hover:opacity-95 sm:text-base"
          style={{
            backgroundColor: 'var(--accent-gold)',
            color: '#07080d',
          }}
        >
          <Sparkles className="h-4 w-4" />
          서화의 방으로 들어가기
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              stopVoice();
              playTap();
              onSkipToInput();
            }}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--surface-1)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <FastForward className="h-3.5 w-3.5" />
            이야기 건너뛰고 바로 사주 보기
          </button>

          {onResumeSaved && savedProfileName && (
            <button
              type="button"
              onClick={() => {
                stopVoice();
                playTap();
                onResumeSaved();
              }}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--surface-1)',
                borderColor: 'rgba(229, 190, 109, 0.35)',
                color: 'var(--accent-gold)',
              }}
            >
              <History className="h-3.5 w-3.5" />
              {savedProfileName} 다시 보기
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 2. Visual-Novel Story Intro Stage
// ============================================================================

export interface StoryIntroStageProps {
  focusTopic: FocusTopic;
  onSelectFocusTopic: (topic: FocusTopic) => void;
  onComplete: () => void;
  onSkip: () => void;
}

export function StoryIntroStage({
  focusTopic,
  onSelectFocusTopic,
  onComplete,
  onSkip,
}: StoryIntroStageProps) {
  const [beatIdx, setBeatIdx] = useState(0);
  const [topicPicked, setTopicPicked] = useState(false);

  const {
    voiceEnabled,
    isSpeaking,
    speakClipOrText,
    stopVoice,
    playTap,
    playChime,
  } = useMediaAudio();

  const spokenSignatureRef = useRef<string | null>(null);

  const currentBeat = INTRO_BEATS[beatIdx] ?? INTRO_BEATS[0];
  const isChoiceBeat = Boolean(currentBeat.isChoice) && !topicPicked;

  const dialogueText =
    currentBeat.isChoice && topicPicked
      ? FOCUS_TOPIC_META[focusTopic].seohwaReply
      : currentBeat.text;

  const activeVoiceKey =
    currentBeat.isChoice && topicPicked
      ? FOCUS_TOPIC_META[focusTopic].voiceKey
      : currentBeat.voiceKey;

  const dialogueMood =
    currentBeat.isChoice && topicPicked
      ? `${FOCUS_TOPIC_META[focusTopic].tag} 선택 완료`
      : currentBeat.moodLabel;

  useEffect(() => {
    if (!voiceEnabled) {
      spokenSignatureRef.current = null;
      return;
    }
    const sig = `${beatIdx}:${activeVoiceKey ?? dialogueText}`;
    if (spokenSignatureRef.current === sig) return;
    spokenSignatureRef.current = sig;
    speakClipOrText({
      voiceKey: activeVoiceKey,
      text: dialogueText,
    });
  }, [voiceEnabled, beatIdx, activeVoiceKey, dialogueText, speakClipOrText]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  const handleAdvance = () => {
    if (isChoiceBeat) return;
    playTap();
    if (beatIdx < INTRO_BEATS.length - 1) {
      setBeatIdx((prev) => prev + 1);
    } else {
      stopVoice();
      onComplete();
    }
  };

  const handlePickTopic = (topic: FocusTopic) => {
    playChime();
    onSelectFocusTopic(topic);
    setTopicPicked(true);
    if (voiceEnabled) {
      const meta = FOCUS_TOPIC_META[topic];
      spokenSignatureRef.current = `${beatIdx}:${meta.voiceKey}`;
      speakClipOrText({
        voiceKey: meta.voiceKey,
        text: meta.seohwaReply,
      });
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopVoice();
      return;
    }
    speakClipOrText({
      voiceKey: activeVoiceKey,
      text: dialogueText,
      force: true,
    });
  };

  return (
    <section
      aria-label="서화의 도입 이야기"
      className="mx-auto flex min-h-[calc(100dvh-76px)] w-full max-w-3xl flex-col justify-between px-4 py-4 sm:py-6"
    >
      {/* Top Progress + Skip */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-label="스토리 진행도">
          {INTRO_BEATS.map((beat, idx) => (
            <span
              key={beat.id}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: idx === beatIdx ? '24px' : '8px',
                backgroundColor:
                  idx <= beatIdx
                    ? 'var(--accent-gold)'
                    : 'rgba(255,255,255,0.16)',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            stopVoice();
            playTap();
            onSkip();
          }}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--surface-1)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          이야기 건너뛰기
          <FastForward className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Centered Portrait Stage */}
      <div
        onClick={handleAdvance}
        className={`flex flex-1 flex-col items-center justify-center py-2 ${
          isChoiceBeat ? '' : 'cursor-pointer'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentBeat.id}-${topicPicked ? 'picked' : 'ask'}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <SeohwaPortrait
              expression={
                currentBeat.isChoice && topicPicked
                  ? 'smirk'
                  : currentBeat.expression
              }
              size="stage"
              dominantElement="earth"
              isSpeaking={isSpeaking}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dialogue Box */}
      <SeohwaDialogueCard
        expression={
          currentBeat.isChoice && topicPicked
            ? 'smirk'
            : currentBeat.expression
        }
        moodLabel={dialogueMood}
        text={dialogueText}
        typewriter
        showContinueCue={!isChoiceBeat}
        onAdvance={isChoiceBeat ? undefined : handleAdvance}
        showPortrait={false}
        isSpeaking={isSpeaking}
        onToggleSpeak={handleToggleSpeak}
      >
        {isChoiceBeat && (
          <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
            {(Object.keys(FOCUS_TOPIC_META) as FocusTopic[]).map((topicKey) => {
              const meta = FOCUS_TOPIC_META[topicKey];
              return (
                <button
                  key={topicKey}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePickTopic(topicKey);
                  }}
                  className="flex min-h-[46px] items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all hover:scale-[1.01] sm:text-sm"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'rgba(229, 190, 109, 0.35)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>
                    {meta.emoji} {meta.label}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--accent-gold)' }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </SeohwaDialogueCard>
    </section>
  );
}

// ============================================================================
// 3. Conversational Birth Input Stage
// ============================================================================

const SIJIN_OPTIONS = [
  { key: 'ja', hangul: '자', hanja: '子', range: '23:30–01:29', hour: 0, minute: 0 },
  { key: 'chuk', hangul: '축', hanja: '丑', range: '01:30–03:29', hour: 2, minute: 0 },
  { key: 'in', hangul: '인', hanja: '寅', range: '03:30–05:29', hour: 4, minute: 0 },
  { key: 'myo', hangul: '묘', hanja: '卯', range: '05:30–07:29', hour: 6, minute: 0 },
  { key: 'jin', hangul: '진', hanja: '辰', range: '07:30–09:29', hour: 8, minute: 0 },
  { key: 'sa', hangul: '사', hanja: '巳', range: '09:30–11:29', hour: 10, minute: 0 },
  { key: 'o', hangul: '오', hanja: '午', range: '11:30–13:29', hour: 12, minute: 0 },
  { key: 'mi', hangul: '미', hanja: '未', range: '13:30–15:29', hour: 14, minute: 0 },
  { key: 'sin', hangul: '신', hanja: '申', range: '15:30–17:29', hour: 16, minute: 0 },
  { key: 'yu', hangul: '유', hanja: '酉', range: '17:30–19:29', hour: 18, minute: 0 },
  { key: 'sul', hangul: '술', hanja: '戌', range: '19:30–21:29', hour: 20, minute: 0 },
  { key: 'hae', hangul: '해', hanja: '亥', range: '21:30–23:29', hour: 22, minute: 0 },
];

function getDaysInSolarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export interface ConversationalInputStageProps {
  initialValue?: BirthInput;
  onSubmit: (input: BirthInput) => void;
  onBackToStory: () => void;
}

export function ConversationalInputStage({
  initialValue,
  onSubmit,
  onBackToStory,
}: ConversationalInputStageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const {
    voiceEnabled,
    isSpeaking,
    speakClipOrText,
    stopVoice,
    playTap,
    playChime,
  } = useMediaAudio();

  const [form, setForm] = useState<BirthInput>(() => ({
    name: initialValue?.name && !initialValue.id?.startsWith('preset-')
      ? initialValue.name
      : '',
    gender: initialValue?.gender ?? 'female',
    calendarType: initialValue?.calendarType ?? 'solar',
    isLeapMonth: Boolean(initialValue?.isLeapMonth),
    year: initialValue?.year ?? 1998,
    month: initialValue?.month ?? 5,
    day: initialValue?.day ?? 14,
    hour: initialValue?.hour ?? 10,
    minute: initialValue?.minute ?? 30,
    unknownTime: Boolean(initialValue?.unknownTime),
    cityId: initialValue?.cityId ?? 'seoul',
    useTrueSolarTime: initialValue?.useTrueSolarTime ?? true,
    useEquationOfTime: initialValue?.useEquationOfTime ?? false,
    jasiMode: initialValue?.jasiMode ?? 'yajasi',
  }));

  const inputVoiceKey = step === 1 ? 'input-1' : 'input-2';
  const inputDialogueText =
    step === 1 ? voiceLines['input-1'] : voiceLines['input-2'];

  useEffect(() => {
    if (!voiceEnabled) return;
    speakClipOrText({
      voiceKey: inputVoiceKey,
      text: inputDialogueText,
    });
  }, [voiceEnabled, inputVoiceKey, inputDialogueText, speakClipOrText]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  const handleToggleInputSpeak = () => {
    if (isSpeaking) {
      stopVoice();
      return;
    }
    speakClipOrText({
      voiceKey: inputVoiceKey,
      text: inputDialogueText,
      force: true,
    });
  };

  const maxDay =
    form.calendarType === 'lunar'
      ? 30
      : getDaysInSolarMonth(form.year || 2000, form.month || 1);

  const timeStr = `${String(form.hour).padStart(2, '0')}:${String(
    form.minute,
  ).padStart(2, '0')}`;

  const activeCity = useMemo(
    () => BIRTH_CITIES.find((c) => c.id === form.cityId) ?? BIRTH_CITIES[0],
    [form.cityId],
  );

  const cityTstOffset = useMemo(() => {
    const stdMeridian = (activeCity.utcOffsetMinutes / 60) * 15;
    return Math.round((activeCity.longitude - stdMeridian) * 4);
  }, [activeCity]);

  const activeSijinKey = useMemo(() => {
    const total = form.hour * 60 + form.minute;
    if (total >= 23 * 60 + 30 || total < 90) return 'ja';
    if (total < 210) return 'chuk';
    if (total < 330) return 'in';
    if (total < 450) return 'myo';
    if (total < 570) return 'jin';
    if (total < 690) return 'sa';
    if (total < 810) return 'o';
    if (total < 930) return 'mi';
    if (total < 1050) return 'sin';
    if (total < 1170) return 'yu';
    if (total < 1290) return 'sul';
    return 'hae';
  }, [form.hour, form.minute]);

  const handleQuickDemo = () => {
    stopVoice();
    playChime();
    const demo = PRESET_PROFILES[0];
    onSubmit({
      ...demo,
      id: `user-${Date.now()}`,
      name: form.name.trim() || demo.name,
    });
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      playTap();
      setStep(2);
      return;
    }
    stopVoice();
    playChime();
    onSubmit({
      ...form,
      name: form.name.trim() || '밤의 여행자',
      year: Math.min(2100, Math.max(1900, Math.round(form.year || 2000))),
      day: Math.min(maxDay, Math.max(1, form.day)),
    });
  };

  return (
    <section
      aria-label="사주 명식 대화형 입력"
      className="mx-auto flex min-h-[calc(100dvh-76px)] w-full max-w-2xl flex-col justify-center px-4 py-6"
    >
      <SeohwaDialogueCard
        expression="focus"
        moodLabel={`명식 입력 · ${step}/2단계`}
        text={inputDialogueText}
        isSpeaking={isSpeaking}
        onToggleSpeak={handleToggleInputSpeak}
        className="mb-5"
      />

      <form
        onSubmit={handleFormSubmit}
        className="space-y-5 rounded-[24px] border p-5 shadow-2xl sm:p-6"
        style={{
          backgroundColor: 'var(--surface-glass)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {step === 1 ? (
          <motion.div
            key="input-step-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="story-birth-name"
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                <UserRound className="h-3.5 w-3.5" />
                이름 또는 닉네임
              </label>
              <input
                id="story-birth-name"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="예: 서연 (비워두면 '밤의 여행자'로 풀어줘요)"
                className="min-h-[48px] w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent-gold)]"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="space-y-2">
              <span
                className="block text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                성별 (10년 인생 계절 ‘대운’이 순행/역행하는 기준)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    { id: 'female', label: '여성 (坤命)' },
                    { id: 'male', label: '남성 (乾命)' },
                  ] as { id: Gender; label: string }[]
                ).map((g) => {
                  const active = form.gender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        playTap();
                        setForm((prev) => ({ ...prev, gender: g.id }));
                      }}
                      aria-pressed={active}
                      className="min-h-[48px] rounded-2xl border px-4 py-3 text-sm font-bold transition-colors"
                      style={{
                        backgroundColor: active
                          ? 'var(--accent-gold-soft)'
                          : 'var(--surface-1)',
                        borderColor: active
                          ? 'var(--accent-gold)'
                          : 'var(--border-subtle)',
                        color: active
                          ? 'var(--accent-gold)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="min-h-[44px] rounded-full border px-4 py-2 text-xs font-semibold transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                ⚡ 예시 사주로 먼저 체험하기
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopVoice();
                    playTap();
                    onBackToStory();
                  }}
                  className="min-h-[46px] rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg sm:flex-none"
                  style={{
                    backgroundColor: 'var(--accent-gold)',
                    color: '#07080d',
                  }}
                >
                  생년월일시 입력하기
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="input-step-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Calendar Switch + Leap Month */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Calendar className="h-3.5 w-3.5" />
                생년월일
              </span>
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'solar', label: '양력' },
                    { id: 'lunar', label: '음력' },
                  ] as { id: CalendarType; label: string }[]
                ).map((c) => {
                  const active = form.calendarType === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        playTap();
                        setForm((prev) => ({
                          ...prev,
                          calendarType: c.id,
                          isLeapMonth: c.id === 'solar' ? false : prev.isLeapMonth,
                        }));
                      }}
                      className="min-h-[36px] rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors"
                      style={{
                        backgroundColor: active
                          ? 'var(--accent-gold-soft)'
                          : 'var(--surface-1)',
                        borderColor: active
                          ? 'var(--accent-gold)'
                          : 'var(--border-subtle)',
                        color: active
                          ? 'var(--accent-gold)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
                {form.calendarType === 'lunar' && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(form.isLeapMonth)}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        isLeapMonth: !prev.isLeapMonth,
                      }))
                    }
                    className="min-h-[36px] rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: form.isLeapMonth
                        ? 'var(--accent-gold-soft)'
                        : 'var(--surface-1)',
                      borderColor: form.isLeapMonth
                        ? 'var(--accent-gold)'
                        : 'var(--border-subtle)',
                      color: form.isLeapMonth
                        ? 'var(--accent-gold)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    윤달 {form.isLeapMonth ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>
            </div>

            {/* Year / Month / Day */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label
                  htmlFor="story-birth-year"
                  className="mb-1 block text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  출생 연도
                </label>
                <input
                  id="story-birth-year"
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.year}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, year: Number(e.target.value) }))
                  }
                  className="min-h-[44px] w-full rounded-xl border px-3 py-2 font-mono text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="story-birth-month"
                  className="mb-1 block text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  월
                </label>
                <select
                  id="story-birth-month"
                  value={form.month}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    const nextMax =
                      form.calendarType === 'lunar'
                        ? 30
                        : getDaysInSolarMonth(form.year || 2000, m);
                    setForm((prev) => ({
                      ...prev,
                      month: m,
                      day: Math.min(prev.day, nextMax),
                    }));
                  }}
                  className="min-h-[44px] w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="story-birth-day"
                  className="mb-1 block text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  일
                </label>
                <select
                  id="story-birth-day"
                  value={Math.min(form.day, maxDay)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, day: Number(e.target.value) }))
                  }
                  className="min-h-[44px] w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {Array.from({ length: maxDay }, (_, idx) => idx + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}일
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time + 12 Sijin */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="story-birth-time"
                  className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Clock className="h-3.5 w-3.5" />
                  출생 시각 & 12시진
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(form.unknownTime)}
                  onClick={() => {
                    playTap();
                    setForm((prev) => ({
                      ...prev,
                      unknownTime: !prev.unknownTime,
                    }));
                  }}
                  className="min-h-[36px] rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: form.unknownTime
                      ? 'var(--accent-gold-soft)'
                      : 'var(--surface-1)',
                    borderColor: form.unknownTime
                      ? 'var(--accent-gold)'
                      : 'var(--border-subtle)',
                    color: form.unknownTime
                      ? 'var(--accent-gold)'
                      : 'var(--text-secondary)',
                  }}
                >
                  출생시간 모름 {form.unknownTime ? '✓' : ''}
                </button>
              </div>

              <p
                className="rounded-xl border px-3 py-2 text-[11px] leading-relaxed"
                style={{
                  backgroundColor: 'rgba(229, 190, 109, 0.06)',
                  borderColor: 'rgba(229, 190, 109, 0.2)',
                  color: 'var(--text-secondary)',
                }}
              >
                💡 <strong style={{ color: 'var(--accent-gold)' }}>12시진이란?</strong>{' '}
                하루 24시간을 두 시간씩 12구간으로 나눈 전통 시간표예요. 정확한 분을 모르더라도 대략적인 시간대 버튼만 콕 눌러주면 돼요.
              </p>

              <div className={form.unknownTime ? 'pointer-events-none opacity-45' : ''}>
                <div className="mb-2 flex items-center gap-3">
                  <input
                    id="story-birth-time"
                    type="time"
                    value={timeStr}
                    disabled={Boolean(form.unknownTime)}
                    onChange={(e) => {
                      const [hStr, mStr] = e.target.value.split(':');
                      const h = Number(hStr);
                      const m = Number(mStr);
                      if (!Number.isNaN(h) && !Number.isNaN(m)) {
                        setForm((prev) => ({ ...prev, hour: h, minute: m }));
                      }
                    }}
                    className="min-h-[42px] rounded-xl border px-3.5 py-2 font-mono text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    또는 12시진 버튼으로 빠르게 선택
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {SIJIN_OPTIONS.map((s) => {
                    const active = !form.unknownTime && activeSijinKey === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        disabled={Boolean(form.unknownTime)}
                        onClick={() => {
                          playTap();
                          setForm((prev) => ({
                            ...prev,
                            hour: s.hour,
                            minute: s.minute,
                            unknownTime: false,
                          }));
                        }}
                        className="flex min-h-[42px] flex-col items-center justify-center rounded-xl border px-1 py-1 text-center transition-colors"
                        style={{
                          backgroundColor: active
                            ? 'var(--accent-gold-soft)'
                            : 'var(--surface-1)',
                          borderColor: active
                            ? 'var(--accent-gold)'
                            : 'var(--border-subtle)',
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: active
                              ? 'var(--accent-gold)'
                              : 'var(--text-primary)',
                          }}
                        >
                          {s.hangul}시{' '}
                          <span className="font-serif font-normal">{s.hanja}</span>
                        </span>
                        <span
                          className="font-mono text-[9px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {s.range.slice(0, 5)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Collapsible Precision Astronomy Options */}
            <div
              className="overflow-hidden rounded-2xl border"
              style={{
                backgroundColor: 'var(--surface-1)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <button
                type="button"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((prev) => !prev)}
                className="flex min-h-[44px] w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-xs font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="flex flex-wrap items-center gap-1.5">
                  <Compass
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--accent-gold)' }}
                  />
                  <span>출생 도시 & 진태양시 정밀 옵션</span>
                  <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                    ({activeCity.nameKo} ·{' '}
                    {form.useTrueSolarTime ? `${cityTstOffset}분 보정` : '보정 OFF'})
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    advancedOpen ? 'rotate-180' : ''
                  }`}
                  style={{ color: 'var(--text-muted)' }}
                />
              </button>

              {advancedOpen && (
                <div
                  className="space-y-3 border-t p-4 text-xs"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <p
                    className="rounded-xl border px-3 py-2 text-[11px] leading-relaxed"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    ☀️ <strong style={{ color: 'var(--accent-gold)' }}>진태양시란?</strong>{' '}
                    한국 시계는 동경 135° 표준시를 써서 실제 태양이 머리 위에 뜨는 하늘 시간과 서울 기준 약 32분 차이가 나요. 태어난 도시의 진짜 태양 위치로 시주를 맞춰 더 정교하게 풀어드려요.
                  </p>

                  <div>
                    <label
                      htmlFor="story-birth-city"
                      className="mb-1 flex items-center gap-1.5 font-semibold"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      출생 도시
                    </label>
                    <select
                      id="story-birth-city"
                      value={form.cityId}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, cityId: e.target.value }))
                      }
                      className="min-h-[40px] w-full rounded-xl border px-3 py-2 text-xs outline-none"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {BIRTH_CITIES.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.nameKo} ({city.country})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        진태양시 보정
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        경도 시차 보정 ({activeCity.nameKo}{' '}
                        {cityTstOffset >= 0 ? `+${cityTstOffset}` : cityTstOffset}분)
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-label="진태양시 보정"
                      aria-checked={form.useTrueSolarTime}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          useTrueSolarTime: !prev.useTrueSolarTime,
                        }))
                      }
                      className="min-h-[36px] rounded-full px-3.5 py-1 font-semibold"
                      style={{
                        backgroundColor: form.useTrueSolarTime
                          ? 'var(--accent-gold)'
                          : 'var(--surface-2)',
                        color: form.useTrueSolarTime
                          ? '#07080d'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {form.useTrueSolarTime ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: 'yajasi', label: '야자시 (당일 일주)' },
                          { id: 'jojasi', label: '조자시 (익일 일주)' },
                        ] as { id: JasiMode; label: string }[]
                      ).map((mode) => {
                        const active = form.jasiMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({ ...prev, jasiMode: mode.id }))
                            }
                            className="min-h-[38px] rounded-xl border px-3 py-1.5 font-semibold"
                            style={{
                              backgroundColor: active
                                ? 'var(--accent-gold-soft)'
                                : 'var(--surface-2)',
                              borderColor: active
                                ? 'var(--accent-gold)'
                                : 'var(--border-subtle)',
                              color: active
                                ? 'var(--accent-gold)'
                                : 'var(--text-secondary)',
                            }}
                          >
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      밤 23:30~01:29 사이 출생자를 위한 기준이에요. 보통은 오늘 날짜를 유지하는 ‘야자시’를 써요.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setStep(1);
                }}
                className="min-h-[46px] rounded-full border px-4 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                ← 이름·성별
              </button>

              <button
                type="submit"
                className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-[0_10px_26px_rgba(229,190,109,0.28)] sm:flex-none"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#07080d',
                }}
              >
                <Sparkles className="h-4 w-4" />
                여덟 글자 펼쳐 보기
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </section>
  );
}

// ============================================================================
// 4. Ceremonial Ritual Loading Stage
// ============================================================================

const RITUAL_STEPS = [
  '태어난 순간의 태양 황경과 절입(節入)을 맞추는 중…',
  '진태양시와 지장간 속 숨은 기운을 불러오는 중…',
  '네 여덟 글자의 진짜 성격과 대운 물결을 펼치는 중…',
];

export interface RitualLoadingStageProps {
  userName: string;
  onComplete: () => void;
}

export function RitualLoadingStage({
  userName,
  onComplete,
}: RitualLoadingStageProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const {
    voiceEnabled,
    isSpeaking,
    speakClipOrText,
    stopVoice,
    playRitual,
    playReveal,
  } = useMediaAudio();

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    playRitual();
    const t1 = window.setTimeout(() => setStepIdx(1), 700);
    const t2 = window.setTimeout(() => setStepIdx(2), 1400);
    const doneTimer = window.setTimeout(() => {
      playReveal();
      onCompleteRef.current();
    }, 2150);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(doneTimer);
      stopVoice();
    };
  }, [playRitual, playReveal, stopVoice]);

  useEffect(() => {
    if (!voiceEnabled) return;
    speakClipOrText({
      voiceKey: 'ritual-1',
      text: voiceLines['ritual-1'],
    });
  }, [voiceEnabled, speakClipOrText]);

  return (
    <section
      aria-label="사주 명식 개방 의식"
      className="mx-auto flex min-h-[calc(100dvh-76px)] w-full max-w-xl flex-col items-center justify-center px-4 py-10 text-center"
    >
      <div className="relative flex flex-col items-center">
        <SeohwaPortrait
          expression="focus"
          size="card"
          dominantElement="earth"
          isSpeaking={isSpeaking}
        />
        <div className="-mt-6">
          <YinYangLoader
            size={88}
            label={`${userName || '여행자'}님의 천명 해독 중`}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={stepIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-5 font-serif-kr text-base font-semibold sm:text-lg"
          style={{ color: 'var(--accent-gold)' }}
        >
          {RITUAL_STEPS[stepIdx]}
        </motion.p>
      </AnimatePresence>
    </section>
  );
}
