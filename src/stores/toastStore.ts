import { create } from 'zustand';

interface ToastState {
  xpAmount: number | null;
  showToast: (amount: number) => void;
  clearToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  xpAmount: null,

  showToast: (amount) => {
    set({ xpAmount: amount });
  },

  clearToast: () => {
    set({ xpAmount: null });
  },
}));
