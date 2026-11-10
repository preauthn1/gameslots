// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { bankAdd, bankDelete, bankList, payList, payOut, sendUserPhoneCode } from '@/api/bankcard';
import { ConfirmSheet, PageHeader, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { CodeField, PasswordField, TextField } from '@/components/form-controls';
import { useCountdown } from '@/hooks/use-countdown';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const methodType = (method) => method?.offline_address?.type || method?.type;
const methodLabel = (method, t) => {
  const type = methodType(method);
  if (type === 1) return t('manageWithdrawMethod.bankTransfer');
  if (type === 2) return t('manageWithdrawMethod.usdtPayment');
  return method?.name || '';
};

const maskNumber = (value, visible) => {
  const number = String(value || '');
  if (!number || visible) return number;
  if (number.length <= 8) return `${number.slice(0, 4)} ****`;
  return `${number.slice(0, 4)} **** **** ${number.slice(-4)}`;
};

const parseBanks = (method) => {
  if (!method?.bank_config) return [];
  try {
    return JSON.parse(method.bank_config);
  } catch {
    return [];
  }
};

function useWithdrawCatalog() {
  const [methods, setMethods] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    Promise.all([payList(), bankList()])
      .then(([pays, banks]) => {
        setMethods(pays?.pay_out_list || []);
        setCards(Array.isArray(banks) ? banks : banks?.list || []);
      })
      .catch((error) => toast.error(error?.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    reload();
  }, []);
  return { methods, cards, loading, reload };
}

export function WithdrawMethodScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const { methods, cards, loading, reload } = useWithdrawCatalog();
  const [tab, setTab] = useState(null);
  const [visible, setVisible] = useState({});
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (Number(user?.user_type) === 1) router.replace('/guest-account-upgrade');
  }, [router, user?.user_type]);

  useEffect(() => {
    if (!tab && methods[0]) setTab(methods[0].id);
  }, [methods, tab]);

  const current = methods.find((method) => method.id === tab);
  const type = methodType(current);
  const mine = cards.filter((card) => Number(card.type) === Number(type));

  const remove = async () => {
    try {
      await bankDelete({ id: pending.id });
      toast.success(t('manageWithdrawMethod.deleteSuccess'));
      setPending(null);
      reload();
    } catch (error) {
      toast.error(error?.message || t('manageWithdrawMethod.deleteFailed'));
    }
  };

  return (
    <Screen>
      <PageHeader title={t('withdraw.title')} onBack={() => router.back()} />
      {loading ? (
        <PageSkeleton rows={5} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.wallet}>
            <Text style={styles.muted}>{t('manageWithdrawMethod.myWallet')}</Text>
            <Text style={styles.balance}>₹{user?.balance ?? 0}</Text>
          </View>
          <Text style={styles.heading}>{t('manageWithdrawMethod.selectWithdrawalMethod')}</Text>
          <View style={styles.tabs}>
            {methods.map((method) => (
              <Pressable key={method.id} style={[styles.tab, tab === method.id && styles.tabOn]} onPress={() => setTab(method.id)}>
                <Text style={[styles.tabText, tab === method.id && styles.tabTextOn]}>{methodLabel(method, t)}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.heading}>{type === 2 ? t('manageWithdrawMethod.selectUsdtWallet') : t('manageWithdrawMethod.selectBankCard')}</Text>
          {mine.length ? (
            mine.map((card) => (
              <View key={card.id} style={styles.card}>
                <View style={styles.cardBody}>
                  <Text style={styles.title}>{card.bank_name || methodLabel(current, t)}</Text>
                  <Pressable onPress={() => setVisible((value) => ({ ...value, [card.id]: !value[card.id] }))}>
                    <Text style={styles.muted}>{maskNumber(card.card_number, visible[card.id])}</Text>
                  </Pressable>
                  {card.card_holder ? <Text style={styles.muted}>{t('manageWithdrawMethod.cardHolder')}: {card.card_holder}</Text> : null}
                </View>
                <Pressable onPress={() => setPending(card)}><Text style={styles.danger}>{t('manageWithdrawMethod.delete')}</Text></Pressable>
              </View>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.title}>{type === 2 ? t('manageWithdrawMethod.emptyUsdtWallet') : t('manageWithdrawMethod.emptyBankCard')}</Text>
              <Text style={styles.muted}>{t('manageWithdrawMethod.emptySubtitle')}</Text>
            </View>
          )}
          <PrimaryButton
            label={type === 2 ? t('manageWithdrawMethod.addUsdtWallet') : t('manageWithdrawMethod.addBankCard')}
            onPress={() => router.push({ pathname: '/add-withdraw-method', params: { methodId: String(tab || '') } })}
          />
          <Text style={styles.muted}>{t('manageWithdrawMethod.securityNotice')}</Text>
        </ScrollView>
      )}
      <ConfirmSheet
        visible={!!pending}
        danger
        title={type === 2 ? t('manageWithdrawMethod.deleteUsdtWallet') : t('manageWithdrawMethod.deleteBankCardDialog')}
        message={type === 2 ? t('manageWithdrawMethod.deleteConfirm') : t('manageWithdrawMethod.deleteBankCardConfirm')}
        confirmText={t('manageWithdrawMethod.delete')}
        cancelText={t('manageWithdrawMethod.cancel')}
        onConfirm={remove}
        onClose={() => setPending(null)}
      />
    </Screen>
  );
}

export function WithdrawApplyScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const minRecharge = Number(useSystemStore((state) => state.appConfig?.app_info?.config_user_recharge) || 0);
  const { methods, cards, loading } = useWithdrawCatalog();
  const [tab, setTab] = useState(null);
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState({});
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (Number(user?.user_type) === 1) router.replace('/guest-account-upgrade');
  }, [router, user?.user_type]);

  useEffect(() => {
    if (!tab && methods[0]) setTab(methods[0].id);
  }, [methods, tab]);

  const current = methods.find((method) => method.id === tab);
  const type = methodType(current);
  const mine = cards.filter((card) => Number(card.type) === Number(type));
  const hasPassword = Number(user?.is_pay_password) === 0;

  const submit = async () => {
    const value = Number(amount);
    if (!selected) return;
    if (!hasPassword) {
      setPrompt('password');
      return;
    }
    if (minRecharge > 0 && Number(user?.total_recharge || 0) < minRecharge) {
      setPrompt('recharge');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error(t('withdrawDetail.enterAmountRequired'));
      return;
    }
    if (value > Number(user?.balance || 0)) {
      toast.error(t('withdrawDetail.amountExceedsBalance'));
      return;
    }
    if (!password) {
      toast.error(t('withdrawDetail.enterTransactionPasswordRequired'));
      return;
    }
    const gap = Number(user?.user_wagers || 0) - Number(user?.total_game_wagers || 0);
    if (gap > 0) {
      setPrompt('wager');
      return;
    }
    setSubmitting(true);
    try {
      await payOut({
        payment_id: selected.payment_id,
        amount: value,
        bank_id: selected.id,
        account_type: selected.type,
        currency: current?.currency,
        pay_password: password,
      });
      toast.success(t('withdrawDetail.withdrawSubmitted'));
      setAmount('');
      setPassword('');
      setSelected(null);
      fetchUserInfo().catch(() => {});
    } catch (error) {
      toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <PageHeader title={t('withdraw.title')} onBack={() => router.back()} />
      {loading ? (
        <PageSkeleton rows={5} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.wallet}>
            <Text style={styles.muted}>{t('profile.myWallet')}</Text>
            <Text style={styles.balance}>₹{user?.balance ?? 0}</Text>
          </View>
          <Text style={styles.heading}>{t('withdraw.selectMethod')}</Text>
          <View style={styles.tabs}>
            {methods.map((method) => (
              <Pressable key={method.id} style={[styles.tab, tab === method.id && styles.tabOn]} onPress={() => { setTab(method.id); setSelected(null); }}>
                <Text style={[styles.tabText, tab === method.id && styles.tabTextOn]}>{methodLabel(method, t)}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.heading}>{type === 2 ? t('withdraw.selectUsdtWallet') : t('withdraw.selectBankCard')}</Text>
          {mine.length ? mine.map((card) => (
            <Pressable key={card.id} style={styles.card} onPress={() => setSelected(card)}>
              <View style={styles.cardBody}>
                <Text style={styles.title}>{card.bank_name}</Text>
                <Text style={styles.muted}>{maskNumber(card.card_number, visible[card.id])}</Text>
              </View>
              <Text style={selected?.id === card.id ? styles.selected : styles.select}>
                {selected?.id === card.id ? t('withdrawDetail.selected') : t('withdraw.select')}
              </Text>
            </Pressable>
          )) : (
            <View style={styles.empty}>
              <Text style={styles.title}>{type === 2 ? t('withdrawMethod.emptyUsdtWalletTitle') : t('withdrawMethod.emptyBankCardTitle')}</Text>
              <Text style={styles.muted}>{t('withdrawMethod.emptySubtitle')}</Text>
              <PrimaryButton label={type === 2 ? t('withdrawMethod.addUsdtWallet') : t('withdrawMethod.addBankCard')} onPress={() => router.push('/add-withdraw-method')} />
            </View>
          )}
          {selected ? (
            <View style={styles.form}>
              <TextField label={t('withdrawDetail.amount')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder={t('withdrawDetail.enterPlaceholder')} />
              <PasswordField label={t('withdrawDetail.transactionPassword')} value={password} onChangeText={setPassword} keyboardType="number-pad" maxLength={6} placeholder={t('withdrawDetail.enterTransactionPassword')} />
              <View style={styles.row}>
                <Text style={styles.muted}>{t('withdrawDetail.arrivalAmount')}</Text>
                <Text style={styles.title}>₹{amount || 0}</Text>
              </View>
              <PrimaryButton label={t('withdraw.title')} loading={submitting} onPress={submit} />
            </View>
          ) : null}
        </ScrollView>
      )}
      <ConfirmSheet
        visible={prompt === 'password'}
        title={t('withdrawMethod.setTransactionPasswordTitle')}
        message={t('withdrawMethod.setTransactionPasswordMessage')}
        confirmText={t('withdrawMethod.setTransactionPasswordAction')}
        cancelText={t('manageWithdrawMethod.cancel')}
        onConfirm={() => { setPrompt(''); router.push('/change-transaction-password'); }}
        onClose={() => setPrompt('')}
      />
      <ConfirmSheet
        visible={prompt === 'recharge'}
        title={t('withdrawMethod.rechargeTitle')}
        message={t('withdrawMethod.rechargeRequirement', { amount: minRecharge })}
        confirmText={t('withdrawMethod.goRecharge')}
        cancelText={t('common.cancel')}
        onConfirm={() => { setPrompt(''); router.push('/recharge'); }}
        onClose={() => setPrompt('')}
      />
      <ConfirmSheet
        visible={prompt === 'wager'}
        title={t('userInfo.tip')}
        message={t('withdrawDetail.wagerInsufficient')}
        confirmText={t('common.confirm')}
        cancelText={t('manageWithdrawMethod.cancel')}
        onConfirm={() => setPrompt('')}
        onClose={() => setPrompt('')}
      />
    </Screen>
  );
}

export function AddWithdrawMethodScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const appConfig = useSystemStore((state) => state.appConfig);
  const { methods, cards, loading } = useWithdrawCatalog();
  const [tab, setTab] = useState(null);
  const [name, setName] = useState(user?.realname || '');
  const [ifsc, setIfsc] = useState('');
  const [account, setAccount] = useState('');
  const [network, setNetwork] = useState('');
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  const { seconds, setSeconds, sending, setSending } = useCountdown();
  const [submitting, setSubmitting] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (!tab && methods[0]) setTab(methods[0].id);
  }, [methods, tab]);

  const current = methods.find((method) => method.id === tab) || methods[0];
  const type = methodType(current);
  const banks = useMemo(() => parseBanks(current), [current]);
  const bankName = banks.find((bank) => bank.key === ifsc.slice(0, 4).toUpperCase())?.value || '';
  const needsCode = cards.length === 0;

  const sendCode = async () => {
    if (seconds || sending) return;
    if (!user?.phone) {
      toast.error(t('loginModal.phoneRequired'));
      return;
    }
    setSending(true);
    try {
      await sendUserPhoneCode({ phone: user.phone, qh: user.qh || '+91' });
      setSeconds(Number(appConfig?.app_info?.config_phone_verify_time) || 60);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSending(false);
    }
  };

  const submit = async () => {
    if (type === 1) {
      if (!name.trim()) return toast.error(t('addWithdrawMethod.accountHolderRequired'));
      if (ifsc.length !== 11) return toast.error(t('addWithdrawMethod.ifscInvalid'));
      if (!/^\d+$/.test(account)) return toast.error(t('addWithdrawMethod.accountNumberInvalid'));
      if (needsCode && !code.trim()) return toast.error(t('registerModal.verificationRequired'));
    } else if (!network || !address) {
      return toast.error(t('addWithdrawMethod.fillAllFields'));
    }
    setSubmitting(true);
    try {
      const payload = type === 1
        ? { type: 1, payment_id: current.id, bank_name: bankName, bank_code: ifsc, card_number: account, card_holder: name, is_default: 0 }
        : { type: 2, payment_id: current.id, bank_name: network, bank_code: network, card_number: address, card_holder: name, is_default: 0 };
      if (needsCode) payload.verify_code = code;
      await bankAdd(payload);
      toast.success(t('addWithdrawMethod.addSuccess'));
      router.back();
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <PageHeader title={type === 2 ? t('addWithdrawMethod.addWalletTitle') : t('addWithdrawMethod.addBankCardTitle')} onBack={() => router.back()} />
      {loading ? <PageSkeleton rows={4} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.tabs}>
            {methods.map((method) => (
              <Pressable key={method.id} style={[styles.tab, tab === method.id && styles.tabOn]} onPress={() => setTab(method.id)}>
                <Text style={[styles.tabText, tab === method.id && styles.tabTextOn]}>{methodLabel(method, t)}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.notice}>
            <Text style={styles.title}>{type === 2 ? t('addWithdrawMethod.securityNotice') : t('addWithdrawMethod.beforeYouBegin')}</Text>
            <Text style={styles.muted}>{type === 2 ? t('addWithdrawMethod.usdtTipsDesc') : t('addWithdrawMethod.beforeYouBeginDesc')}</Text>
          </View>
          {type === 1 ? (
            <>
              <TextField label={t('addWithdrawMethod.accountHolder')} value={name} onChangeText={setName} editable={!user?.realname} placeholder={t('addWithdrawMethod.accountHolderPlaceholder')} />
              <Text style={styles.heading}>{t('addWithdrawMethod.ifscCode')}</Text>
              <View style={styles.inline}>
                <TextField fill value={ifsc} onChangeText={(value) => setIfsc(value.replace(/[^A-Za-z0-9]/g, '').slice(0, 11).toUpperCase())} autoCapitalize="characters" maxLength={11} placeholder={t('addWithdrawMethod.ifscPlaceholder')} />
                <PrimaryButton variant="accent" label={t('addWithdrawMethod.findIfscShort')} onPress={() => setHelp(true)} style={styles.sideAction} />
              </View>
              <TextField label={t('addWithdrawMethod.bankAccount')} value={account} onChangeText={(value) => setAccount(value.replace(/\D/g, '').slice(0, 20))} keyboardType="number-pad" maxLength={20} placeholder={t('addWithdrawMethod.bankAccountPlaceholder')} />
              <TextField label={t('addWithdrawMethod.bankName')} value={bankName} editable={false} placeholder={t('addWithdrawMethod.bankNamePlaceholder')} />
            </>
          ) : (
            <>
              <Text style={styles.label}>{t('addWithdrawMethod.walletNetwork')}</Text>
              <View style={styles.tabs}>
                {banks.map((bank) => (
                  <Pressable key={bank.key || bank.value} style={[styles.tab, network === bank.value && styles.tabOn]} onPress={() => setNetwork(bank.value)}>
                    <Text style={[styles.tabText, network === bank.value && styles.tabTextOn]}>{bank.value}</Text>
                  </Pressable>
                ))}
              </View>
              <TextField label={t('addWithdrawMethod.inputWalletAddress')} value={address} onChangeText={setAddress} placeholder={t('addWithdrawMethod.walletAddressPlaceholder')} />
            </>
          )}
          {needsCode ? (
            <>
              <CodeField
                label={t('addWithdrawMethod.linkedPhoneNumber')}
                value={code}
                onChangeText={setCode}
                placeholder={t('addWithdrawMethod.verifyCodePlaceholder')}
                onSend={sendCode}
                disabled={seconds > 0 || sending}
                loading={sending}
                tone="accent"
                sendLabel={seconds > 0 ? `${seconds}s` : t('registerModal.sendCode')}
              />
            </>
          ) : null}
          <PrimaryButton label={t('addWithdrawMethod.confirmAndAdd')} loading={submitting} onPress={submit} />
        </ScrollView>
      )}
      <ConfirmSheet
        visible={help}
        title={t('addWithdrawMethod.findIfscTitle')}
        message={`${t('addWithdrawMethod.ifscSubtitle')}\n${t('addWithdrawMethod.ifscStep1Title')}\n${t('addWithdrawMethod.ifscStep2Title')}`}
        confirmText={t('common.confirm')}
        cancelText={t('common.close')}
        onConfirm={() => setHelp(false)}
        onClose={() => setHelp(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: s(12), gap: s(10), paddingBottom: s(32) },
  wallet: { padding: s(16), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: s(6) },
  muted: { color: colors.muted, fontSize: s(12), lineHeight: s(18) },
  balance: { color: colors.text, fontSize: s(28), fontWeight: '800' },
  heading: { color: colors.text, fontSize: s(13), fontWeight: '700' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8) },
  tab: { minHeight: s(36), paddingHorizontal: s(12), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.text, fontWeight: '700', fontSize: s(12) },
  tabTextOn: { color: colors.accentInk },
  card: { minHeight: s(72), padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: s(12) },
  cardBody: { flex: 1, gap: s(4) },
  title: { color: colors.text, fontWeight: '700' },
  danger: { color: colors.danger, fontWeight: '700' },
  empty: { padding: s(16), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: s(8), alignItems: 'center' },
  select: { color: colors.text, borderWidth: 1, borderColor: colors.line, borderRadius: s(6), paddingHorizontal: s(10), paddingVertical: s(6), overflow: 'hidden' },
  selected: { color: colors.accentInk, backgroundColor: colors.accent, borderRadius: s(6), paddingHorizontal: s(10), paddingVertical: s(6), overflow: 'hidden', fontWeight: '700' },
  form: { gap: s(8) },
  inline: { flexDirection: 'row', gap: s(8), alignItems: 'center' },
  sideAction: { paddingHorizontal: s(12) },
  notice: { padding: s(12), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: s(6) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
