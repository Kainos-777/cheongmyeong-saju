import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  PRESET_PROFILES,
  calculateCompatibility,
  calculateSaju,
} from '../engine';
import {
  readSharedFromLocation,
  type AppStage,
  type FocusTopic,
  type ResultChapter,
} from '../story/storyCore';
import type { AppTab } from '../types/design';
import type {
  BirthInput,
  CompatibilityResult,
  SajuResult,
} from '../types/saju';

const PROFILES_STORAGE_KEY = 'cheongmyeong:profiles:v1';
const ACTIVE_PROFILE_STORAGE_KEY = 'cheongmyeong:active-profile:v1';

function ensureProfileId(input: BirthInput, fallbackIndex = 0): BirthInput {
  if (input.id && input.id.trim().length > 0) return input;
  return {
    ...input,
    id: `profile-${Date.now()}-${fallbackIndex}`,
  };
}

function loadInitialProfiles(): BirthInput[] {
  const defaults = PRESET_PROFILES.map((p, idx) => ensureProfileId(p, idx));
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaults;

    const valid = parsed.filter(
      (item): item is BirthInput =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.year === 'number' &&
        typeof item.month === 'number' &&
        typeof item.day === 'number',
    );
    if (valid.length === 0) return defaults;
    return valid.map((p, idx) => ensureProfileId(p, idx));
  } catch {
    return defaults;
  }
}

function loadInitialActiveProfileId(profiles: BirthInput[]): string {
  const fallback = profiles[0]?.id ?? 'preset-ux-designer';
  if (typeof window === 'undefined') return fallback;

  try {
    const saved = window.localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
    if (saved && profiles.some((p) => (p.id ?? p.name) === saved)) {
      return saved;
    }
  } catch {
    // Ignore storage read failure
  }
  return fallback;
}

function pickPartnerId(profiles: BirthInput[], primaryId: string): string {
  const presetPartner = profiles.find(
    (p) =>
      (p.id ?? p.name) === 'preset-partner-sample' &&
      (p.id ?? p.name) !== primaryId,
  );
  if (presetPartner) return presetPartner.id ?? presetPartner.name;
  const other = profiles.find((p) => (p.id ?? p.name) !== primaryId);
  return other ? (other.id ?? other.name) : primaryId;
}

export interface BirthInputModalState {
  open: boolean;
  mode: 'create' | 'edit';
}

export interface SajuStoreContextValue {
  profiles: BirthInput[];
  activeProfileId: string;
  activeProfile: BirthInput;
  sajuResult: SajuResult;
  personAId: string;
  personBId: string;
  compatibility: CompatibilityResult;
  activeTab: AppTab;
  birthInputModal: BirthInputModalState;
  exportModalOpen: boolean;
  isCalculating: boolean;
  // Story renewal state
  stage: AppStage;
  chapter: ResultChapter;
  focusTopic: FocusTopic;
  isSharedView: boolean;
  hasUserSubmittedProfile: boolean;
  pillarOrder: 'traditional' | 'modern';
  setStage: (stage: AppStage) => void;
  setChapter: (chapter: ResultChapter) => void;
  setFocusTopic: (topic: FocusTopic) => void;
  togglePillarOrder: () => void;
  startReading: (input: BirthInput) => void;
  claimOwnReading: () => void;
  // Backwards-compatible actions
  setActiveTab: (tab: AppTab) => void;
  selectProfile: (profileId: string) => void;
  saveProfile: (input: BirthInput, mode?: 'create' | 'edit') => void;
  deleteProfile: (profileId: string) => void;
  setPersonAId: (profileId: string) => void;
  setPersonBId: (profileId: string) => void;
  saveCustomCompatibilityProfile: (side: 'A' | 'B', input: BirthInput) => void;
  openBirthInput: (mode?: 'create' | 'edit') => void;
  closeBirthInput: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  resetProfiles: () => void;
}

const SajuStoreContext = createContext<SajuStoreContextValue | null>(null);

export function SajuStoreProvider({ children }: { children: ReactNode }) {
  const initialShared = useMemo(() => readSharedFromLocation(), []);

  const [profiles, setProfiles] = useState<BirthInput[]>(() => {
    const base = loadInitialProfiles();
    if (!initialShared) return base;
    const sharedId = initialShared.input.id ?? `shared-${Date.now()}`;
    const sharedProfile = { ...initialShared.input, id: sharedId };
    const withoutDup = base.filter((p) => (p.id ?? p.name) !== sharedId);
    return [sharedProfile, ...withoutDup];
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    if (initialShared) {
      return initialShared.input.id ?? 'shared-profile';
    }
    return loadInitialActiveProfileId(loadInitialProfiles());
  });

  const [personAId, setPersonAId] = useState<string>(() => activeProfileId);
  const [personBId, setPersonBId] = useState<string>(() =>
    pickPartnerId(profiles, activeProfileId),
  );

  // Story renewal state
  const [stage, setStage] = useState<AppStage>(() =>
    initialShared ? 'result' : 'landing',
  );
  const [chapter, setChapter] = useState<ResultChapter>(0);
  const [focusTopic, setFocusTopic] = useState<FocusTopic>(
    () => initialShared?.focusTopic ?? 'roast',
  );
  const [isSharedView, setIsSharedView] = useState<boolean>(() =>
    Boolean(initialShared),
  );
  const [hasUserSubmittedProfile, setHasUserSubmittedProfile] =
    useState<boolean>(() =>
      profiles.some(
        (p) => p.id && !p.id.startsWith('preset-') && !p.id.startsWith('shared-'),
      ),
    );
  const [pillarOrder, setPillarOrder] = useState<'traditional' | 'modern'>(
    'traditional',
  );

  // Legacy-compatible state
  const [activeTab, setActiveTab] = useState<AppTab>('pillars');
  const [birthInputModal, setBirthInputModal] = useState<BirthInputModalState>({
    open: false,
    mode: 'create',
  });
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const pulseTimerRef = useRef<number | null>(null);

  const triggerCalculationPulse = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
    }
    setIsCalculating(true);
    pulseTimerRef.current = window.setTimeout(() => {
      setIsCalculating(false);
      pulseTimerRef.current = null;
    }, 340);
  }, []);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(pulseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        PROFILES_STORAGE_KEY,
        JSON.stringify(profiles),
      );
      window.localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, activeProfileId);
    } catch {
      // Ignore quota / privacy mode failures
    }
  }, [profiles, activeProfileId]);

  const activeProfile = useMemo(
    () =>
      profiles.find((p) => (p.id ?? p.name) === activeProfileId) ??
      profiles[0] ??
      PRESET_PROFILES[0],
    [profiles, activeProfileId],
  );

  const personAProfile = useMemo(
    () => profiles.find((p) => (p.id ?? p.name) === personAId) ?? activeProfile,
    [profiles, personAId, activeProfile],
  );

  const personBProfile = useMemo(
    () =>
      profiles.find((p) => (p.id ?? p.name) === personBId) ??
      profiles.find(
        (p) => (p.id ?? p.name) !== (personAProfile.id ?? personAProfile.name),
      ) ??
      activeProfile,
    [profiles, personBId, personAProfile, activeProfile],
  );

  const sajuResult = useMemo(() => calculateSaju(activeProfile), [activeProfile]);
  const personAResult = useMemo(
    () => calculateSaju(personAProfile),
    [personAProfile],
  );
  const personBResult = useMemo(
    () => calculateSaju(personBProfile),
    [personBProfile],
  );
  const compatibility = useMemo(
    () => calculateCompatibility(personAResult, personBResult),
    [personAResult, personBResult],
  );

  const togglePillarOrder = useCallback(() => {
    setPillarOrder((prev) =>
      prev === 'traditional' ? 'modern' : 'traditional',
    );
  }, []);

  const clearShareUrlParam = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('r')) {
        url.searchParams.delete('r');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Ignore history failure
    }
  }, []);

  const startReading = useCallback(
    (input: BirthInput) => {
      const resolvedId = `user-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const nextProfile: BirthInput = { ...input, id: resolvedId };
      setProfiles((prev) => [nextProfile, ...prev]);
      setActiveProfileId(resolvedId);
      setPersonAId(resolvedId);
      setHasUserSubmittedProfile(true);
      setIsSharedView(false);
      setChapter(0);
      setStage('ritual');
      clearShareUrlParam();
    },
    [clearShareUrlParam],
  );

  const claimOwnReading = useCallback(() => {
    setIsSharedView(false);
    clearShareUrlParam();
    setStage('input');
  }, [clearShareUrlParam]);

  const selectProfile = useCallback(
    (profileId: string) => {
      setActiveProfileId(profileId);
      setPersonAId(profileId);
      triggerCalculationPulse();
    },
    [triggerCalculationPulse],
  );

  const saveProfile = useCallback(
    (input: BirthInput, mode: 'create' | 'edit' = 'create') => {
      const resolvedId =
        mode === 'edit' && input.id
          ? input.id
          : `profile-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const nextProfile: BirthInput = {
        ...input,
        id: resolvedId,
      };

      setProfiles((prev) => {
        if (mode === 'edit' && input.id) {
          const exists = prev.some((p) => (p.id ?? p.name) === input.id);
          if (exists) {
            return prev.map((p) =>
              (p.id ?? p.name) === input.id ? nextProfile : p,
            );
          }
        }
        return [nextProfile, ...prev];
      });
      setActiveProfileId(resolvedId);
      setPersonAId(resolvedId);
      setHasUserSubmittedProfile(true);
      triggerCalculationPulse();
    },
    [triggerCalculationPulse],
  );

  const deleteProfile = useCallback(
    (profileId: string) => {
      setProfiles((prev) => {
        if (prev.length <= 1) return prev;
        const filtered = prev.filter((p) => (p.id ?? p.name) !== profileId);
        if (filtered.length === 0) return prev;
        const fallbackId = filtered[0].id ?? filtered[0].name;

        if (activeProfileId === profileId) {
          setActiveProfileId(fallbackId);
        }
        if (personAId === profileId) {
          setPersonAId(fallbackId);
        }
        if (personBId === profileId) {
          setPersonBId(pickPartnerId(filtered, fallbackId));
        }
        return filtered;
      });
    },
    [activeProfileId, personAId, personBId],
  );

  const saveCustomCompatibilityProfile = useCallback(
    (side: 'A' | 'B', input: BirthInput) => {
      const customId =
        input.id && input.id.startsWith('compat-custom-')
          ? input.id
          : `compat-custom-${side.toLowerCase()}-${Date.now()}`;
      const nextProfile: BirthInput = { ...input, id: customId };

      setProfiles((prev) => {
        const exists = prev.some((p) => (p.id ?? p.name) === customId);
        if (exists) {
          return prev.map((p) =>
            (p.id ?? p.name) === customId ? nextProfile : p,
          );
        }
        return [...prev, nextProfile];
      });

      if (side === 'A') {
        setPersonAId(customId);
      } else {
        setPersonBId(customId);
      }
    },
    [],
  );

  const openBirthInput = useCallback((mode: 'create' | 'edit' = 'create') => {
    setBirthInputModal({ open: true, mode });
  }, []);

  const closeBirthInput = useCallback(() => {
    setBirthInputModal((prev) => ({ ...prev, open: false }));
  }, []);

  const openExportModal = useCallback(() => setExportModalOpen(true), []);
  const closeExportModal = useCallback(() => setExportModalOpen(false), []);

  const resetProfiles = useCallback(() => {
    const defaults = PRESET_PROFILES.map((p, idx) => ensureProfileId(p, idx));
    setProfiles(defaults);
    const firstId = defaults[0].id ?? defaults[0].name;
    setActiveProfileId(firstId);
    setPersonAId(firstId);
    setPersonBId(pickPartnerId(defaults, firstId));
  }, []);

  const value = useMemo<SajuStoreContextValue>(
    () => ({
      profiles,
      activeProfileId,
      activeProfile,
      sajuResult,
      personAId,
      personBId,
      compatibility,
      activeTab,
      birthInputModal,
      exportModalOpen,
      isCalculating,
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
      setActiveTab,
      selectProfile,
      saveProfile,
      deleteProfile,
      setPersonAId,
      setPersonBId,
      saveCustomCompatibilityProfile,
      openBirthInput,
      closeBirthInput,
      openExportModal,
      closeExportModal,
      resetProfiles,
    }),
    [
      profiles,
      activeProfileId,
      activeProfile,
      sajuResult,
      personAId,
      personBId,
      compatibility,
      activeTab,
      birthInputModal,
      exportModalOpen,
      isCalculating,
      stage,
      chapter,
      focusTopic,
      isSharedView,
      hasUserSubmittedProfile,
      pillarOrder,
      togglePillarOrder,
      startReading,
      claimOwnReading,
      selectProfile,
      saveProfile,
      deleteProfile,
      saveCustomCompatibilityProfile,
      openBirthInput,
      closeBirthInput,
      openExportModal,
      closeExportModal,
      resetProfiles,
    ],
  );

  return createElement(SajuStoreContext.Provider, { value }, children);
}

export function useSajuStore(): SajuStoreContextValue {
  const ctx = useContext(SajuStoreContext);
  if (!ctx) {
    throw new Error('useSajuStore must be used inside a <SajuStoreProvider>');
  }
  return ctx;
}
