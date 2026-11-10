// @ts-nocheck
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/i18n';
import { useSystemStore } from '@/stores/system-store';
import { colors } from '@/theme/colors';
import { matchSupportedLocale } from '@/utils/getCurrentLang';
import { scale as s } from '@/utils/scale';

const FALLBACK = [
  { lang: 'hi-IN', title: 'भाषा' },
  { lang: 'en', title: 'English' },
];

const languageOptions = (langList) => {
  if (!Array.isArray(langList)) return FALLBACK;
  const options = langList
    .map((item) => ({
      lang: matchSupportedLocale(item?.lang),
      title: String(item?.title || '').trim(),
    }))
    .filter((item) => item.lang === 'en' || item.lang === 'hi-IN');
  return options.length ? options : FALLBACK;
};

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const langList = useSystemStore((state) => state.appConfig?.lang_list);
  const loadAppConfig = useSystemStore((state) => state.loadAppConfig);
  const options = languageOptions(langList);

  const change = (lang) => {
    if (!lang || lang === locale) return;
    setLocale(lang);
    loadAppConfig().catch(() => {});
  };

  return (
    <View style={styles.row}>
      {options.map((item) => {
        const active = item.lang === locale;
        const label = item.title || (item.lang === 'en' ? 'English' : 'भाषा');
        return (
          <Pressable key={item.lang} style={[styles.option, active && styles.optionActive]} onPress={() => change(item.lang)}>
            <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: s(140), flexDirection: 'row', alignItems: 'center', gap: s(6) },
  option: {
    flex: 1,
    height: s(28),
    paddingHorizontal: s(4),
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: s(6),
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  text: { color: colors.text, fontSize: s(12), fontWeight: '600' },
  textActive: { color: colors.accentInk },
});
