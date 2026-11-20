import { useCallback, useEffect, useState } from 'react';
import type {
  BirthInput,
  CompatibilityResult,
  ElementKey,
  Pillar,
  SajuResult,
} from '../types/saju';

// ============================================================================
// 1. Story Renewal Types
// ============================================================================

export type AppStage = 'landing' | 'story' | 'input' | 'ritual' | 'result';
export type SeohwaExpression = 'mystic' | 'smirk' | 'focus' | 'warm';
export type FocusTopic = 'love' | 'wealth' | 'roast' | 'luck';
export type ResultChapter = 0 | 1 | 2 | 3 | 4;

export interface StoryBeat {
  id: string;
  expression: SeohwaExpression;
  moodLabel: string;
  text: string;
  isChoice?: boolean;
}

export interface RoastItem {
  id: string;
  badge: string;
  title: string;
  roast: string;
  warmTip: string;
}

export interface ChapterScript {
  chapter: ResultChapter;
  navLabel: string;
  title: string;
  subtitle: string;
  expression: SeohwaExpression;
  moodLabel: string;
  headline: string;
  dialogue: string;
}

export interface SharedPayload {
  input: BirthInput;
  focusTopic?: FocusTopic;
}

// ============================================================================
// 2. Zero-Login URL Share Codec (?r=...)
// ============================================================================

interface CompactPayload {
  v: 1;
  n: string;
  g: 'm' | 'f';
  c: 's' | 'l';
  lp?: 1;
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  u?: 1;
  ct: string;
  tst: 0 | 1;
  eot?: 0 | 1;
  j: 'y' | 'j';
  ft?: FocusTopic;
}

const B64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const trip = (b0 << 16) | (b1 << 8) | b2;
    out += B64_ALPHABET[(trip >> 18) & 0x3f];
    out += B64_ALPHABET[(trip >> 12) & 0x3f];
    if (i + 1 < bytes.length) out += B64_ALPHABET[(trip >> 6) & 0x3f];
    if (i + 2 < bytes.length) out += B64_ALPHABET[trip & 0x3f];
  }
  return out.replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlToBytes(token: string): Uint8Array | null {
  if (!token || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const mod = b64.length % 4;
  if (mod === 1) return null;
  const padded = mod === 0 ? b64 : b64 + '='.repeat(4 - mod);

  const out: number[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    const c0 = B64_ALPHABET.indexOf(padded[i]);
    const c1 = B64_ALPHABET.indexOf(padded[i + 1]);
    const c2 = padded[i + 2] === '=' ? -1 : B64_ALPHABET.indexOf(padded[i + 2]);
    const c3 = padded[i + 3] === '=' ? -1 : B64_ALPHABET.indexOf(padded[i + 3]);
    if (c0 < 0 || c1 < 0 || (padded[i + 2] !== '=' && c2 < 0) || (padded[i + 3] !== '=' && c3 < 0)) {
      return null;
    }
    out.push((c0 << 2) | (c1 >> 4));
    if (c2 >= 0) out.push(((c1 & 0x0f) << 4) | (c2 >> 2));
    if (c3 >= 0) out.push(((c2 & 0x03) << 6) | c3);
  }
  return new Uint8Array(out);
}

export function encodeSharePayload(
  input: BirthInput,
  focusTopic: FocusTopic = 'roast',
): string {
  const compact: CompactPayload = {
    v: 1,
    n: (input.name || '익명').slice(0, 24),
    g: input.gender === 'male' ? 'm' : 'f',
    c: input.calendarType === 'lunar' ? 'l' : 's',
    y: Math.min(2100, Math.max(1900, Math.round(input.year))),
    mo: Math.min(12, Math.max(1, Math.round(input.month))),
    d: Math.min(31, Math.max(1, Math.round(input.day))),
    h: Math.min(23, Math.max(0, Math.round(input.hour))),
    mi: Math.min(59, Math.max(0, Math.round(input.minute))),
    ct: input.cityId || 'seoul',
    tst: input.useTrueSolarTime ? 1 : 0,
    j: input.jasiMode === 'jojasi' ? 'j' : 'y',
    ft: focusTopic,
  };
  if (input.isLeapMonth) compact.lp = 1;
  if (input.unknownTime) compact.u = 1;
  if (input.useEquationOfTime !== undefined) {
    compact.eot = input.useEquationOfTime ? 1 : 0;
  }

  const json = JSON.stringify(compact);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

export function decodeSharePayload(token: string): SharedPayload | null {
  try {
    const bytes = base64UrlToBytes(token.trim());
    if (!bytes) return null;
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Partial<CompactPayload>;
    if (!parsed || parsed.v !== 1) return null;
    if (
      typeof parsed.y !== 'number' ||
      typeof parsed.mo !== 'number' ||
      typeof parsed.d !== 'number' ||
      typeof parsed.h !== 'number' ||
      typeof parsed.mi !== 'number'
    ) {
      return null;
    }
    if (
      parsed.y < 1900 ||
      parsed.y > 2100 ||
      parsed.mo < 1 ||
      parsed.mo > 12 ||
      parsed.d < 1 ||
      parsed.d > 31 ||
      parsed.h < 0 ||
      parsed.h > 23 ||
      parsed.mi < 0 ||
      parsed.mi > 59
    ) {
      return null;
    }

    const validFocus: FocusTopic[] = ['love', 'wealth', 'roast', 'luck'];
    const focusTopic =
      parsed.ft && validFocus.includes(parsed.ft) ? parsed.ft : 'roast';

    const input: BirthInput = {
      id: `shared-${token.slice(0, 10)}`,
      name:
        typeof parsed.n === 'string' && parsed.n.trim().length > 0
          ? parsed.n.trim().slice(0, 24)
          : '공유된 명식',
      gender: parsed.g === 'm' ? 'male' : 'female',
      calendarType: parsed.c === 'l' ? 'lunar' : 'solar',
      isLeapMonth: parsed.lp === 1,
      year: Math.round(parsed.y),
      month: Math.round(parsed.mo),
      day: Math.round(parsed.d),
      hour: Math.round(parsed.h),
      minute: Math.round(parsed.mi),
      unknownTime: parsed.u === 1,
      cityId: typeof parsed.ct === 'string' && parsed.ct ? parsed.ct : 'seoul',
      useTrueSolarTime: parsed.tst !== 0,
      useEquationOfTime: parsed.eot === 1,
      jasiMode: parsed.j === 'j' ? 'jojasi' : 'yajasi',
    };
    return { input, focusTopic };
  } catch {
    return null;
  }
}

export function buildShareUrl(
  input: BirthInput,
  focusTopic: FocusTopic = 'roast',
  baseUrl?: string,
): string {
  const token = encodeSharePayload(input, focusTopic);
  const originAndPath =
    baseUrl ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://cheongmyeong-saju.vercel.app/');
  const url = new URL(originAndPath);
  url.searchParams.set('r', token);
  return url.toString();
}

export function readSharedFromLocation(): SharedPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('r');
    if (!token) return null;
    return decodeSharePayload(token);
  } catch {
    return null;
  }
}

// ============================================================================
// 3. Zero-Cost Web Audio API Synthesizer (BGM + SFX)
// ============================================================================

const SOUND_STORAGE_KEY = 'cheongmyeong:sound-enabled:v1';
const PENTATONIC_HZ = [293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 659.25];

class SeohwaSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private bgmTimer: number | null = null;
  private step = 0;
  private listeners = new Set<(enabled: boolean) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(SOUND_STORAGE_KEY);
        this.enabled = saved === 'true';
      } catch {
        this.enabled = false;
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.ctx = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public subscribe(fn: (enabled: boolean) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  public setEnabled(next: boolean): void {
    this.enabled = next;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
    }
    if (next) {
      this.startAmbient();
      this.playChime();
    } else {
      this.stopAmbient();
    }
    this.notify();
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  public startAmbient(): void {
    if (!this.enabled || typeof window === 'undefined') return;
    if (this.bgmTimer !== null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const triggerAmbientNote = () => {
      if (!this.enabled) return;
      const audioCtx = this.ensureContext();
      if (!audioCtx || audioCtx.state !== 'running') return;
      const pattern = [0, 2, 4, 3, 5, 2, 1, 4];
      const freq = PENTATONIC_HZ[pattern[this.step % pattern.length]];
      this.step += 1;
      this.playTone(freq, 2.4, 0.032, 'sine', 950);
      if (this.step % 4 === 0) {
        this.playTone(freq * 0.5, 3.6, 0.024, 'triangle', 480);
      }
    };

    triggerAmbientNote();
    this.bgmTimer = window.setInterval(triggerAmbientNote, 2100);
  }

  public stopAmbient(): void {
    if (this.bgmTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private playTone(
    freq: number,
    durationSec: number,
    peakGain: number,
    type: OscillatorType = 'sine',
    lowpassHz = 1800,
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(lowpassHz, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec + 0.05);
    } catch {
      // Ignore Web Audio errors in headless environments
    }
  }

  public playTap(): void {
    if (!this.enabled) return;
    this.playTone(520, 0.09, 0.035, 'triangle', 1200);
  }

  public playChime(): void {
    if (!this.enabled) return;
    this.playTone(587.33, 0.7, 0.045, 'sine', 2200);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (this.enabled) this.playTone(880, 0.9, 0.03, 'sine', 2400);
      }, 95);
    }
  }

  public playRitual(): void {
    if (!this.enabled) return;
    this.playTone(220, 2.2, 0.055, 'sine', 900);
    this.playTone(440, 2.0, 0.032, 'triangle', 1400);
  }

  public playReveal(): void {
    if (!this.enabled) return;
    [392.0, 493.88, 587.33, 783.99].forEach((freq, idx) => {
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          if (this.enabled) this.playTone(freq, 1.1, 0.036, 'sine', 2400);
        }, idx * 85);
      }
    });
  }
}

export const soundEngine = new SeohwaSoundEngine();

export function useSoundEngine() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() =>
    soundEngine.isEnabled(),
  );

  useEffect(() => {
    const unsub = soundEngine.subscribe(setSoundEnabled);
    if (soundEngine.isEnabled()) {
      soundEngine.startAmbient();
    }
    return () => {
      unsub();
    };
  }, []);

  const toggleSound = useCallback(() => {
    return soundEngine.toggle();
  }, []);

  const enableSound = useCallback(() => {
    soundEngine.setEnabled(true);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    enableSound,
    playTap: () => soundEngine.playTap(),
    playChime: () => soundEngine.playChime(),
    playRitual: () => soundEngine.playRitual(),
    playReveal: () => soundEngine.playReveal(),
  };
}

// ============================================================================
// 4. Seohwa (서화 · 瑞花) Script Engine
// ============================================================================

export const FOCUS_TOPIC_META: Record<
  FocusTopic,
  {
    label: string;
    emoji: string;
    tag: string;
    seohwaReply: string;
  }
> = {
  love: {
    label: '연애 · 인간관계 팩트체크',
    emoji: '💘',
    tag: '도화·연애운',
    seohwaReply:
      '좋아. 남들 앞에선 괜찮은 척 웃다가 혼자 밤에 이불 걷어차는 연애 패턴까지, 내가 깔끔하게 짚어줄게.',
  },
  wealth: {
    label: '재물 · 일복 · 커리어 포텐',
    emoji: '💰',
    tag: '재물·일복',
    seohwaReply:
      '현실적이네. 돈이 들어오는 길목이랑, 열심히 일하고도 남 좋은 일만 시키는 구멍까지 같이 보자.',
  },
  roast: {
    label: '내 진짜 성격 순살 팩폭',
    emoji: '🔥',
    tag: '기질 팩폭',
    seohwaReply:
      '담력이 꽤 좋은데? 겉으론 멀쩡한 척해도 속으로 무슨 생각 하고 사는지 여덟 글자는 거짓말 못 해.',
  },
  luck: {
    label: '올해·향후 10년 대운 흐름',
    emoji: '✨',
    tag: '대운·타이밍',
    seohwaReply:
      '때를 읽는 눈이 있구나. 지금 밀고 나갈 타이밍인지, 웅크렸다 한 번에 터뜨릴 때인지 바로 펼쳐줄게.',
  },
};

export const INTRO_BEATS: StoryBeat[] = [
  {
    id: 'beat-1',
    expression: 'mystic',
    moodLabel: '밤의 서재 · 첫인사',
    text: '어머, 이 야심한 밤에 청명각 문턱을 넘다니. 남들 다 자는 시간에 네 명식(命式)이 유독 시끄럽게 반짝이길래 기다리고 있었어.',
  },
  {
    id: 'beat-2',
    expression: 'smirk',
    moodLabel: '서화의 한 수',
    text: '나는 서화(瑞花). 괜히 "다 잘될 거예요~" 같은 뻔한 덕담이나 늘어놓진 않아. 복채도 로그인도 필요 없으니, 네 사주가 숨겨둔 진짜 민낯만 딱 들켜 보자고.',
  },
  {
    id: 'beat-3',
    expression: 'focus',
    moodLabel: '오늘 밤의 화두',
    text: '본격적으로 여덟 글자를 펼쳐보기 전에— 오늘 밤 네 머릿속을 제일 복잡하게 만드는 게 뭔지부터 하나 골라 볼래?',
    isChoice: true,
  },
  {
    id: 'beat-4',
    expression: 'warm',
    moodLabel: '명식 개방 준비',
    text: '이제 네가 태어난 날의 별자리와 바람을 불러올 차례야. 이름과 생년월일만 알려주면, 1분 안에 네 여덟 글자를 낱낱이 풀어줄게.',
  },
];

const ELEMENT_KO: Record<ElementKey, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

const ELEMENT_ROAST: Record<ElementKey, { excess: string; lack: string }> = {
  wood: {
    excess:
      '머릿속에 아이디어와 계획이 너무 많아서, 정작 하나 끝내기도 전에 새 판을 세 개씩 더 벌리는 타입이야.',
    lack:
      '시작하기 전에 계산부터 너무 많이 굴려. 완벽한 타이밍을 기다리다가 남들 출발선 떠나는 뒷모습만 보기 쉬워.',
  },
  fire: {
    excess:
      '텐션 오르면 밤새 달릴 만큼 에너지가 넘치는데, 식을 때도 얼음물처럼 확 식어서 주변 사람을 당황시키곤 해.',
    lack:
      '속에 하고 싶은 말과 열정은 가득한데, 막상 표현하려 들면 낯을 가리거나 타이밍을 한 박자 놓쳐서 속앓이해.',
  },
  earth: {
    excess:
      '겉으론 듬직하고 흔들림 없어 보여도, 한 번 고집이 꽂히면 남의 말이 귀에 아예 안 들어오는 황소고집 기질이 있어.',
    lack:
      '아이디어와 감각은 기가 막힌데, 그걸 현실 루틴으로 묵직하게 쌓아두는 마무리가 아쉬울 때가 잦아.',
  },
  metal: {
    excess:
      '기준이 워낙 칼같아서 네 눈에 안 차면 조용히 손절 치는 편이지? 정작 본인 실수엔 세상 제일 엄격해서 피곤할 때가 많아.',
    lack:
      '사람 좋고 유연한 건 장점인데, 거절을 못 해서 남의 감정 쓰레기통이나 애매한 부탁까지 다 떠안곤 해.',
  },
  water: {
    excess:
      '눈치가 백 단이라 상대 속마음까지 다 읽으면서, 밤마다 혼자 의미 없는 시뮬레이션을 백 번씩 돌리는 오버싱킹 장인이야.',
    lack:
      '앞만 보고 직진하는 추진력은 좋은데, 잠깐 멈춰서 숨 고르고 감정을 흘려보내는 여유가 부족해서 번아웃이 오기 쉬워.',
  },
};

export function buildSeohwaRoasts(result: SajuResult): RoastItem[] {
  const name = result.input.name || '당신';
  const ilju = `${result.pillars.day.stem.hangul}${result.pillars.day.branch.hangul}일주`;
  const dominant = result.dominantElement;
  const lacking = result.lackingElement;
  const dominantScore = result.elements.find((e) => e.element === dominant);
  const lackingScore = result.elements.find((e) => e.element === lacking);

  const strengthRoast =
    result.strength.level === '극신강' || result.strength.level === '신강'
      ? `일간 힘이 ${result.strength.score}점(${result.strength.level})이나 돼서 남한테 휘둘리긴커녕 오히려 네 페이스대로 판을 끌고 가야 직성이 풀려. 잔소리 들으면 겉으론 "네~" 해도 속으론 이미 한 귀로 흘리고 있지?`
      : result.strength.level === '중화'
        ? `신강·신약 ${result.strength.score}점의 중화(中和)라니, 겉보기엔 둥글둥글 맞춰주는 것 같지만 사실 손해 볼 일은 칼같이 피해 가는 영리한 밸런스형이야.`
        : `${result.strength.level}(${result.strength.score}점) 명식이라 주변 분위기랑 사람 눈치를 남들보다 세 배는 더 민감하게 캐치해. 혼자 있을 때 배터리 방전되는 느낌이 자주 들지?`;

  const shenshaHighlight = result.shensha[0];
  const challengeLine =
    result.interpretation.growthChallenges[0] ??
    ELEMENT_ROAST[lacking].lack;

  const thirdRoast = shenshaHighlight
    ? `네 명식에 '${shenshaHighlight.name}(${shenshaHighlight.hanja})' 기운이 딱 박혀 있네. ${shenshaHighlight.description} 여기에 ${challengeLine}`
    : `${ELEMENT_KO[lacking]} 기운이 ${lackingScore?.percentage ?? 0}%로 비어 있어. ${ELEMENT_ROAST[lacking].lack}`;

  return [
    {
      id: 'roast-daymaster',
      badge: `팩폭 01 · ${ilju}`,
      title: `${name}님, 겉과 속 온도 차이 들켰네`,
      roast: strengthRoast,
      warmTip: `그래도 ${result.interpretation.iljuAnimal} 기질답게 한번 마음먹은 판에선 누구보다 오래 버티는 저력이 있어.`,
    },
    {
      id: 'roast-dominant',
      badge: `팩폭 02 · 주력 ${ELEMENT_KO[dominant]}`,
      title: `${ELEMENT_KO[dominant]} ${dominantScore?.percentage ?? 0}% 과몰입 주의보`,
      roast: ELEMENT_ROAST[dominant].excess,
      warmTip: `반대로 지금 네게 약이 되는 건 ${ELEMENT_KO[result.yongshin.primary]} 기운(용신)이야. 일부러라도 이 흐름을 곁에 둬 봐.`,
    },
    {
      id: 'roast-secret',
      badge: shenshaHighlight
        ? `팩폭 03 · ${shenshaHighlight.name}`
        : `팩폭 03 · 결핍 ${ELEMENT_KO[lacking]}`,
      title: shenshaHighlight
        ? `숨겨둔 치트키와 아킬레스건`
        : `${ELEMENT_KO[lacking]} 공백이 만드는 패턴`,
      roast: thirdRoast,
      warmTip: result.interpretation.personalityStrengths[0]
        ? `결국 네 무기는 '${result.interpretation.personalityStrengths[0]}' 쪽에 있어. 약점 고치려 애쓰기 전에 이 강점부터 극대화해.`
        : '완벽해지려 애쓰기보다 네 결을 잘 타는 게 백 배 남는 장사야.',
    },
  ];
}

export function buildChapterScripts(
  result: SajuResult,
  focusTopic: FocusTopic,
): {
  chapters: ChapterScript[];
  viralOneLiner: string;
} {
  const name = result.input.name || '당신';
  const iljuHangul = `${result.pillars.day.stem.hangul}${result.pillars.day.branch.hangul}일주`;
  const iljuHanja = `${result.pillars.day.stem.hanja}${result.pillars.day.branch.hanja}`;
  const dmKo = ELEMENT_KO[result.dayMaster.element];
  const domKo = ELEMENT_KO[result.dominantElement];
  const yongKo = ELEMENT_KO[result.yongshin.primary];
  const currentYear = new Date().getFullYear();
  const currentSewoon =
    result.sewoon.find((s) => s.year === currentYear) ?? result.sewoon[0];

  const focusHook =
    focusTopic === 'love'
      ? '연애·사람 때문에 밤잠 설친 이유부터 명식에서 딱 짚어봤어.'
      : focusTopic === 'wealth'
        ? '네 돈줄이 어디서 열리고 어디서 새는지부터 낱낱이 뜯어봤지.'
        : focusTopic === 'luck'
          ? '지금 네 시간표가 상승장인지 숨 고르기 구간인지부터 계산했어.'
          : '겉포장 다 걷어내고 네 여덟 글자가 말하는 본캐부터 열어볼게.';

  const chapters: ChapterScript[] = [
    {
      chapter: 0,
      navLabel: '1장 팩폭',
      title: '1장 · 타고난 기질 순살 팩폭',
      subtitle: `${iljuHangul}(${iljuHanja}) · ${result.gyeokguk.name}`,
      expression: 'smirk',
      moodLabel: '촌철살인 팩폭 타임',
      headline: `${name}님은 '${result.interpretation.iljuTitle}'의 기운을 타고났어`,
      dialogue: `${focusHook} ${name}님 일주는 ${iljuHangul}(${iljuHanja}), 타고난 본원은 ${dmKo}이네. 겉으론 ${result.interpretation.archetype}처럼 보이는데, 속내를 들여다보면 생각보다 훨씬 솔직한 구석이 있어. 놀라지 말고 하나씩 들어봐.`,
    },
    {
      chapter: 1,
      navLabel: '2장 사주',
      title: '2장 · 네 여덟 글자와 오행의 비밀',
      subtitle: `주력 ${domKo} · 용신 ${yongKo}`,
      expression: 'mystic',
      moodLabel: '천문 명식 해부',
      headline: '카드를 뒤집으면 땅속에 숨은 진짜 속마음까지 다 보여',
      dialogue: `아래 4개 기둥을 하나씩 눌러서 뒤집어 봐. 겉으로 드러난 천간·지지 말고도 땅속 지장간(藏干)에 네 무의식이 숨어 있거든. 오행 그래프를 보면 ${domKo} 기운이 판을 끌고 있고, 지금 네 흐름을 살려주는 열쇠는 단연 ${yongKo}이야.`,
    },
    {
      chapter: 2,
      navLabel: '3장 대운',
      title: '3장 · 연애 · 재물 & 향후 10년 대운',
      subtitle: `${currentSewoon ? `${currentSewoon.year}년 ${currentSewoon.stem.hangul}${currentSewoon.branch.hangul}년` : '대운 파동'} · ${result.daewoonDirection} ${result.daewoonStartAge}세`,
      expression: 'focus',
      moodLabel: '인연과 타이밍',
      headline: '운이 들어오는 파도 위에서 노를 저어야 결과가 두 배가 돼',
      dialogue: `사람 만날 때 꽂히는 포인트도, 돈이 모이는 방식도 전부 네 일주랑 대운 흐름 안에 적혀 있어. ${currentSewoon ? `올해 ${currentSewoon.year}년(${currentSewoon.stem.hangul}${currentSewoon.branch.hangul}) 키워드는 '${currentSewoon.keyword}'` : '지금 대운'}인데, 아래 물결 그래프를 눌러 앞으로 10년 치 파도를 직접 짚어봐.`,
    },
    {
      chapter: 3,
      navLabel: '4장 궁합',
      title: '4장 · 그 사람과의 케미 & 궁합',
      subtitle: '연인 · 썸 · 친구 · 비즈니스 파트너',
      expression: 'smirk',
      moodLabel: '속궁합·케미 감정',
      headline: '혼자 볼 때보다 둘을 붙여 놓으면 진짜 반전이 터지지',
      dialogue: '네 사주만 보고 가면 아쉽잖아? 신경 쓰이는 썸남·썸녀나 연인, 아니면 찰떡 같은 친구 생일 한번 넣어봐. 둘이 붙었을 때 시너지가 폭발하는지, 자존심 싸움으로 불붙는지 내가 가감 없이 판정해 줄게.',
    },
    {
      chapter: 4,
      navLabel: '5장 공유',
      title: '5장 · 너만의 천명 카드 & 링크 공유',
      subtitle: '9:16 인스타 스토리 · 카톡 1초 공유',
      expression: 'warm',
      moodLabel: '서화의 마지막 선물',
      headline: '오늘 들킨 네 여덟 글자, 예쁜 부적 카드 한 장으로 챙겨가',
      dialogue: `${name}님 명식 꽤 인상 깊었어. 아래 9:16 카드로 저장해서 인스타 스토리에 올리거나, 링크를 복사해서 친구한테 보내 봐. 로그인이나 결제 없이 링크 누른 사람도 바로 네 풀이랑 자기 사주 궁합까지 이어서 볼 수 있거든.`,
    },
  ];

  const viralOneLiner =
    result.strength.level === '극신강' || result.strength.level === '신강'
      ? `${iljuHangul}의 직진 본능—남 눈치 대신 내 판을 짜는 승부사`
      : result.strength.level === '중화'
        ? `${iljuHangul}의 영리한 균형감—웃으며 실속 다 챙기는 전략가`
        : `${iljuHangul}의 섬세한 촉—사람 마음을 꿰뚫어 보는 감각파`;

  return { chapters, viralOneLiner };
}

export function buildCompatibilityQuote(compat: CompatibilityResult): string {
  const aName = compat.personA.input.name || '첫 번째 분';
  const bName = compat.personB.input.name || '두 번째 분';
  if (compat.overallScore >= 82) {
    return `${aName}님과 ${bName}님? ${compat.overallScore}점이면 서로 부족한 오행을 기가 막히게 채워주는 찰떡 조합이야. ${compat.headline}`;
  }
  if (compat.overallScore >= 65) {
    return `${compat.overallScore}점이네! 기본적으로 끌리는 포인트가 확실한데, 사소한 타이밍만 맞추면 오래 가는 탄탄한 케미야.`;
  }
  return `${compat.overallScore}점이면 자극적이고 강렬한 인연이야. 닮아서 부딪히는 부분이 있으니 서로 표현 방식만 한 톤 낮추면 반전 매력이 터져.`;
}

// ============================================================================
// 5. 1080×1920 (9:16) Viral Story Card SVG + PNG Exporter
// ============================================================================

const CARD_ELEMENT_COLOR: Record<ElementKey, string> = {
  wood: '#38c988',
  fire: '#ff6b5b',
  earth: '#e8b14a',
  metal: '#cbd5e1',
  water: '#4fa3ff',
};

const CARD_ELEMENT_KO: Record<ElementKey, string> = {
  wood: '목 木',
  fire: '화 火',
  earth: '토 土',
  metal: '금 金',
  water: '수 水',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const clean = text.trim();
  const lines: string[] = [];
  let cursor = 0;
  while (cursor < clean.length && lines.length < maxLines) {
    lines.push(clean.slice(cursor, cursor + maxChars));
    cursor += maxChars;
  }
  if (cursor < clean.length && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = `${last.slice(0, Math.max(1, maxChars - 1))}…`;
  }
  return lines;
}

export function generateViralStoryCardSvg(
  result: SajuResult,
  quoteLine: string,
  roasts: string[] = [],
): string {
  const pillars: Pillar[] = [
    result.pillars.hour,
    result.pillars.day,
    result.pillars.month,
    result.pillars.year,
  ];
  const dmColor = CARD_ELEMENT_COLOR[result.dayMaster.element];
  const yongColor = CARD_ELEMENT_COLOR[result.yongshin.primary];
  const userName = escapeXml(result.input.name || '무명');
  const iljuTitle = escapeXml(result.interpretation.iljuTitle);
  const archetype = escapeXml(
    `${result.interpretation.archetype} · ${result.interpretation.iljuAnimal}`,
  );
  const quoteLines = wrapLines(quoteLine, 26, 2);
  const highlightRoast = wrapLines(
    roasts[0] || result.interpretation.coreSummary,
    33,
    3,
  );

  const pillarBlocks = pillars
    .map((p, idx) => {
      const x = 104 + idx * 222;
      const y = 695;
      const stemCol = p.isUnknown ? '#64748b' : CARD_ELEMENT_COLOR[p.stem.element];
      const brCol = p.isUnknown ? '#64748b' : CARD_ELEMENT_COLOR[p.branch.element];
      const isDay = p.key === 'day';
      return `
        <g transform="translate(${x}, ${y})">
          <rect width="204" height="330" rx="28" fill="#111624" stroke="${
            isDay ? '#e5be6d' : 'rgba(255,255,255,0.12)'
          }" stroke-width="${isDay ? '2.5' : '1.5'}" />
          <text x="102" y="46" text-anchor="middle" fill="${
            isDay ? '#e5be6d' : '#94a3b8'
          }" font-size="22" font-weight="600" font-family="'Noto Sans KR', sans-serif">${escapeXml(
        p.labelKo,
      )}${isDay ? ' · 본원' : ''}</text>
          <text x="102" y="142" text-anchor="middle" fill="${stemCol}" font-size="82" font-weight="700" font-family="'Noto Serif KR', serif">${
        p.isUnknown ? '?' : escapeXml(p.stem.hanja)
      }</text>
          <text x="102" y="178" text-anchor="middle" fill="#cbd5e1" font-size="21" font-family="'Noto Sans KR', sans-serif">${
        p.isUnknown ? '시간 미상' : `${escapeXml(p.stem.hangul)} · ${escapeXml(p.stemTenGod)}`
      }</text>
          <line x1="42" y1="198" x2="162" y2="198" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
          <text x="102" y="274" text-anchor="middle" fill="${brCol}" font-size="82" font-weight="700" font-family="'Noto Serif KR', serif">${
        p.isUnknown ? '?' : escapeXml(p.branch.hanja)
      }</text>
          <text x="102" y="308" text-anchor="middle" fill="#94a3b8" font-size="21" font-family="'Noto Sans KR', sans-serif">${
        p.isUnknown ? '삼주 분석' : `${escapeXml(p.branch.hangul)} · ${escapeXml(p.branchTenGod)}`
      }</text>
        </g>`;
    })
    .join('');

  const elementBars = result.elements
    .map((el, idx) => {
      const y = 1365 + idx * 54;
      const col = CARD_ELEMENT_COLOR[el.element];
      const barWidth = Math.max(18, Math.round((el.percentage / 100) * 520));
      return `
        <g transform="translate(104, ${y})">
          <text x="0" y="24" fill="${col}" font-size="24" font-weight="700" font-family="'Noto Sans KR', sans-serif">${CARD_ELEMENT_KO[el.element]}</text>
          <rect x="130" y="8" width="520" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
          <rect x="130" y="8" width="${barWidth}" height="20" rx="10" fill="${col}" />
          <text x="872" y="24" text-anchor="end" fill="#e2e8f0" font-size="23" font-weight="600" font-family="'JetBrains Mono', monospace">${el.percentage}% · ${escapeXml(el.status)}</text>
        </g>`;
    })
    .join('');

  const luckyDots = result.interpretation.luckyColors
    .slice(0, 3)
    .map((c, idx) => {
      const cx = 755 + idx * 52;
      return `<circle cx="${cx}" cy="1715" r="16" fill="${escapeXml(
        c.hex,
      )}" stroke="rgba(255,255,255,0.35)" stroke-width="2" />`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#07080d" />
      <stop offset="52%" stop-color="#0e1220" />
      <stop offset="100%" stop-color="#07080d" />
    </linearGradient>
    <radialGradient id="haloGrad" cx="50%" cy="22%" r="48%">
      <stop offset="0%" stop-color="${dmColor}" stop-opacity="0.24" />
      <stop offset="60%" stop-color="#e5be6d" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#07080d" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bgGrad)" />
  <rect width="1080" height="1920" fill="url(#haloGrad)" />
  <rect x="38" y="38" width="1004" height="1844" rx="44" fill="none" stroke="rgba(229,190,109,0.28)" stroke-width="2" />
  <rect x="54" y="54" width="972" height="1812" rx="34" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

  <!-- Top Brand & Crescent Emblem -->
  <circle cx="540" cy="145" r="44" fill="rgba(229,190,109,0.1)" stroke="#e5be6d" stroke-width="1.5" />
  <path d="M548 118 A28 28 0 1 0 564 166 A22 22 0 1 1 548 118 Z" fill="#e5be6d" />
  <text x="540" y="234" text-anchor="middle" fill="#e5be6d" font-size="25" font-weight="600" letter-spacing="6" font-family="'Noto Sans KR', sans-serif">청명각 · 淸明閣</text>

  <!-- Profile & Ilju Hero -->
  <rect x="330" y="276" width="420" height="52" rx="26" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
  <text x="540" y="310" text-anchor="middle" fill="#e2e8f0" font-size="25" font-weight="600" font-family="'Noto Sans KR', sans-serif">${userName}님의 여덟 글자 명식</text>

  <text x="540" y="424" text-anchor="middle" fill="#f8f5ee" font-size="76" font-weight="700" font-family="'Noto Serif KR', serif">${iljuTitle}</text>
  <text x="540" y="484" text-anchor="middle" fill="#e5be6d" font-size="30" font-weight="500" font-family="'Noto Sans KR', sans-serif">${archetype}</text>

  <!-- Seohwa Quote Pill -->
  <rect x="96" y="532" width="888" height="122" rx="28" fill="rgba(229,190,109,0.1)" stroke="rgba(229,190,109,0.34)" stroke-width="1.5" />
  ${quoteLines
    .map(
      (line, i) =>
        `<text x="540" y="${(quoteLines.length === 1 ? 604 : 582) + i * 42}" text-anchor="middle" fill="#fdf8ec" font-size="30" font-weight="600" font-family="'Noto Sans KR', sans-serif">${
          i === 0 ? '“' : ''
        }${escapeXml(line)}${i === quoteLines.length - 1 ? '”' : ''}</text>`,
    )
    .join('')}

  <!-- Four Pillars -->
  ${pillarBlocks}

  <!-- Seohwa Roast Excerpt Box -->
  <rect x="96" y="1062" width="888" height="236" rx="30" fill="#101522" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
  <text x="136" y="1112" fill="#e5be6d" font-size="24" font-weight="700" font-family="'Noto Sans KR', sans-serif">서화의 한 줄 팩폭 · ${escapeXml(
    result.strength.level,
  )} (${result.strength.score}점)</text>
  ${highlightRoast
    .map(
      (line, i) =>
        `<text x="136" y="${1164 + i * 44}" fill="#dbe2ee" font-size="27" font-family="'Noto Sans KR', sans-serif">${escapeXml(
          line,
        )}</text>`,
    )
    .join('')}

  <!-- Five Elements Distribution -->
  <text x="104" y="1338" fill="#94a3b8" font-size="22" font-weight="600" letter-spacing="2" font-family="'Noto Sans KR', sans-serif">오행 기운 비율 (五行)</text>
  ${elementBars}

  <!-- Bottom Yongshin & Lucky Palette -->
  <rect x="96" y="1660" width="888" height="110" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" />
  <text x="136" y="1708" fill="#94a3b8" font-size="22" font-family="'Noto Sans KR', sans-serif">핵심 용신(用神)</text>
  <text x="136" y="1744" fill="${yongColor}" font-size="32" font-weight="700" font-family="'Noto Sans KR', sans-serif">${CARD_ELEMENT_KO[result.yongshin.primary]} · ${escapeXml(
    result.gyeokguk.name,
  )}</text>
  <text x="640" y="1724" text-anchor="end" fill="#94a3b8" font-size="22" font-family="'Noto Sans KR', sans-serif">행운 컬러</text>
  ${luckyDots}

  <!-- Footer CTA Watermark -->
  <text x="540" y="1828" text-anchor="middle" fill="#cbd5e1" font-size="23" font-family="'Noto Sans KR', sans-serif">로그인·결제 없이 무료로 내 사주 팩폭 &amp; 궁합 보기 · 청명각</text>
</svg>`;
}

export async function downloadViralCardPng(
  svgMarkup: string,
  filenameBase: string,
): Promise<'png' | 'svg'> {
  const safeBase =
    filenameBase.replace(/[^a-zA-Z0-9가-힣_-]/g, '-').replace(/-+/g, '-') ||
    'cheongmyeong-card';

  const triggerDownload = (href: string, filename: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  let blobUrl = '';
  try {
    const svgBlob = new Blob([svgMarkup], {
      type: 'image/svg+xml;charset=utf-8',
    });
    blobUrl = URL.createObjectURL(svgBlob);
    const img = new window.Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('SVG raster load failed'));
      img.src = blobUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');

    ctx.drawImage(img, 0, 0, 1080, 1920);
    const pngUrl = canvas.toDataURL('image/png');
    triggerDownload(pngUrl, `${safeBase}-story-card.png`);
    return 'png';
  } catch {
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      svgMarkup,
    )}`;
    triggerDownload(svgUrl, `${safeBase}-story-card.svg`);
    return 'svg';
  } finally {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }
}
