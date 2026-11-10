// @ts-nocheck
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { PageHeader, Screen } from '@/components/chrome';
import { useI18n } from '@/i18n';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

export default function AboutPage() {
  const { t } = useI18n();
  const router = useRouter();
  const items = t('about.items');
  const list = Array.isArray(items) ? items : [];
  return (
    <Screen>
      <PageHeader title={t('about.title')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('about.title')}</Text>
        <Text style={styles.intro}>{t('about.intro')}</Text>
        {list.map((item) => (
          <Text key={item} style={styles.item}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: s(24), gap: s(12), alignItems: 'center' },
  title: { color: '#42b883', fontSize: s(28), fontWeight: '800' },
  intro: { color: colors.text, fontSize: s(16), lineHeight: s(24), textAlign: 'center' },
  item: { color: colors.text, fontSize: s(16), alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: s(8), padding: s(12) },
});
