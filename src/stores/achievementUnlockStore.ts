import { create } from 'zustand';

interface AchievementUnlockState {
  achievementKey: string | null;
  showUnlock: (key: string) => void;
  dismissUnlock: () => void;
}

export const useAchievementUnlockStore = create<AchievementUnlockState>((set) => ({
  achievementKey: null,

  showUnlock: (key) => {
    set({ achievementKey: key });
  },

  dismissUnlock: () => {
    set({ achievementKey: null });
  },
}));
