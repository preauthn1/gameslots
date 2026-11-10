// @ts-nocheck
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PageHeader, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { useChatroomStore } from '@/stores/chatroom-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const ITEMS = [
  ['showVip', 'pageCopy.chatSettings.showVip'],
  ['showBets', 'pageCopy.chatSettings.showMyBets'],
  ['hideAllBets', 'pageCopy.chatSettings.hideAllBets'],
  ['hideAllShare', 'pageCopy.chatSettings.hideAllShares'],
];

export default function ChatSettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const settings = useChatroomStore((state) => state.settings);
  const toggleSetting = useChatroomStore((state) => state.toggleSetting);

  return (
    <Screen>
      <PageHeader title={t('pageCopy.chatSettings.title')} onBack={() => router.back()} />
      <View style={styles.list}>
        {ITEMS.map(([key, label]) => (
          <View key={key} style={styles.card}>
            <Text style={styles.label}>{t(label)}</Text>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: !!settings[key] }}
              style={[styles.switch, settings[key] && styles.switchOn]}
              onPress={() => toggleSetting(key)}>
              <View style={[styles.knob, settings[key] && styles.knobOn]} />
            </Pressable>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: s(12), gap: s(10) },
  card: {
    minHeight: s(56),
    borderRadius: s(8),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: s(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { color: colors.text, fontWeight: '600', flex: 1 },
  switch: { width: s(44), height: s(26), borderRadius: s(13), backgroundColor: '#3a414d', padding: s(3) },
  switchOn: { backgroundColor: colors.accent },
  knob: { width: s(20), height: s(20), borderRadius: s(10), backgroundColor: '#fff' },
  knobOn: { marginLeft: s(18) },
});
