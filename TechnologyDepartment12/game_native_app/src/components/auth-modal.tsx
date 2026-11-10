// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { BackHandler, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/chrome';
import { CodeField, InlineAction, PasswordField, PhoneField, TextField } from '@/components/form-controls';
import { useCountdown } from '@/hooks/use-countdown';
import { useI18n } from '@/i18n';
import { phone_login, registerApi, sendPhoneCode } from '@/api/user';
import { toast } from '@/services/toast-store';
import { getAuthTokenBundle, useUserStore } from '@/stores/user-store';
import { useSystemStore } from '@/stores/system-store';
import getCurrentLang from '@/utils/getCurrentLang';
import tokenManager from '@/utils/token-manager';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const SCREEN_HEIGHT = Dimensions.get('screen').height;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
const appendIfPresent = (target, key, value) => {
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    target[key] = value;
  }
};

const phoneMaxLengthFor = (config) => {
  const raw = config?.app_info?.web_qh;
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return 10;
    }
  }
  const length = Number.parseInt(parsed?.['+91'], 10);
  return Number.isFinite(length) && length > 0 ? length : 10;
};

export function AuthScreen({ mode = 'login' }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useI18n();
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const appConfig = useSystemStore((state) => state.appConfig);
  const loadAppConfig = useSystemStore((state) => state.loadAppConfig);
  const isLogin = mode !== 'register';
  const needPhoneVerify = Number(appConfig?.app_info?.config_phone_verify_status) === 1;
  const phoneMaxLength = phoneMaxLengthFor(appConfig);
  const [loginType, setLoginType] = useState('password');
  const [phone, setPhone] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [sentTarget, setSentTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { seconds, setSeconds, sending: sendingCode, setSending: setSendingCode } = useCountdown();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const allowLeave = useRef(false);
  const closing = useRef(false);
  const closeRef = useRef(() => {});

  const openAgreement = () => {
    router.push({ pathname: '/help-detail', params: { type: '7' } });
  };

  const leave = () => {
    allowLeave.current = true;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  closeRef.current = () => {
    if (allowLeave.current || closing.current) return;
    closing.current = true;
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 240, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(leave)();
    });
  };

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [translateY]);

  useEffect(() => {
    const subscription = navigation.addListener('beforeRemove', (event) => {
      if (allowLeave.current) return;
      event.preventDefault();
      closeRef.current();
    });
    return subscription;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (allowLeave.current) return false;
        closeRef.current();
        return true;
      });
      return () => subscription.remove();
    }, []),
  );

  const close = () => closeRef.current();

  useEffect(() => {
    if (!isLogin) loadAppConfig().catch(() => {});
  }, [isLogin, loadAppConfig]);

  const openOther = () => {
    const routes = navigation.getState()?.routes || [];
    const previous = routes[routes.length - 2]?.name;
    const target = isLogin ? 'register' : 'login';
    if (previous === target) {
      router.back();
      return;
    }
    router.push(isLogin ? '/register' : '/login');
  };

  const openForgot = () => {
    allowLeave.current = true;
    router.replace({ pathname: '/forgot-password', params: { type: '1' } });
  };

  const finishAuth = async (result) => {
    const { token, refreshToken, expiresIn } = getAuthTokenBundle(result);
    if (!token) throw new Error('Login response did not include a token');
    tokenManager.setToken(token, refreshToken, expiresIn);
    try {
      await fetchUserInfo();
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
    close();
  };

  const phoneValid = /^\d+$/.test(phone) && phone.length === phoneMaxLength;
  const verificationTarget = `+91:${phone}`;

  const changePhone = (value) => {
    const next = value.replace(/\D/g, '').slice(0, phoneMaxLength);
    setPhone(next);
    if (sentTarget && `+91:${next}` !== sentTarget) {
      setSentTarget('');
      setVerifyCode('');
      setSeconds(0);
    }
  };

  const submit = async () => {
    if (!phoneValid) {
      toast.error(isLogin ? t('loginModal.phoneInvalid') : t('registerModal.phoneInvalid'));
      return;
    }
    if (isLogin) {
      if (!secret || secret.length < 6) {
        toast.error(t('loginModal.passwordRequired'));
        return;
      }
    } else {
      if (!secret) {
        toast.error(t('registerModal.passwordRequired'));
        return;
      }
      if (!PASSWORD_PATTERN.test(secret)) {
        toast.error(t('registerModal.passwordLength'));
        return;
      }
      if (needPhoneVerify) {
        if (!verifyCode) {
          toast.error(t('registerModal.verificationRequired'));
          return;
        }
        if (sentTarget !== verificationTarget) {
          toast.error(t('registerModal.verificationSendFirst'));
          return;
        }
      }
      if (!agreeTerms) {
        toast.error(t('registerModal.agreementRequired'));
        return;
      }
    }
    setSubmitting(true);
    try {
      if (isLogin) {
        const credentials =
          loginType === 'otp'
            ? { phone, qh: '+91', verify_code: secret }
            : { phone, qh: '+91', password: secret };
        await finishAuth(await phone_login(credentials, { noResend: true }));
      } else {
        const system = useSystemStore.getState();
        const registerParams = {
          username: '',
          realname: '',
          account_type: '1',
          password: secret,
          password_confirm: secret,
          phone,
          qh: '+91',
        };
        if (needPhoneVerify) registerParams.verify_code = verifyCode;
        appendIfPresent(registerParams, 'pix', system.registerPix);
        appendIfPresent(registerParams, 'platform', system.registerPlatform);
        appendIfPresent(registerParams, 'click_id', system.registerClickId);
        appendIfPresent(registerParams, 'lang', getCurrentLang());
        appendIfPresent(registerParams, 'inv_code', system.InviteCode);
        appendIfPresent(registerParams, 'adid', system.adid);
        appendIfPresent(registerParams, 'app_token', system.appToken);
        if (system.adid) registerParams.platform = 'adjust';
        if (String(system.env || '').toLowerCase() === 'traffic_poor') registerParams.register_device = 'TRAFFIC_POOR';
        await finishAuth(await registerApi(registerParams, { noResend: true }));
        toast.success(t('registerModal.registerSuccess'));
      }
    } catch (error) {
      if (error?.type !== 'AUTH_ERROR') {
        toast.error(error?.message || error?.msg || (isLogin ? t('loginModal.loginFailed') : t('registerModal.registerFailed')));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sendCode = async () => {
    if (!phoneValid || seconds > 0 || sendingCode) return;
    setSendingCode(true);
    try {
      await sendPhoneCode({ phone, qh: '+91' });
      setSentTarget(verificationTarget);
      setSeconds(Number(appConfig?.app_info?.config_phone_verify_time) || 60);
      toast.success(t('registerModal.verificationSent'));
    } catch (error) {
      if (!error?.silent) toast.error(error?.message || t('errors.requestFailed'));
    } finally {
      setSendingCode(false);
    }
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: SCREEN_HEIGHT > 0 ? 1 - Math.min(translateY.value / SCREEN_HEIGHT, 1) : 1,
  }));

  return (
      <View style={styles.overlay}>
        <Animated.View pointerEvents="none" style={[styles.scrim, scrimStyle]} />
        <Animated.View style={[styles.screen, sheetStyle, { paddingTop: insets.top + s(12), paddingBottom: insets.bottom + s(24) }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isLogin ? t('loginModal.signIn') : t('loginModal.signUp')}</Text>
          <Pressable onPress={close}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/brand/a91-logo.png')} style={styles.logo} contentFit="contain" />
          <Text style={styles.welcome}>{t('loginModal.welcome')}</Text>
          {isLogin && needPhoneVerify ? (
            <View style={styles.tabs}>
              {['otp', 'password'].map((type) => (
                <Pressable key={type} style={[styles.tab, loginType === type && styles.tabActive]} onPress={() => setLoginType(type)}>
                  <Text style={[styles.tabText, loginType === type && styles.tabTextActive]}>
                    {type === 'otp' ? t('loginModal.otp') : t('loginModal.password')}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <PhoneField
            label={t('loginModal.phoneLabel')}
            value={phone}
            onChangeText={changePhone}
            maxLength={phoneMaxLength}
            placeholder={t('loginModal.phoneInputPlaceholder')}
          />
          {isLogin && needPhoneVerify && loginType === 'otp' ? (
            <TextField
              label={t('loginModal.verificationLabel')}
              value={secret}
              onChangeText={setSecret}
              maxLength={6}
              keyboardType="number-pad"
              placeholder={t('loginModal.verificationInputPlaceholder')}
              right={
                <InlineAction
                  label={seconds > 0 ? `${seconds}s` : sendingCode ? t('registerModal.sending') : t('loginModal.send')}
                  onPress={sendCode}
                  disabled={seconds > 0 || sendingCode}
                />
              }
            />
          ) : (
            <PasswordField
              label={t('loginModal.passwordLabel')}
              value={secret}
              onChangeText={setSecret}
              maxLength={20}
              placeholder={t('loginModal.passwordInputPlaceholder')}
            />
          )}
          {!isLogin && needPhoneVerify ? (
            <CodeField
              label={t('loginModal.verificationLabel')}
              value={verifyCode}
              onChangeText={(value) => setVerifyCode(value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder={t('loginModal.verificationInputPlaceholder')}
              onSend={sendCode}
              disabled={!phoneValid || seconds > 0 || sendingCode}
              loading={sendingCode}
              sendLabel={seconds > 0 ? `${seconds}s` : sendingCode ? t('registerModal.sending') : t('loginModal.send')}
            />
          ) : null}
          {!isLogin ? (
            <View style={styles.agreement}>
              <Pressable
                hitSlop={s(8)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeTerms }}
                onPress={() => setAgreeTerms((value) => !value)}
                style={styles.agreementToggle}>
                <View style={[styles.box, agreeTerms && styles.boxOn]}>
                  {agreeTerms ? (
                    <Svg width={s(12)} height={s(12)} viewBox="0 0 16 16">
                      <Path d="M3.5 8.2l3 3.1 6-6.4" fill="none" stroke={colors.accentInk} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : null}
                </View>
              </Pressable>
              <Text style={styles.agreementText}>
                {t('registerModal.agreementText')}{' '}
                <Text style={styles.agreementLink} onPress={openAgreement}>
                  {t('registerModal.terms')}
                </Text>
              </Text>
            </View>
          ) : null}
          <PrimaryButton label={isLogin ? t('loginModal.signIn') : t('registerModal.signUp')} onPress={submit} loading={submitting} />
          {isLogin ? (
            <View style={styles.loginLinks}>
              <Pressable onPress={openForgot} hitSlop={s(8)}>
                <Text style={styles.forgotLink}>{t('loginModal.forgotPassword')}</Text>
              </Pressable>
              <Pressable onPress={openOther} hitSlop={s(8)}>
                <Text style={styles.registerCopy}>
                  {t('loginModal.noAccountShort')} <Text style={styles.registerLink}>{t('loginModal.signUp')}</Text>
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={openOther} style={styles.switchRow}>
              <Text style={styles.switchLink}>{`${t('registerModal.haveAccount')} ${t('registerModal.signIn')}`}</Text>
            </Pressable>
          )}
        </ScrollView>
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: s(12),
  },
  header: { height: s(32), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.text, fontSize: s(16), fontWeight: '600' },
  close: { color: colors.text, fontSize: s(18) },
  logo: { width: s(176), height: s(60), alignSelf: 'center' },
  body: { gap: s(12), paddingTop: s(16) },
  welcome: { color: colors.text, fontSize: s(16), fontWeight: '700', textAlign: 'center' },
  tabs: { flexDirection: 'row', gap: s(8) },
  tab: { flex: 1, height: s(32), borderRadius: s(8), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.text, fontWeight: '600' },
  tabTextActive: { color: colors.accentInk },
  agreement: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  agreementToggle: { width: s(24), height: s(24), alignItems: 'center', justifyContent: 'center' },
  box: { width: s(18), height: s(18), borderRadius: s(4), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  agreementText: { color: colors.muted, flex: 1, fontSize: s(12), lineHeight: s(18) },
  agreementLink: { color: colors.accent },
  switchRow: { alignItems: 'center' },
  switchLink: { color: colors.accent, fontSize: s(14), lineHeight: s(20), textAlign: 'center' },
  loginLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(8) },
  forgotLink: { color: colors.text, fontSize: s(12), lineHeight: s(18) },
  registerCopy: { color: colors.text, fontSize: s(12), lineHeight: s(18) },
  registerLink: { color: colors.accent, fontWeight: '600' },
});
