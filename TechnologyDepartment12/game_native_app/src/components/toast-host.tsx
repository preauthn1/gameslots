// @ts-nocheck
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useToastStore } from '@/services/toast-store';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const tones = {
  info: colors.surface,
  success: '#1f3d16',
  error: '#4a1717',
  warning: '#3d3214',
};

export function ToastHost() {
  const visible = useToastStore((state) => state.visible);
  const message = useToastStore((state) => state.message);
  const tone = useToastStore((state) => state.tone);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(hide, 2200);
    return () => clearTimeout(timer);
  }, [visible, message, hide]);

  if (!visible || !message) return null;
  return (
    <View pointerEvents="none" style={styles.layer}>
      <Text style={[styles.toast, { backgroundColor: tones[tone] || colors.surface }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    paddingTop: s(78),
    paddingHorizontal: s(24),
  },
  toast: {
    overflow: 'hidden',
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: s(12),
    paddingHorizontal: s(16),
    fontSize: s(14),
  },
});
