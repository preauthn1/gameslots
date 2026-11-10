import { NativeModules, Platform } from 'react-native';

import { memoryStorage } from '@/utils/memory-storage';

const STORAGE_KEY = 'app-locale';
const SUPPORTED = ['en', 'hi-IN'];

const matchSupportedLocale = (value) => {
  const tag = String(value || '')
    .trim()
    .replace(/_/g, '-');
  if (!tag) return '';
  const exact = SUPPORTED.find((item) => item.toLowerCase() === tag.toLowerCase());
  if (exact) return exact;
  const primary = tag.toLowerCase().split('-')[0];
  return SUPPORTED.find((item) => item.toLowerCase().split('-')[0] === primary) || '';
};

const systemLocaleCandidates = () => {
  const values = [];
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings || {};
      if (Array.isArray(settings.AppleLanguages)) values.push(...settings.AppleLanguages);
      if (settings.AppleLocale) values.push(settings.AppleLocale);
    } else {
      const identifier = NativeModules.I18nManager?.localeIdentifier;
      if (identifier) values.push(identifier);
    }
  } catch {
    // Native locale settings are unavailable in some runtimes.
  }
  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (intlLocale) values.push(intlLocale);
  } catch {
    // Intl locale is optional.
  }
  return values;
};

export function detectSystemLocale() {
  for (const candidate of systemLocaleCandidates()) {
    const matched = matchSupportedLocale(candidate);
    if (matched) return matched;
  }
  return 'en';
}

export default function getCurrentLang() {
  return matchSupportedLocale(memoryStorage.getItem(STORAGE_KEY)) || detectSystemLocale();
}

export { matchSupportedLocale, STORAGE_KEY as LOCALE_STORAGE_KEY, SUPPORTED as SUPPORTED_LOCALES };
