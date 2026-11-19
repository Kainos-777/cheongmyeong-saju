import { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import { useDesignerStudio } from './DesignerStudioProvider';
import { DENSITY_PAD_MAP, MOTION_PRESET_CONFIGS } from './themes';

type ExportFormat = 'w3c' | 'css' | 'motion';

export function ExportTokensTab() {
  const { tokens, activeThemePreset } = useDesignerStudio();
  const [format, setFormat] = useState<ExportFormat>('w3c');
  const [copied, setCopied] = useState(false);

  const radiusPx = Math.round(tokens.radiusScale * 18);
  const densityPad = DENSITY_PAD_MAP[tokens.density];

  const payload = useMemo(() => {
    if (format === 'w3c') {
      const json = {
        $schema: 'https://tr.designtokens.org/format/',
        meta: {
          brand: '청명 (CHEONGMYEONG · 淸明)',
          theme: tokens.theme,
          themeLabel: `${activeThemePreset.nameKo} (${activeThemePreset.nameEn})`,
          mode: activeThemePreset.mode,
          density: tokens.density,
          pillarOrder: tokens.pillarOrder,
        },
        color: {
          surface: {
            canvas: { $type: 'color', $value: activeThemePreset.tokens.bgCanvas },
            elevated: { $type: 'color', $value: activeThemePreset.tokens.bgElevated },
            primary: { $type: 'color', $value: activeThemePreset.tokens.surface1 },
            secondary: { $type: 'color', $value: activeThemePreset.tokens.surface2 },
            glass: { $type: 'color', $value: activeThemePreset.tokens.surfaceGlass },
          },
          text: {
            primary: { $type: 'color', $value: activeThemePreset.tokens.textPrimary },
            secondary: { $type: 'color', $value: activeThemePreset.tokens.textSecondary },
            muted: { $type: 'color', $value: activeThemePreset.tokens.textMuted },
          },
          accent: {
            gold: { $type: 'color', $value: activeThemePreset.tokens.accentGold },
            goldSoft: { $type: 'color', $value: activeThemePreset.tokens.accentGoldSoft },
          },
          element: {
            wood: { $type: 'color', $value: tokens.elementPalette.wood, $description: '목 (木)' },
            fire: { $type: 'color', $value: tokens.elementPalette.fire, $description: '화 (火)' },
            earth: { $type: 'color', $value: tokens.elementPalette.earth, $description: '토 (土)' },
            metal: { $type: 'color', $value: tokens.elementPalette.metal, $description: '금 (金)' },
            water: { $type: 'color', $value: tokens.elementPalette.water, $description: '수 (水)' },
          },
        },
        dimension: {
          radiusCard: { $type: 'dimension', $value: `${radiusPx}px` },
          glassBlur: { $type: 'dimension', $value: `${tokens.glassBlur}px` },
          densityPad: { $type: 'dimension', $value: densityPad },
          baseFontSize: {
            $type: 'dimension',
            $value: `${(16 * tokens.fontScale).toFixed(1)}px`,
          },
        },
        motion: {
          preset: { $type: 'string', $value: tokens.motion.preset },
          speed: { $type: 'number', $value: tokens.motion.speed },
          stiffness: { $type: 'number', $value: tokens.motion.stiffness },
          damping: { $type: 'number', $value: tokens.motion.damping },
          mass: { $type: 'number', $value: tokens.motion.mass },
          reducedMotion: { $type: 'boolean', $value: tokens.motion.reducedMotion },
        },
      };
      return {
        filename: 'cheongmyeong.tokens.json',
        mime: 'application/json',
        code: JSON.stringify(json, null, 2),
      };
    }

    if (format === 'css') {
      const css = `/* 청명 (CHEONGMYEONG) Design Tokens — ${activeThemePreset.nameKo} */
:root,
[data-theme="${tokens.theme}"] {
  color-scheme: ${activeThemePreset.mode};

  --bg-canvas: ${activeThemePreset.tokens.bgCanvas};
  --bg-elevated: ${activeThemePreset.tokens.bgElevated};
  --surface-1: ${activeThemePreset.tokens.surface1};
  --surface-2: ${activeThemePreset.tokens.surface2};
  --surface-glass: ${activeThemePreset.tokens.surfaceGlass};
  --border-subtle: ${activeThemePreset.tokens.borderSubtle};
  --border-strong: ${activeThemePreset.tokens.borderStrong};

  --text-primary: ${activeThemePreset.tokens.textPrimary};
  --text-secondary: ${activeThemePreset.tokens.textSecondary};
  --text-muted: ${activeThemePreset.tokens.textMuted};

  --accent-gold: ${activeThemePreset.tokens.accentGold};
  --accent-gold-soft: ${activeThemePreset.tokens.accentGoldSoft};

  --color-wood: ${tokens.elementPalette.wood};
  --color-fire: ${tokens.elementPalette.fire};
  --color-earth: ${tokens.elementPalette.earth};
  --color-metal: ${tokens.elementPalette.metal};
  --color-water: ${tokens.elementPalette.water};

  --radius-scale: ${tokens.radiusScale};
  --radius-card: ${radiusPx}px;
  --glass-blur: ${tokens.glassBlur}px;
  --font-scale: ${tokens.fontScale};
  --density-pad: ${densityPad};
  --motion-speed: ${tokens.motion.speed};
}`;
      return {
        filename: 'cheongmyeong-tokens.css',
        mime: 'text/css',
        code: css,
      };
    }

    const presetInfo = MOTION_PRESET_CONFIGS[tokens.motion.preset];
    const effectiveSpeed = Math.max(0.1, tokens.motion.speed);
    const tsCode = `// 청명 (CHEONGMYEONG) Framer Motion Choreography Spec
// Preset: ${presetInfo.nameEn} (${presetInfo.nameKo})

export const CHEONGMYEONG_MOTION_SPEC = {
  preset: '${tokens.motion.preset}',
  speed: ${tokens.motion.speed},
  reducedMotion: ${tokens.motion.reducedMotion},
  spring: {
    type: 'spring' as const,
    stiffness: ${tokens.motion.stiffness},
    damping: ${tokens.motion.damping},
    mass: ${tokens.motion.mass},
  },
  timeScaledSpring: {
    type: 'spring' as const,
    stiffness: ${Math.round(tokens.motion.stiffness * effectiveSpeed * effectiveSpeed)},
    damping: ${Number((tokens.motion.damping * effectiveSpeed).toFixed(2))},
    mass: ${tokens.motion.mass},
  },
  staggerStepSec: ${Number((0.08 / effectiveSpeed).toFixed(3))},
} as const;
`;
    return {
      filename: 'cheongmyeong-motion.ts',
      mime: 'text/typescript',
      code: tsCode,
    };
  }, [format, tokens, activeThemePreset, radiusPx, densityPad]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload.code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = payload.code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([payload.code], { type: payload.mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = payload.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3.5">
      {/* Format Tabs */}
      <div
        className="grid grid-cols-3 gap-1 rounded-xl border p-1"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
      >
        {[
          { id: 'w3c' as const, label: 'Figma JSON' },
          { id: 'css' as const, label: 'CSS Vars' },
          { id: 'motion' as const, label: 'Motion TS' },
        ].map((tab) => {
          const active = format === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFormat(tab.id);
                setCopied(false);
              }}
              aria-pressed={active}
              className="rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors"
              style={{
                backgroundColor: active ? 'var(--accent-gold-soft)' : 'transparent',
                color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* File Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileCode2 className="h-3.5 w-3.5" style={{ color: 'var(--accent-gold)' }} />
          <span className="font-mono-spec text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {payload.filename}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
            style={{
              backgroundColor: 'var(--surface-1)',
              borderColor: 'var(--border-subtle)',
              color: copied ? 'var(--color-wood)' : 'var(--text-primary)',
            }}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? '복사됨!' : '복사'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
            style={{
              backgroundColor: 'var(--accent-gold-soft)',
              borderColor: 'var(--accent-gold)',
              color: 'var(--accent-gold)',
            }}
          >
            <Download className="h-3 w-3" />
            <span>다운로드</span>
          </button>
        </div>
      </div>

      {/* Live Code Preview */}
      <pre
        className="font-mono-spec max-h-[360px] overflow-auto rounded-2xl border p-3.5 text-[11px] leading-relaxed"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <code>{payload.code}</code>
      </pre>
    </div>
  );
}
