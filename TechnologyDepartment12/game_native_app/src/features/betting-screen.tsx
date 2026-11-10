// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { gameBet, gameType } from '@/api/game';
import { EmptyState, PageHeader, PageSkeleton, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthRange = (key) => {
  const [year, month] = key.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    label: `${year}/${String(month).padStart(2, '0')}`,
    partition: `${year}-${String(month).padStart(2, '0')}-01_${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
};

const recentMonths = () => {
  const now = new Date();
  return [0, 1, 2].map((offset) => monthKey(new Date(now.getFullYear(), now.getMonth() - offset, 1)));
};

const mapBet = (item) => {
  const status = Number(item.win_lose_status);
  let result = String(item.win_lose_price || '0');
  let tone = 'waiting';
  if (status === 2) tone = 'lose';
  if (status === 3) {
    tone = 'win';
    if (!result.startsWith('+')) result = `+${result}`;
  }
  if (status === 4) {
    tone = 'draw';
    result = '0';
  }
  return {
    id: item.id,
    title: item.game_info?.name || '',
    time: item.created_at || '',
    betAmount: item.bet_price || '0',
    result,
    status: tone,
    betSn: item.business_sn || '',
    type_id: item.type_id || '',
  };
};

export function BettingScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const months = useMemo(recentMonths, []);
  const [vendors, setVendors] = useState([]);
  const [typeId, setTypeId] = useState(null);
  const [month, setMonth] = useState(months[0]);
  const [status, setStatus] = useState(0);
  const [statusOpen, setStatusOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ bet: 0, profit: 0 });
  const [loading, setLoading] = useState(true);

  const statuses = [
    { value: 0, label: t('common.all') },
    { value: 3, label: t('winLoss.win') },
    { value: 2, label: t('winLoss.lose') },
    { value: 1, label: t('winLoss.pending') },
  ];

  const load = useCallback(async () => {
    if (!typeId) return;
    setLoading(true);
    try {
      const range = monthRange(month);
      const response = await gameBet({
        status,
        type_id: typeId,
        partition_date: range.partition,
        page: 1,
        page_size: 20,
      });
      setTotals({ bet: response?.all_bet_price || 0, profit: response?.all_win_lose_price || 0 });
      setItems((response?.list || []).map(mapBet));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [month, status, typeId]);

  useEffect(() => {
    gameType()
      .then((response) => {
        const list = response?.list || [];
        setVendors(list);
        if (list[0]) setTypeId(list[0].id);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const profit = Number(totals.profit);
  const profitText = profit < 0 ? '0.00' : `${profit > 0 ? '+' : ''}${profit}`;

  return (
    <Screen>
      <PageHeader title={t('pageCopy.betting.history')} onBack={() => router.back()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorRow} contentContainerStyle={styles.vendorContent}>
        {vendors.map((vendor) => (
          <Pressable key={vendor.id} style={[styles.chip, typeId === vendor.id && styles.chipOn]} onPress={() => setTypeId(vendor.id)}>
            <Text style={[styles.chipText, typeId === vendor.id && styles.chipTextOn]}>{vendor.name || vendor.en_name || vendor.code}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.filters}>
        <Pressable style={styles.filter} onPress={() => { setMonthOpen((value) => !value); setStatusOpen(false); }}>
          <Text style={styles.filterText}>{monthRange(month).label}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>
        <Pressable style={styles.filter} onPress={() => { setStatusOpen((value) => !value); setMonthOpen(false); }}>
          <Text style={styles.filterText}>{statuses.find((item) => item.value === status)?.label}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>
      </View>
      {monthOpen ? (
        <View style={styles.menu}>
          {months.map((key) => (
            <Pressable key={key} onPress={() => { setMonth(key); setMonthOpen(false); }}>
              <Text style={[styles.menuText, key === month && styles.menuOn]}>{monthRange(key).label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {statusOpen ? (
        <View style={styles.menu}>
          {statuses.map((item) => (
            <Pressable key={item.value} onPress={() => { setStatus(item.value); setStatusOpen(false); }}>
              <Text style={[styles.menuText, item.value === status && styles.menuOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {loading ? (
        <PageSkeleton rows={5} />
      ) : (
        <FlatList
          style={styles.fill}
          data={items}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('pageCopy.betting.noRecords')}</Text>
              <Text style={styles.emptyCopy}>{t('pageCopy.betting.noMatchingBets')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: '/betting-detail', params: { payload: encodeURIComponent(JSON.stringify(item)) } })}>
              <View style={styles.row}>
                <Text style={styles.title} numberOfLines={1}>{item.title || '—'}</Text>
                <Text style={[styles.result, styles[item.status]]}>{item.result}</Text>
              </View>
              <Text style={styles.meta}>{item.betSn}</Text>
              <View style={styles.row}>
                <Text style={styles.meta}>{item.time}</Text>
                <Text style={styles.meta}>{t('betting.bet')}{item.betAmount}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <View style={styles.summary}>
        <View>
          <Text style={styles.meta}>{t('betting.totalBet')}</Text>
          <Text style={styles.summaryValue}>{totals.bet}</Text>
        </View>
        <View>
          <Text style={styles.meta}>{t('betting.totalProfit')}</Text>
          <Text style={[styles.summaryValue, styles.win]}>{profitText}</Text>
        </View>
      </View>
    </Screen>
  );
}

export function BettingDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { payload } = useLocalSearchParams();
  const item = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(String(payload || '')));
    } catch {
      return null;
    }
  }, [payload]);

  return (
    <Screen>
      <PageHeader title={t('pageCopy.betting.details')} onBack={() => router.back()} />
      {!item ? (
        <EmptyState label={t('pageCopy.betting.invalidBet')} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={[styles.result, styles[item.status]]}>{item.result}</Text>
            </View>
            <Text style={[styles.meta, styles[item.status]]}>
              {item.status === 'waiting' ? t('pageCopy.betting.pending') : t('pageCopy.betting.settled')}
            </Text>
            <Text style={styles.meta}>{item.betSn}</Text>
          </View>
          <Text style={styles.section}>{t('pageCopy.betting.information')}</Text>
          {[
            [t('bettingDetail.gameName'), item.title],
            [t('bettingDetail.betAmount'), item.betAmount],
            [t('bettingDetail.validBet'), item.betAmount],
            [t('bettingDetail.netProfit'), item.status === 'lose' ? '0.00' : item.result],
            [t('bettingDetail.betTime'), item.time],
            [t('bettingDetail.transactionNo'), item.betSn],
          ].map(([label, value]) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.meta}>{label}</Text>
              <Text style={styles.title}>{value}</Text>
            </View>
          ))}
          <Pressable style={styles.support} onPress={() => router.push('/customer-service-center')}>
            <Text style={styles.title}>{t('bettingDetail.question')}</Text>
            <Text style={styles.supportAction}>{t('bettingDetail.contactService')} ›</Text>
          </Pressable>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  vendorRow: { height: s(44), maxHeight: s(44), flexGrow: 0 },
  vendorContent: { height: s(44), gap: s(8), paddingHorizontal: s(12), alignItems: 'center' },
  chip: { height: s(36), paddingHorizontal: s(12), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700', fontSize: s(12) },
  chipTextOn: { color: colors.accentInk },
  filters: { flexDirection: 'row', gap: s(8), paddingHorizontal: s(12), paddingBottom: s(8) },
  filter: { flex: 1, height: s(36), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: s(10), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterText: { color: colors.text, fontSize: s(12), fontWeight: '600' },
  chevron: { color: colors.muted },
  menu: { marginHorizontal: s(12), marginBottom: s(8), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: s(8), gap: s(8) },
  menuText: { color: colors.text, paddingVertical: s(6) },
  menuOn: { color: colors.accent, fontWeight: '700' },
  list: { padding: s(12), gap: s(10), paddingBottom: s(88) },
  card: { padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: s(6) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(8) },
  title: { color: colors.text, fontWeight: '700', flexShrink: 1 },
  result: { fontWeight: '800' },
  meta: { color: colors.muted, fontSize: s(12) },
  win: { color: colors.accent },
  lose: { color: colors.danger },
  draw: { color: colors.muted },
  waiting: { color: '#3c81e5' },
  empty: { alignItems: 'center', paddingTop: s(48), gap: s(8) },
  emptyTitle: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  emptyCopy: { color: colors.muted, fontSize: s(12), textAlign: 'center' },
  summary: { position: 'absolute', left: 0, right: 0, bottom: 0, height: s(64), paddingHorizontal: s(16), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line },
  summaryValue: { color: colors.text, fontWeight: '800', marginTop: s(2) },
  section: { color: colors.text, fontWeight: '700' },
  detailRow: { minHeight: s(36), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(12) },
  support: { marginTop: s(8), padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: s(8) },
  supportAction: { color: colors.accent, fontWeight: '700' },
});
