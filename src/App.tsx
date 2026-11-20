import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Moon, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ExportShareModal } from './components';
import {
  AmbientCosmosCanvas,
  DEFAULT_MOTION_SETTINGS,
  MotionProvider,
} from './motion';
import { SajuStoreProvider, useSajuStore } from './store/sajuStore';
import {
  ChapterResultStage,
  ConversationalInputStage,
  LandingStage,
  RitualLoadingStage,
  StoryIntroStage,
  useSoundEngine,
} from './story';

function CheongmyeongStoryShell() {
  const {
    profiles,
    activeProfile,
    sajuResult,
    personAId,
    personBId,
    compatibility,
    exportModalOpen,
    stage,
    chapter,
    focusTopic,
    isSharedView,
    hasUserSubmittedProfile,
    pillarOrder,
    setStage,
    setChapter,
    setFocusTopic,
    togglePillarOrder,
    startReading,
    claimOwnReading,
    setPersonAId,
    setPersonBId,
    saveCustomCompatibilityProfile,
    openExportModal,
    closeExportModal,
  } = useSajuStore();

  const { soundEnabled, toggleSound, playTap } = useSoundEngine();

  return (
    <MotionProvider settings={DEFAULT_MOTION_SETTINGS}>
      <MotionConfig reducedMotion="user">
        <div
          className="relative min-h-dvh w-full overflow-x-clip"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            color: 'var(--text-primary)',
          }}
        >
          <AmbientCosmosCanvas
            dominantElement={sajuResult.dominantElement}
            theme="obsidian"
          />

          {/* Minimal Floating Top Bar: Brand + Sound Toggle */}
          <header
            className="sticky top-0 z-40 border-b"
            style={{
              backgroundColor: 'rgba(7, 8, 13, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-5">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setStage('landing');
                }}
                className="flex min-h-[40px] items-center gap-2 rounded-full px-2 py-1 text-left transition-opacity hover:opacity-90"
                aria-label="청명각 홈으로"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: 'var(--accent-gold-soft)',
                    borderColor: 'rgba(229, 190, 109, 0.35)',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <Moon className="h-4 w-4" />
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="font-serif-kr text-sm font-bold tracking-tight sm:text-base">
                    청명각
                  </span>
                  <span
                    className="font-serif-kr text-xs"
                    style={{ color: 'var(--accent-gold)' }}
                  >
                    淸明閣
                  </span>
                </span>
              </button>

              <div className="flex items-center gap-2">
                {stage === 'result' && (
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setStage('input');
                    }}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    새 사주
                  </button>
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  aria-label="배경음 및 효과음 토글"
                  onClick={() => toggleSound()}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: soundEnabled
                      ? 'var(--accent-gold-soft)'
                      : 'var(--surface-1)',
                    borderColor: soundEnabled
                      ? 'rgba(229, 190, 109, 0.45)'
                      : 'var(--border-subtle)',
                    color: soundEnabled
                      ? 'var(--accent-gold)'
                      : 'var(--text-secondary)',
                  }}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5" />
                  )}
                  <span>{soundEnabled ? '소리 ON' : '소리 OFF'}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Visual-Novel / Story Flow */}
          <main className="relative z-10 w-full">
            <AnimatePresence mode="wait">
              {stage === 'landing' && (
                <motion.div
                  key="stage-landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <LandingStage
                    onStartStory={() => setStage('story')}
                    onSkipToInput={() => setStage('input')}
                    onResumeSaved={
                      hasUserSubmittedProfile
                        ? () => {
                            setChapter(0);
                            setStage('result');
                          }
                        : undefined
                    }
                    savedProfileName={
                      hasUserSubmittedProfile ? activeProfile.name : undefined
                    }
                  />
                </motion.div>
              )}

              {stage === 'story' && (
                <motion.div
                  key="stage-story"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <StoryIntroStage
                    focusTopic={focusTopic}
                    onSelectFocusTopic={setFocusTopic}
                    onComplete={() => setStage('input')}
                    onSkip={() => setStage('input')}
                  />
                </motion.div>
              )}

              {stage === 'input' && (
                <motion.div
                  key="stage-input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <ConversationalInputStage
                    initialValue={activeProfile}
                    onSubmit={startReading}
                    onBackToStory={() => setStage('story')}
                  />
                </motion.div>
              )}

              {stage === 'ritual' && (
                <motion.div
                  key="stage-ritual"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                >
                  <RitualLoadingStage
                    userName={activeProfile.name}
                    onComplete={() => {
                      setChapter(0);
                      setStage('result');
                    }}
                  />
                </motion.div>
              )}

              {stage === 'result' && (
                <motion.div
                  key="stage-result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChapterResultStage
                    sajuResult={sajuResult}
                    focusTopic={focusTopic}
                    chapter={chapter}
                    onChangeChapter={setChapter}
                    pillarOrder={pillarOrder}
                    onTogglePillarOrder={togglePillarOrder}
                    isSharedView={isSharedView}
                    onClaimOwnReading={claimOwnReading}
                    onStartNewReading={() => setStage('input')}
                    onReplayOpening={() => setStage('story')}
                    onOpenPosterModal={openExportModal}
                    compatibility={compatibility}
                    profiles={profiles}
                    personAId={personAId}
                    personBId={personBId}
                    onSelectPersonA={setPersonAId}
                    onSelectPersonB={setPersonBId}
                    onCustomInputPersonA={(input) =>
                      saveCustomCompatibilityProfile('A', input)
                    }
                    onCustomInputPersonB={(input) =>
                      saveCustomCompatibilityProfile('B', input)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <ExportShareModal
            open={exportModalOpen}
            onClose={closeExportModal}
            result={sajuResult}
            theme="obsidian"
            pillarOrder={pillarOrder}
          />
        </div>
      </MotionConfig>
    </MotionProvider>
  );
}

export function App() {
  return (
    <SajuStoreProvider>
      <CheongmyeongStoryShell />
    </SajuStoreProvider>
  );
}

export default App;
