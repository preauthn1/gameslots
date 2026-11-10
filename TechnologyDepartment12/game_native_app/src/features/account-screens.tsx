// @ts-nocheck
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  addKyc,
  getKyc,
  resetPassword,
  resetTradePassword,
  sendPhoneCode,
  updatePassword,
  updatePayPassword,
  updatePhone,
  updateUserInfo,
  upgradeDeviceAccount,
} from '@/api/user';
import { BottomSheet, ConfirmSheet, PageHeader, PageSkeleton, PrimaryButton, Screen } from '@/components/chrome';
import { UserAvatar } from '@/components/user-avatar';
import { CodeField, PasswordField, PhoneField, TextField } from '@/components/form-controls';
import { useCountdown } from '@/hooks/use-countdown';
import { useI18n } from '@/i18n';
import { toast } from '@/services/toast-store';
import { useSystemStore } from '@/stores/system-store';
import { useUserStore } from '@/stores/user-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
const PAY_PATTERN = /^\d{6}$/;
const avatar = require('../../assets/brand/nav/avatar.png');

const phoneMaxLengthFor = (config, qh = '+91') => {
  const raw = config?.app_info?.web_qh;
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return 10;
    }
  }
  const length = Number.parseInt(parsed?.[qh], 10);
  return Number.isFinite(length) && length > 0 ? length : 10;
};

const maskPhone = (phone, qh = '+91') => {
  const masked = String(phone).replace(/(\d{2})\d*(\d{4})/, '$1••••$2');
  return `${qh} ${masked}`;
};

const codeLabel = (seconds, sending, idle, sendingText) => (seconds > 0 ? `${seconds}s` : sending ? sendingText : idle);

export function UserInfoScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const [picker, setPicker] = useState(false);
  const name = user?.nickname || user?.username || t('common.guestUser');
  const chooseAvatar = async () => {
    try {
      await updateUserInfo({ nickname: name, avatar: '', lang: '' });
      await fetchUserInfo();
      setPicker(false);
      toast.success(t('userInfo.avatarUpdateSuccess'));
    } catch (error) {
      toast.error(error?.message || t('userInfo.avatarUpdateFailed'));
    }
  };
  return (
    <Screen>
      <PageHeader title={t('userInfo.title')} onBack={() => router.back()} />
      <View style={styles.summary}>
        <Pressable onPress={() => setPicker(true)}>
          <UserAvatar src={user?.avatar} level={user?.level} size={60} />
        </Pressable>
        <View style={styles.grow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>UID · {user?.id || user?.user_id || ''}</Text>
          <Text style={styles.tag}>{t('userInfo.memberProfile')}</Text>
        </View>
      </View>
      <BottomSheet visible={picker} onClose={() => setPicker(false)} cardStyle={styles.pickerCard}>
        <Text style={styles.name}>{t('userInfo.title')}</Text>
        <Pressable onPress={chooseAvatar}><Image source={avatar} style={styles.avatar} contentFit="cover" /></Pressable>
        <Pressable onPress={() => setPicker(false)}><Text style={styles.meta}>{t('common.close')}</Text></Pressable>
      </BottomSheet>
    </Screen>
  );
}

export function EditNicknameScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const next = nickname.trim();
    if (!next) return toast.error(t('userInfo.enterNickname'));
    setSaving(true);
    try {
      await updateUserInfo({ nickname: next, avatar: '', lang: '' });
      await fetchUserInfo();
      router.back();
    } catch (error) {
      toast.error(error?.message || t('userInfo.nicknameUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={t('userInfo.nickname')} onBack={() => router.back()} />
      <View style={styles.form}>
        <TextField label={t('userInfo.nickname')} value={nickname} onChangeText={setNickname} maxLength={20} />
        <PrimaryButton label={t('common.submit')} loading={saving} onPress={save} />
      </View>
    </Screen>
  );
}

export function ChangeLoginPasswordScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const hasOld = Number(user?.is_password) !== 1;
  const [oldPassword, setOld] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [bindPrompt, setBindPrompt] = useState(false);
  const forgot = () => {
    if (!user?.phone) {
      setBindPrompt(true);
      return;
    }
    router.push({ pathname: '/forgot-password', params: { type: '1' } });
  };
  const save = async () => {
    if (!PASSWORD_PATTERN.test(password)) return toast.error(t('registerModal.passwordLength'));
    if (password !== confirm) return toast.error(t('changePassword.passwordMismatch'));
    setSaving(true);
    try {
      await updatePassword({ password, password_confirm: confirm, password_old: hasOld ? oldPassword : '' });
      toast.success(t('forgotPasswordFlow.resetSuccess'));
      router.back();
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={t('changePassword.loginPassword')} onBack={() => router.back()} />
      <View style={styles.form}>
        {hasOld ? <PasswordField label={t('changePassword.oldPassword')} value={oldPassword} onChangeText={setOld} /> : null}
        <PasswordField label={t('changePassword.newPassword')} value={password} onChangeText={setPassword} maxLength={20} />
        <PasswordField label={t('changePassword.confirmNewPassword')} value={confirm} onChangeText={setConfirm} maxLength={20} />
        <PrimaryButton label={t('common.submit')} loading={saving} onPress={save} />
        {hasOld ? (
          <Pressable onPress={forgot} hitSlop={s(8)}>
            <Text style={styles.forgotLink}>{t('changePassword.forgotLoginPassword')}</Text>
          </Pressable>
        ) : null}
      </View>
      <ConfirmSheet
        visible={bindPrompt}
        title={t('forgotPasswordFlow.phoneRequiredTitle')}
        message={t('forgotPasswordFlow.phoneRequiredMessage')}
        confirmText={t('forgotPasswordFlow.goBindPhone')}
        cancelText={t('common.close')}
        onConfirm={() => {
          setBindPrompt(false);
          router.push('/bind-phone');
        }}
        onClose={() => setBindPrompt(false)}
      />
    </Screen>
  );
}

export function ChangePayPasswordScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useUserStore((state) => state.userInfo);
  const hasOld = Number(user?.is_pay_password) === 0;
  const [oldPassword, setOld] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [bindPrompt, setBindPrompt] = useState(false);
  const forgot = () => {
    if (!user?.phone) {
      setBindPrompt(true);
      return;
    }
    router.push({ pathname: '/forgot-password', params: { type: '2' } });
  };
  const save = async () => {
    if (!PAY_PATTERN.test(password)) return toast.error(t('changePassword.transactionHint'));
    if (password !== confirm) return toast.error(t('changePassword.passwordMismatch'));
    setSaving(true);
    try {
      await updatePayPassword({ password, password_confirm: confirm, password_old: hasOld ? oldPassword : '' });
      toast.success(t('forgotPasswordFlow.resetSuccess'));
      router.back();
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={t('changePassword.transactionPassword')} onBack={() => router.back()} />
      <View style={styles.form}>
        {hasOld ? <PasswordField label={t('changePassword.oldPassword')} value={oldPassword} onChangeText={setOld} keyboardType="number-pad" maxLength={6} /> : null}
        <PasswordField label={t('changePassword.enterTransactionPassword')} value={password} onChangeText={setPassword} keyboardType="number-pad" maxLength={6} />
        <PasswordField label={t('changePassword.confirmTransactionPassword')} value={confirm} onChangeText={setConfirm} keyboardType="number-pad" maxLength={6} />
        <PrimaryButton label={t('common.submit')} loading={saving} onPress={save} />
        {hasOld ? (
          <Pressable onPress={forgot} hitSlop={s(8)}>
            <Text style={styles.forgotLink}>{t('changePassword.forgotTransactionPassword')}</Text>
          </Pressable>
        ) : null}
      </View>
      <ConfirmSheet
        visible={bindPrompt}
        title={t('forgotPasswordFlow.phoneRequiredTitle')}
        message={t('forgotPasswordFlow.phoneRequiredMessage')}
        confirmText={t('forgotPasswordFlow.goBindPhone')}
        cancelText={t('common.close')}
        onConfirm={() => {
          setBindPrompt(false);
          router.push('/bind-phone');
        }}
        onClose={() => setBindPrompt(false)}
      />
    </Screen>
  );
}

export function ForgotPasswordScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = Number(Array.isArray(params.type) ? params.type[0] : params.type) === 2 ? 2 : 1;
  const user = useUserStore((state) => state.userInfo);
  const appConfig = useSystemStore((state) => state.appConfig);
  const loadAppConfig = useSystemStore((state) => state.loadAppConfig);
  const requestLoginOnHome = useUserStore((state) => state.requestLoginOnHome);
  const boundPhone = user?.phone ? String(user.phone) : '';
  const boundQh = user?.qh || '+91';
  const [qh, setQh] = useState(boundQh);
  const [phone, setPhone] = useState(boundPhone);
  const [smsCode, setSmsCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [payPassword, setPayPassword] = useState('');
  const [confirmPayPassword, setConfirmPayPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { seconds, setSeconds, sending, setSending } = useCountdown();
  const [saving, setSaving] = useState(false);
  const phoneMaxLength = phoneMaxLengthFor(appConfig, qh);
  const isLoginReset = type === 1;

  useEffect(() => {
    loadAppConfig().catch(() => {});
  }, [loadAppConfig]);

  useEffect(() => {
    if (!boundPhone) return;
    setPhone(boundPhone);
    setQh(boundQh);
  }, [boundPhone, boundQh]);

  const clearError = (field) => setErrors((current) => (current[field] ? { ...current, [field]: '' } : current));

  const validatePhone = () => {
    const currentPhone = boundPhone || phone;
    if (!currentPhone) {
      setErrors((current) => ({ ...current, phone: t('loginModal.phoneRequired') }));
      return false;
    }
    if (!/^\d+$/.test(currentPhone) || currentPhone.length !== phoneMaxLength) {
      setErrors((current) => ({ ...current, phone: t('loginModal.phoneInvalid') }));
      return false;
    }
    setErrors((current) => ({ ...current, phone: '' }));
    return true;
  };

  const validateCode = () => {
    if (!smsCode) {
      setErrors((current) => ({ ...current, verificationCode: t('registerModal.verificationRequired') }));
      return false;
    }
    setErrors((current) => ({ ...current, verificationCode: '' }));
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setErrors((current) => ({ ...current, password: t('registerModal.passwordRequired') }));
      return false;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setErrors((current) => ({ ...current, password: t('registerModal.passwordLength') }));
      return false;
    }
    setErrors((current) => ({ ...current, password: '' }));
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setErrors((current) => ({ ...current, confirmPassword: t('registerModal.confirmRequired') }));
      return false;
    }
    if (password !== confirmPassword) {
      setErrors((current) => ({ ...current, confirmPassword: t('registerModal.confirmMismatch') }));
      return false;
    }
    setErrors((current) => ({ ...current, confirmPassword: '' }));
    return true;
  };

  const validatePayPassword = () => {
    if (!payPassword) {
      setErrors((current) => ({ ...current, payPassword: t('registerModal.transactionPasswordRequired') }));
      return false;
    }
    if (!PAY_PATTERN.test(payPassword)) {
      setErrors((current) => ({ ...current, payPassword: t('registerModal.transactionPasswordInvalid') }));
      return false;
    }
    setErrors((current) => ({ ...current, payPassword: '' }));
    return true;
  };

  const validateConfirmPayPassword = () => {
    if (payPassword !== confirmPayPassword) {
      setErrors((current) => ({ ...current, confirmPayPassword: t('registerModal.confirmMismatch') }));
      return false;
    }
    setErrors((current) => ({ ...current, confirmPayPassword: '' }));
    return true;
  };

  const send = async () => {
    if (!validatePhone() || seconds > 0 || sending) return;
    setSending(true);
    try {
      await sendPhoneCode({ phone: boundPhone || phone, qh });
      setSeconds(Number(appConfig?.app_info?.config_phone_verify_time) || 60);
      toast.success(t('registerModal.verificationSent'));
    } catch (error) {
      if (!error?.silent) toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSending(false);
    }
  };

  const save = async () => {
    if (saving) return;
    if (!validatePhone() || !validateCode()) return;
    if (isLoginReset) {
      if (!validatePassword() || !validateConfirmPassword()) return;
    } else if (!validatePayPassword() || !validateConfirmPayPassword()) {
      return;
    }
    setSaving(true);
    try {
      const payload = { phone: boundPhone || phone, verify_code: smsCode, qh };
      if (isLoginReset) {
        await resetPassword({ ...payload, password });
        toast.success(t('forgotPasswordFlow.resetSuccess'));
        requestLoginOnHome();
      } else {
        await resetTradePassword({ ...payload, pay_password: payPassword });
        toast.success(t('forgotPasswordFlow.resetSuccess'));
        router.replace('/');
      }
    } catch (error) {
      if (!error?.silent) toast.error(error?.message || t('forgotPasswordFlow.resetFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PageHeader title={isLoginReset ? t('forgotPasswordFlow.title') : t('forgotPasswordFlow.transactionTitle')} onBack={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>{isLoginReset ? t('forgotPasswordFlow.loginHint') : t('forgotPasswordFlow.transactionHint')}</Text>
        {boundPhone ? (
          <TextField label={t('forgotPasswordFlow.boundPhone')} readOnlyText={maskPhone(boundPhone, boundQh)} error={errors.phone} backgroundColor="#292f38" />
        ) : (
          <PhoneField
            label={t('forgotPasswordFlow.boundPhone')}
            value={phone}
            error={errors.phone}
            maxLength={phoneMaxLength}
            placeholder={t('forgotPasswordFlow.phonePlaceholder')}
            onBlur={validatePhone}
            onChangeText={(value) => {
              setPhone(value.replace(/\D/g, '').slice(0, phoneMaxLength));
              clearError('phone');
            }}
          />
        )}
        <CodeField
          label={t('forgotPasswordFlow.smsCodeLabel')}
          value={smsCode}
          error={errors.verificationCode}
          maxLength={10}
          placeholder={t('forgotPasswordFlow.smsCodePlaceholder')}
          onBlur={validateCode}
          onSend={send}
          disabled={seconds > 0 || sending}
          loading={sending}
          tone="outline"
          sendLabel={seconds > 0 ? t('registerModal.resend', { countdown: seconds }) : t('forgotPasswordFlow.sendCode')}
          onChangeText={(value) => {
            setSmsCode(value.replace(/\D/g, '').slice(0, 10));
            clearError('verificationCode');
          }}
        />
        {isLoginReset ? (
          <>
            <PasswordField
              label={t('forgotPasswordFlow.newLoginPassword')}
              value={password}
              onChangeText={(value) => { setPassword(value); clearError('password'); }}
              onBlur={validatePassword}
              placeholder={t('forgotPasswordFlow.newPasswordPlaceholder')}
              maxLength={20}
              error={errors.password}
            />
            <PasswordField
              label={t('forgotPasswordFlow.confirmNewLoginPassword')}
              value={confirmPassword}
              onChangeText={(value) => { setConfirmPassword(value); clearError('confirmPassword'); }}
              onBlur={validateConfirmPassword}
              placeholder={t('forgotPasswordFlow.confirmNewPasswordPlaceholder')}
              maxLength={20}
              error={errors.confirmPassword}
            />
          </>
        ) : (
          <>
            <PasswordField
              label={t('forgotPasswordFlow.newTransactionPassword')}
              value={payPassword}
              onChangeText={(value) => { setPayPassword(value.replace(/\D/g, '').slice(0, 6)); clearError('payPassword'); }}
              onBlur={validatePayPassword}
              placeholder={t('forgotPasswordFlow.newTransactionPasswordPlaceholder')}
              maxLength={6}
              keyboardType="number-pad"
              error={errors.payPassword}
            />
            <PasswordField
              label={t('forgotPasswordFlow.confirmNewTransactionPassword')}
              value={confirmPayPassword}
              onChangeText={(value) => { setConfirmPayPassword(value.replace(/\D/g, '').slice(0, 6)); clearError('confirmPayPassword'); }}
              onBlur={validateConfirmPayPassword}
              placeholder={t('forgotPasswordFlow.confirmTransactionPasswordPlaceholder')}
              maxLength={6}
              keyboardType="number-pad"
              error={errors.confirmPayPassword}
            />
          </>
        )}
        <PrimaryButton label={t('forgotPasswordFlow.resetPassword')} loading={saving} onPress={save} />
      </ScrollView>
    </Screen>
  );
}

export function BindPhoneScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const appConfig = useSystemStore((state) => state.appConfig);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const { seconds, setSeconds, sending, setSending } = useCountdown();
  const [saving, setSaving] = useState(false);
  const send = async () => {
    if (phone.length < 10 || seconds || sending) return;
    setSending(true);
    try {
      await sendPhoneCode({ phone, qh: '+91' });
      setSeconds(Number(appConfig?.app_info?.config_phone_verify_time) || 60);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSending(false);
    }
  };
  const save = async () => {
    if (!code) return toast.error(t('bindPhone.smsCodeRequired'));
    setSaving(true);
    try {
      await updatePhone({ phone, qh: '+91', verify_code: code, password });
      await fetchUserInfo();
      toast.success(t('bindPhone.bindSuccess'));
      router.back();
    } catch (error) {
      toast.error(error?.message || t('bindPhone.bindFailed'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={t('bindPhone.title')} onBack={() => router.back()} />
      <View style={styles.form}>
        <PhoneField label={t('loginModal.phoneLabel')} value={phone} onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
        <CodeField
          label={t('loginModal.verificationLabel')}
          value={code}
          onChangeText={setCode}
          onSend={send}
          disabled={seconds > 0 || sending}
          loading={sending}
          placeholder={t('forgotPasswordFlow.smsPlaceholder')}
          sendLabel={codeLabel(seconds, sending, t('forgotPasswordFlow.sendCode'), t('registerModal.sending'))}
        />
        <PasswordField label={t('loginModal.passwordLabel')} value={password} onChangeText={setPassword} />
        <PrimaryButton label={t('bindPhone.bind')} loading={saving} onPress={save} />
      </View>
    </Screen>
  );
}

export function GuestUpgradeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const appConfig = useSystemStore((state) => state.appConfig);
  const [username, setUsername] = useState('');
  const [realname, setRealname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const { seconds, setSeconds, sending, setSending } = useCountdown();
  const [saving, setSaving] = useState(false);
  const needCode = Number(appConfig?.app_info?.config_phone_verify_status) === 1;
  const send = async () => {
    if (phone.length < 10 || seconds || sending) return;
    setSending(true);
    try {
      await sendPhoneCode({ phone, qh: '+91' });
      setSeconds(Number(appConfig?.app_info?.config_phone_verify_time) || 60);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSending(false);
    }
  };
  const save = async () => {
    if (!username || !realname || phone.length < 10 || !PASSWORD_PATTERN.test(password)) return toast.error(t('registerModal.passwordLength'));
    if (needCode && !code) return toast.error(t('registerModal.verificationRequired'));
    setSaving(true);
    try {
      await upgradeDeviceAccount({ username, realname, phone, password, qh: '+91', verify_code: needCode ? code : undefined });
      await fetchUserInfo();
      router.replace('/');
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={t('guestUpgrade.title')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.form}>
        <TextField label={t('guestUpgrade.usernameLabel')} value={username} onChangeText={setUsername} />
        <TextField label={t('kyc.realName')} value={realname} onChangeText={setRealname} />
        <PhoneField label={t('guestUpgrade.phoneLabel')} value={phone} onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
        <PasswordField label={t('changePassword.newPassword')} value={password} onChangeText={setPassword} />
        {needCode ? (
          <CodeField
            label={t('guestUpgrade.smsCodeLabel')}
            value={code}
            onChangeText={setCode}
            onSend={send}
            disabled={seconds > 0 || sending}
            loading={sending}
            placeholder={t('forgotPasswordFlow.smsPlaceholder')}
            sendLabel={codeLabel(seconds, sending, t('forgotPasswordFlow.sendCode'), t('registerModal.sending'))}
          />
        ) : null}
        <PrimaryButton label={t('common.submit')} loading={saving} onPress={save} />
      </ScrollView>
    </Screen>
  );
}

export function KycScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    getKyc().then((result) => setStatus(Number(result?.status || 0))).catch(() => setStatus(0));
  }, []);
  const save = async () => {
    if (!name.trim()) return toast.error(t('kyc.realName'));
    if (!/^\d+$/.test(idNumber)) return toast.error(t('kyc.idNumberInvalid'));
    if (!front) return toast.error(t('kyc.frontPhotoRequired'));
    if (!back) return toast.error(t('kyc.backPhotoRequired'));
    setSaving(true);
    try {
      await addKyc({ type: 1, name, id_number: idNumber, id_photo: JSON.stringify([front, back]) });
      setStatus(1);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen>
      <PageHeader title={t('kyc.title')} onBack={() => router.back()} />
      {status === null ? <PageSkeleton rows={4} /> : status === 1 ? (
        <View style={styles.form}>
          <Text style={styles.name}>{t('kyc.reviewingTitle')}</Text>
          <Text style={styles.meta}>{t('kyc.reviewingDesc')}</Text>
        </View>
      ) : status === 2 ? (
        <View style={styles.form}>
          <Text style={styles.name}>{t('kyc.statusSuccess')}</Text>
          <Text style={styles.meta}>{t('kyc.statusSuccessDesc')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.form}>
          {status === 3 ? <Text style={styles.fail}>{t('kyc.statusFailed')}</Text> : null}
          <Text style={styles.meta}>{t('kyc.introDesc')}</Text>
          <TextField label={t('kyc.realName')} value={name} onChangeText={setName} placeholder={t('kyc.realNamePlaceholder')} />
          <TextField label={t('kyc.idNumber')} value={idNumber} onChangeText={setIdNumber} placeholder={t('kyc.idNumberPlaceholder')} keyboardType="number-pad" />
          <TextField label={t('kyc.frontUpload')} value={front} onChangeText={setFront} placeholder={t('kyc.clickToUpload')} />
          <TextField label={t('kyc.backUpload')} value={back} onChangeText={setBack} placeholder={t('kyc.clickToUpload')} />
          <PrimaryButton label={t('kyc.submit')} loading={saving} onPress={save} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  form: { padding: s(12), gap: s(12) },
  hint: { color: colors.muted, fontSize: s(12), lineHeight: s(18) },
  forgotLink: { color: colors.text, fontSize: s(12), lineHeight: s(18), textAlign: 'center' },
  grow: { flex: 1 },
  summary: { margin: s(12), padding: s(16), borderRadius: s(8), backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', gap: s(12), alignItems: 'center' },
  avatar: { width: s(60), height: s(60), borderRadius: s(30) },
  name: { color: colors.text, fontSize: s(16), fontWeight: '700' },
  meta: { color: colors.muted, fontSize: s(12), lineHeight: s(18) },
  tag: { alignSelf: 'flex-start', marginTop: s(4), color: colors.accentInk, backgroundColor: colors.accent, borderRadius: s(4), paddingHorizontal: s(6), paddingVertical: s(2), overflow: 'hidden', fontSize: s(11), fontWeight: '700' },
  fail: { color: colors.danger, fontWeight: '700' },
  pickerCard: { padding: s(16), gap: s(12), borderTopLeftRadius: s(16), borderTopRightRadius: s(16), backgroundColor: colors.surface, alignItems: 'center' },
});
