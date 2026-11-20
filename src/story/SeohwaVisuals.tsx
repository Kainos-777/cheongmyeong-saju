import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import type { ElementKey } from '../types/saju';
import type { SeohwaExpression } from './storyCore';

const ELEMENT_HALO: Record<ElementKey, string> = {
  wood: '#38c988',
  fire: '#ff6b5b',
  earth: '#e5be6d',
  metal: '#cbd5e1',
  water: '#4fa3ff',
};

export interface SeohwaPortraitProps {
  expression: SeohwaExpression;
  size?: 'hero' | 'stage' | 'card' | 'compact';
  dominantElement?: ElementKey;
  isSpeaking?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SeohwaPortraitProps['size']>, string> = {
  hero: 'h-64 w-52 sm:h-80 sm:w-64',
  stage: 'h-72 w-56 sm:h-96 sm:w-72',
  card: 'h-48 w-40 sm:h-56 sm:w-44',
  compact: 'h-24 w-20 shrink-0',
};

type PortraitMediaMode = 'video' | 'image' | 'fallback';

const VIGNETTE_MASK_STYLE: CSSProperties = {
  WebkitMaskImage:
    'radial-gradient(ellipse 68% 72% at 50% 44%, black 52%, transparent 96%)',
  maskImage:
    'radial-gradient(ellipse 68% 72% at 50% 44%, black 52%, transparent 96%)',
};

function SeohwaCelestialFallback({
  expression,
  auraColor,
}: {
  expression: SeohwaExpression;
  auraColor: string;
}) {
  return (
    <svg
      viewBox="0 0 320 380"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="seohwaFallbackHair" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#232842" />
          <stop offset="55%" stopColor="#121628" />
          <stop offset="100%" stopColor="#080a12" />
        </linearGradient>
        <linearGradient id="seohwaFallbackHanbok" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#1c2442" />
          <stop offset="60%" stopColor="#11162a" />
          <stop offset="100%" stopColor="#070912" />
        </linearGradient>
        <linearGradient id="seohwaFallbackGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6df9d" />
          <stop offset="55%" stopColor="#e5be6d" />
          <stop offset="100%" stopColor="#a7792b" />
        </linearGradient>
      </defs>
      {/* Crescent halo */}
      <path
        d="M196 50 A56 56 0 1 0 226 142 A46 46 0 1 1 196 50 Z"
        fill="url(#seohwaFallbackGold)"
        opacity="0.32"
      />
      {/* Hair silhouette + binyeo */}
      <path
        d="M96 120 C76 164 70 236 68 336 L252 336 C250 236 244 164 224 120 C214 78 190 54 160 54 C130 54 106 78 96 120 Z"
        fill="url(#seohwaFallbackHair)"
      />
      <ellipse cx="160" cy="64" rx="26" ry="18" fill="#171b2d" />
      <line
        x1="100"
        y1="60"
        x2="224"
        y2="52"
        stroke="url(#seohwaFallbackGold)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="226" cy="52" r="6.5" fill="url(#seohwaFallbackGold)" />
      {/* Celestial face & shoulders silhouette */}
      <path
        d="M120 120 C120 88 200 88 200 120 C200 156 186 188 160 194 C134 188 120 156 120 120 Z"
        fill="#f2d6c4"
        opacity="0.9"
      />
      <path
        d="M58 364 C64 286 82 238 122 222 L160 236 L198 222 C238 238 256 286 262 364 Z"
        fill="url(#seohwaFallbackHanbok)"
      />
      <path
        d="M126 222 L158 274 L194 222"
        fill="none"
        stroke="url(#seohwaFallbackGold)"
        strokeWidth="2"
      />
      {/* Expression glyph */}
      <circle
        cx="160"
        cy="108"
        r="3.2"
        fill={expression === 'focus' ? auraColor : '#e5be6d'}
      />
    </svg>
  );
}

export function SeohwaPortrait({
  expression,
  size = 'stage',
  dominantElement = 'earth',
  isSpeaking = false,
  className = '',
}: SeohwaPortraitProps) {
  const auraColor = ELEMENT_HALO[dominantElement] ?? '#e5be6d';
  const [mediaMode, setMediaMode] = useState<PortraitMediaMode>('video');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isCompact = size === 'compact';

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawShiftX = useMotionValue(0);
  const rawShiftY = useMotionValue(0);

  const rotateX = useSpring(rawRotateX, { stiffness: 180, damping: 22 });
  const rotateY = useSpring(rawRotateY, { stiffness: 180, damping: 22 });
  const shiftX = useSpring(rawShiftX, { stiffness: 180, damping: 22 });
  const shiftY = useSpring(rawShiftY, { stiffness: 180, damping: 22 });

  useEffect(() => {
    setMediaMode('video');
  }, [expression]);

  useEffect(() => {
    if (mediaMode !== 'video') return;
    const video = videoRef.current;
    if (!video) return;
    try {
      const playPromise = video.play?.();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Ignore autoplay promise rejections cleanly; poster remains visible
        });
      }
    } catch {
      // Ignore play errors in restricted/jsdom environments
    }
  }, [expression, mediaMode]);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (isCompact || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateX.set(-ny * 8);
    rawRotateY.set(nx * 10);
    rawShiftX.set(nx * 8);
    rawShiftY.set(ny * 6);
  };

  const handlePointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawShiftX.set(0);
    rawShiftY.set(0);
  };

  const videoSrc = `/character/seohwa-${expression}.mp4`;
  const imageSrc = `/character/seohwa-${expression}.png`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative flex items-center justify-center select-none ${SIZE_CLASSES[size]} ${className}`}
      style={{ perspective: 900 }}
      aria-label={`동양풍 여도사 서화 라이브 초상 (${expression})`}
      data-expression={expression}
      data-speaking={isSpeaking ? 'true' : 'false'}
    >
      {/* Ambient Midnight & Dominant Element Aura */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-full blur-3xl transition-colors duration-700"
        animate={
          isSpeaking
            ? { opacity: [0.38, 0.68, 0.38], scale: [0.97, 1.06, 0.97] }
            : { opacity: 0.28, scale: 1 }
        }
        transition={
          isSpeaking
            ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.4 }
        }
        style={{
          background: `radial-gradient(circle at 50% 42%, rgba(229,190,109,0.34) 0%, ${auraColor} 36%, transparent 72%)`,
        }}
      />

      {/* Luminous Pulsing Golden Speaking Aura Ring */}
      {isSpeaking && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-1 rounded-[46%]"
            animate={{
              scale: [0.98, 1.04, 0.98],
              opacity: [0.55, 0.95, 0.55],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              border: '1.5px solid rgba(229, 190, 109, 0.78)',
              boxShadow:
                '0 0 32px rgba(229, 190, 109, 0.45), inset 0 0 22px rgba(229, 190, 109, 0.2)',
            }}
          />
          {!isCompact && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 rounded-[48%]"
              animate={{
                scale: [1, 1.11],
                opacity: [0.48, 0],
              }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
              style={{
                border: '1px solid rgba(229, 190, 109, 0.55)',
              }}
            />
          )}
        </>
      )}

      {/* Subtle Rotating Celestial Astrolabe Ring Behind Portrait */}
      {!isCompact && (
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 320 380"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          animate={{ rotate: 360 }}
          transition={{ duration: 64, repeat: Infinity, ease: 'linear' }}
          style={{ opacity: isSpeaking ? 0.85 : 0.45 }}
        >
          <circle
            cx="160"
            cy="158"
            r="128"
            fill="none"
            stroke="#e5be6d"
            strokeOpacity="0.34"
            strokeWidth="1"
            strokeDasharray="5 8"
          />
          <circle
            cx="160"
            cy="158"
            r="112"
            fill="none"
            stroke={auraColor}
            strokeOpacity="0.24"
            strokeWidth="0.9"
          />
        </motion.svg>
      )}

      {/* 3D Parallax + Vignette-Masked Photorealistic Living Portrait */}
      <motion.div
        className="relative z-10 h-full w-full"
        style={{
          rotateX: isCompact ? 0 : rotateX,
          rotateY: isCompact ? 0 : rotateY,
          x: isCompact ? 0 : shiftX,
          y: isCompact ? 0 : shiftY,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className="h-full w-full overflow-hidden rounded-[36%]"
          style={VIGNETTE_MASK_STYLE}
          animate={isCompact ? undefined : { y: [0, -3, 0] }}
          transition={
            isCompact
              ? undefined
              : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {mediaMode === 'video' && (
            <video
              key={`video-${expression}`}
              ref={videoRef}
              src={videoSrc}
              poster={imageSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={() => setMediaMode('image')}
              className="h-full w-full object-cover object-top"
              aria-label={`서화 라이브 초상 영상 (${expression})`}
            />
          )}

          {mediaMode === 'image' && (
            <img
              key={`img-${expression}`}
              src={imageSrc}
              alt={`서화 초상 일러스트 (${expression})`}
              onError={() => setMediaMode('fallback')}
              className="h-full w-full object-cover object-top"
            />
          )}

          {mediaMode === 'fallback' && (
            <div className="flex h-full w-full items-center justify-center bg-[#07080d]/60">
              <SeohwaCelestialFallback
                expression={expression}
                auraColor={auraColor}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Golden 4-Bar Audio Equalizer Indicator
// ============================================================================

function GoldenEqualizerBars() {
  const bars = [
    { delay: 0, min: 0.35, max: 1 },
    { delay: 0.14, min: 0.5, max: 0.9 },
    { delay: 0.28, min: 0.3, max: 1 },
    { delay: 0.1, min: 0.45, max: 0.85 },
  ];

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-3.5 items-end gap-[2px]"
    >
      {bars.map((bar, idx) => (
        <motion.span
          key={idx}
          className="block w-[2.5px] rounded-full"
          style={{
            height: '12px',
            backgroundColor: 'var(--accent-gold)',
            transformOrigin: 'bottom',
          }}
          animate={{ scaleY: [bar.min, bar.max, bar.min] }}
          transition={{
            duration: 0.65,
            delay: bar.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

// ============================================================================
// Seohwa Visual-Novel Dialogue Card
// ============================================================================

export interface SeohwaDialogueCardProps {
  expression?: SeohwaExpression;
  moodLabel?: string;
  headline?: string;
  text: string;
  typewriter?: boolean;
  showContinueCue?: boolean;
  onAdvance?: () => void;
  dominantElement?: ElementKey;
  showPortrait?: boolean;
  isSpeaking?: boolean;
  onToggleSpeak?: () => void;
  children?: ReactNode;
  className?: string;
}

export function SeohwaDialogueCard({
  expression = 'mystic',
  moodLabel = '서화의 전언',
  headline,
  text,
  typewriter = false,
  showContinueCue = false,
  onAdvance,
  dominantElement = 'earth',
  showPortrait = true,
  isSpeaking = false,
  onToggleSpeak,
  children,
  className = '',
}: SeohwaDialogueCardProps) {
  const [visibleCount, setVisibleCount] = useState<number>(
    typewriter ? 0 : text.length,
  );

  useEffect(() => {
    if (!typewriter) {
      setVisibleCount(text.length);
      return;
    }
    setVisibleCount(0);
    const id = window.setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= text.length) {
          window.clearInterval(id);
          return prev;
        }
        return prev + 2;
      });
    }, 24);
    return () => window.clearInterval(id);
  }, [text, typewriter]);

  const isTyping = typewriter && visibleCount < text.length;
  const displayedText = isTyping ? text.slice(0, visibleCount) : text;

  const handleCardClick = () => {
    if (isTyping) {
      setVisibleCount(text.length);
      return;
    }
    if (onAdvance) {
      onAdvance();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      onClick={onAdvance || isTyping ? handleCardClick : undefined}
      role={onAdvance ? 'button' : undefined}
      tabIndex={onAdvance ? 0 : undefined}
      onKeyDown={
        onAdvance
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      className={`relative overflow-hidden rounded-[22px] border p-4 shadow-2xl transition-colors sm:p-5 ${
        onAdvance ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderColor: isSpeaking
          ? 'rgba(229, 190, 109, 0.52)'
          : 'rgba(229, 190, 109, 0.28)',
      }}
    >
      {/* Top Speaker Tag + Voice Trigger + Continue Cue */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide"
            style={{
              backgroundColor: 'var(--accent-gold)',
              color: '#07080d',
            }}
          >
            <Sparkles className="h-3 w-3" />
            서화 · 瑞花
          </span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-secondary)',
            }}
          >
            {moodLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSpeak && (
            <button
              type="button"
              aria-label="서화 대사 음성 재생/정지"
              aria-pressed={Boolean(isSpeaking)}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSpeak();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:opacity-95"
              style={{
                backgroundColor: isSpeaking
                  ? 'rgba(229, 190, 109, 0.2)'
                  : 'var(--surface-1)',
                borderColor: isSpeaking
                  ? 'rgba(229, 190, 109, 0.65)'
                  : 'var(--border-subtle)',
                color: isSpeaking
                  ? 'var(--accent-gold)'
                  : 'var(--text-secondary)',
              }}
            >
              {isSpeaking ? (
                <>
                  <GoldenEqualizerBars />
                  <span>⏹ 멈춤</span>
                </>
              ) : (
                <span>🔊 듣기</span>
              )}
            </button>
          )}

          {showContinueCue && !isTyping && (
            <motion.span
              animate={{ opacity: [0.45, 1, 0.45], y: [0, 2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: 'var(--accent-gold)' }}
            >
              눌러서 계속
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3.5 sm:gap-4">
        {showPortrait && (
          <SeohwaPortrait
            expression={expression}
            size="compact"
            dominantElement={dominantElement}
            isSpeaking={isSpeaking}
            className="hidden sm:flex"
          />
        )}

        <div className="min-w-0 flex-1 space-y-2">
          {headline && (
            <h2
              className="font-serif-kr text-base font-bold leading-snug sm:text-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              {headline}
            </h2>
          )}
          <p
            className="text-sm leading-relaxed sm:text-[15px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {displayedText}
            {isTyping && (
              <span
                className="ml-0.5 inline-block h-4 w-0.5 animate-pulse align-middle"
                style={{ backgroundColor: 'var(--accent-gold)' }}
              />
            )}
          </p>
          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
    </motion.div>
  );
}
