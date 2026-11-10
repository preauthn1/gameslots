// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { rechargeList, withdrawList } from '@/api/bankcard';
import { getTurntableData, getTurntableRecords, getTurntableWithdrawals } from '@/api/turntable';
import { getUserBillList } from '@/api/wallect';
import { EmptyState, PageHeader, PageSkeleton, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const ymd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shift = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return ymd(date);
};

const ranges = {
  today: () => ({ start: ymd(new Date()), end: ymd(new Date()) }),
  yesterday: () => ({ start: shift(1), end: shift(1) }),
  last7: () => ({ start: shift(7), end: ymd(new Date()) }),
  last30: () => ({ start: shift(30), end: ymd(new Date()) }),
  month: () => {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const end = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return { start, end };
  },
};

const copyText = async (value, t) => {
  if (!value || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
  try {
    await navigator.clipboard.writeText(String(value));
    toast.success(t('common.copySuccess'));
  } catch {
    toast.error(t('common.copyFailed'));
  }
};

function FilterBar({ dates, dateKey, onDate, types, typeValue, onType, t }) {
  const [open, setOpen] = useState('');
  return (
    <View>
      <View style={styles.filters}>
        <Pressable style={styles.filter} onPress={() => setOpen(open === 'date' ? '' : 'date')}>
          <Text style={styles.filterText}>{dates.find((item) => item.key === dateKey)?.label}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>
        {types ? (
          <Pressable style={styles.filter} onPress={() => setOpen(open === 'type' ? '' : 'type')}>
            <Text style={styles.filterText}>{types.find((item) => item.value === typeValue)?.label}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
        ) : null}
      </View>
      {open === 'date' ? (
        <View style={styles.menu}>
          {dates.map((item) => (
            <Pressable key={item.key} onPress={() => { onDate(item.key); setOpen(''); }}>
              <Text style={[styles.menuText, item.key === dateKey && styles.menuOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {open === 'type' && types ? (
        <View style={styles.menu}>
          {types.map((item) => (
            <Pressable key={String(item.value)} onPress={() => { onType(item.value); setOpen(''); }}>
              <Text style={[styles.menuText, item.value === typeValue && styles.menuOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function RecordPage({ title, chips, chip, onChip, dates, dateKey, onDate, types, typeValue, onType, load, renderItem, empty }) {
  const router = useRouter();
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    load()
      .then((list) => setItems(list || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Screen>
      <PageHeader title={title} onBack={() => router.back()} />
      {chips?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipContent}>
          {chips.map((item) => (
            <Pressable key={item.id} style={[styles.chip, chip === item.id && styles.chipOn]} onPress={() => onChip(item.id)}>
              <Text style={[styles.chipText, chip === item.id && styles.chipTextOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <FilterBar dates={dates} dateKey={dateKey} onDate={onDate} types={types} typeValue={typeValue} onType={onType} t={t} />
      {loading ? <PageSkeleton rows={5} /> : (
        <FlatList
          style={styles.fill}
          data={items}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label={empty || t('common.noData')} />}
          renderItem={renderItem}
        />
      )}
    </Screen>
  );
}

const listOf = (result) => result?.list || result?.records || (Array.isArray(result) ? result : []);

export function BillScreen() {
  const { t } = useI18n();
  const groups = [
    { id: '1,3,6,7,8,9,10,11,12,13,2,4,14,15,16', label: t('wallet.billTypeAll') },
    { id: '1', label: t('wallet.billTypeRecharge') },
    { id: '3', label: t('wallet.billTypeWithdraw') },
    { id: '6,7,8,9,10,11,12,13', label: t('wallet.billTypeSystemGift') },
    { id: '2,4,14,15,16', label: t('wallet.billTypeCommission') },
  ];
  const dates = [
    { key: 'month', label: `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}` },
    { key: 'today', label: t('rechargeRecord.today') },
    { key: 'last7', label: t('rechargeRecord.last7Days') },
    { key: 'last30', label: t('rechargeRecord.last30Days') },
  ];
  const types = [
    { value: '', label: t('common.all') },
    { value: 1, label: t('wallet.billChangeIncrease') },
    { value: 2, label: t('wallet.billChangeDecrease') },
  ];
  const [chip, setChip] = useState(groups[0].id);
  const [dateKey, setDateKey] = useState('month');
  const [change, setChange] = useState('');
  const load = useCallback(() => {
    const range = ranges[dateKey]();
    return getUserBillList({
      page: 1,
      page_size: 20,
      type: '',
      partition_date: `${range.start}_${range.end}`,
      change,
      detail_type: chip,
    }).then(listOf);
  }, [change, chip, dateKey]);

  return (
    <RecordPage
      title={t('pageCopy.betting.transactions')}
      chips={groups}
      chip={chip}
      onChip={setChip}
      dates={dates}
      dateKey={dateKey}
      onDate={setDateKey}
      types={types}
      typeValue={change}
      onType={setChange}
      load={load}
      renderItem={({ item }) => {
        const amount = item.balance || item.amount || item.money || 0;
        const signed = `${Number(item.change) === 2 ? '-' : '+'}${amount}`;
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <Text style={styles.title}>{item.title || item.remark || item.detail || '—'}</Text>
                <Text style={styles.meta}>{item.business_sn || item.order_no || ''}</Text>
                <Text style={styles.meta}>{item.created_at || item.create_time || ''}</Text>
              </View>
              <Text style={[styles.amount, Number(item.change) === 2 ? styles.lose : styles.win]}>{signed}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

function paymentRecord(kind) {
  return function PaymentRecordScreen() {
    const { t } = useI18n();
    const dates = [
      { key: 'today', label: t(`${kind}.today`) },
      { key: 'yesterday', label: t(`${kind}.yesterday`) },
      { key: 'last7', label: t(`${kind}.last7Days`) },
      { key: 'last30', label: t(`${kind}.last30Days`) },
      { key: 'all', label: t('common.all') },
    ];
    const types = kind === 'rechargeRecord'
      ? [
          { value: null, label: t('rechargeRecord.allTypes') },
          { value: 1, label: t('rechargeRecord.digitalWallet') },
          { value: 2, label: t('rechargeRecord.thirdPartyPayment') },
          { value: 3, label: t('rechargeRecord.offlinePayment') },
        ]
      : [
          { value: null, label: t('withdrawRecord.allTypes') },
          { value: 1, label: t('withdrawRecord.bankPay') },
          { value: 2, label: t('withdrawRecord.thirdPartyPay') },
          { value: 3, label: t('withdrawRecord.usdtPay') },
        ];
    const [dateKey, setDateKey] = useState(kind === 'rechargeRecord' ? 'today' : 'all');
    const [type, setType] = useState(null);
    const load = useCallback(() => {
      const params = { page: 1, page_size: 20 };
      if (dateKey !== 'all') {
        const range = ranges[dateKey]();
        params.partition_date = `${range.start}_${range.end}`;
      }
      if (type !== null) params.type = type;
      const request = kind === 'rechargeRecord' ? rechargeList : withdrawList;
      return request(params).then(listOf);
    }, [dateKey, type]);

    return (
      <RecordPage
        title={t(`${kind}.title`)}
        dates={dates}
        dateKey={dateKey}
        onDate={setDateKey}
        types={types}
        typeValue={type}
        onType={setType}
        load={load}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => copyText(item.order_no, t)}>
            <View style={styles.row}>
              <Text style={styles.title}>
                {kind === 'rechargeRecord' ? t(`rechargeTypeMap.${item.type}`) : `${t('withdrawRecord.withdrawType')} ${t(`withdrawTypeMap.${item.account_type}`)}`}
              </Text>
              <Text style={styles.amount}>{item.amount} {item.currency || ''}</Text>
            </View>
            <Text style={styles.meta}>{t(`${kind}.transactionId`)} {item.order_no}</Text>
            <View style={styles.row}>
              <Text style={styles.meta}>{item.created_at}</Text>
              <Text style={styles.status}>{item.status_text || item.status}</Text>
            </View>
          </Pressable>
        )}
      />
    );
  };
}

export const RechargeRecordScreen = paymentRecord('rechargeRecord');
export const WithdrawRecordScreen = paymentRecord('withdrawRecord');

export function SpinWithdrawScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState('spin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTurntableData({}, { showLoading: false })
      .then((meta) => {
        const data = meta?.data || meta || {};
        const params = { turntable_id: data.id || data.turntable_id || '', date: data.date || data.period_date || '', page: 1, limit: 20 };
        return tab === 'spin' ? getTurntableRecords(params) : getTurntableWithdrawals(params);
      })
      .then((result) => {
        if (alive) setItems(listOf(result));
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tab]);

  return (
    <Screen>
      <PageHeader title={t('spin.record')} onBack={() => router.back()} />
      <View style={styles.filters}>
        {[
          ['spin', t('spin.spinRecords')],
          ['withdraw', t('spin.withdrawRecords')],
        ].map(([id, label]) => (
          <Pressable key={id} style={[styles.filter, tab === id && styles.chipOn]} onPress={() => setTab(id)}>
            <Text style={[styles.filterText, tab === id && styles.chipTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <PageSkeleton rows={5} /> : (
        <FlatList
          style={styles.fill}
          data={items}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label={t('common.noData')} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.nickname || item.name || item.username || item.remark || '—'}</Text>
                <Text style={styles.amount}>{item.amount ?? item.reward ?? item.money ?? ''}</Text>
              </View>
              <Text style={styles.meta}>{item.created_at || item.time || item.create_time || ''}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  chips: { height: s(44), maxHeight: s(44), flexGrow: 0 },
  chipContent: { height: s(44), gap: s(8), paddingHorizontal: s(12), alignItems: 'center' },
  chip: { height: s(32), paddingHorizontal: s(12), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: s(12), fontWeight: '700' },
  chipTextOn: { color: colors.accentInk },
  filters: { flexDirection: 'row', gap: s(8), paddingHorizontal: s(12), paddingBottom: s(8) },
  filter: { flex: 1, height: s(36), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: s(10), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterText: { color: colors.text, fontSize: s(12), fontWeight: '600' },
  chevron: { color: colors.muted },
  menu: { marginHorizontal: s(12), marginBottom: s(8), padding: s(8), gap: s(6), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  menuText: { color: colors.text, paddingVertical: s(6) },
  menuOn: { color: colors.accent, fontWeight: '700' },
  list: { padding: s(12), gap: s(10) },
  card: { padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: s(6) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(8) },
  grow: { flex: 1, gap: s(4) },
  title: { color: colors.text, fontWeight: '700', flexShrink: 1 },
  meta: { color: colors.muted, fontSize: s(12) },
  amount: { color: colors.text, fontWeight: '800' },
  win: { color: colors.accent },
  lose: { color: colors.danger },
  status: { color: '#f3c45f', fontSize: s(12), fontWeight: '700' },
});
