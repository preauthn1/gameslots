// @ts-nocheck
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getLevelList, getLevelReward } from '@/api/vip';
import { ConfirmSheet, PageHeader, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

function useLevels() {
  const { t } = useI18n();
  const user = useUserStore((state) => state.userInfo);
  const [levels, setLevels] = useState([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(Number(user?.level || 0));
  useEffect(() => {
    getLevelList()
      .then((result) => {
        const list = (Array.isArray(result) ? result : result?.list || []).slice().sort((a, b) => Number(a.number) - Number(b.number));
        setLevels(list);
        setSelected(Number(user?.level || list[0]?.number || 0));
      })
      .catch((error) => toast.error(error?.message || t('errors.requestFailed')))
      .finally(() => setReady(true));
  }, [t, user?.level]);
  return { user, levels, ready, selected, setSelected, currentLevel: Number(user?.level || 0) };
}

function LevelTabs({ levels, selected, currentLevel, onSelect, t }) {
  return (
    <ScrollView horizontal style={styles.tabs} contentContainerStyle={styles.tabContent} showsHorizontalScrollIndicator={false}>
      {levels.map((item) => {
        const id = Number(item.number);
        const active = id === selected;
        return (
          <Pressable key={id} style={[styles.tab, active && styles.tabOn]} onPress={() => onSelect(id)}>
            <Text style={[styles.tabText, active && styles.tabTextOn]}>V{item.number}</Text>
            {id === currentLevel ? <Text style={styles.current}>{t('vip.currentLevel')}</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function VipCenterScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, levels, ready, selected, setSelected, currentLevel } = useLevels();
  const [claiming, setClaiming] = useState('');
  const config = levels.find((item) => Number(item.number) === selected) || levels[0];
  const next = levels.find((item) => Number(item.number) > currentLevel);
  const rechargeGap = next ? Math.max(0, Number(next.recharge || 0) - Number(user?.total_recharge || 0)) : 0;
  const wagerGap = next ? Math.max(0, Number(next.game_wagers || 0) - Number(user?.total_game_wagers || 0)) : 0;
  const progress = !next
    ? t('vip.maxLevelReached')
    : rechargeGap > 0
      ? `${t('vip.rechargeMore')} ₹${rechargeGap.toLocaleString('en-US')} ${t('vip.upgradeTo')} ${next.name || `VIP ${next.number}`}`
      : wagerGap > 0
        ? `${t('vip.betMore')} ₹${wagerGap.toLocaleString('en-US')} ${t('vip.upgradeTo')} ${next.name || `VIP ${next.number}`}`
        : t('vip.upgradeReady');
  const claim = async (type) => {
    setClaiming(type);
    try {
      await getLevelReward({ type, level: selected });
      toast.success(t('vip.claimSuccess'));
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setClaiming('');
    }
  };
  const rewards = config
    ? [
        { id: 'upgrade', title: t('vip.upgradeReward'), desc: t('vip.upgradeDesc', { name: config.name || '' }), amount: config.bonus },
        { id: 'week', title: t('vip.weeklyReward'), desc: t('vip.weeklyReset'), amount: config.week_bonus, type: 'week_bonus', can: Number(config.is_week_bonus) === 1 && selected === currentLevel },
        { id: 'month', title: t('vip.monthlyReward'), desc: t('vip.monthlyReset'), amount: config.month_bonus, type: 'month_bonus', can: Number(config.is_month_bonus) === 1 && selected === currentLevel },
      ]
    : [];
  return (
    <Screen>
      <PageHeader title="VIP" onBack={() => router.back()} />
      {!ready ? <PageSkeleton rows={4} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          <LevelTabs levels={levels} selected={selected} currentLevel={currentLevel} onSelect={setSelected} t={t} />
          <View style={styles.card}>
            <Text style={styles.title}>{config?.name || `VIP ${currentLevel}`}</Text>
            <Text style={styles.meta}>{progress}</Text>
            <Text style={styles.meta}>{t('vip.totalRecharge')} ₹{Number(user?.total_recharge || 0).toLocaleString('en-US')}</Text>
            <Text style={styles.meta}>{t('vip.totalBet')} ₹{Number(user?.total_game_wagers || 0).toLocaleString('en-US')}</Text>
          </View>
          {rewards.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.amount}>₹{Number(item.amount || 0).toLocaleString('en-US')}</Text>
              </View>
              <Text style={styles.meta}>{item.desc}</Text>
              {item.type ? <PrimaryButton label={item.can ? t('vip.claim') : t('vip.claimed')} disabled={!item.can} loading={claiming === item.type} onPress={() => claim(item.type)} /> : null}
            </View>
          ))}
          <Pressable style={styles.card} onPress={() => router.push('/vip-center/benefits')}><Text style={styles.title}>{t('vip.levelBenefits')}</Text></Pressable>
          <Pressable style={styles.card} onPress={() => router.push('/vip-center/level-guide')}><Text style={styles.title}>{t('vipWelfare.levelGuide')}</Text></Pressable>
        </ScrollView>
      )}
    </Screen>
  );
}

export function VipBenefitsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, levels, ready, selected, setSelected, currentLevel } = useLevels();
  const [policy, setPolicy] = useState(false);
  const config = levels.find((item) => Number(item.number) === selected) || levels[0];
  const rechargeNeed = Number(config?.recharge || 0);
  const wagerNeed = Number(config?.game_wagers || 0);
  const rechargeTotal = Number(user?.total_recharge || 0);
  const wagerTotal = Number(user?.total_game_wagers || 0);
  return (
    <Screen>
      <PageHeader title={t('vip.levelBenefits')} onBack={() => router.back()} />
      {!ready ? <PageSkeleton rows={4} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          <LevelTabs levels={levels} selected={selected} currentLevel={currentLevel} onSelect={setSelected} t={t} />
          <Text style={styles.title}>VIP {selected} {t('vip.levelRequirements')}</Text>
          <View style={styles.card}>
            <Text style={styles.meta}>{t('vip.depositAmount')} ₹{rechargeNeed.toLocaleString('en-US')}</Text>
            <Text style={styles.amount}>{rechargeTotal >= rechargeNeed ? t('vip.achieved') : t('vip.notAchieved')}</Text>
            <Text style={styles.meta}>{t('vip.betAmount')} ₹{wagerNeed.toLocaleString('en-US')}</Text>
            <Text style={styles.amount}>{wagerTotal >= wagerNeed ? t('vip.achieved') : t('vip.notAchieved')}</Text>
          </View>
          <Text style={styles.title}>VIP {selected} {t('vip.levelBenefits')}</Text>
          {[
            [t('vip.upgradeReward'), config?.bonus],
            [t('vip.weeklyReward'), config?.week_bonus],
            [t('vip.monthlyReward'), config?.month_bonus],
            [t('vipWelfare.freeWithdrawal'), config?.withdraw_count || config?.free_withdraw],
          ].map(([label, value]) => (
            <View key={label} style={styles.rowCard}>
              <Text style={styles.title}>{label}</Text>
              <Text style={styles.amount}>{value ?? '—'}</Text>
            </View>
          ))}
          <Pressable onPress={() => setPolicy(true)}><Text style={styles.link}>{t('vip.rewardPolicy')}</Text></Pressable>
        </ScrollView>
      )}
      <ConfirmSheet visible={policy} title={t('vip.rewardPolicy')} message={t('vip.upgradeDesc', { name: config?.name || '' })} confirmText={t('common.confirm')} cancelText={t('common.close')} onConfirm={() => setPolicy(false)} onClose={() => setPolicy(false)} />
    </Screen>
  );
}

export function VipLevelGuideScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { levels, ready } = useLevels();
  const [open, setOpen] = useState('1-10');
  const ranges = [];
  for (let start = 1; start <= 50; start += 10) {
    const rows = levels.filter((item) => Number(item.number) >= start && Number(item.number) <= start + 9);
    if (start === 1 || rows.length) ranges.push({ id: `${start}-${start + 9}`, rows });
  }
  return (
    <Screen>
      <PageHeader title={t('vipWelfare.levelGuide')} onBack={() => router.back()} />
      {!ready ? <PageSkeleton rows={4} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          {ranges.map((range) => (
            <View key={range.id} style={styles.card}>
              <Pressable onPress={() => setOpen(open === range.id ? '' : range.id)}>
                <Text style={styles.title}>VIP {range.id}</Text>
              </Pressable>
              {open === range.id ? range.rows.map((item) => (
                <View key={item.number} style={styles.row}>
                  <Text style={styles.meta}>V{item.number} {item.name || ''}</Text>
                  <Text style={styles.meta}>₹{Number(item.recharge || 0).toLocaleString('en-US')}</Text>
                </View>
              )) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: s(12), gap: s(10) },
  tabs: { height: s(52), maxHeight: s(52), flexGrow: 0 },
  tabContent: { height: s(52), gap: s(8), alignItems: 'center', paddingHorizontal: s(12) },
  tab: { minWidth: s(64), height: s(44), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.text, fontWeight: '700' },
  tabTextOn: { color: colors.accentInk },
  current: { color: '#f3c45f', fontSize: s(9) },
  card: { padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: s(6) },
  rowCard: { minHeight: s(44), paddingHorizontal: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: s(8) },
  title: { color: colors.text, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: s(12), lineHeight: s(18) },
  amount: { color: colors.accent, fontWeight: '800' },
  link: { color: colors.accent, fontWeight: '700' },
});
