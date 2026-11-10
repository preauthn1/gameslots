// @ts-nocheck
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getRechargeGiftCoupons, payIn, payList } from '@/api/bankcard';
import { creatorsList } from '@/api/incentivePlan';
import { getTeamList } from '@/api/vip';
import { PageHeader, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { TextField } from '@/components/form-controls';
import { ResourceListScreen } from '@/features/more-screens';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const copyText = async (value, t) => {
  if (!value) return;
  if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(String(value));
    toast.success(t('common.copySuccess'));
  }
};

function usePayment(paymentId) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    payList()
      .then((res) => {
        const list = res?.pay_in_list || [];
        setPayment(list.find((item) => String(item.id) === String(paymentId)) || null);
      })
      .catch((error) => toast.error(error?.message))
      .finally(() => setLoading(false));
  }, [paymentId]);
  return { payment, loading };
}

function DetailRow({ label, value, onCopy, copyLabel }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {onCopy ? (
        <Pressable onPress={onCopy}>
          <Text style={styles.copy}>{copyLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function BankTransferScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { payment, loading } = usePayment(params.paymentId);
  const address = payment?.offline_address || {};
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reference.trim()) {
      toast.warning(t('recharge.enterReferenceNumber'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await payIn({ id: params.paymentId, amount: Number(params.amount), remark: reference });
      router.replace({ pathname: '/recharge-success', params: { amount: String(params.amount || ''), order_no: String(res?.business_no || res?.order_no || ''), status: '0' } });
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <PageHeader title={t('recharge.title')} onBack={() => router.back()} />
      {loading ? (
        <PageSkeleton rows={4} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.amount}>₹{params.amount || '-'}</Text>
          <View style={styles.card}>
            <DetailRow label={t('withdrawMethod.cardHolder')} value={address.card_holder} copyLabel={t('common.copy')} onCopy={() => copyText(address.card_holder, t)} />
            <DetailRow label={t('addWithdrawMethod.bankTransferP2')} value={address.name} copyLabel={t('common.copy')} onCopy={() => copyText(address.name, t)} />
            <DetailRow label={t('userInfo.withdrawMethod')} value={address.number} copyLabel={t('common.copy')} onCopy={() => copyText(address.number, t)} />
            <DetailRow label="IFSC" value={address.code} copyLabel={t('common.copy')} onCopy={() => copyText(address.code, t)} />
          </View>
          <TextField value={reference} onChangeText={setReference} placeholder={t('recharge.referenceNumber')} />
          <PrimaryButton label={t('recharge.confirmTransfer')} onPress={submit} loading={submitting} />
        </ScrollView>
      )}
    </Screen>
  );
}

export function UsdtPayScreen({ online = false }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { payment, loading } = usePayment(params.paymentId);
  const address = params.address || payment?.offline_address?.address || payment?.address || '';
  const icon = params.icon || payment?.offline_address?.icon || payment?.icon || '';
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (online) {
      router.replace({ pathname: '/recharge-success', params: { amount: String(params.amount || ''), order_no: String(params.businessNo || '') } });
      return;
    }
    if (!reference.trim()) {
      toast.warning(t('recharge.enterReferenceNumber'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await payIn({ id: params.paymentId, amount: Number(params.amount), remark: reference });
      if (res?.pay_url) {
        router.replace({ pathname: '/recharge-success', params: { amount: String(res.amount || params.amount || ''), order_no: String(res.business_no || '') } });
        return;
      }
      router.replace({ pathname: '/recharge-success', params: { amount: String(params.amount || ''), order_no: String(res?.business_no || ''), status: '0' } });
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <PageHeader title={t('recharge.title')} onBack={() => router.back()} />
      {loading && !params.address ? (
        <PageSkeleton rows={4} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.amount}>{params.amount || '-'} USDT</Text>
          <View style={styles.card}>
            <Text style={styles.value}>{t('recharge.usdtAddress')}</Text>
            {icon ? <Image source={{ uri: icon }} style={styles.qr} contentFit="contain" /> : null}
            <DetailRow label={t('recharge.usdtAddress')} value={address} copyLabel={t('common.copy')} onCopy={() => copyText(address, t)} />
          </View>
          {online ? null : (
            <TextField value={reference} onChangeText={setReference} placeholder={t('recharge.referenceNumber')} />
          )}
          <PrimaryButton label={t('recharge.confirmTransfer')} onPress={submit} loading={submitting} />
        </ScrollView>
      )}
    </Screen>
  );
}

export function CouponScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState('owned');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRechargeGiftCoupons({}, { showLoading: false })
      .then((res) => setItems(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []))
      .catch((error) => toast.error(error?.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = items.filter((item) => (tab === 'expired' ? item.status === 'EXPIRED' || item.status === 'USED' : item.status === 'UNUSED' || !item.status));

  return (
    <Screen>
      <PageHeader title={t('recharge.couponPageTitle')} onBack={() => router.back()} />
      <View style={styles.tabs}>
        {['owned', 'expired'].map((key) => (
          <Pressable key={key} style={[styles.tab, tab === key && styles.tabOn]} onPress={() => setTab(key)}>
            <Text style={styles.value}>{key === 'owned' ? t('recharge.availableCoupons') : t('recharge.couponExpired')}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <PageSkeleton rows={3} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.amount}>{visible.length}</Text>
          {visible.map((item, index) => (
            <Pressable key={item.couponCode || index} style={styles.card} onPress={() => router.push({ pathname: '/recharge', params: { couponCode: item.couponCode || '' } })}>
              <Text style={styles.value}>{item.couponName || item.name || item.couponCode}</Text>
              <Text style={styles.label}>{item.couponValidUntil || item.amount || ''}</Text>
            </Pressable>
          ))}
          {!visible.length ? <Text style={styles.label}>{t('common.noData')}</Text> : null}
        </ScrollView>
      )}
    </Screen>
  );
}

export function ReferBonusScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const code = useUserStore((state) => state.userInfo?.invitation_code || '');
  const link = `https://pu.sukim.top/?invite=${encodeURIComponent(code)}&register=true`;
  return (
    <Screen>
      <PageHeader title={t('referBonus.title')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.value}>{t('referBonus.bannerLine1')}</Text>
        <Text style={styles.amount}>{t('referBonus.bannerLine2')}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('referBonus.shareLink')}</Text>
          <Text style={styles.value}>{link}</Text>
          <Pressable onPress={() => copyText(link, t)}>
            <Text style={styles.copy}>{t('common.copy')}</Text>
          </Pressable>
        </View>
        <Pressable style={styles.card} onPress={() => router.push('/my-subordinates')}>
          <Text style={styles.value}>{t('referBonus.mySubordinates')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

export function SubordinateScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('mySubordinate.title')} loader={() => getTeamList({ page: 1, page_size: 20 })} />;
}

export function IncentiveRecordScreen() {
  const { t } = useI18n();
  return <ResourceListScreen title={t('incentivePlan.heading')} loader={() => creatorsList({ page: 1, page_size: 20 })} />;
}

const styles = StyleSheet.create({
  content: { padding: s(12), gap: s(12) },
  amount: { color: colors.accent, fontSize: s(28), fontWeight: '800' },
  card: { borderRadius: s(12), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: s(12), gap: s(8) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: s(8) },
  rowCopy: { flex: 1, gap: s(2) },
  label: { color: colors.muted, fontSize: s(12) },
  value: { color: colors.text, fontWeight: '700' },
  copy: { color: colors.accent, fontWeight: '700' },
  qr: { width: s(160), height: s(160), alignSelf: 'center', backgroundColor: '#fff', borderRadius: s(8) },
  tabs: { flexDirection: 'row', gap: s(8), paddingHorizontal: s(12), paddingTop: s(12) },
  tab: { flex: 1, height: s(36), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
