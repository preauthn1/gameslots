// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SourceIcon } from '@/components/source-icon';
import { useI18n } from '@/i18n';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function PageHeader({ title, onBack, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + s(8) }]}>
      <Pressable onPress={onBack} hitSlop={s(8)} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        {onBack ? <SourceIcon name="back" size={s(24)} /> : null}
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, loading, variant = 'primary', compact, style }) {
  const blocked = disabled || loading;
  const ink = variant === 'primary' ? colors.accentInk : variant === 'accent' ? colors.accent : colors.text;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        variant === 'outline' && styles.buttonOutline,
        variant === 'accent' && styles.buttonAccent,
        blocked && styles.disabled,
        pressed && !blocked && styles.pressed,
        style,
      ]}
      disabled={blocked}
      onPress={onPress}>
      {loading ? <ActivityIndicator color={ink} /> : <Text style={[styles.buttonText, { color: ink }]}>{label}</Text>}
    </Pressable>
  );
}

export function PageSkeleton() {
  return (
    <View style={styles.pageLoading}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

export function EmptyState({ label }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

export function ListLoadFooter({ loading = false, finished = false, hasData = true }) {
  const { t } = useI18n();
  if (!hasData && !loading) return null;
  return (
    <View style={styles.listFooter}>
      <ActivityIndicator size="small" color={colors.accent} animating={loading} style={[styles.listFooterMark, { opacity: loading ? 1 : 0 }]} />
      <Text style={[styles.listFooterText, { opacity: !loading && finished ? 0.6 : 0 }]}>{t('common.noMoreData')}</Text>
    </View>
  );
}

const SCREEN_HEIGHT = Dimensions.get('screen').height;

export function BottomSheet({ visible, onClose, children, cardStyle }) {
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    setShown(true);
  }, [progress, visible]);

  useEffect(() => {
    if (!shown) return undefined;
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 280 : 220,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setShown(false);
    });
    return () => animation.stop();
  }, [progress, shown, visible]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] });

  return (
    <Modal visible={shown} transparent statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Animated.View style={[styles.sheetMask, { opacity: progress }]}>
          <Pressable style={styles.sheetMaskHit} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheet, cardStyle, { paddingBottom: insets.bottom + s(16), transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export function ConfirmSheet({ visible, title, message, confirmText, cancelText, danger, onConfirm, onClose }) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetHead}>
        <Text style={styles.sheetTitle}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={s(8)}>
          <Text style={styles.sheetClose}>×</Text>
        </Pressable>
      </View>
      <Text style={styles.sheetMessage}>{message}</Text>
      <Pressable style={[styles.sheetOk, danger && styles.sheetDanger]} onPress={onConfirm}>
        <Text style={[styles.sheetOkText, danger && styles.sheetDangerText]}>{confirmText}</Text>
      </Pressable>
      <Pressable style={styles.sheetCancel} onPress={onClose}>
        <Text style={styles.sheetCancelText}>{cancelText}</Text>
      </Pressable>
    </BottomSheet>
  );
}

export function ListRow({ title, value, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value || '›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    minHeight: s(52),
    paddingHorizontal: s(12),
    paddingBottom: s(8),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  back: { width: s(32), height: s(32), alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.text, fontSize: s(16), fontWeight: '700', textAlign: 'center' },
  right: { minWidth: s(32), alignItems: 'flex-end' },
  button: {
    height: s(48),
    borderRadius: s(8),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: { height: s(44) },
  buttonOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  buttonAccent: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  buttonText: { color: colors.accentInk, fontSize: s(14), fontWeight: '700' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.72 },
  empty: { padding: s(32), alignItems: 'center' },
  emptyText: { color: colors.muted, fontSize: s(14) },
  row: {
    minHeight: s(52),
    paddingHorizontal: s(14),
    borderRadius: s(8),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(12),
  },
  rowTitle: { color: colors.text, fontSize: s(14), fontWeight: '600', flex: 1 },
  rowValue: { color: colors.muted, fontSize: s(13) },
  pageLoading: {
    flex: 1,
    minHeight: s(240),
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooter: {
    width: '100%',
    height: s(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooterMark: { position: 'absolute' },
  listFooterText: {
    color: colors.muted,
    fontSize: s(11),
    lineHeight: s(14),
    textAlign: 'center',
  },
  sheetRoot: { flex: 1 },
  sheetMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheetMaskHit: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    padding: s(12),
    gap: s(12),
    borderTopLeftRadius: s(12),
    borderTopRightRadius: s(12),
  },
  sheetHead: { minHeight: s(24), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontSize: s(14), fontWeight: '700', flex: 1 },
  sheetClose: { color: colors.muted, fontSize: s(28), lineHeight: s(28), fontWeight: '700' },
  sheetMessage: { color: colors.muted, fontSize: s(12), lineHeight: s(16) },
  sheetOk: { height: s(48), borderRadius: s(6), backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sheetDanger: { backgroundColor: '#ff8088' },
  sheetOkText: { color: colors.accentInk, fontSize: s(14), fontWeight: '600' },
  sheetDangerText: { color: colors.accentInk },
  sheetCancel: { height: s(48), borderRadius: s(6), borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  sheetCancelText: { color: colors.text, fontSize: s(14), fontWeight: '600' },
});
