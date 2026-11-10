import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const ICONS = {
  index: {
    normal: require('../../assets/brand/tab-home.png'),
    active: require('../../assets/brand/tab-home-active.png'),
  },
  recharge: {
    normal: require('../../assets/brand/tab-deposit.png'),
    active: require('../../assets/brand/tab-deposit-active.png'),
  },
  spin: {
    normal: require('../../assets/brand/tab-cash.png'),
    active: require('../../assets/brand/tab-cash-active.png'),
  },
  'welfare-center': {
    normal: require('../../assets/brand/tab-activity.png'),
    active: require('../../assets/brand/tab-activity-active.png'),
  },
  profile: {
    normal: require('../../assets/brand/tab-profile.png'),
    active: require('../../assets/brand/tab-profile-active.png'),
  },
} as const;

const TABS = [
  { name: 'index', labelKey: 'common.home' },
  { name: 'recharge', labelKey: 'profile.deposit' },
  { name: 'spin', labelKey: 'common.getCash' },
  { name: 'welfare-center', labelKey: 'common.activity' },
  { name: 'profile', labelKey: 'common.profile' },
] as const;

const GUARDED = new Set(['recharge', 'spin', 'profile']);

export function AppTabBar(props: {
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (routeKey: string) => void;
}) {
  const { state, navigateToTab } = props;
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const hasWelfarePending = useUserStore((state) => state.hasWelfarePending);

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: { key: string; name: string }, index: number) => {
        const focused = state.index === index;
        const meta = TABS.find((tab) => tab.name === route.name);
        const label = meta ? t(meta.labelKey) : route.name;

        const onPress = () => {
          if (GUARDED.has(route.name) && !isLoggedIn) {
            openLogin();
            return;
          }

          if (!focused) {
            navigateToTab(route.key);
          }
        };

        return (
          <Pressable key={route.key} style={({ pressed }) => [styles.item, pressed && styles.pressed]} onPress={onPress}>
            <View style={styles.iconSlot}>
              <Image
                source={ICONS[route.name as keyof typeof ICONS]?.[focused ? 'active' : 'normal'] ?? ICONS.index.normal}
                style={styles.tabIcon}
                contentFit="contain"
              />
              {route.name === 'welfare-center' && hasWelfarePending ? <View style={styles.badge} /> : null}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    minHeight: s(58),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(4),
    paddingTop: s(6),
  },
  pressed: { opacity: 0.7 },
  iconSlot: {
    position: 'relative',
    width: s(24),
    height: s(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: { width: s(24), height: s(24) },
  label: {
    color: colors.muted,
    fontSize: s(12),
    lineHeight: s(16),
  },
  labelActive: {
    color: colors.accent,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: s(-2),
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: colors.badge,
  },
});
