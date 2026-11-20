import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
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
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SeohwaPortraitProps['size']>, string> = {
  hero: 'h-64 w-52 sm:h-80 sm:w-64',
  stage: 'h-72 w-56 sm:h-96 sm:w-72',
  card: 'h-48 w-40 sm:h-56 sm:w-44',
  compact: 'h-24 w-20 shrink-0',
};

export function SeohwaPortrait({
  expression,
  size = 'stage',
  dominantElement = 'earth',
  className = '',
}: SeohwaPortraitProps) {
  const auraColor = ELEMENT_HALO[dominantElement] ?? '#e5be6d';
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 150);
    }, 4400);
    return () => window.clearInterval(id);
  }, []);

  const isSmirk = expression === 'smirk';
  const isWarm = expression === 'warm';
  const isFocus = expression === 'focus';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className={`relative flex items-center justify-center select-none ${SIZE_CLASSES[size]} ${className}`}
      aria-label={`동양풍 여도사 서화 캐릭터 일러스트 (${expression})`}
      data-expression={expression}
    >
      {/* Soft Midnight & Element Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full blur-3xl opacity-30 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${auraColor} 0%, rgba(229,190,109,0.22) 40%, transparent 72%)`,
        }}
      />

      {/* Rotating Celestial Astrolabe Halo */}
      <motion.svg
        viewBox="0 0 320 380"
        className="relative z-10 h-full w-full overflow-visible drop-shadow-[0_18px_34px_rgba(0,0,0,0.65)]"
        animate={size === 'compact' ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="seohwaBgVignette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e1222" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#07080d" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#07080d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="seohwaHairGrad" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#21263d" />
            <stop offset="45%" stopColor="#111423" />
            <stop offset="100%" stopColor="#090b12" />
          </linearGradient>
          <linearGradient id="seohwaSkinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fae7d8" />
            <stop offset="72%" stopColor="#f0d1be" />
            <stop offset="100%" stopColor="#dfb59e" />
          </linearGradient>
          <linearGradient id="seohwaHanbokGrad" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#1b2340" />
            <stop offset="55%" stopColor="#12172b" />
            <stop offset="100%" stopColor="#090c18" />
          </linearGradient>
          <linearGradient id="seohwaGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6df9d" />
            <stop offset="50%" stopColor="#e5be6d" />
            <stop offset="100%" stopColor="#b08232" />
          </linearGradient>
          <linearGradient id="seohwaFanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e2747" />
            <stop offset="100%" stopColor="#0d1223" />
          </linearGradient>
          <radialGradient id="seohwaLanternGlow" cx="50%" cy="85%" r="50%">
            <stop offset="0%" stopColor="#f5c96b" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#f5c96b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="seohwaAlphaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="72%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="95%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="seohwaFadeMask">
            <rect x="0" y="0" width="320" height="380" fill="url(#seohwaAlphaGrad)" />
          </mask>
        </defs>

        {/* Outer Sacred Geometry Halo Rings */}
        <motion.g
          style={{ transformOrigin: '160px 146px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 54, repeat: Infinity, ease: 'linear' }}
          opacity={0.72}
        >
          <circle
            cx="160"
            cy="146"
            r="118"
            fill="none"
            stroke="url(#seohwaGoldGrad)"
            strokeOpacity="0.38"
            strokeWidth="1.1"
            strokeDasharray="6 7"
          />
          <circle
            cx="160"
            cy="146"
            r="102"
            fill="none"
            stroke={auraColor}
            strokeOpacity="0.28"
            strokeWidth="1"
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <circle
              key={deg}
              cx={160 + 118 * Math.cos((deg * Math.PI) / 180)}
              cy={146 + 118 * Math.sin((deg * Math.PI) / 180)}
              r={deg % 90 === 0 ? 3 : 1.7}
              fill="#e5be6d"
              opacity={0.8}
            />
          ))}
        </motion.g>

        {/* Crescent Moon Behind Head */}
        <path
          d="M196 52 A56 56 0 1 0 226 144 A46 46 0 1 1 196 52 Z"
          fill="url(#seohwaGoldGrad)"
          opacity="0.24"
        />

        {/* Character Layer */}
        <g mask="url(#seohwaFadeMask)">
          {/* Back Flowing Hair Silhouette */}
          <path
            d="M94 118 C72 162 66 238 64 345 L256 345 C254 238 248 162 226 118 C216 74 192 50 160 50 C128 50 104 74 94 118 Z"
            fill="url(#seohwaHairGrad)"
          />

          {/* Traditional Hair Updo Bun + Crescent Binyeo Hairpin */}
          <ellipse cx="160" cy="60" rx="28" ry="20" fill="#171b2d" />
          <line
            x1="96"
            y1="56"
            x2="226"
            y2="48"
            stroke="url(#seohwaGoldGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="228" cy="48" r="7" fill="url(#seohwaGoldGrad)" />
          <path
            d="M227 55 Q234 74 228 92"
            stroke="#e5be6d"
            strokeWidth="1.6"
            fill="none"
            opacity="0.85"
          />
          <circle cx="228" cy="95" r="3.2" fill="#f7e4ad" />

          {/* Hanbok Shoulders & Sleeves */}
          <path
            d="M52 372 C56 290 76 238 118 222 L160 236 L202 222 C244 238 264 290 268 372 Z"
            fill="url(#seohwaHanbokGrad)"
          />
          {/* Gold Constellation Shoulder Embroidery */}
          <path
            d="M84 270 Q106 258 122 276 M236 270 Q214 258 198 276"
            stroke="url(#seohwaGoldGrad)"
            strokeWidth="1.3"
            strokeDasharray="2 4"
            fill="none"
            opacity="0.65"
          />
          <circle cx="94" cy="288" r="2" fill="#e5be6d" opacity="0.7" />
          <circle cx="226" cy="288" r="2" fill="#e5be6d" opacity="0.7" />

          {/* Neck & Clavicle Shadow */}
          <path
            d="M144 180 L144 232 C144 244 176 244 176 232 L176 180 Z"
            fill="url(#seohwaSkinGrad)"
          />
          <path
            d="M144 185 Q160 202 176 185 L176 202 Q160 212 144 202 Z"
            fill="#cfa089"
            opacity="0.45"
          />

          {/* Hanbok Overlapping Lapel (깃 & 동정) */}
          <path
            d="M118 222 L156 286 L202 222 L214 230 L162 308 L106 230 Z"
            fill="#141a32"
            stroke="url(#seohwaGoldGrad)"
            strokeWidth="1.6"
          />
          {/* Crisp White Dongjeong Collar */}
          <path
            d="M126 220 L158 272 L194 220 L186 216 L158 258 L134 216 Z"
            fill="#f5efe3"
            opacity="0.96"
          />
          {/* Flowing Gold Goreum Ribbon Tie */}
          <path
            d="M168 272 C190 268 206 278 202 292 C196 300 176 292 168 282 Z"
            fill="url(#seohwaGoldGrad)"
          />
          <path
            d="M168 278 Q174 328 164 368"
            stroke="url(#seohwaGoldGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.92"
          />

          {/* Face Contour */}
          <path
            d="M118 118 C118 86 202 86 202 118 C202 154 188 188 160 194 C132 188 118 154 118 118 Z"
            fill="url(#seohwaSkinGrad)"
          />

          {/* Soft Cheek Glow */}
          <ellipse
            cx="132"
            cy="152"
            rx="10"
            ry="5"
            fill="#e57a70"
            opacity={isWarm ? 0.34 : 0.18}
          />
          <ellipse
            cx="188"
            cy="152"
            rx="10"
            ry="5"
            fill="#e57a70"
            opacity={isWarm ? 0.34 : 0.18}
          />

          {/* Eyes */}
          <motion.g
            style={{ transformOrigin: '160px 136px' }}
            animate={
              blinking
                ? { scaleY: 0.1 }
                : { scaleY: 1 }
            }
            transition={{ duration: 0.1 }}
          >
            {isWarm ? (
              <>
                <path
                  d="M129 138 Q138 130 147 138"
                  fill="none"
                  stroke="#181826"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M173 138 Q182 130 191 138"
                  fill="none"
                  stroke="#181826"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                {/* Left Eye */}
                <ellipse cx="138" cy="136" rx="9" ry="6.2" fill="#fcfaf7" />
                <circle cx="139" cy="136" r="5" fill="#c28b37" />
                <circle cx="139" cy="136" r="2.7" fill="#17141d" />
                <circle cx="137" cy="134" r="1.5" fill="#ffffff" />
                <path
                  d="M127 134 Q138 127 149 135"
                  fill="none"
                  stroke="#141522"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                {/* Right Eye */}
                <ellipse cx="182" cy="136" rx="9" ry="6.2" fill="#fcfaf7" />
                <circle cx="181" cy="136" r="5" fill="#c28b37" />
                <circle cx="181" cy="136" r="2.7" fill="#17141d" />
                <circle cx="179" cy="134" r="1.5" fill="#ffffff" />
                <path
                  d="M171 135 Q182 127 193 134"
                  fill="none"
                  stroke="#141522"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </>
            )}
          </motion.g>

          {/* Eyebrows (expression-sensitive!) */}
          <path
            d={
              isSmirk
                ? 'M127 123 Q138 119 148 123'
                : isFocus
                  ? 'M127 124 Q138 121 148 125'
                  : 'M127 124 Q138 120 148 124'
            }
            fill="none"
            stroke="#1b1f33"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d={
              isSmirk
                ? 'M172 121 Q182 115 193 121'
                : isFocus
                  ? 'M172 125 Q182 121 193 124'
                  : 'M172 124 Q182 120 193 124'
            }
            fill="none"
            stroke="#1b1f33"
            strokeWidth="2.1"
            strokeLinecap="round"
          />

          {/* Delicate Nose & Lips */}
          <path
            d="M159 144 Q157 154 160 156"
            fill="none"
            stroke="#c7957e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d={
              isWarm
                ? 'M151 169 Q160 177 169 169'
                : isSmirk
                  ? 'M152 170 Q162 174 170 166'
                  : isFocus
                    ? 'M154 171 Q160 172 166 171'
                    : 'M153 170 Q160 173 167 170'
            }
            fill="none"
            stroke="#b8565b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Forehead Subtle Gold Moon Mark (Mystic Accent) */}
          <path
            d="M160 105 A4.5 4.5 0 1 0 164 111 A3.6 3.6 0 1 1 160 105 Z"
            fill="#e5be6d"
            opacity="0.88"
          />

          {/* Front Framing Hair Strands */}
          <path
            d="M160 66 C130 68 112 90 112 124 C108 175 104 232 94 295 C108 265 114 218 118 176 C120 138 124 108 148 92 C142 104 139 114 140 120 C148 104 156 96 164 90 C172 100 182 112 192 124 C194 112 190 100 184 92 C196 108 200 138 202 176 C206 218 212 265 226 295 C216 232 212 175 208 124 C208 90 190 68 160 66 Z"
            fill="url(#seohwaHairGrad)"
          />

          {/* Expression-Specific Props */}
          {isSmirk && (
            <motion.g
              initial={{ opacity: 0, rotate: -10, y: 12 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              style={{ transformOrigin: '205px 265px' }}
            >
              {/* Folding East-Asian Paper Fan near lower right chin */}
              <path
                d="M206 254 L148 190 A78 78 0 0 1 258 196 Z"
                fill="url(#seohwaFanGrad)"
                stroke="url(#seohwaGoldGrad)"
                strokeWidth="2"
              />
              <line x1="206" y1="254" x2="174" y2="178" stroke="#e5be6d" strokeOpacity="0.45" strokeWidth="1" />
              <line x1="206" y1="254" x2="206" y2="172" stroke="#e5be6d" strokeOpacity="0.45" strokeWidth="1" />
              <line x1="206" y1="254" x2="234" y2="182" stroke="#e5be6d" strokeOpacity="0.45" strokeWidth="1" />
              <circle cx="206" cy="254" r="4" fill="#e5be6d" />
            </motion.g>
          )}

          {isFocus && (
            <motion.g
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glowing Constellation Fate Threads */}
              <path
                d="M72 238 Q128 208 160 232 T248 210"
                fill="none"
                stroke="#e5be6d"
                strokeWidth="1.6"
                strokeDasharray="4 4"
              />
              <circle cx="112" cy="222" r="3.5" fill="#f8e3a8" />
              <circle cx="160" cy="232" r="4.5" fill={auraColor} />
              <circle cx="212" cy="218" r="3.5" fill="#f8e3a8" />
            </motion.g>
          )}

          {isWarm && (
            <rect
              x="20"
              y="210"
              width="280"
              height="160"
              fill="url(#seohwaLanternGlow)"
            />
          )}
        </g>

        {/* Floating Stardust Particles */}
        {[
          { cx: 64, cy: 112, r: 2.2, delay: 0 },
          { cx: 256, cy: 126, r: 2.5, delay: 0.9 },
          { cx: 88, cy: 204, r: 1.8, delay: 1.7 },
          { cx: 248, cy: 238, r: 2.0, delay: 0.5 },
        ].map((dot, idx) => (
          <motion.circle
            key={idx}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={idx % 2 === 0 ? '#e5be6d' : auraColor}
            animate={{ opacity: [0.25, 0.95, 0.25], y: [0, -6, 0] }}
            transition={{
              duration: 3.4,
              delay: dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.svg>
    </motion.div>
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
      className={`relative overflow-hidden rounded-[22px] border p-4 shadow-2xl sm:p-5 ${
        onAdvance ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderColor: 'rgba(229, 190, 109, 0.28)',
      }}
    >
      {/* Top Speaker Tag */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
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

      <div className="flex items-start gap-3.5 sm:gap-4">
        {showPortrait && (
          <SeohwaPortrait
            expression={expression}
            size="compact"
            dominantElement={dominantElement}
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
