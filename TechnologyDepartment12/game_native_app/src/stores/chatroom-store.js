import { create } from 'zustand';

import { memoryStorage } from '@/utils/memory-storage';

const KEY = 'chatroom_display_settings';
const defaults = {
  showVip: false,
  showBets: false,
  hideAllBets: false,
  hideAllShare: false,
};

const load = () => {
  try {
    return { ...defaults, ...JSON.parse(memoryStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...defaults };
  }
};

export const useChatroomStore = create((set, get) => ({
  settings: load(),
  toggleSetting(key) {
    if (!(key in get().settings)) return;
    const settings = { ...get().settings, [key]: !get().settings[key] };
    memoryStorage.setItem(KEY, JSON.stringify(settings));
    set({ settings });
  },
}));
