import { useCallback, useSyncExternalStore } from 'react';

export const BGM_STORAGE_KEY = 'cheongmyeong:bgm:v2';
export const VOICE_STORAGE_KEY = 'cheongmyeong:voice:v2';

const BGM_SRC = '/audio/cheongmyeong-bgm.mp3';
const VOICE_DIR = '/audio/voice';
const VOICE_ASSET_VERSION = '2';

const BGM_NORMAL_VOLUME = 0.42;
const BGM_DUCK_VOLUME = 0.14;

// D minor Korean pentatonic scale (D4, F4, G4, A4, C5, D5, F5)
const PENTATONIC_D_MINOR_HZ = [
  293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46,
];

const PREFERRED_KO_VOICE_PATTERNS: RegExp[] = [
  /google\s*한국의/i,
  /sunhi/i,
  /yuna/i,
  /heami/i,
  /sora|jiyeon|female/i,
];

export interface MediaAudioState {
  bgmEnabled: boolean;
  voiceEnabled: boolean;
  isSpeaking: boolean;
}

export interface SpeakClipOrTextOptions {
  voiceKey?: string;
  text: string;
  force?: boolean;
  allowBrowserTts?: boolean;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readStoredBool(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function writeStoredBool(key: string, value: boolean): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage quota or restricted context errors
  }
}

/**
 * Cleans Korean storytelling text so Web Speech TTS sounds natural:
 * strips Hanja parentheticals like (戊午), emojis, and decorative symbols.
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // Strip parenthetical annotations containing Hanja (e.g. "서화(瑞花)", "목(木)")
  text = text.replace(
    /\(\s*[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\s·,\/\-]+\s*\)/g,
    '',
  );

  // Strip emojis and pictographs if supported by runtime RegExp
  try {
    text = text.replace(
      /[\p{Extended_Pictographic}\uFE0F\u200D]/gu,
      '',
    );
  } catch {
    // Fallback for environments without Unicode property escapes
    text = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
  }

  // Replace middle dots and decorative dashes with natural conversational pauses
  text = text
    .replace(/\s*[·•・]\s*/g, ', ')
    .replace(/\s*[—–]+\s*/g, ', ')
    .replace(/…+/g, ', ')
    .replace(/[「」『』<>【】★☆◆◇▶]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,+/g, ',')
    .trim();

  return text;
}

function selectKoreanFemaleVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const koreanVoices = voices.filter((v) =>
    /^ko([-_]|$)/i.test(v.lang || ''),
  );
  const pool = koreanVoices.length > 0 ? koreanVoices : voices;

  for (const pattern of PREFERRED_KO_VOICE_PATTERNS) {
    const match = pool.find((v) => pattern.test(v.name || ''));
    if (match) return match;
  }

  const exactKoKr = koreanVoices.find((v) => /^ko-kr$/i.test(v.lang || ''));
  return exactKoKr ?? koreanVoices[0] ?? null;
}

class MediaAudioEngine {
  private bgmEnabled: boolean;
  private voiceEnabled: boolean;
  private isSpeaking = false;

  private snapshot: MediaAudioState;
  private listeners = new Set<() => void>();

  // Audio elements & timers
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmFallbackActive = false;
  private bgmFadeTimer: number | null = null;
  private bgmPadTimer: number | null = null;
  private bgmPadStep = 0;
  private bgmPadGain: GainNode | null = null;
  private bgmUnlockBound = false;

  private voiceAudio: HTMLAudioElement | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private voiceToken = 0;

  // Shared Web Audio API context for SFX & BGM fallback
  private ctx: AudioContext | null = null;

  constructor() {
    this.bgmEnabled = readStoredBool(BGM_STORAGE_KEY);
    this.voiceEnabled = readStoredBool(VOICE_STORAGE_KEY);
    this.snapshot = {
      bgmEnabled: this.bgmEnabled,
      voiceEnabled: this.voiceEnabled,
      isSpeaking: this.isSpeaking,
    };

    if (isBrowser()) {
      // Prime speechSynthesis voice list if available
      try {
        window.speechSynthesis?.getVoices?.();
      } catch {
        // Ignore in headless/restricted contexts
      }

      if (this.bgmEnabled) {
        this.bindGestureBgmUnlock();
      }
    }
  }

  // --------------------------------------------------------------------------
  // Subscription & Snapshot
  // --------------------------------------------------------------------------

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): MediaAudioState => {
    return this.snapshot;
  };

  private emit(): void {
    this.snapshot = {
      bgmEnabled: this.bgmEnabled,
      voiceEnabled: this.voiceEnabled,
      isSpeaking: this.isSpeaking,
    };
    this.listeners.forEach((listener) => listener());
  }

  private setSpeaking(next: boolean): void {
    if (this.isSpeaking === next) return;
    this.isSpeaking = next;
    this.syncBgmTargetVolume();
    this.emit();
  }

  // --------------------------------------------------------------------------
  // Web Audio Context Helper
  // --------------------------------------------------------------------------

  private ensureAudioContext(): AudioContext | null {
    if (!isBrowser()) return null;
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
      try {
        const res = this.ctx.resume();
        res?.catch?.(() => {});
      } catch {
        // Ignore resume failure prior to user gesture
      }
    }
    return this.ctx;
  }

  // --------------------------------------------------------------------------
  // BGM Player (MP3 + Smooth Fade/Duck + Web Audio Pentatonic Fallback)
  // --------------------------------------------------------------------------

  private getTargetBgmVolume(): number {
    if (!this.bgmEnabled) return 0;
    return this.isSpeaking ? BGM_DUCK_VOLUME : BGM_NORMAL_VOLUME;
  }

  private bindGestureBgmUnlock(): void {
    if (!isBrowser() || this.bgmUnlockBound) return;
    this.bgmUnlockBound = true;

    const unlock = () => {
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      this.bgmUnlockBound = false;
      if (this.bgmEnabled) {
        this.startBgm();
      }
    };

    window.addEventListener('pointerdown', unlock, { capture: true, once: true });
    window.addEventListener('keydown', unlock, { capture: true, once: true });
  }

  private syncBgmTargetVolume(): void {
    if (!isBrowser()) return;

    // Smoothly adjust Web Audio fallback pad gain if active
    if (this.bgmPadGain && this.ctx) {
      try {
        const targetPadGain = this.bgmEnabled
          ? this.isSpeaking
            ? 0.34
            : 1.0
          : 0.0001;
        this.bgmPadGain.gain.setTargetAtTime(
          targetPadGain,
          this.ctx.currentTime,
          0.18,
        );
      } catch {
        // Ignore gain ramp errors
      }
    }

    if (!this.bgmAudio) return;

    if (this.bgmFadeTimer !== null) {
      window.clearInterval(this.bgmFadeTimer);
      this.bgmFadeTimer = null;
    }

    const audio = this.bgmAudio;
    const stepMs = 30;

    this.bgmFadeTimer = window.setInterval(() => {
      const target = this.getTargetBgmVolume();
      const current = audio.volume;
      const diff = target - current;

      if (Math.abs(diff) <= 0.015) {
        try {
          audio.volume = Math.max(0, Math.min(1, target));
        } catch {
          // Ignore readonly volume errors
        }
        if (this.bgmFadeTimer !== null) {
          window.clearInterval(this.bgmFadeTimer);
          this.bgmFadeTimer = null;
        }
        if (!this.bgmEnabled && target === 0) {
          try {
            audio.pause();
          } catch {
            // Ignore pause errors
          }
        }
        return;
      }

      // Fade down slightly faster when ducking for voice; swell gently back up
      const rate = diff < 0 ? 0.16 : 0.08;
      const next = Math.max(0, Math.min(1, current + diff * rate));
      try {
        audio.volume = next;
      } catch {
        // Ignore readonly volume errors
      }
    }, stepMs);
  }

  private ensureBgmElement(): HTMLAudioElement | null {
    if (!isBrowser() || typeof window.Audio !== 'function') return null;
    if (this.bgmAudio) return this.bgmAudio;

    try {
      const audio = new window.Audio(BGM_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0.01;
      audio.onerror = () => {
        if (this.bgmEnabled) {
          this.startWebAudioPadFallback();
        }
      };
      this.bgmAudio = audio;
      return audio;
    } catch {
      return null;
    }
  }

  public startBgm(): void {
    if (!isBrowser() || !this.bgmEnabled) return;

    const audio = this.ensureBgmElement();
    if (!audio) {
      this.startWebAudioPadFallback();
      return;
    }

    // If MP3 already failed previously, keep running the gentle pad fallback
    if (this.bgmFallbackActive) {
      this.startWebAudioPadFallback();
      return;
    }

    try {
      if (audio.paused) {
        audio.volume = Math.min(audio.volume || 0.01, 0.05);
      }
      const playResult = audio.play?.();
      if (playResult && typeof playResult.then === 'function') {
        playResult
          .then(() => {
            if (!this.bgmEnabled) {
              audio.pause?.();
              return;
            }
            this.stopWebAudioPadFallback();
            this.syncBgmTargetVolume();
          })
          .catch((err: unknown) => {
            if (!this.bgmEnabled) return;
            const errName =
              err && typeof err === 'object' && 'name' in err
                ? String((err as { name?: unknown }).name)
                : '';
            if (errName === 'NotAllowedError') {
              // Autoplay blocked prior to gesture; wait for first interaction
              this.bindGestureBgmUnlock();
            } else {
              // Offline, missing codec, or headless environment -> graceful pad
              this.startWebAudioPadFallback();
            }
          });
      } else {
        // Non-Promise legacy/jsdom play()
        this.syncBgmTargetVolume();
      }
    } catch {
      this.startWebAudioPadFallback();
    }
  }

  public stopBgm(): void {
    if (!isBrowser()) return;
    this.stopWebAudioPadFallback();
    if (this.bgmAudio) {
      this.syncBgmTargetVolume();
    }
  }

  private startWebAudioPadFallback(): void {
    if (!isBrowser() || !this.bgmEnabled) return;
    this.bgmFallbackActive = true;
    if (this.bgmPadTimer !== null) return;

    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    if (!this.bgmPadGain) {
      try {
        const master = ctx.createGain();
        master.gain.setValueAtTime(
          this.isSpeaking ? 0.34 : 1.0,
          ctx.currentTime,
        );
        master.connect(ctx.destination);
        this.bgmPadGain = master;
      } catch {
        return;
      }
    }

    const triggerNote = () => {
      if (!this.bgmEnabled || !this.bgmFallbackActive) return;
      const audioCtx = this.ensureAudioContext();
      if (!audioCtx || audioCtx.state !== 'running' || !this.bgmPadGain) {
        return;
      }

      const pattern = [0, 3, 4, 2, 5, 3, 1, 4];
      const freq =
        PENTATONIC_D_MINOR_HZ[pattern[this.bgmPadStep % pattern.length]];
      this.bgmPadStep += 1;

      this.playPadTone(audioCtx, this.bgmPadGain, freq, 2.8, 0.03, 'sine', 920);
      if (this.bgmPadStep % 4 === 0) {
        this.playPadTone(
          audioCtx,
          this.bgmPadGain,
          freq * 0.5,
          4.2,
          0.022,
          'triangle',
          460,
        );
      }
    };

    triggerNote();
    this.bgmPadTimer = window.setInterval(triggerNote, 2200);
  }

  private stopWebAudioPadFallback(): void {
    this.bgmFallbackActive = false;
    if (this.bgmPadTimer !== null && isBrowser()) {
      window.clearInterval(this.bgmPadTimer);
      this.bgmPadTimer = null;
    }
  }

  private playPadTone(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    durationSec: number,
    peakGain: number,
    type: OscillatorType,
    lowpassHz: number,
  ): void {
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
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + durationSec + 0.05);
    } catch {
      // Ignore Web Audio node errors
    }
  }

  // --------------------------------------------------------------------------
  // Voice Player (Studio Neural MP3 Clips + Web Speech API Fallback)
  // --------------------------------------------------------------------------

  private ensureVoiceElement(): HTMLAudioElement | null {
    if (!isBrowser() || typeof window.Audio !== 'function') return null;
    if (this.voiceAudio) return this.voiceAudio;

    try {
      const audio = new window.Audio();
      audio.preload = 'auto';
      this.voiceAudio = audio;
      return audio;
    } catch {
      return null;
    }
  }

  public stopVoice = (): void => {
    this.voiceToken += 1;

    if (this.voiceAudio) {
      try {
        this.voiceAudio.onended = null;
        this.voiceAudio.onerror = null;
        this.voiceAudio.pause?.();
        this.voiceAudio.currentTime = 0;
      } catch {
        // Ignore media reset errors
      }
    }

    this.activeUtterance = null;
    if (isBrowser() && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis?.cancel?.();
      } catch {
        // Ignore speechSynthesis cancel errors
      }
    }

    this.setSpeaking(false);
  };

  public speakClipOrText = (opts: SpeakClipOrTextOptions): void => {
    this.stopVoice();

    if (!isBrowser()) return;
    if (!this.voiceEnabled && !opts.force) return;

    const token = ++this.voiceToken;
    const rawText = opts.text ?? '';

    if (opts.voiceKey) {
      const audio = this.ensureVoiceElement();
      if (!audio) {
        this.setSpeaking(false);
        return;
      }

      const cancelClip = () => {
        if (token !== this.voiceToken) return;
        audio.onended = null;
        audio.onerror = null;
        this.setSpeaking(false);
      };

      try {
        audio.src = `${VOICE_DIR}/${encodeURIComponent(opts.voiceKey)}.mp3?v=${VOICE_ASSET_VERSION}`;
        audio.volume = 0.96;
        audio.onended = () => {
          cancelClip();
        };
        audio.onerror = () => {
          cancelClip();
        };

        this.setSpeaking(true);
        const playResult = audio.play?.();
        if (playResult && typeof playResult.then === 'function') {
          playResult.catch(() => {
            cancelClip();
          });
        }
      } catch {
        cancelClip();
      }
      return;
    }

    if (opts.allowBrowserTts === true) {
      this.speakViaSpeechSynthesis(rawText, token);
      return;
    }

    this.setSpeaking(false);
  };

  private speakViaSpeechSynthesis(rawText: string, token: number): void {
    if (!isBrowser() || token !== this.voiceToken) return;
    this.setSpeaking(false);

    const cleaned = cleanTextForSpeech(rawText);
    if (!cleaned) {
      return;
    }

    if (
      !('speechSynthesis' in window) ||
      !window.speechSynthesis ||
      typeof window.SpeechSynthesisUtterance !== 'function'
    ) {
      this.setSpeaking(false);
      return;
    }

    try {
      const synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) {
        synth.cancel();
      }

      const utterance = new window.SpeechSynthesisUtterance(cleaned);
      const voices = synth.getVoices?.() ?? [];
      const bestVoice = selectKoreanFemaleVoice(voices);

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || 'ko-KR';
      } else {
        utterance.lang = 'ko-KR';
      }

      utterance.rate = 0.96;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;

      utterance.onstart = () => {
        if (token !== this.voiceToken || this.activeUtterance !== utterance) {
          return;
        }
        this.setSpeaking(true);
      };
      utterance.onend = () => {
        if (token !== this.voiceToken || this.activeUtterance !== utterance) {
          return;
        }
        this.activeUtterance = null;
        this.setSpeaking(false);
      };
      utterance.onerror = () => {
        if (token !== this.voiceToken || this.activeUtterance !== utterance) {
          return;
        }
        this.activeUtterance = null;
        this.setSpeaking(false);
      };

      this.activeUtterance = utterance;
      synth.speak(utterance);
    } catch {
      this.activeUtterance = null;
      this.setSpeaking(false);
    }
  }

  // --------------------------------------------------------------------------
  // User Controls & State Toggles
  // --------------------------------------------------------------------------

  public setBgmEnabled = (next: boolean): void => {
    if (this.bgmEnabled === next) {
      if (next) this.startBgm();
      return;
    }
    this.bgmEnabled = next;
    writeStoredBool(BGM_STORAGE_KEY, next);
    if (next) {
      this.ensureAudioContext();
      this.startBgm();
    } else {
      this.stopBgm();
    }
    this.emit();
  };

  public setVoiceEnabled = (next: boolean): void => {
    if (this.voiceEnabled === next) return;
    this.voiceEnabled = next;
    writeStoredBool(VOICE_STORAGE_KEY, next);
    if (next) {
      this.ensureAudioContext();
      this.ensureVoiceElement();
    } else {
      this.stopVoice();
    }
    this.emit();
  };

  public toggleBgm = (): boolean => {
    const next = !this.bgmEnabled;
    this.setBgmEnabled(next);
    if (next) this.playTap();
    return next;
  };

  public toggleVoice = (): boolean => {
    const next = !this.voiceEnabled;
    this.setVoiceEnabled(next);
    if (next) this.playTap();
    return next;
  };

  /**
   * Unlocks BOTH BGM and Seohwa voice inside a single user CTA gesture
   * (e.g. "서화의 방으로 들어가기").
   */
  public enableExperienceAudio = (): void => {
    this.bgmEnabled = true;
    this.voiceEnabled = true;
    writeStoredBool(BGM_STORAGE_KEY, true);
    writeStoredBool(VOICE_STORAGE_KEY, true);
    this.ensureAudioContext();
    this.ensureVoiceElement();
    this.startBgm();
    this.emit();
  };

  // --------------------------------------------------------------------------
  // Subtle Web Audio SFX
  // --------------------------------------------------------------------------

  private canPlaySfx(): boolean {
    return isBrowser() && (this.bgmEnabled || this.voiceEnabled);
  }

  private playTone(
    freq: number,
    durationSec: number,
    peakGain: number,
    type: OscillatorType = 'sine',
    lowpassHz = 1800,
  ): void {
    const ctx = this.ensureAudioContext();
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
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec + 0.04);
    } catch {
      // Ignore Web Audio errors in headless environments
    }
  }

  public playTap = (): void => {
    if (!this.canPlaySfx()) return;
    this.playTone(480, 0.08, 0.03, 'triangle', 1200);
  };

  public playChime = (): void => {
    if (!this.canPlaySfx()) return;
    this.playTone(587.33, 0.72, 0.04, 'sine', 2200);
    window.setTimeout(() => {
      if (this.canPlaySfx()) {
        this.playTone(880.0, 0.9, 0.028, 'sine', 2400);
      }
    }, 95);
  };

  public playRitual = (): void => {
    if (!this.canPlaySfx()) return;
    this.playTone(146.83, 2.2, 0.045, 'sine', 780);
    this.playTone(220.0, 2.0, 0.032, 'sine', 1100);
    this.playTone(440.0, 1.8, 0.018, 'triangle', 1400);
  };

  public playReveal = (): void => {
    if (!this.canPlaySfx()) return;
    [293.66, 349.23, 440.0, 523.25, 587.33].forEach((freq, idx) => {
      window.setTimeout(() => {
        if (this.canPlaySfx()) {
          this.playTone(freq, 1.15, 0.032, 'sine', 2400);
        }
      }, idx * 85);
    });
  };
}

export const mediaAudioEngine = new MediaAudioEngine();

export function useMediaAudio() {
  const state = useSyncExternalStore(
    mediaAudioEngine.subscribe,
    mediaAudioEngine.getSnapshot,
    mediaAudioEngine.getSnapshot,
  );

  const toggleBgm = useCallback(() => mediaAudioEngine.toggleBgm(), []);
  const toggleVoice = useCallback(() => mediaAudioEngine.toggleVoice(), []);
  const setBgmEnabled = useCallback(
    (next: boolean) => mediaAudioEngine.setBgmEnabled(next),
    [],
  );
  const setVoiceEnabled = useCallback(
    (next: boolean) => mediaAudioEngine.setVoiceEnabled(next),
    [],
  );
  const enableExperienceAudio = useCallback(
    () => mediaAudioEngine.enableExperienceAudio(),
    [],
  );
  const speakClipOrText = useCallback(
    (opts: SpeakClipOrTextOptions) => mediaAudioEngine.speakClipOrText(opts),
    [],
  );
  const stopVoice = useCallback(() => mediaAudioEngine.stopVoice(), []);

  return {
    bgmEnabled: state.bgmEnabled,
    voiceEnabled: state.voiceEnabled,
    isSpeaking: state.isSpeaking,
    toggleBgm,
    toggleVoice,
    setBgmEnabled,
    setVoiceEnabled,
    enableExperienceAudio,
    speakClipOrText,
    stopVoice,
    playTap: mediaAudioEngine.playTap,
    playChime: mediaAudioEngine.playChime,
    playRitual: mediaAudioEngine.playRitual,
    playReveal: mediaAudioEngine.playReveal,
  };
}
