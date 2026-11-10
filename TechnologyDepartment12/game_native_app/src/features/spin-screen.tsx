// @ts-nocheck
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTurntableData, spinTurntable } from '@/api/turntable';
import { ConfirmSheet, PageSkeleton } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const stageBg = require('../../assets/brand/spin/stage-bg.png');
const wheelDisc = require('../../assets/brand/spin/wheel-disc.png');
const wheelRing = require('../../assets/brand/spin/wheel-ring.png');
const wheelSpin = require('../../assets/brand/spin/wheel-spin.png');
const coinLeft = require('../../assets/brand/spin/coin-stack-left.png');
const coinRight = require('../../assets/brand/spin/coin-stack-right.png');
const recordIcon = require('../../assets/brand/spin/icon-record.png');

export function SpinScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const balance = useUserStore((state) => state.userInfo?.balance ?? 0);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [tab, setTab] = useState('points');
  const [rules, setRules] = useState(false);
  const [rotation] = useState(() => new Animated.Value(0));

  const load = () => {
    getTurntableData({}, { showLoading: false })
      .then(setData)
      .catch((error) => toast.error(error?.message || t('errors.requestFailed')))
      .finally(() => setReady(true));
  };

  useEffect(() => {
    load();
  }, []);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    rotation.setValue(0);
    Animated.timing(rotation, { toValue: 1, duration: 2800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    try {
      const result = await spinTurntable({});
      toast.success(result?.prize_name || result?.name || t('spin.pageTitle'));
      await fetchUserInfo().catch(() => {});
      load();
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSpinning(false);
    }
  };

  const spinStyle = {
    transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1440deg'] }) }],
  };
  const chances = data?.chance ?? data?.times ?? data?.remain_times ?? data?.spin_times ?? 0;

  return (
    <View style={styles.page}>
      <Image source={stageBg} style={styles.bg} contentFit="cover" />
      <View style={[styles.top, { paddingTop: insets.top + s(12) }]}>
        <Text style={styles.title}>{t('spin.pageTitle')}</Text>
        <View style={styles.topActions}>
          <Pressable onPress={() => setRules(true)}><Text style={styles.help}>{t('balanceTreasure.rules')}</Text></Pressable>
          <Pressable onPress={() => router.push('/spin/withdrawals')}>
            <Image source={recordIcon} style={styles.record} contentFit="contain" />
          </Pressable>
        </View>
      </View>
      <View style={styles.tabs}>
        {[['points', t('spin.tabPoints')], ['invite', t('spin.tabInvite')]].map(([id, label]) => (
          <Pressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => setTab(id)}>
            <Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {!ready ? (
        <PageSkeleton rows={2} />
      ) : (
        <View style={styles.body}>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>{tab === 'points' ? t('spin.myPoints') : t('spin.myAmountPlain')}</Text>
            <Text style={styles.amountValue}>{tab === 'points' ? data?.points ?? data?.point ?? 0 : `₹${data?.amount ?? data?.balance ?? balance}`}</Text>
            <Text style={styles.chances}>{t('spin.spinsLeft')} {chances}</Text>
          </View>
          <View style={styles.stage}>
            <Image source={coinLeft} style={[styles.coin, styles.coinLeft]} contentFit="contain" />
            <Image source={coinRight} style={[styles.coin, styles.coinRight]} contentFit="contain" />
            <View style={styles.wheelWrap}>
              <Image source={wheelRing} style={styles.ring} contentFit="contain" />
              <Animated.View style={[styles.discWrap, spinStyle]}>
                <Image source={wheelDisc} style={styles.disc} contentFit="contain" />
              </Animated.View>
              <Pressable style={styles.spinButton} onPress={spin} disabled={spinning}>
                <Image source={wheelSpin} style={styles.spinImage} contentFit="contain" />
              </Pressable>
            </View>
          </View>
          {tab === 'invite' ? (
            <Pressable style={styles.invite} onPress={() => router.push('/refer-bonus')}>
              <Text style={styles.inviteText}>{t('spin.inviteFriends')}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
      <ConfirmSheet visible={rules} title={t('spin.pointsRulesTitle')} message={t('spin.pointsRulesFallback')} confirmText={t('common.confirm')} cancelText={t('common.close')} onConfirm={() => setRules(false)} onClose={() => setRules(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#14081c' },
  bg: { ...StyleSheet.absoluteFillObject },
  top: { paddingHorizontal: s(16), paddingTop: s(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  help: { color: '#f3c45f', fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: s(8), paddingHorizontal: s(16), paddingTop: s(8) },
  tab: { flex: 1, height: s(36), borderRadius: s(6), borderWidth: 1, borderColor: '#6b4a16', alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: '#fff', fontWeight: '700', fontSize: s(12) },
  tabTextOn: { color: colors.accentInk },
  invite: { height: s(44), paddingHorizontal: s(16), borderRadius: s(8), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  inviteText: { color: colors.accentInk, fontWeight: '800' },
  title: { color: '#fff6d8', fontSize: s(18), fontWeight: '800' },
  record: { width: s(28), height: s(28) },
  body: { flex: 1, alignItems: 'center', paddingTop: s(12), gap: s(16) },
  amountCard: { width: '88%', borderRadius: s(12), backgroundColor: 'rgba(20,10,28,0.72)', borderWidth: 1, borderColor: '#6b4a16', padding: s(14), alignItems: 'center', gap: s(4) },
  amountLabel: { color: '#f3c45f', fontSize: s(12) },
  amountValue: { color: '#fff', fontSize: s(28), fontWeight: '800' },
  chances: { color: colors.muted, fontSize: s(12) },
  stage: { width: s(320), height: s(340), alignItems: 'center', justifyContent: 'center' },
  coin: { position: 'absolute', width: s(72), height: s(72), bottom: s(8) },
  coinLeft: { left: 0 },
  coinRight: { right: 0 },
  wheelWrap: { width: s(280), height: s(280), alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: s(280), height: s(280) },
  discWrap: { width: s(220), height: s(220) },
  disc: { width: s(220), height: s(220) },
  spinButton: { position: 'absolute', width: s(86), height: s(86), alignItems: 'center', justifyContent: 'center' },
  spinImage: { width: s(86), height: s(86) },
});
