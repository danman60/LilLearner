import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChildState {
  activeChildId: string | null;
  setActiveChild: (id: string) => void;
  loadActiveChild: () => Promise<void>;
}

export const useChildStore = create<ChildState>((set) => ({
  activeChildId: null,

  setActiveChild: (id) => {
    set({ activeChildId: id });
    AsyncStorage.setItem('activeChildId', id);
  },

  loadActiveChild: async () => {
    const id = await AsyncStorage.getItem('activeChildId');
    if (id) set({ activeChildId: id });
  },
}));
