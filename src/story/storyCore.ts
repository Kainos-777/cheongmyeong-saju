import { useCallback, useEffect, useState } from 'react';
import type {
  BirthInput,
  CompatibilityResult,
  ElementKey,
  Pillar,
  SajuResult,
} from '../types/saju';
import voiceLines from './voiceLines.json';

// ============================================================================
// 1. Story Renewal Types
// ============================================================================

export type AppStage = 'landing' | 'story' | 'input' | 'ritual' | 'result';
export type SeohwaExpression = 'mystic' | 'smirk' | 'focus' | 'warm';
export type FocusTopic = 'love' | 'wealth' | 'roast' | 'luck';
export type ResultChapter = 0 | 1 | 2 | 3 | 4;

export interface StoryBeat {
  id: string;
  voiceKey?: string;
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
  secretTease: string;
  secretReveal: string;
}

export interface SajuGlossaryItem {
  id: string;
  term: string;
  hanja: string;
  plainTitle: string;
  easyDesc: string;
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
// 4. Seohwa (서화 · 瑞花) "밀당" Storytelling & Plain-Korean Script Engine
// ============================================================================

export const SAJU_PLAIN_GLOSSARY: SajuGlossaryItem[] = [
  {
    id: 'ilju',
    term: '일주',
    hanja: '日柱',
    plainTitle: '내 본캐를 결정하는 대표 캐릭터',
    easyDesc:
      '태어난 날의 위·아래 두 글자예요. 사주 여덟 글자 중 "나는 어떤 결을 가진 사람인가"를 가장 선명하게 보여주는 내 메인 캐릭터죠.',
  },
  {
    id: 'ilgan',
    term: '일간',
    hanja: '日干',
    plainTitle: '타고난 본질 원소 (진짜 나)',
    easyDesc:
      '일주의 윗글자 하나! 나무·불·흙·쇠·물 다섯 가지 원소 중 내가 어떤 성질의 씨앗으로 태어났는지 알려주는 "영혼의 코어"예요.',
  },
  {
    id: 'jijanggan',
    term: '지장간',
    hanja: '地藏干',
    plainTitle: '겉표정 아래 숨겨진 진짜 속마음',
    easyDesc:
      '아랫줄 땅(지지) 속에 몰래 숨겨 둔 기운들이에요. 남들 앞에선 괜찮은 척 웃어도 내 무의식 속에 깔린 본심과 숨은 재능이 여기 적혀 있어요.',
  },
  {
    id: 'ohaeng',
    term: '오행',
    hanja: '五行',
    plainTitle: '내 에너지 스탯 5각형 (목·화·토·금·수)',
    easyDesc:
      '추진력(목), 열정(화), 중심(토), 결단(금), 지혜(수) 다섯 기운의 비율이에요. 캐릭터 능력치 그래프처럼 어떤 스탯이 넘치고 비어 있는지 보여줘요.',
  },
  {
    id: 'singang-sinyak',
    term: '신강·신약',
    hanja: '身强·身弱',
    plainTitle: '기운의 유불리가 아닌, 내 페이스 강도',
    easyDesc:
      '좋고 나쁨이 절대 아니에요! 신강은 자기 주관이 세서 판을 끌고 가는 타입, 신약은 주변 분위기와 사람 감정을 섬세하게 읽는 감각파라는 뜻이에요.',
  },
  {
    id: 'yongshin',
    term: '용신',
    hanja: '用神',
    plainTitle: '막힌 기운을 뚫어주는 치트키 원소',
    easyDesc:
      '내 사주에서 너무 과열되거나 얼어붙은 흐름을 딱 균형 잡아주는 구원 투수예요. 용신 기운이 들어오는 해·색상·사람을 만나면 일이 신기하게 술술 풀려요.',
  },
  {
    id: 'gyeokguk',
    term: '격국',
    hanja: '格局',
    plainTitle: '세상 속에서 빛나는 내 타고난 포지션',
    easyDesc:
      '내가 일터나 사회라는 큰 판에 나갔을 때 기획자·해결사·예술가·리더 중 어떤 역할로 제일 존재감을 발휘하는지 알려주는 나만의 필살기 타이틀이에요.',
  },
  {
    id: 'daewoon',
    term: '대운',
    hanja: '大運',
    plainTitle: '10년마다 바뀌는 인생의 계절 파도',
    easyDesc:
      '10년 단위로 내 발밑에 깔리는 거대한 날씨예요. 여름 파도엔 과감하게 꽃을 피우고, 겨울 파도엔 실력을 모으는 식으로 타이밍을 읽는 지도죠.',
  },
  {
    id: 'sewoon',
    term: '세운',
    hanja: '歲運',
    plainTitle: '올해 한 해를 관통하는 연간 날씨',
    easyDesc:
      '10년 대운이 큰 계절이라면 세운은 매년 달라지는 올해의 날씨예요. 올해 인연이 닿는지, 이동수나 재물 바람이 부는지 한눈에 짚어줘요.',
  },
  {
    id: 'sinsal',
    term: '신살',
    hanja: '神殺',
    plainTitle: '남들 시선을 끄는 특수 버프 & 주의 태그',
    easyDesc:
      '옛날엔 무섭게 불렀지만 사실 특수 능력치 태그예요. 사람 마음을 끄는 도화살, 멀리 뻗어나가는 역마살처럼 내 매력이 어디로 튀는지 알려주는 시그널이죠.',
  },
];

export const FOCUS_TOPIC_META: Record<
  FocusTopic,
  {
    label: string;
    emoji: string;
    tag: string;
    voiceKey: string;
    seohwaReply: string;
  }
> = {
  love: {
    label: '연애 · 인간관계 팩트체크',
    emoji: '💘',
    tag: '도화·연애운',
    voiceKey: 'reply-love',
    seohwaReply: voiceLines['reply-love'],
  },
  wealth: {
    label: '재물 · 일복 · 커리어 포텐',
    emoji: '💰',
    tag: '재물·일복',
    voiceKey: 'reply-wealth',
    seohwaReply: voiceLines['reply-wealth'],
  },
  roast: {
    label: '내 진짜 성격 순살 팩폭',
    emoji: '🔥',
    tag: '기질 팩폭',
    voiceKey: 'reply-roast',
    seohwaReply: voiceLines['reply-roast'],
  },
  luck: {
    label: '올해·향후 10년 대운 흐름',
    emoji: '✨',
    tag: '대운·타이밍',
    voiceKey: 'reply-luck',
    seohwaReply: voiceLines['reply-luck'],
  },
};

export const INTRO_BEATS: StoryBeat[] = [
  {
    id: 'beat-1',
    voiceKey: 'beat-1',
    expression: 'mystic',
    moodLabel: '밤의 서재 · 첫인사',
    text: voiceLines['beat-1'],
  },
  {
    id: 'beat-2',
    voiceKey: 'beat-2',
    expression: 'smirk',
    moodLabel: '서화의 한 수',
    text: voiceLines['beat-2'],
  },
  {
    id: 'beat-3',
    voiceKey: 'beat-3',
    expression: 'focus',
    moodLabel: '오늘 밤의 화두',
    text: voiceLines['beat-3'],
    isChoice: true,
  },
  {
    id: 'beat-4',
    voiceKey: 'beat-4',
    expression: 'warm',
    moodLabel: '명식 개방 준비',
    text: voiceLines['beat-4'],
  },
];

const ELEMENT_KO: Record<ElementKey, string> = {
  wood: '목(木·나무)',
  fire: '화(火·불)',
  earth: '토(土·흙)',
  metal: '금(金·쇠)',
  water: '수(水·물)',
};

const ELEMENT_PLAIN_METAPHOR: Record<ElementKey, string> = {
  wood: '뻗어나가는 나무의 추진력',
  fire: '단숨에 시선을 모으는 불꽃의 표현력',
  earth: '묵직하게 판을 지탱하는 대지의 안정감',
  metal: '불필요한 걸 칼같이 쳐내는 쇠의 결단력',
  water: '사람 마음을 스며들듯 읽는 물의 통찰력',
};

const ELEMENT_ROAST: Record<ElementKey, { excess: string; lack: string }> = {
  wood: {
    excess:
      '있잖아… 머릿속에 아이디어와 계획이 너무 넘쳐서, 정작 하나 마무리하기도 전에 새 판을 두세 개씩 벌려놓고 혼자 바빠지는 타입이지?',
    lack:
      '근데 말이야… 시작하기 전에 경우의 수부터 너무 재다가, 남들 이미 출발선 떠나는 뒷모습 보며 "조금만 더 준비할걸" 하곤 해.',
  },
  fire: {
    excess:
      '텐션 올라갈 땐 밤새 달릴 만큼 뜨겁다가도, 마음이 한 번 식으면 얼음물처럼 딱 돌아서서 주변 사람을 당황시키곤 하잖아. 맞지?',
    lack:
      '속엔 하고 싶은 말도 열정도 가득한데, 막상 사람들 앞에선 낯을 가리거나 타이밍을 한 박자 놓쳐서 밤에 혼자 이불 찰 때가 잦아.',
  },
  earth: {
    excess:
      '겉으론 세상 든든하고 흔들림 없어 보여도, 한 번 고집이 꽂히면 남의 말이 귀에 아예 안 들어오는 황소고집… 본인도 알면서 모르는 척하지?',
    lack:
      '감각이랑 아이디어는 기가 막힌데, 그걸 현실 루틴으로 묵직하게 쌓아두는 마무리가 아쉬워서 손에 쥔 걸 놓치기 쉬워.',
  },
  metal: {
    excess:
      '기준이 워낙 칼같아서 네 마음에 안 차면 말없이 조용히 선 긋는 편이지? 정작 본인 실수엔 세상 제일 엄격해서 스스로를 제일 피곤하게 굴어.',
    lack:
      '사람 좋고 유연한 건 너무 예쁜데, 거절을 못 해서 애매한 부탁이나 남의 감정 쓰레기통까지 다 떠안고 속으로 앓곤 하잖아.',
  },
  water: {
    excess:
      '눈치가 백 단이라 상대 표정만 봐도 속마음을 다 읽는데, 그걸 밤마다 혼자 시뮬레이션 백 번씩 돌리는 오버싱킹 장인이라니까.',
    lack:
      '앞만 보고 달리는 추진력은 끝내주는데, 잠깐 멈춰서 숨 고르고 감정을 흘려보내는 브레이크가 약해서 갑자기 방전되곤 해.',
  },
};

export function buildSeohwaRoasts(result: SajuResult): RoastItem[] {
  const name = result.input.name || '당신';
  const ilju = `${result.pillars.day.stem.hangul}${result.pillars.day.branch.hangul}일주`;
  const dominant = result.dominantElement;
  const lacking = result.lackingElement;
  const dominantScore = result.elements.find((e) => e.element === dominant);
  const lackingScore = result.elements.find((e) => e.element === lacking);
  const yongKo = ELEMENT_KO[result.yongshin.primary];
  const dmKo = ELEMENT_KO[result.dayMaster.element];

  const strengthRoast =
    result.strength.level === '극신강' || result.strength.level === '신강'
      ? `타고난 본질 원소(일간)가 ${dmKo}인데, 내 페이스를 밀어붙이는 강도(${result.strength.level} ${result.strength.score}점)가 꽤 높아. 누가 잔소리하면 겉으론 "네~" 웃으면서 속으론 이미 한 귀로 흘리고 있지?`
      : result.strength.level === '중화'
        ? `타고난 본질 원소(일간) ${dmKo}가 딱 균형 잡힌 ${result.strength.score}점 중화(中和)네. 겉보기엔 둥글둥글 다 맞춰주는 것 같지만, 사실 손해 볼 판은 칼같이 피해 가는 영리한 밸런스파야.`
        : `타고난 본질 원소(일간)가 ${dmKo}이고 기운을 섬세하게 타는 ${result.strength.level}(${result.strength.score}점)이야. 남들보다 눈치가 세 배는 빨라서 사람 비위 맞추다 혼자 방전되는 밤이 잦지?`;

  const shenshaHighlight = result.shensha[0];
  const challengeLine =
    result.interpretation.growthChallenges[0] ??
    ELEMENT_ROAST[lacking].lack;

  const thirdRoast = shenshaHighlight
    ? `있잖아… 네 사주에 '${shenshaHighlight.name}(${shenshaHighlight.hanja})'이라는 특수 매력 태그(신살)가 딱 박혀 있어. ${shenshaHighlight.description} 근데 말이야… 그래서 괜히 시선 몰리는 만큼 '${challengeLine}' 쪽에서 혼자 골머리 앓기 쉬워.`
    : `다섯 가지 에너지 스탯(오행) 중에 ${ELEMENT_KO[lacking]} 쪽이 ${lackingScore?.percentage ?? 0}%로 살짝 비어 있네. ${ELEMENT_ROAST[lacking].lack}`;

  return [
    {
      id: 'roast-daymaster',
      badge: `팩폭 01 · 본캐 ${ilju}`,
      title: `${name}님, 겉은 멀쩡한 척해도 다 들켰는데?`,
      roast: strengthRoast,
      warmTip: `그래도 '${result.interpretation.iljuAnimal}' 기질에 사회 속 포지션(격국)이 '${result.gyeokguk.name}'답게, 한번 마음먹은 판에선 결국 끝까지 살아남는 저력이 있어.`,
    },
    {
      id: 'roast-dominant',
      badge: `팩폭 02 · 주력 ${ELEMENT_KO[dominant]}`,
      title: `${ELEMENT_KO[dominant]} 스탯 ${dominantScore?.percentage ?? 0}% 과몰입 주의보`,
      roast: ELEMENT_ROAST[dominant].excess,
      warmTip: `반대로 지금 네 막힌 기운을 뚫어주는 치트키 원소(용신)는 ${yongKo}이야. ${ELEMENT_PLAIN_METAPHOR[result.yongshin.primary]}을 곁에 두면 숨통이 탁 트일 거야.`,
    },
    {
      id: 'roast-secret',
      badge: shenshaHighlight
        ? `팩폭 03 · 특수태그 ${shenshaHighlight.name}`
        : `팩폭 03 · 빈칸 ${ELEMENT_KO[lacking]}`,
      title: shenshaHighlight
        ? `남들 홀리는 치트키와 숨은 아킬레스건`
        : `${ELEMENT_KO[lacking]} 빈칸이 만드는 비밀 패턴`,
      roast: thirdRoast,
      warmTip: result.interpretation.personalityStrengths[0]
        ? `약점 고치느라 애쓰지 마. 네 진짜 무기는 '${result.interpretation.personalityStrengths[0]}'에 있으니까— 다음 장에서 3D 카드 뒤집어 보면 속마음까지 더 선명해질걸?`
        : '완벽해지려 애쓰기보다 네 결을 잘 타는 게 백 배 남는 장사야. 다음 장 카드도 한 번 뒤집어 봐.',
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
  const lackKo = ELEMENT_KO[result.lackingElement];
  const yongKo = ELEMENT_KO[result.yongshin.primary];
  const avoidKo = ELEMENT_KO[result.yongshin.avoidElement];
  const currentYear = new Date().getFullYear();
  const currentSewoon =
    result.sewoon.find((s) => s.year === currentYear) ?? result.sewoon[0];

  const dayHidden = result.pillars.day.hiddenStemTenGods;
  const deepestHidden = dayHidden[dayHidden.length - 1];
  const topInteraction = result.interactions[0];

  const peakDaewoon =
    result.daewoon.length > 0
      ? result.daewoon.reduce(
          (best, cur) =>
            cur.favorabilityScore > best.favorabilityScore ? cur : best,
          result.daewoon[0],
        )
      : undefined;
  const currentAge = Math.max(1, currentYear - result.solarDate.year + 1);
  const currentDaewoon =
    result.daewoon.find(
      (d) => currentAge >= d.startAge && currentAge <= d.endAge,
    ) ?? result.daewoon[0];

  const luckyColor = result.interpretation.luckyColors[0];
  const luckyNums =
    result.interpretation.luckyNumbers.length > 0
      ? result.interpretation.luckyNumbers.join(', ')
      : '3, 7';

  const focusHook =
    focusTopic === 'love'
      ? '아까 연애·인간관계 골랐지? 네가 왜 밤잠 설쳤는지 명식에서 딱 짚어봤어.'
      : focusTopic === 'wealth'
        ? '아까 재물·일복 골랐던 거 기억나지? 돈이 붙는 길목부터 뜯어봤어.'
        : focusTopic === 'luck'
          ? '아까 앞으로의 대운 흐름 골랐잖아. 지금 치고 나갈 타이밍인지부터 계산했어.'
          : '아까 진짜 성격 팩폭 골랐지? 겉포장 다 걷어낸 본캐부터 열어볼게.';

  const focusSecretBonus =
    focusTopic === 'love'
      ? result.interpretation.loveStyle
      : focusTopic === 'wealth'
        ? result.interpretation.wealthStyle
        : focusTopic === 'luck'
          ? result.interpretation.careerDesignStyle
          : result.interpretation.growthChallenges[0] ?? result.interpretation.coreSummary;

  const chapters: ChapterScript[] = [
    {
      chapter: 0,
      navLabel: '1장 팩폭',
      title: '1장 · 타고난 기질 순살 팩폭',
      subtitle: `${iljuHangul}(${iljuHanja}) · ${result.gyeokguk.name}`,
      expression: 'smirk',
      moodLabel: '촌철살인 팩폭 타임',
      headline: `${name}님은 '${result.interpretation.iljuTitle}'의 기운을 타고났어`,
      dialogue: `${focusHook} 네 본캐를 결정하는 일주가 ${iljuHangul}(${iljuHanja}), 타고난 본질 원소(일간)는 ${dmKo}이네. 겉으론 ${result.interpretation.archetype}처럼 보여도 속마음은 꽤 다를걸? 근데 이건 시작일 뿐이야… 아래 팩폭 읽고 다음 장에서 속마음 카드까지 뒤집어 봐.`,
      secretTease: `잠깐… ${name}님 사주에서 남들한텐 절대 안 보여주는 '진짜 약한 구석' 하나만 더 들춰볼까? 좀 찔릴 수도 있는데… 열어볼래?`,
      secretReveal: `다 들킬 각오 됐어? ${name}님 일주 아랫자리 땅속(지장간) 깊숙한 곳엔 ${
        deepestHidden
          ? `'${deepestHidden.hangul}(${deepestHidden.tenGod})'`
          : dmKo
      } 기운이 숨어 있어. 그래서 겉으론 안 그런 척해도 속으론 "${focusSecretBonus}" 같은 결로 마음이 먼저 움직이곤 해. 혼자 너무 끙끙대지 마, 네가 예민한 게 아니라 촉이 살아 있는 거니까.`,
    },
    {
      chapter: 1,
      navLabel: '2장 사주',
      title: '2장 · 네 여덟 글자와 오행의 비밀',
      subtitle: `주력 ${domKo} · 치트키(용신) ${yongKo}`,
      expression: 'mystic',
      moodLabel: '천문 명식 해부',
      headline: '카드를 뒤집으면 겉표정 아래 숨겨진 진짜 속마음까지 다 보여',
      dialogue: `아래 4개 기둥 카드를 하나씩 눌러서 뒤집어 봐. 겉에 적힌 글자 말고도 땅속에 숨은 '진짜 속마음(지장간)'이 숨어 있거든. 에너지 스탯(오행)을 보면 ${domKo} 기운이 제일 세고, 지금 막힌 흐름을 뚫어주는 치트키 원소(용신)는 단연 ${yongKo}이야.`,
      secretTease:
        '있잖아… 여덟 글자가 서로 부딪히거나 끌어당기며 만드는 "은밀한 기운 충돌 지점"이 보이는데… 몰래 확인해 볼래?',
      secretReveal: `${
        topInteraction
          ? `네 명식 안에는 '${topInteraction.label}(${topInteraction.type})' 흐름이 흐르고 있어. ${topInteraction.description} `
          : `${domKo} 기운이 강하고 ${lackKo} 쪽이 비어 있어서 내면의 텐션이 한쪽으로 쏠리기 쉬워. `
      }특히 ${avoidKo} 기운이 과할 땐 괜히 피곤해지니까, ${result.yongshin.reason}처럼 치트키 원소 ${yongKo} 흐름을 의식적으로 챙기면 중심이 훨씬 단단해질 거야.`,
    },
    {
      chapter: 2,
      navLabel: '3장 대운',
      title: '3장 · 연애 · 재물 & 향후 10년 대운',
      subtitle: `${currentSewoon ? `${currentSewoon.year}년 날씨 ${currentSewoon.stem.hangul}${currentSewoon.branch.hangul}` : '대운 파동'} · ${result.daewoonDirection} ${result.daewoonStartAge}세`,
      expression: 'focus',
      moodLabel: '인연과 타이밍',
      headline: '인생 계절(대운) 파도 위에서 노를 저어야 결과가 두 배가 돼',
      dialogue: `사람 만날 때 꽂히는 포인트도, 돈이 모이는 방식도 전부 네 10년 계절(대운) 지도 안에 적혀 있어. 올해(${currentSewoon?.year ?? currentYear}년)의 연간 날씨(세운) 키워드는 '${currentSewoon?.keyword ?? '전환과 정리'}'인데… 아래 파동 그래프 눌러보면 진짜 승부 볼 해가 언제인지 보일 거야.`,
      secretTease: `근데 말이야… ${name}님 10년 대운 곡선에서 '그냥 넘기면 너무 아까운 황금 터닝포인트'가 딱 보이거든. 몇 살인지 알려줄까?`,
      secretReveal: `${
        peakDaewoon
          ? `파동에서 제일 빛나는 구간은 만 ${peakDaewoon.startAge}~${peakDaewoon.endAge}세 '${peakDaewoon.stem.hangul}${peakDaewoon.branch.hangul}' 대운(호감도 ${peakDaewoon.favorabilityScore}점)이야! ${peakDaewoon.summary} `
          : `앞으로 ${result.daewoonStartAge}세부터 본격적으로 ${result.daewoonDirection} 파도가 열려. `
      }${
        currentDaewoon
          ? `지금 지나고 있는 만 ${currentDaewoon.startAge}~${currentDaewoon.endAge}세(${currentDaewoon.stem.hangul}${currentDaewoon.branch.hangul}) 구간에선 무리해서 새 판을 벌리기보다 '${ELEMENT_PLAIN_METAPHOR[result.yongshin.primary]}' 쪽 무기를 갈아두면 다음 파도에서 판을 통째로 뒤집을 수 있어.`
          : `올해는 '${ELEMENT_PLAIN_METAPHOR[result.yongshin.primary]}' 감각을 갈아두면 다음 계절 파도에서 판을 통째로 뒤집을 수 있어.`
      }`,
    },
    {
      chapter: 3,
      navLabel: '4장 궁합',
      title: '4장 · 그 사람과의 케미 & 궁합',
      subtitle: '연인 · 썸 · 친구 · 비즈니스 파트너',
      expression: 'smirk',
      moodLabel: '속궁합·케미 감정',
      headline: '혼자 볼 때보다 둘을 붙여 놓으면 진짜 반전이 터지지',
      dialogue:
        '네 사주만 보고 가기엔 살짝 아쉽잖아? 신경 쓰이는 썸남·썸녀나 연인, 아니면 찰떡 같은 친구 생일 한번 넣어봐. 둘이 붙었을 때 시너지가 폭발하는지, 자존심 버튼 눌러서 불붙는지 내가 가감 없이 판정해 줄게.',
      secretTease:
        '사실 상대 사주랑 붙여 보면 "절대 누르면 안 되는 관계의 금기 버튼"이 꼭 하나씩 있거든… 미리 알고 갈래?',
      secretReveal: `${name}님은 평소 비어 있는 ${lackKo} 기운이나 치트키 원소(${yongKo})를 가진 사람한테 첫눈에 확 끌리는 편이야. 그런데 막상 가까워지면 ${domKo} 자존심이 올라와서 말 대신 침묵으로 선 긋곤 하지. 상대를 바꾸려 하기보다 서로 다른 템포만 인정하면 세상 든든한 내 편이 돼 줄 인연이 꼭 붙어.`,
    },
    {
      chapter: 4,
      navLabel: '5장 공유',
      title: '5장 · 너만의 천명 카드 & 링크 공유',
      subtitle: '9:16 인스타 스토리 · 카톡 1초 공유',
      expression: 'warm',
      moodLabel: '서화의 마지막 선물',
      headline: '오늘 들킨 네 여덟 글자, 예쁜 부적 카드 한 장으로 챙겨가',
      dialogue: `${name}님 명식 꽤 흥미로웠어. 아래 9:16 카드로 저장해서 스토리에 올리거나, 링크 복사해서 친구한테 슬쩍 보내 봐. 로그인도 복채도 없이 링크 받은 사람도 바로 자기 사주랑 너랑 궁합 몇 점인지 이어서 볼 수 있거든.`,
      secretTease: `가기 전에 잠깐만… 오늘 밤 서화가 ${name}님만을 위해 골라둔 '비밀 개운 치트키' 안 챙기고 갈 거야? 마지막 선물 열어봐.`,
      secretReveal: `내일부터 바로 써먹어 봐! ${name}님한테 지금 기운을 채워주는 럭키 컬러는 '${luckyColor ? luckyColor.name : '천명 골드'}', 좋은 방향은 '${result.interpretation.luckyDirection}', 행운 숫자는 '${luckyNums}'이야. 오늘 밤 서화의 한 줄 조언—" ${result.today.advice} " 잊지 말고, 기운 빠질 때마다 이 카드 꺼내 봐.`,
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
  const topHighlight = compat.highlights[0]?.detail;

  if (compat.overallScore >= 82) {
    return `어머… ${aName}님하고 ${bName}님, ${compat.overallScore}점(${compat.grade})? 이 정도면 서로 비어 있던 에너지 스탯(오행)을 기가 막히게 채워주는 찰떡 조합이야. ${compat.headline} 근데 말이야… 너무 잘 통할수록 속마음 말 안 해도 알 거라 넘기다 서운해지니까, 다정한 한 마디만 아끼지 마.`;
  }
  if (compat.overallScore >= 65) {
    return `음… ${compat.overallScore}점(${compat.grade})이네! ${aName}님과 ${bName}님, 처음부터 자석처럼 끌리는 포인트가 확실해. ${topHighlight ?? compat.headline} 사소한 감정 템포 차이만 한 박자 맞춰 주면 생각보다 훨씬 오래, 단단하게 가는 인연이야.`;
  }
  return `호오… ${compat.overallScore}점(${compat.grade})이라. 겁먹지 마, 점수가 낮다고 나쁜 사이가 아니거든? ${aName}님과 ${bName}님은 닮은 듯 달라서 스파크가 세게 튀는 자극적인 케미야. ${compat.advice || '서로 표현 방식만 한 톤 낮춰 주면'} 아무도 예상 못 한 반전 매력이 터질걸?`;
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
