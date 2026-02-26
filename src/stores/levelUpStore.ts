import { create } from 'zustand';

interface LevelUpState {
  newLevel: number | null;
  showLevelUp: (level: number) => void;
  dismissLevelUp: () => void;
}

export const useLevelUpStore = create<LevelUpState>((set) => ({
  newLevel: null,

  showLevelUp: (level) => {
    set({ newLevel: level });
  },

  dismissLevelUp: () => {
    set({ newLevel: null });
  },
}));
