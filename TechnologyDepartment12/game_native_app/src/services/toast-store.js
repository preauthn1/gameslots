import { create } from 'zustand';

export const useToastStore = create((set) => ({
  message: '',
  tone: 'info',
  visible: false,
  show(message, tone = 'info') {
    set({ message: String(message || ''), tone, visible: true });
  },
  hide() {
    set({ visible: false });
  },
}));

export const toast = {
  info: (message) => useToastStore.getState().show(message, 'info'),
  success: (message) => useToastStore.getState().show(message, 'success'),
  error: (message) => useToastStore.getState().show(message, 'error'),
  warning: (message) => useToastStore.getState().show(message, 'warning'),
};
