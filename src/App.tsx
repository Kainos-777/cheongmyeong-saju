import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  BirthInputSheet,
  BottomTabBar,
  ExportShareModal,
  HeaderNav,
} from './components';
import { BIRTH_CITIES, PRESET_PROFILES } from './engine';
import { AmbientCosmosCanvas, MotionProvider } from './motion';
import { CompatibilityPage } from './pages/CompatibilityPage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { ElementsPage } from './pages/ElementsPage';
import { LuckTimelinePage } from './pages/LuckTimelinePage';
import { PillarsPage } from './pages/PillarsPage';
import { SajuStoreProvider, useSajuStore } from './store/sajuStore';
import {
  DesignerStudioDrawer,
  DesignerStudioProvider,
  DeviceFrameStage,
  GridOverlay,
  useDesignerStudio,
} from './studio';

function CheongmyeongAppShell() {
  const { tokens, toggleStudio } = useDesignerStudio();
  const {
    profiles,
    activeProfile,
    sajuResult,
    activeTab,
    birthInputModal,
    exportModalOpen,
    setActiveTab,
    selectProfile,
    saveProfile,
    deleteProfile,
    openBirthInput,
    closeBirthInput,
    openExportModal,
    closeExportModal,
  } = useSajuStore();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'pillars':
        return <PillarsPage />;
      case 'elements':
        return <ElementsPage />;
      case 'luck':
        return <LuckTimelinePage />;
      case 'compatibility':
        return <CompatibilityPage />;
      case 'design-system':
        return <DesignSystemPage />;
      default:
        return <PillarsPage />;
    }
  };

  return (
    <MotionProvider settings={tokens.motion}>
      <MotionConfig reducedMotion={tokens.motion.reducedMotion ? 'always' : 'never'}>
        <DeviceFrameStage>
          <div className="relative min-h-dvh w-full">
            <AmbientCosmosCanvas
              dominantElement={sajuResult.dominantElement}
              theme={tokens.theme}
            />
            <GridOverlay />

            <div className="relative z-10 flex min-h-dvh flex-col">
              <HeaderNav
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                profiles={profiles}
                activeProfile={activeProfile}
                onSelectProfile={selectProfile}
                onDeleteProfile={deleteProfile}
                onOpenBirthInput={() => openBirthInput('create')}
                onOpenExport={openExportModal}
                onToggleStudio={() => toggleStudio()}
                studioOpen={tokens.studioOpen}
                dayMasterElement={sajuResult.dayMaster.element}
                iljuTitle={sajuResult.interpretation.iljuTitle}
              />

              <main className="mx-auto w-full max-w-7xl flex-1 px-3 pt-4 pb-28 sm:px-5 md:pb-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={
                      tokens.motion.reducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 10 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      tokens.motion.reducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: -6 }
                    }
                    transition={
                      tokens.motion.reducedMotion
                        ? { duration: 0 }
                        : { duration: 0.2, ease: 'easeOut' }
                    }
                  >
                    {renderActivePage()}
                  </motion.div>
                </AnimatePresence>
              </main>

              <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
            </div>

            <BirthInputSheet
              open={birthInputModal.open}
              mode={birthInputModal.mode}
              onClose={closeBirthInput}
              onSubmit={(input) => saveProfile(input, birthInputModal.mode)}
              initialValue={
                birthInputModal.mode === 'edit' ? activeProfile : undefined
              }
              cities={BIRTH_CITIES}
              presets={PRESET_PROFILES}
            />

            <ExportShareModal
              open={exportModalOpen}
              onClose={closeExportModal}
              result={sajuResult}
              theme={tokens.theme}
              elementPalette={tokens.elementPalette}
              pillarOrder={tokens.pillarOrder}
            />
          </div>
        </DeviceFrameStage>

        <DesignerStudioDrawer showFloatingTrigger />
      </MotionConfig>
    </MotionProvider>
  );
}

export function App() {
  return (
    <DesignerStudioProvider>
      <SajuStoreProvider>
        <CheongmyeongAppShell />
      </SajuStoreProvider>
    </DesignerStudioProvider>
  );
}

export default App;
