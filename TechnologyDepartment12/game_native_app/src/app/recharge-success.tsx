// @ts-nocheck
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { PageHeader, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const STATUS = {
  0: 'rechargeRecord.pending',
  1: 'rechargeRecord.success',
  2: 'rechargeRecord.failed',
  3: 'rechargeRecord.failed',
};

export default function RechargeSuccessPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const amount = params.amount ? `₹ ${params.amount}` : '-';
  const status = STATUS[String(params.status)] ? t(STATUS[String(params.status)]) : '-';
  const orderNo = String(params.order_no || params.orderNo || '-');

  const copyOrder = async () => {
    if (orderNo === '-') return;
    if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(orderNo);
      toast.success(t('common.copySuccess'));
    }
  };

  return (
    <Screen>
      <PageHeader title={t('recharge.submitSuccess')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('recharge.submitSuccess')}</Text>
          <Text style={styles.desc}>{t('recharge.submitSuccessDesc')}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.heading}>{t('recharge.transactionDetail')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('recharge.detailAmount')}</Text>
            <Text style={styles.value}>{amount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('recharge.detailStatus')}</Text>
            <Text style={styles.muted}>{status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('recharge.detailOrderNo')}</Text>
            <Pressable onPress={copyOrder}>
              <Text style={styles.muted}>{orderNo}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: s(16), gap: s(12) },
  card: { borderRadius: s(16), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: s(16), gap: s(10) },
  title: { color: colors.text, fontSize: s(18), fontWeight: '800', textAlign: 'center' },
  desc: { color: colors.muted, textAlign: 'center', lineHeight: s(20) },
  heading: { color: colors.text, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: s(12) },
  label: { color: colors.muted },
  value: { color: colors.accent, fontWeight: '700' },
  muted: { color: colors.text },
});
