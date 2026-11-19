import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Download, FileCode2, Image as ImageIcon, X } from 'lucide-react';
import type { ElementPalette, ThemePresetId } from '../types/design';
import type { SajuResult } from '../types/saju';
import { copyToClipboard, formatKoreanBirthSummary } from './elementUtils';
import { generateSajuPosterSvg } from './SajuCardSvgGenerator';

export interface ExportShareModalProps {
  open: boolean;
  onClose: () => void;
  result: SajuResult;
  theme?: ThemePresetId;
  elementPalette?: Partial<ElementPalette>;
  pillarOrder?: 'traditional' | 'modern';
}

export function ExportShareModal({
  open,
  onClose,
  result,
  theme = 'obsidian',
  elementPalette,
  pillarOrder = 'traditional',
}: ExportShareModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [pngBusy, setPngBusy] = useState(false);

  const svgMarkup = useMemo(
    () =>
      generateSajuPosterSvg(result, {
        theme,
        elementPalette,
        pillarOrder,
      }),
    [result, theme, elementPalette, pillarOrder]
  );

  const svgPreviewUrl = useMemo(() => {
    if (!open) return '';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  }, [open, svgMarkup]);

  const summaryText = useMemo(() => formatKoreanBirthSummary(result), [result]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  const safeFileBase = (result.input.name || 'cheongmyeong-saju')
    .replace(/[^a-zA-Z0-9가-힣_-]/g, '-')
    .replace(/-+/g, '-');

  const handleDownloadSvg = () => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileBase}-saju-poster.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportStatus('SVG 벡터 포스터 다운로드 완료 (Figma에 바로 드롭 가능)');
  };

  const handleDownloadPng = async () => {
    setPngBusy(true);
    let blobUrl = '';
    try {
      const img = new window.Image();
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      blobUrl = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('SVG image load failed'));
        img.src = blobUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 2240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${safeFileBase}-saju-poster.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportStatus('고해상도 PNG(1600×2240) 이미지 저장 완료');
      }
    } catch {
      setExportStatus('PNG 변환 중 오류가 발생했습니다. SVG 저장을 이용해 주세요.');
    } finally {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setPngBusy(false);
    }
  };

  const handleCopySummary = async () => {
    const ok = await copyToClipboard(summaryText);
    if (ok) {
      setCopiedText(true);
      setExportStatus('사주 명식 요약 텍스트가 클립보드에 복사되었습니다.');
      window.setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl shadow-2xl md:rounded-[var(--radius-card)]"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-5 py-3.5"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h2 id="export-modal-title" className="text-base font-bold">
                  사주 아트워크 포스터 내보내기
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  현재 테마({theme})와 오행 팔레트가 반영된 Figma-ready 벡터 SVG / 2x PNG
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-12">
              {/* SVG Preview */}
              <div
                className="flex items-center justify-center rounded-2xl p-3 md:col-span-6"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {svgPreviewUrl && (
                  <img
                    src={svgPreviewUrl}
                    alt={`${result.input.name} 사주 포스터 미리보기`}
                    className="max-h-[48vh] w-auto rounded-xl shadow-xl"
                  />
                )}
              </div>

              {/* Actions & Korean Text Summary */}
              <div className="flex flex-col justify-between gap-4 md:col-span-6">
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-transform active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--accent-gold)',
                      color: 'var(--bg-canvas)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode2 className="h-4 w-4" />
                      <div>
                        <div className="text-xs font-bold">SVG 벡터 다운로드</div>
                        <div className="text-[11px] opacity-85">
                          레이어가 보존되어 Figma에 바로 드롭 가능
                        </div>
                      </div>
                    </div>
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={pngBusy}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors disabled:opacity-60"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
                      <div>
                        <div className="text-xs font-bold">
                          {pngBusy ? 'PNG 변환 중...' : 'PNG 고해상도 저장 (2x)'}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          1600 × 2240px 공유용 래스터 이미지
                        </div>
                      </div>
                    </div>
                    <Download className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {copiedText ? (
                        <Check className="h-4 w-4" style={{ color: 'var(--color-wood)' }} />
                      ) : (
                        <Copy className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
                      )}
                      <div>
                        <div className="text-xs font-bold">
                          {copiedText ? '요약 텍스트 복사됨!' : '한국어 요약 텍스트 복사'}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          노션 · 메신저 공유용 정갈한 리포트 포맷
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span
                    className="block text-[11px] font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    텍스트 요약 미리보기
                  </span>
                  <pre
                    className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl p-3 font-sans text-[11px] leading-relaxed"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {summaryText}
                  </pre>
                </div>

                {exportStatus && (
                  <p
                    className="rounded-xl px-3 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--accent-gold-soft)',
                      color: 'var(--accent-gold)',
                    }}
                    role="status"
                  >
                    {exportStatus}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
