// @ts-nocheck
import { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmSheet } from '@/components/chrome';
import { LanguageToggle } from '@/components/language-toggle';
import { UserAvatar } from '@/components/user-avatar';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { memoryStorage } from '@/utils/memory-storage';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const brand = require('../../assets/brand/profile/brand.png');
const logoutIcon = require('../../assets/brand/profile/logout.png');
const chevron = require('../../assets/brand/profile/chevron.png');
const userIcon = require('../../assets/brand/profile/user.png');
const phoneIcon = require('../../assets/brand/profile/phone.png');
const passwordIcon = require('../../assets/brand/profile/password.png');
const securityIcon = require('../../assets/brand/profile/security.png');
const walletIcon = require('../../assets/brand/profile/wallet.png');
const languageIcon = require('../../assets/brand/profile/language.png');
const clearCacheIcon = require('../../assets/brand/profile/clear-cache.png');
const copyIcon = require('../../assets/brand/profile/copy-icon.png');

export function ProfileScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUserStore((state) => state.userInfo);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openLogin = useUserStore((state) => state.openLoginModal);
  const openRegister = useUserStore((state) => state.openRegisterModal);
  const logoutUser = useUserStore((state) => state.logoutUser);
  const [dialog, setDialog] = useState('');

  const open = (path) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    router.push(path);
  };

  const rows = [
    { icon: userIcon, label: t('userInfo.editNickname'), value: user?.nickname || user?.username || '--', path: '/edit-nickname' },
    { icon: phoneIcon, label: t('userInfo.phoneBind'), value: user?.phone ? t('userInfo.bound') : t('userInfo.notBound'), path: '/bind-phone' },
    { icon: passwordIcon, label: t('userInfo.loginPassword'), value: Number(user?.has_password || 0) === 1 ? t('userInfo.alreadySet') : t('userInfo.notSet'), path: '/change-login-password' },
    { icon: securityIcon, label: t('userInfo.transactionPassword'), value: user?.is_pay_password === 0 ? t('userInfo.alreadySet') : t('userInfo.notSet'), path: '/change-transaction-password' },
    { icon: walletIcon, label: t('userInfo.withdrawMethod'), value: '', path: '/manage-withdraw-method' },
  ];

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + s(12) }]}>
        {isLoggedIn ? (
          <>
            <View style={styles.header}>
              <Image source={brand} style={styles.brand} contentFit="contain" />
              <Pressable onPress={() => setDialog('logout')}>
                <Image source={logoutIcon} style={styles.logoutIcon} contentFit="contain" />
              </Pressable>
            </View>
            <View style={styles.userRow}>
              <UserAvatar src={user?.avatar} level={user?.level} size={60} />
              <View style={styles.userCopy}>
                <Text style={styles.name} numberOfLines={1}>{user?.nickname || user?.username || '--'}</Text>
                <Pressable style={styles.uid} onPress={async () => {
                  const id = String(user?.user_id || user?.id || '');
                  if (Platform.OS === 'web' && id && navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(id);
                    toast.success(t('common.copySuccess'));
                  }
                }}>
                  <Text style={styles.uidText}>ID：{user?.user_id || user?.id || '--'}</Text>
                  <Image source={copyIcon} style={styles.copyIcon} contentFit="contain" />
                </Pressable>
              </View>
              <Text style={styles.vip}>VIP {user?.level || 0}</Text>
            </View>
            <View style={styles.balanceCard}>
              <Pressable onPress={() => open('/wallet')}>
                <Text style={styles.balanceLabel}>{t('profileR1.totalBalance')}</Text>
                <Text style={styles.balance}>₹ {user?.balance ?? 0}</Text>
              </Pressable>
              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>{t('profileR1.rewardBalance')}</Text>
                  <Text style={styles.metricValue}>₹ {user?.bonus_balance ?? user?.reward_balance ?? 0}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>{t('profileR1.cashBalance')}</Text>
                  <Text style={styles.metricValue}>₹ {user?.cash_balance ?? user?.balance ?? 0}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>{t('profileR1.withdrawable')}</Text>
                  <Text style={styles.metricValue}>₹ {user?.withdrawable_balance ?? user?.balance ?? 0}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.depositBtn} onPress={() => open('/recharge')}>
                  <Text style={styles.depositText}>{t('profileR1.deposit')}</Text>
                </Pressable>
                <Pressable style={styles.withdrawBtn} onPress={() => open('/withdraw-method')}>
                  <Text style={styles.withdrawText}>{t('profileR1.withdrawal')}</Text>
                </Pressable>
              </View>
            </View>
            <Pressable style={styles.entry} onPress={() => open('/vip-center')}>
              <Text style={styles.entryText}>{t('pageCopy.profile.vipCenter')}</Text>
              <Text style={styles.entryAside}>{t('pageCopy.profile.viewBenefits')} ›</Text>
            </Pressable>
            <Text style={styles.section}>{t('userInfo.accountSecurity')}</Text>
            <View style={styles.card}>
              {rows.map((item) => (
                <Pressable key={item.path} style={styles.row} onPress={() => open(item.path)}>
                  <Image source={item.icon} style={styles.rowIcon} contentFit="contain" />
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.value ? <Text style={styles.rowValue}>{item.value}</Text> : null}
                  <Image source={chevron} style={styles.chevron} contentFit="contain" />
                </Pressable>
              ))}
              <View style={styles.row}>
                <Image source={languageIcon} style={styles.rowIcon} contentFit="contain" />
                <Text style={styles.rowLabel}>{t('profile.switchLanguage')}</Text>
                <LanguageToggle />
              </View>
              <Pressable style={styles.row} onPress={() => setDialog('cache')}>
                <Image source={clearCacheIcon} style={styles.rowIcon} contentFit="contain" />
                <Text style={styles.rowLabel}>{t('userInfo.clearCache')}</Text>
              </Pressable>
            </View>
            <Pressable style={styles.entry} onPress={() => open('/refer-bonus')}>
              <View>
                <Text style={styles.entryText}>{t('pageCopy.profile.inviteFriends')}</Text>
                <Text style={styles.entryAside}>{t('pageCopy.profile.invitationCode', { code: user?.invitation_code || '--' })}</Text>
              </View>
              <Text style={styles.entryText}>{t('pageCopy.profile.share')}</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.auth}>
            <Pressable style={styles.loginPill} onPress={openLogin}><Text style={styles.loginText}>{t('profile.login')}</Text></Pressable>
            <Pressable style={styles.registerPill} onPress={openRegister}><Text style={styles.registerText}>{t('profile.register')}</Text></Pressable>
          </View>
        )}
        {!isLoggedIn ? <Text style={styles.greeting}>{t('profile.greetingText')}</Text> : null}
        <View style={styles.support}>
          <Pressable style={styles.supportButton} onPress={() => open('/contact')}>
            <Text style={styles.supportText}>{t('pageCopy.profile.liveSupport')}</Text>
          </Pressable>
          <Pressable style={styles.supportButton} onPress={() => open('/customer-service-center')}>
            <Text style={styles.supportText}>{t('pageCopy.profile.helpCenter')}</Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>{t('pageCopy.profile.responsibleGaming')}</Text>
      </ScrollView>
      <ConfirmSheet
        visible={dialog === 'logout'}
        title={t('profile.logout')}
        message={t('userInfo.logoutConfirm')}
        confirmText={t('profile.logout')}
        cancelText={t('common.cancel')}
        danger
        onClose={() => setDialog('')}
        onConfirm={() => {
          setDialog('');
          logoutUser().then(() => router.replace('/'));
        }}
      />
      <ConfirmSheet
        visible={dialog === 'cache'}
        title={t('userInfo.clearCache')}
        message={t('userInfo.clearCacheHint')}
        confirmText={t('userInfo.clearCacheAction')}
        cancelText={t('common.cancel')}
        danger
        onClose={() => setDialog('')}
        onConfirm={() => {
          setDialog('');
          memoryStorage.clear().finally(() => logoutUser().then(() => router.replace('/')));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: s(16), paddingBottom: s(28), gap: s(12) },
  header: { height: s(28), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { width: s(66), height: s(26) },
  logoutIcon: { width: s(24), height: s(24) },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: s(12), marginBottom: s(4) },
  userCopy: { flex: 1, gap: s(4) },
  name: { color: '#f0f3ff', fontSize: s(13), fontWeight: '600' },
  uid: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  uidText: { color: colors.muted, fontSize: s(12) },
  copyIcon: { width: s(24), height: s(24) },
  vip: { color: '#f3c45f', fontSize: s(12), fontWeight: '600', marginRight: s(8) },
  balanceCard: { borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: s(12), gap: s(12) },
  balanceLabel: { color: colors.muted, fontSize: s(13), fontWeight: '600' },
  balance: { color: colors.text, fontSize: s(24), fontWeight: '700' },
  metrics: { flexDirection: 'row' },
  metric: { flex: 1, alignItems: 'center', gap: s(2) },
  metricLabel: { color: colors.muted, fontSize: s(12), textAlign: 'center' },
  metricValue: { color: colors.text, fontSize: s(14), fontWeight: '600' },
  actions: { flexDirection: 'row', gap: s(8) },
  depositBtn: { flex: 1, height: s(44), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s(3)}px 0 #4d661e` },
  withdrawBtn: { flex: 1, height: s(44), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  withdrawText: { color: colors.text, fontWeight: '600', fontSize: s(12) },
  depositText: { color: colors.accentInk, fontWeight: '600', fontSize: s(12) },
  entry: { minHeight: s(48), borderRadius: s(6), backgroundColor: colors.surface, padding: s(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entryText: { color: '#f3c45f', fontSize: s(12), fontWeight: '700' },
  entryAside: { color: '#f3c45f', fontSize: s(12) },
  section: { color: colors.text, fontSize: s(14), fontWeight: '700' },
  card: { borderRadius: s(8), backgroundColor: colors.surface, overflow: 'hidden' },
  row: { minHeight: s(48), paddingHorizontal: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10), borderBottomWidth: 1, borderBottomColor: '#252b35' },
  rowIcon: { width: s(20), height: s(20) },
  rowLabel: { flex: 1, color: colors.text, fontSize: s(14) },
  rowValue: { color: colors.muted, fontSize: s(12) },
  chevron: { width: s(14), height: s(14) },
  auth: { flexDirection: 'row', gap: s(8) },
  loginPill: { flex: 1, height: s(36), borderRadius: s(999), alignItems: 'center', justifyContent: 'center', backgroundColor: '#eba84c' },
  loginText: { color: '#412408', fontWeight: '700' },
  registerPill: { flex: 1, height: s(36), borderRadius: s(999), alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d2eed' },
  registerText: { color: '#f0f3ff', fontWeight: '700' },
  greeting: { color: colors.muted, textAlign: 'center' },
  support: { flexDirection: 'row' },
  supportButton: { flex: 1, height: s(44), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  supportText: { color: colors.text, fontWeight: '600' },
  footer: { color: colors.muted, fontSize: s(12), textAlign: 'center' },
});
