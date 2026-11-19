import { useEffect, useRef } from 'react';
import type { ElementKey } from '../types/saju';
import type { ThemePresetId } from '../types/design';
import { useMotionSettings } from './MotionContext';
import { clampMotionSpeed, isMotionReduced } from './presets';

export interface AmbientCosmosCanvasProps {
  dominantElement: ElementKey;
  theme: ThemePresetId;
  contained?: boolean;
  className?: string;
}

interface RgbTuple {
  r: number;
  g: number;
  b: number;
}

interface StarParticle {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  twinkleSpeed: number;
  depth: number;
  isAccent: boolean;
}

const ELEMENT_FALLBACK_RGB: Record<ElementKey, RgbTuple> = {
  wood: { r: 56, g: 201, b: 136 },
  fire: { r: 255, g: 107, b: 91 },
  earth: { r: 232, g: 177, b: 74 },
  metal: { r: 203, g: 213, b: 225 },
  water: { r: 79, g: 163, b: 255 },
};

const HANJI_ELEMENT_INK_RGB: Record<ElementKey, RgbTuple> = {
  wood: { r: 23, g: 126, b: 82 },
  fire: { r: 195, g: 64, b: 48 },
  earth: { r: 150, g: 101, b: 16 },
  metal: { r: 79, g: 89, b: 104 },
  water: { r: 30, g: 94, b: 184 },
};

const THEME_ACCENT_RGB: Record<ThemePresetId, RgbTuple> = {
  obsidian: { r: 227, g: 185, b: 99 },
  hanji: { r: 150, g: 101, b: 16 },
  celadon: { r: 174, g: 218, b: 200 },
  dancheong: { r: 242, g: 184, b: 75 },
};

function parseCssColor(value: string): RgbTuple | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b };
      }
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b };
      }
    }
  }

  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }

  return null;
}

function rgba(c: RgbTuple, a: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
}

function createStarField(count: number): StarParticle[] {
  let seed = 20261119;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const stars: StarParticle[] = [];
  for (let i = 0; i < count; i++) {
    const depth = 0.25 + rand() * 0.75;
    stars.push({
      nx: rand(),
      ny: rand(),
      vx: (rand() - 0.5) * 0.012 * depth,
      vy: (rand() - 0.5) * 0.009 * depth,
      radius: 0.7 + rand() * 1.9 * depth,
      alpha: 0.2 + rand() * 0.65,
      phase: rand() * Math.PI * 2,
      twinkleSpeed: 0.6 + rand() * 1.4,
      depth,
      isAccent: i % 3 === 0,
    });
  }
  return stars;
}

export function AmbientCosmosCanvas({
  dominantElement,
  theme,
  contained = false,
  className = '',
}: AmbientCosmosCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const settings = useMotionSettings();
  const reduced = isMotionReduced(settings);
  const speed = clampMotionSpeed(settings.speed);

  // Keep latest reactive speed inside a ref so rAF loop scales smoothly without resetting stars
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLight = theme === 'hanji';

    const readPalette = (): {
      elementRgb: RgbTuple;
      accentRgb: RgbTuple;
      inkRgb: RgbTuple;
    } => {
      const styles = getComputedStyle(document.documentElement);
      const cssElColor = parseCssColor(
        styles.getPropertyValue(`--color-${dominantElement}`)
      );
      const cssAccent = parseCssColor(styles.getPropertyValue('--accent-gold'));

      return {
        elementRgb:
          cssElColor ??
          (isLight
            ? HANJI_ELEMENT_INK_RGB[dominantElement]
            : ELEMENT_FALLBACK_RGB[dominantElement]),
        accentRgb: cssAccent ?? THEME_ACCENT_RGB[theme],
        inkRgb: isLight ? { r: 68, g: 58, b: 46 } : { r: 235, g: 232, b: 224 },
      };
    };

    let cachedPalette = readPalette();

    let width = 0;
    let height = 0;
    let dpr = 1;

    const stars = createStarField(
      typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 56
    );

    const targetParallax = { x: 0, y: 0 };
    const smoothParallax = { x: 0, y: 0 };

    const updateSize = () => {
      const host = contained ? canvas.parentElement : null;
      const nextW = host ? host.clientWidth : window.innerWidth;
      const nextH = host ? host.clientHeight : window.innerHeight;
      if (nextW <= 0 || nextH <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = nextW;
      height = nextH;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    let simTime = 0;
    let lastTimestamp = performance.now();
    let rafId = 0;
    let isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';

    const drawFrame = (elapsedSec: number, dtSec: number) => {
      if (width <= 0 || height <= 0) return;

      const palette = cachedPalette;
      ctx.clearRect(0, 0, width, height);

      // Smooth pointer parallax
      smoothParallax.x += (targetParallax.x - smoothParallax.x) * 0.06;
      smoothParallax.y += (targetParallax.y - smoothParallax.y) * 0.06;

      const minDim = Math.min(width, height);

      // 1. Subtle cosmic / mineral nebula washes
      const primaryX = width * 0.72 + smoothParallax.x * 0.45;
      const primaryY = height * 0.24 + smoothParallax.y * 0.45;
      const primaryGrad = ctx.createRadialGradient(
        primaryX,
        primaryY,
        0,
        primaryX,
        primaryY,
        minDim * 0.72
      );
      primaryGrad.addColorStop(
        0,
        rgba(palette.elementRgb, isLight ? 0.08 : 0.14)
      );
      primaryGrad.addColorStop(
        0.5,
        rgba(palette.accentRgb, isLight ? 0.035 : 0.055)
      );
      primaryGrad.addColorStop(1, rgba(palette.elementRgb, 0));
      ctx.fillStyle = primaryGrad;
      ctx.fillRect(0, 0, width, height);

      const secondaryX = width * 0.22 - smoothParallax.x * 0.35;
      const secondaryY = height * 0.78 - smoothParallax.y * 0.35;
      const secondaryGrad = ctx.createRadialGradient(
        secondaryX,
        secondaryY,
        0,
        secondaryX,
        secondaryY,
        minDim * 0.65
      );
      secondaryGrad.addColorStop(
        0,
        rgba(palette.accentRgb, isLight ? 0.065 : 0.1)
      );
      secondaryGrad.addColorStop(1, rgba(palette.accentRgb, 0));
      ctx.fillStyle = secondaryGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Flowing celestial orbital arcs (천상열차분야지도 motif)
      const cx = width * 0.5 + smoothParallax.x * 0.25;
      const cy = height * 0.46 + smoothParallax.y * 0.25;
      const baseR = minDim * 0.38;

      ctx.save();
      ctx.translate(cx, cy);

      const arcCount = 3;
      for (let i = 0; i < arcCount; i++) {
        const radius = baseR * (0.72 + i * 0.28);
        const rot =
          elapsedSec * (0.035 + i * 0.015) * (i % 2 === 0 ? 1 : -1) + i * 1.1;
        ctx.save();
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 1.35);
        ctx.strokeStyle = rgba(
          i === 1 ? palette.elementRgb : palette.accentRgb,
          isLight ? 0.095 - i * 0.02 : 0.11 - i * 0.025
        );
        ctx.lineWidth = i === 0 ? 1 : 0.75;
        if (i === 2) {
          ctx.setLineDash([4, 9]);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // 3. Advance & project star positions
      const screenStars: { x: number; y: number; star: StarParticle }[] = [];
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (dtSec > 0) {
          s.nx = (s.nx + s.vx * dtSec + 1) % 1;
          s.ny = (s.ny + s.vy * dtSec + 1) % 1;
        }
        const x = s.nx * width + smoothParallax.x * s.depth;
        const y = s.ny * height + smoothParallax.y * s.depth;
        screenStars.push({ x, y, star: s });
      }

      // 4. Faint constellation connections
      const maxLinkDist = Math.min(145, minDim * 0.24);
      const maxLinkDistSq = maxLinkDist * maxLinkDist;
      ctx.lineWidth = 0.7;

      for (let i = 0; i < screenStars.length; i++) {
        const a = screenStars[i];
        for (let j = i + 1; j < screenStars.length; j++) {
          const b = screenStars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxLinkDistSq) {
            const proximity = 1 - Math.sqrt(distSq) / maxLinkDist;
            const lineAlpha = proximity * (isLight ? 0.11 : 0.13);
            ctx.strokeStyle = rgba(palette.accentRgb, lineAlpha);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 5. Stardust particles
      for (let i = 0; i < screenStars.length; i++) {
        const { x, y, star } = screenStars[i];
        const twinkle =
          0.65 +
          0.35 * Math.sin(elapsedSec * star.twinkleSpeed + star.phase);
        const alpha = star.alpha * twinkle * (isLight ? 0.55 : 0.85);
        const color = star.isAccent ? palette.elementRgb : palette.inkRgb;

        if (!isLight && star.radius > 1.55) {
          ctx.fillStyle = rgba(palette.elementRgb, alpha * 0.22);
          ctx.beginPath();
          ctx.arc(x, y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = rgba(color, alpha);
        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (reduced || e.pointerType === 'touch' || width <= 0 || height <= 0) {
        return;
      }
      const nx = (e.clientX / width - 0.5) * 2;
      const ny = (e.clientY / height - 0.5) * 2;
      targetParallax.x = nx * 16;
      targetParallax.y = ny * 12;
    };

    const handleVisibilityChange = () => {
      isHidden = document.visibilityState === 'hidden';
      if (!isHidden) {
        lastTimestamp = performance.now();
      }
    };

    const resizeTarget = contained && canvas.parentElement ? canvas.parentElement : null;
    let resizeObserver: ResizeObserver | null = null;
    if (resizeTarget && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
        if (reduced) {
          drawFrame(0, 0);
        }
      });
      resizeObserver.observe(resizeTarget);
    }

    const handleWindowResize = () => {
      updateSize();
      if (reduced) {
        drawFrame(0, 0);
      }
    };

    window.addEventListener('resize', handleWindowResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const finePointer =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(pointer: fine)')?.matches);

    if (!reduced && finePointer) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        cachedPalette = readPalette();
        if (reduced) {
          drawFrame(0, 0);
        }
      });
      mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'data-theme'],
      });
    }

    if (reduced) {
      drawFrame(0, 0);
    } else {
      const tick = (now: number) => {
        const rawDt = Math.min(0.05, Math.max(0, (now - lastTimestamp) / 1000));
        lastTimestamp = now;

        if (!isHidden) {
          const dt = rawDt * speedRef.current;
          simTime += dt;
          drawFrame(simTime, dt);
        }

        rafId = window.requestAnimationFrame(tick);
      };
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dominantElement, theme, contained, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`${
        contained ? 'absolute' : 'fixed'
      } inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
