import { create } from 'zustand';

import { messages } from '@/i18n/messages';
import getCurrentLang, { LOCALE_STORAGE_KEY, matchSupportedLocale } from '@/utils/getCurrentLang';
import { memoryStorage } from '@/utils/memory-storage';

const resolvePath = (source, path) => path.split('.').reduce((current, key) => current?.[key], source);

export const formatMessage = (value, params = {}) => {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
};

export const translate = (locale, key, params) => {
  const current = messages[locale] || messages.en;
  const value = resolvePath(current, key);
  if (value !== undefined) return formatMessage(value, params);
  const fallback = resolvePath(messages.en, key);
  if (fallback === undefined) return key;
  return formatMessage(fallback, params);
};

export const useI18nStore = create((set) => ({
  locale: getCurrentLang(),
  setLocale(nextLocale) {
    const matched = matchSupportedLocale(nextLocale);
    if (!matched) return;
    memoryStorage.setItem(LOCALE_STORAGE_KEY, matched);
    set({ locale: matched });
  },
}));

export function syncLocale() {
  const next = getCurrentLang();
  if (useI18nStore.getState().locale !== next) {
    useI18nStore.setState({ locale: next });
  }
}

export function useI18n() {
  const locale = useI18nStore((state) => state.locale);
  const setLocale = useI18nStore((state) => state.setLocale);
  return {
    locale,
    setLocale,
    t: (key, params) => translate(locale, key, params),
  };
}
