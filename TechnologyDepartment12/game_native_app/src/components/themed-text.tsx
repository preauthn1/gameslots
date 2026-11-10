import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scale as s } from '@/utils/scale';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontSize: s(14),
    lineHeight: s(20),
    fontWeight: 500,
  },
  smallBold: {
    fontSize: s(14),
    lineHeight: s(20),
    fontWeight: 700,
  },
  default: {
    fontSize: s(16),
    lineHeight: s(24),
    fontWeight: 500,
  },
  title: {
    fontSize: s(48),
    fontWeight: 600,
    lineHeight: s(52),
  },
  subtitle: {
    fontSize: s(32),
    lineHeight: s(44),
    fontWeight: 600,
  },
  link: {
    lineHeight: s(30),
    fontSize: s(14),
  },
  linkPrimary: {
    lineHeight: s(30),
    fontSize: s(14),
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: s(12),
  },
});
