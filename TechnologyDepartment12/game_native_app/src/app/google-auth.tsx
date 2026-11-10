// @ts-nocheck
import { useEffect } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { PrimaryButton, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

export default function GoogleAuthPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const raw = Array.isArray(params.url) ? params.url[0] : params.url;
  const authUrl = raw ? decodeURIComponent(String(raw)) : '';

  useEffect(() => {
    if (authUrl) Linking.openURL(authUrl).catch(() => {});
  }, [authUrl]);

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>{authUrl ? t('pageCopy.googleAuth.login') : t('loginModal.loginFailed')}</Text>
        <Text style={styles.subtitle}>{authUrl ? t('pageCopy.googleAuth.redirecting') : ''}</Text>
        <PrimaryButton label={t('common.back')} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: s(14), padding: s(24) },
  title: { color: '#e5e3ff', fontSize: s(14), fontWeight: '700' },
  subtitle: { color: 'rgba(229,227,255,0.72)', fontSize: s(11) },
});
