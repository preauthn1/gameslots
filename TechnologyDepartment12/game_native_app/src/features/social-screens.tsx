// @ts-nocheck
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getPrizePoolCurrent, getPrizePoolLeaderboard } from '@/api/jackpot';
import { claimGameBetRank, claimRechargeRank, geNowGame, geNowRecharge } from '@/api/rank';
import { getSacredActivity, getSacredJourney, getSacredSpin, getSacredTower } from '@/api/sacred';
import { getTeamList } from '@/api/vip';
import { ConfirmSheet, EmptyState, PageHeader, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const rowsOf = (result) => result?.list || result?.records || result?.rank_list || (Array.isArray(result) ? result : []);

export { TeamScreen } from '@/features/team-screen';

export function RankScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState('recharge');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  useEffect(() => {
    setLoading(true);
    const request = tab === 'recharge' ? geNowRecharge : geNowGame;
    request({ page: 1, page_size: 20 })
      .then((result) => setItems(rowsOf(result)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);
  const claim = async () => {
    setClaiming(true);
    try {
      await (tab === 'recharge' ? claimRechargeRank({}) : claimGameBetRank({}));
      toast.success(t('jackpotRank.claimSuccess'));
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setClaiming(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={t('rankings.title')} onBack={() => router.back()} />
      <View style={styles.tabs}>
        {[['recharge', t('wallet.billTypeRecharge')], ['bet', t('jackpotRank.bet')]].map(([id, label]) => (
          <Pressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => setTab(id)}>
            <Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <PageSkeleton rows={6} /> : (
        <FlatList
          style={styles.fill}
          data={items}
          keyExtractor={(item, index) => String(item.id || item.user_id || index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label={t('common.noData')} />}
          ListHeaderComponent={<PrimaryButton label={t('vip.claim')} loading={claiming} onPress={claim} />}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.rank}>{item.rank || index + 1}</Text>
              <View style={styles.grow}>
                <Text style={styles.title}>{item.nickname || item.username || item.name || '—'}</Text>
                <Text style={styles.meta}>{item.amount || item.recharge || item.bet_amount || item.score || ''}</Text>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

export function JackpotScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [pool, setPool] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState(false);
  useEffect(() => {
    Promise.all([getPrizePoolCurrent().catch(() => null), getPrizePoolLeaderboard({ page: 1, page_size: 20 }).catch(() => [])])
      .then(([current, board]) => {
        setPool(current?.data || current);
        setItems(rowsOf(board));
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <Screen>
      <PageHeader title={t('jackpotRank.title')} onBack={() => router.back()} right={<Pressable onPress={() => setRules(true)}><Text style={styles.link}>{t('jackpotRank.activityRules')}</Text></Pressable>} />
      {loading ? <PageSkeleton rows={5} /> : (
        <FlatList
          style={styles.fill}
          data={items}
          keyExtractor={(item, index) => String(item.user_id || item.id || index)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.card}>
              <Text style={styles.meta}>{t('jackpotRank.myRank')} {pool?.my_rank || pool?.rank || '—'}</Text>
              <Text style={styles.amount}>₹{pool?.amount || pool?.prize_pool || pool?.pool || 0}</Text>
              <Text style={styles.meta}>{t('jackpotRank.myBets')} {pool?.my_bet || pool?.bet || 0}</Text>
            </View>
          }
          ListEmptyComponent={<EmptyState label={t('common.noData')} />}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.rank}>{item.rank || index + 1}</Text>
              <Text style={styles.title}>{item.nickname || item.username || '—'}</Text>
              <Text style={styles.amount}>{item.bet_amount || item.amount || item.score || ''}</Text>
            </View>
          )}
        />
      )}
      <ConfirmSheet visible={rules} title={t('jackpotRank.ruleTitle')} message={`${t('jackpotRank.rule1')}\n${t('jackpotRank.rule2')}`} confirmText={t('common.confirm')} cancelText={t('common.close')} onConfirm={() => setRules(false)} onClose={() => setRules(false)} />
    </Screen>
  );
}

export function SacredScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const tabs = [
    ['journey', t('sacredJourney.tabJourney'), getSacredJourney],
    ['tower', t('sacredJourney.tabSacredTower'), getSacredTower],
    ['wheel', t('sacredJourney.tabPowerFortuneWheel'), getSacredSpin],
    ['exchange', t('sacredJourney.tabExchange'), getSacredActivity],
  ];
  const [tab, setTab] = useState('journey');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const loader = tabs.find((item) => item[0] === tab)?.[2];
    loader({})
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [tab]);
  const payload = data?.data || data || {};
  const list = rowsOf(payload);
  return (
    <Screen>
      <PageHeader title={t('sacredJourney.tabJourney')} onBack={() => router.back()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent}>
        {tabs.map(([id, label]) => (
          <Pressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => setTab(id)}>
            <Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading ? <PageSkeleton rows={4} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.card}>
            <Text style={styles.title}>{payload.title || payload.name || t('sacredJourney.boostHeroTitle')}</Text>
            <Text style={styles.meta}>{payload.desc || payload.description || payload.remark || t('sacredJourney.boostHeroSub')}</Text>
          </View>
          {list.map((item, index) => (
            <View key={item.id || index} style={styles.card}>
              <Text style={styles.title}>{item.name || item.title || item.stationName || `#${index + 1}`}</Text>
              <Text style={styles.meta}>{item.status_text || item.status || item.reward || ''}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

export function SubordinateScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getTeamList({ page: 1, page_size: 20 }).then((result) => setItems(rowsOf(result))).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);
  return (
    <Screen>
      <PageHeader title={t('mySubordinate.title')} onBack={() => router.back()} />
      {loading ? <PageSkeleton rows={5} /> : (
        <FlatList data={items} keyExtractor={(item, index) => String(item.id || index)} contentContainerStyle={styles.list} ListEmptyComponent={<EmptyState label={t('common.noData')} />} renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.nickname || item.username || '—'}</Text>
            <Text style={styles.meta}>{t('mySubordinate.level') || ''} {item.level || item.vip_level || ''}</Text>
            <Text style={styles.meta}>{item.created_at || ''}</Text>
          </View>
        )} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { padding: s(12), gap: s(10) },
  tabs: { flexDirection: 'row', gap: s(8), paddingHorizontal: s(12), paddingBottom: s(8) },
  tabScroll: { height: s(44), maxHeight: s(44), flexGrow: 0 },
  tabScrollContent: { height: s(44), gap: s(8), paddingHorizontal: s(12), alignItems: 'center' },
  tab: { flexGrow: 0, height: s(36), paddingHorizontal: s(12), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.text, fontWeight: '700', fontSize: s(12) },
  tabTextOn: { color: colors.accentInk },
  card: { padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: s(10) },
  rowCard: { minHeight: s(48), paddingHorizontal: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rank: { width: s(28), color: '#f3c45f', fontWeight: '800' },
  grow: { flex: 1 },
  title: { color: colors.text, fontWeight: '700', flex: 1 },
  meta: { color: colors.muted, fontSize: s(12) },
  amount: { color: colors.accent, fontWeight: '800' },
  link: { color: colors.accent, fontWeight: '700' },
});
