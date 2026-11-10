import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import DrawerLayout, { DrawerPosition, DrawerType, type DrawerLayoutMethods } from 'react-native-gesture-handler/ReanimatedDrawerLayout';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLevelList } from '@/api/vip';
import { LanguageToggle } from '@/components/language-toggle';
import { SourceIcon } from '@/components/source-icon';
import { UserAvatar } from '@/components/user-avatar';
import { useI18n } from '@/i18n';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const brandLogo = require('../../assets/brand/a91-logo.png');
const elephant = require('../../assets/brand/nav/elephant.png');
const menuAccount = require('../../assets/brand/sidebar/menu-account.png');
const menuNotification = require('../../assets/brand/sidebar/menu-notification.png');
const menuTransaction = require('../../assets/brand/sidebar/menu-transaction.png');
const menuBetting = require('../../assets/brand/sidebar/menu-betting.png');
const menuLanguage = require('../../assets/brand/sidebar/menu-language.png');
const chevron = require('../../assets/brand/sidebar/chevron-right.png');
const vipBadges = [
  require('../../assets/brand/sidebar/vip-badge-0.png'),
  require('../../assets/brand/sidebar/vip-badge-1.png'),
  require('../../assets/brand/sidebar/vip-badge-2.png'),
  require('../../assets/brand/sidebar/vip-badge-3.png'),
];

const VIP_TIERS = [
  { border: '#7bd950', from: '#20372a', to: '#17261f', fill: '#7bd950' },
  { border: '#515e8b', from: '#2d3553', to: '#20263d', fill: '#8aa0d4' },
  { border: '#70547a', from: '#48304e', to: '#302237', fill: '#c9a0d4' },
  { border: '#806847', from: '#55422c', to: '#392d20', fill: '#e0c48a' },
];

const clampVipLevel = (level: unknown) => {
  const value = Number(level);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(18, Math.floor(value));
};

const vipTierIndex = (level: number) => {
  if (level <= 4) return 0;
  if (level <= 9) return 1;
  if (level <= 14) return 2;
  return 3;
};

const formatCurrency = (value: number, locale: string) =>
  Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const vipProgress = (user: { level?: number; total_recharge?: number; total_game_wagers?: number; extra_game_wagers?: number } | null, levels: Array<{ number?: number; recharge?: number; game_wagers?: number }>) => {
  const level = clampVipLevel(user?.level);
  const sorted = [...levels].sort((a, b) => Number(a.number) - Number(b.number));
  const currentIndex = sorted.findIndex((item) => Number(item.number) === level);
  if (!sorted.length) {
    return { pending: true, isMax: false, percent: 0, current: 0, target: 0, mode: 'recharge', nextLevel: Math.min(18, level + 1), level };
  }
  if (currentIndex === -1 || currentIndex >= sorted.length - 1) {
    return { pending: false, isMax: true, percent: 100, current: 0, target: 0, mode: 'recharge', nextLevel: level, level };
  }
  const next = sorted[currentIndex + 1];
  const nextLevel = Number(next?.number ?? level + 1);
  const totalRecharge = Number(user?.total_recharge || 0);
  const totalGameWagers = Number(user?.total_game_wagers || 0) + Number(user?.extra_game_wagers || 0);
  const reqRecharge = Number(next?.recharge || 0);
  const reqWagers = Number(next?.game_wagers || 0);
  const mode = totalRecharge < reqRecharge ? 'recharge' : 'wager';
  const current = mode === 'recharge' ? totalRecharge : totalGameWagers;
  const target = mode === 'recharge' ? reqRecharge : reqWagers;
  const percent = target === 0 ? 100 : Math.min(100, (current / target) * 100);
  return { pending: false, isMax: false, percent, current, target, mode, nextLevel, level };
};

let vipLevelCache: Array<{ number?: number; recharge?: number; game_wagers?: number }> | null = null;
let vipLevelRequest: Promise<Array<{ number?: number; recharge?: number; game_wagers?: number }>> | null = null;

const loadVipLevels = () => {
  if (vipLevelCache) return Promise.resolve(vipLevelCache);
  if (!vipLevelRequest) {
    vipLevelRequest = getLevelList()
      .then((result) => {
        const list = Array.isArray(result) ? result : result?.data || result?.list || [];
        vipLevelCache = list;
        return list;
      })
      .catch((error) => {
        vipLevelRequest = null;
        throw error;
      });
  }
  return vipLevelRequest;
};

const MENU = [
  ['sidebar.account', '/profile', menuAccount],
  ['sidebar.notification', '/notice', menuNotification],
  ['sidebar.transactionRecords', '/bill-record', menuTransaction],
  ['sidebar.bettingRecords', '/betting-record', menuBetting],
] as const;

type DrawerApi = { open: () => void; close: () => void };
const DrawerApiContext = createContext<DrawerApi>({ open() {}, close() {} });

export function HomeDrawer({ children }: { children: ReactNode }) {
  const drawerRef = useRef<DrawerLayoutMethods>(null);
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(310, Math.round(width * 0.86));
  const [opened, setOpened] = useState(false);
  const api = useMemo<DrawerApi>(
    () => ({
      open: () => drawerRef.current?.openDrawer(),
      close: () => drawerRef.current?.closeDrawer(),
    }),
    [],
  );

  useEffect(() => {
    if (!opened) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      drawerRef.current?.closeDrawer();
      return true;
    });
    return () => subscription.remove();
  }, [opened]);

  return (
    <DrawerApiContext.Provider value={api}>
      <DrawerLayout
        ref={drawerRef}
        drawerWidth={drawerWidth}
        drawerPosition={DrawerPosition.LEFT}
        drawerType={DrawerType.SLIDE}
        drawerBackgroundColor={colors.bg}
        overlayColor="rgba(0,0,0,0.55)"
        edgeWidth={32}
        onDrawerOpen={() => setOpened(true)}
        onDrawerClose={() => setOpened(false)}
        renderNavigationView={() => <DrawerPanel />}>
        {children}
      </DrawerLayout>
    </DrawerApiContext.Provider>
  );
}

function SidebarVipCard({ user, levels, onPress }: { user: { level?: number; total_recharge?: number; total_game_wagers?: number; extra_game_wagers?: number } | null; levels: Array<{ number?: number; recharge?: number; game_wagers?: number }>; onPress: () => void }) {
  const { t, locale } = useI18n();
  const progress = vipProgress(user, levels);
  const tier = VIP_TIERS[vipTierIndex(progress.level)];
  const amount = formatCurrency(progress.target, locale);
  const tip = progress.pending
    ? ''
    : progress.isMax
      ? t('sidebar.vipMax')
      : `${t(progress.mode === 'wager' ? 'sidebar.vipUpgradeWagerBefore' : 'sidebar.vipUpgradeRechargeBefore')}₹${amount}${t(progress.mode === 'wager' ? 'sidebar.vipUpgradeWagerAfter' : 'sidebar.vipUpgradeRechargeAfter', { level: progress.nextLevel })}`;
  const progressText = progress.isMax
    ? 'MAX'
    : `${Number(progress.current || 0).toLocaleString('en-US')} / ${Number(progress.target || 0).toLocaleString('en-US')}`;
  const fill = progress.percent <= 0 ? 0 : Math.min(100, progress.percent);

  return (
    <Pressable style={[styles.vipCard, { borderColor: tier.border, backgroundColor: tier.to }]} onPress={onPress}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="sidebarVip" x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0.04" stopColor={tier.from} />
            <Stop offset="0.96" stopColor={tier.to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#sidebarVip)" />
      </Svg>
      <View style={styles.vipBadge}>
        <Image source={vipBadges[vipTierIndex(progress.level)]} style={styles.vipBadgeImage} contentFit="contain" />
        <Text style={styles.vipBadgeLevel}>V{progress.level}</Text>
      </View>
      <View style={styles.vipBody}>
        <Text style={styles.vipTitle}>VIP {progress.level}</Text>
        <Text style={styles.vipTip}>{tip}</Text>
        <View style={styles.vipTrack}>
          <View style={[styles.vipFill, { width: `${fill}%`, backgroundColor: tier.fill }]} />
        </View>
        <View style={styles.vipLabels}>
          <Text style={styles.vipLabel}>VIP {progress.level}</Text>
          <Text style={styles.vipProgress}>{progress.pending ? '' : progressText}</Text>
          <Text style={styles.vipLabel}>VIP {progress.nextLevel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function DrawerPanel() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { close } = useContext(DrawerApiContext);
  const { t } = useI18n();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const user = useUserStore((state) => state.userInfo);
  const balance = user?.balance ?? 0;
  const openLogin = useUserStore((state) => state.openLoginModal);
  const openRegister = useUserStore((state) => state.openRegisterModal);
  const [vipLevels, setVipLevels] = useState<Array<{ number?: number; recharge?: number; game_wagers?: number }>>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      vipLevelCache = null;
      vipLevelRequest = null;
      setVipLevels([]);
      return undefined;
    }
    let alive = true;
    loadVipLevels()
      .then((list) => {
        if (alive) setVipLevels(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const go = (path: string) => {
    close();
    if (!isLoggedIn && path !== '/notice') {
      openLogin();
      return;
    }
    router.push(path as never);
  };

  return (
    <View style={[styles.drawer, { paddingTop: insets.top + s(16), paddingBottom: insets.bottom + s(16) }]}>
      <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerContent}>
      <View style={styles.drawerTop}>
        <Image source={brandLogo} style={styles.logo} contentFit="contain" />
        <Pressable onPress={close}><Text style={styles.close}>×</Text></Pressable>
      </View>
      {isLoggedIn ? (
        <>
        <Pressable style={styles.profileRow} onPress={() => go('/user-info')}>
          <UserAvatar src={user?.avatar} level={user?.level} size={60} />
          <View style={styles.profileMeta}>
            <Text style={styles.drawerText} numberOfLines={1}>{user?.nickname || user?.username || '--'}</Text>
            <Text style={styles.profileId}>ID : {user?.user_id || user?.id || '--'}</Text>
            <Text style={styles.profileId}>₹{balance}</Text>
          </View>
          <Image source={chevron} style={styles.chevron} contentFit="contain" />
        </Pressable>
        <SidebarVipCard user={user} levels={vipLevels} onPress={() => go('/vip-center')} />
        </>
      ) : (
        <View style={styles.guestActions}>
          <Pressable style={styles.guestLogin} onPress={() => { close(); openLogin(); }}>
            <Text style={styles.guestLoginText}>{t('loginModal.signIn')}</Text>
          </Pressable>
          <Pressable style={styles.guestRegister} onPress={() => { close(); openRegister(); }}>
            <Text style={styles.guestRegisterText}>{t('loginModal.signUp')}</Text>
          </Pressable>
        </View>
      )}
      {MENU.map(([key, path, icon]) => (
        <Pressable key={path} style={styles.drawerItem} onPress={() => go(path)}>
          <Image source={icon} style={styles.drawerIcon} contentFit="contain" />
          <Text style={styles.drawerText}>{t(key)}</Text>
          <Image source={chevron} style={styles.chevron} contentFit="contain" />
        </Pressable>
      ))}
      <View style={styles.drawerItem}>
        <Image source={menuLanguage} style={styles.drawerIcon} contentFit="contain" />
        <Text style={styles.drawerText}>{t('sidebar.language')}</Text>
        <LanguageToggle />
      </View>
      <Text style={styles.supportLine}>{t('sidebar.supportLine')}</Text>
      <Pressable style={styles.contact} onPress={() => { close(); router.push('/customer-service-center'); }}>
        <Text style={styles.contactText}>{t('sidebar.contactUs')}</Text>
      </Pressable>
      </ScrollView>
    </View>
  );
}

export function GlobalNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { open } = useContext(DrawerApiContext);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const user = useUserStore((state) => state.userInfo);
  const balance = user?.balance ?? 0;
  const openLogin = useUserStore((state) => state.openLoginModal);
  const openRegister = useUserStore((state) => state.openRegisterModal);

  return (
    <View style={[styles.nav, { paddingTop: insets.top }]}>
      <View style={styles.main}>
        <View style={styles.left}>
          <Pressable style={({ pressed }) => [styles.menu, pressed && styles.pressed]} accessibilityLabel={t('common.menu')} onPress={open}>
            <SourceIcon name="menu" size={s(22)} />
          </Pressable>
          <Image source={brandLogo} style={styles.logo} contentFit="contain" />
        </View>

        {isLoggedIn ? (
          <View style={styles.userInfo}>
            <Pressable onPress={() => router.push('/balance-treasure')}>
              <Image source={elephant} style={styles.elephant} contentFit="contain" />
            </Pressable>
            <Pressable style={styles.balance} onPress={() => router.push('/wallet')}>
              <Text style={styles.balanceText}>₹{balance}</Text>
              <Text style={styles.balancePlus}>+</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/profile')}>
              <UserAvatar src={user?.avatar} level={user?.level} size={44} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.auth}>
            <Pressable style={styles.login} onPress={openLogin}>
              <Text style={styles.loginText}>{t('loginModal.signIn')}</Text>
            </Pressable>
            <Pressable style={styles.register} onPress={openRegister}>
              <Text style={styles.registerText}>{t('loginModal.signUp')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: colors.bg,
  },
  main: {
    minHeight: s(64),
    paddingHorizontal: s(12),
    paddingVertical: s(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  menu: {
    width: s(44),
    height: s(44),
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  logo: { width: s(66), height: s(22) },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  elephant: { width: s(32), height: s(32) },
  auth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  login: {
    minWidth: s(75),
    height: s(48),
    paddingHorizontal: s(12),
    borderRadius: s(6),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.text,
    fontSize: s(14),
    fontWeight: '600',
  },
  register: {
    minWidth: s(75),
    height: s(48),
    paddingHorizontal: s(12),
    borderRadius: s(6),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 ${s(2)}px 0 ${colors.accentShadow}`,
  },
  registerText: {
    color: colors.accentInk,
    fontSize: s(14),
    fontWeight: '600',
  },
  balance: {
    minWidth: s(90),
    height: s(32),
    paddingHorizontal: s(12),
    borderRadius: s(6),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
  },
  balanceText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  balancePlus: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  drawer: { width: '100%', height: '100%', backgroundColor: colors.bg, paddingHorizontal: s(16) },
  drawerScroll: { flex: 1 },
  drawerContent: { gap: s(12) },
  drawerTop: { height: s(32), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { color: colors.muted, fontSize: s(28), lineHeight: s(28) },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  profileMeta: { flex: 1, gap: s(4) },
  profileId: { color: colors.muted, fontSize: s(12) },
  guestActions: { flexDirection: 'row', gap: s(8) },
  guestLogin: { flex: 1, height: s(36), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  guestLoginText: { color: colors.text, fontWeight: '600' },
  guestRegister: { flex: 1, height: s(36), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 #4d661e` },
  guestRegisterText: { color: colors.accentInk, fontWeight: '600' },
  drawerItem: { minHeight: s(36), flexDirection: 'row', alignItems: 'center', gap: s(8) },
  drawerIcon: { width: s(24), height: s(24) },
  drawerText: { flex: 1, color: colors.text, fontSize: s(14), fontWeight: '500' },
  chevron: { width: s(16), height: s(16) },
  supportLine: { color: colors.muted, fontSize: s(12) },
  contact: { height: s(48), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(2)}px 0 #4d661e` },
  contactText: { color: colors.accentInk, fontSize: s(16), fontWeight: '600' },
  vipCard: {
    minHeight: s(124),
    borderRadius: s(12),
    borderWidth: 1,
    paddingTop: s(10),
    paddingRight: s(12),
    paddingBottom: s(10),
    paddingLeft: s(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    overflow: 'hidden',
  },
  vipBadge: { width: s(80), height: s(80) },
  vipBadgeImage: { width: s(80), height: s(80) },
  vipBadgeLevel: {
    position: 'absolute',
    top: '46%',
    left: 0,
    right: 0,
    color: colors.text,
    fontSize: s(20),
    fontWeight: '700',
    lineHeight: s(20),
    textAlign: 'center',
  },
  vipBody: { flex: 1, gap: s(4) },
  vipTitle: { color: colors.text, fontSize: s(16), lineHeight: s(20), fontWeight: '700' },
  vipTip: { color: '#c5cec7', fontSize: s(12), lineHeight: s(16) },
  vipTrack: { height: s(5), borderRadius: s(3), backgroundColor: 'rgba(0,0,0,0.25)', overflow: 'hidden' },
  vipFill: { height: '100%', borderRadius: s(3) },
  vipLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(4) },
  vipLabel: { color: '#c5cec7', fontSize: s(12), lineHeight: s(16) },
  vipProgress: { flex: 1, color: colors.text, fontSize: s(12), lineHeight: s(16), textAlign: 'center' },
});
