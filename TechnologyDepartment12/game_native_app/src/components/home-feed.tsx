import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const CATEGORIES = [
  { key: 'slots', label: 'Slots', active: true },
  { key: 'crash', label: 'Crash', active: false },
  { key: 'new', label: 'New', active: false },
  { key: 'favorites', label: 'Favorites', active: false },
];

const PROVIDERS = ['PG Soft', 'JILI', 'JDB', 'InOut'];

export function HomeFeed() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Pressable style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Search games</Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CATEGORIES.map((item) => (
          <Pressable key={item.key} style={[styles.chip, item.active && styles.chipActive]}>
            <Text style={[styles.chipText, item.active && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providers}>
        {PROVIDERS.map((label) => (
          <Pressable key={label} style={styles.provider}>
            <Text style={styles.providerText}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.support}>
        <Text style={styles.supportTitle}>Support · 24/7</Text>
        <Pressable>
          <Text style={styles.supportAction}>Contact us</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: s(12),
    paddingTop: s(16),
    paddingBottom: s(18),
    gap: s(16),
  },
  search: {
    height: s(48),
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(14),
  },
  searchIcon: {
    color: colors.muted,
    fontSize: s(18),
  },
  searchText: {
    color: colors.muted,
    fontSize: s(14),
  },
  chips: {
    gap: s(8),
    flexGrow: 1,
  },
  chip: {
    minWidth: s(88),
    height: s(44),
    paddingHorizontal: s(16),
    borderRadius: s(6),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    boxShadow: `0 ${s(2)}px 0 ${colors.accentShadow}`,
  },
  chipText: {
    color: colors.text,
    fontSize: s(16),
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.accentInk,
  },
  providers: {
    gap: s(8),
  },
  provider: {
    height: s(36),
    paddingHorizontal: s(16),
    borderRadius: s(6),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    color: colors.text,
    fontSize: s(14),
    fontWeight: '600',
  },
  support: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportTitle: {
    color: colors.text,
    fontSize: s(16),
    fontWeight: '700',
  },
  supportAction: {
    color: colors.accent,
    fontSize: s(14),
    fontWeight: '600',
  },
});
