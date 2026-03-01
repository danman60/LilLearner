import { create } from 'zustand';
import { FEATURES, FeatureKey } from '../config/features';

type FeatureFlags = Record<FeatureKey, boolean>;

interface FeatureState {
  flags: FeatureFlags;
  syncFromPrefs: (prefs: {
    gamification_enabled: boolean;
    skills_tracking_enabled: boolean;
    photo_entries_enabled: boolean;
    scrapbook_theme_enabled: boolean;
    voice_input_enabled: boolean;
    book_tracking_enabled: boolean;
  }) => void;
}

const PREF_TO_FLAG: Record<string, FeatureKey> = {
  gamification_enabled: 'GAMIFICATION',
  skills_tracking_enabled: 'SKILLS_TRACKING',
  photo_entries_enabled: 'PHOTO_ENTRIES',
  scrapbook_theme_enabled: 'SCRAPBOOK_THEME',
  voice_input_enabled: 'VOICE_INPUT',
  book_tracking_enabled: 'BOOK_TRACKING',
};

export const useFeatureStore = create<FeatureState>((set) => ({
  flags: { ...FEATURES },
  syncFromPrefs: (prefs) =>
    set({
      flags: {
        GAMIFICATION: prefs.gamification_enabled,
        SKILLS_TRACKING: prefs.skills_tracking_enabled,
        PHOTO_ENTRIES: prefs.photo_entries_enabled,
        SCRAPBOOK_THEME: prefs.scrapbook_theme_enabled,
        VOICE_INPUT: prefs.voice_input_enabled,
        BOOK_TRACKING: prefs.book_tracking_enabled,
        SKIP_AUTH: FEATURES.SKIP_AUTH, // Dev-only, never from DB
      },
    }),
}));

/** Convenience hook for a single feature flag */
export function useFeature(key: FeatureKey): boolean {
  return useFeatureStore((s) => s.flags[key]);
}
