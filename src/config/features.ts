/**
 * Feature flags for LilLearner
 * Controls which features are active. Defaults used until user preferences are loaded from DB.
 */
export const FEATURES = {
  GAMIFICATION: false,
  SKILLS_TRACKING: false,
  PHOTO_ENTRIES: false,
  SCRAPBOOK_THEME: false,
  VOICE_INPUT: false,
  BOOK_TRACKING: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
