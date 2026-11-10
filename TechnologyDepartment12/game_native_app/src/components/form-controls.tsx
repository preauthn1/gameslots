// @ts-nocheck
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';

import { PrimaryButton } from '@/components/chrome';
import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const passwordEyeOpen = require('../../assets/icons/password-eye-open.svg');
const passwordEyeClosed = require('../../assets/icons/password-eye-closed.svg');

function FieldFrame({ label, error, style, children }) {
  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function InputBox({ error, left, right, compact, fill, backgroundColor, bare, children }) {
  if (bare) return <View style={styles.bare}>{children}</View>;
  return (
    <View
      style={[
        styles.box,
        compact && styles.boxCompact,
        fill && styles.fill,
        backgroundColor ? { backgroundColor } : null,
        error && styles.boxError,
      ]}>
      {left}
      {children}
      {right}
    </View>
  );
}

export function TextField({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  editable = true,
  onBlur,
  autoCapitalize,
  onSubmitEditing,
  secureTextEntry,
  left,
  right,
  compact,
  fill,
  backgroundColor,
  textAlign,
  fontWeight,
  fontSize,
  readOnlyText,
  bare,
  invalid,
}) {
  const flagged = Boolean(error || invalid);
  const inputStyle = [
    styles.input,
    compact && styles.inputCompact,
    bare && styles.bareInput,
    textAlign ? { textAlign } : null,
    fontWeight ? { fontWeight } : null,
    fontSize ? { fontSize: s(fontSize) } : null,
    readOnlyText ? styles.readOnlyText : null,
  ];
  return (
    <FieldFrame label={label} error={error} style={[fill && styles.fill, bare && styles.bareFrame]}>
      <InputBox error={flagged} left={left} right={right} compact={compact} fill={fill} backgroundColor={backgroundColor} bare={bare}>
        {readOnlyText ? (
          <Text style={inputStyle} numberOfLines={1}>{readOnlyText}</Text>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            onSubmitEditing={onSubmitEditing}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            keyboardType={keyboardType}
            maxLength={maxLength}
            editable={editable}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            style={inputStyle}
          />
        )}
      </InputBox>
    </FieldFrame>
  );
}

export function PhoneField({ dialCode = '+91', ...props }) {
  return (
    <TextField
      keyboardType="phone-pad"
      {...props}
      left={
        <>
          <Text style={styles.code}>{dialCode}</Text>
          <View style={styles.divider} />
        </>
      }
    />
  );
}

export function PasswordField({ label, error, value, onChangeText, placeholder, maxLength, keyboardType, onBlur }) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      label={label}
      error={error}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      keyboardType={keyboardType}
      secureTextEntry={!visible}
      right={
        <Pressable onPress={() => setVisible((current) => !current)} hitSlop={s(8)} style={styles.eyeButton}>
          <Image source={visible ? passwordEyeClosed : passwordEyeOpen} style={styles.eye} contentFit="contain" />
        </Pressable>
      }
    />
  );
}

export function InlineAction({ label, onPress, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={s(8)}>
      <Text style={[styles.inlineAction, disabled && styles.disabled]}>{label}</Text>
    </Pressable>
  );
}

export function CodeField({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  maxLength,
  onBlur,
  onSend,
  sendLabel,
  disabled,
  loading,
  tone = 'primary',
}) {
  return (
    <FieldFrame label={label} error={error}>
      <View style={styles.row}>
        <TextField
          fill
          invalid={Boolean(error)}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          keyboardType="number-pad"
          maxLength={maxLength}
        />
        <PrimaryButton variant={tone} label={sendLabel} onPress={onSend} disabled={disabled} loading={loading} style={styles.send} />
      </View>
    </FieldFrame>
  );
}

const styles = StyleSheet.create({
  field: { gap: s(6) },
  fill: { flex: 1 },
  label: { color: colors.text, fontSize: s(12), fontWeight: '600' },
  error: { color: colors.error, fontSize: s(12), lineHeight: s(16) },
  box: {
    height: s(48),
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    gap: s(8),
  },
  boxCompact: { height: s(44) },
  boxError: { borderColor: colors.error },
  bare: { width: '100%' },
  bareFrame: { width: '100%' },
  input: {
    flex: 1,
    height: s(48),
    color: colors.text,
    fontSize: s(14),
    paddingVertical: 0,
    textAlignVertical: 'center',
    backgroundColor: 'transparent',
  },
  inputCompact: { height: s(44) },
  bareInput: { width: '100%', height: s(48) },
  readOnlyText: { color: '#747b89' },
  code: { color: colors.text, fontSize: s(14) },
  divider: { width: 1, height: s(18), backgroundColor: colors.line },
  eyeButton: { width: s(32), height: s(32), alignItems: 'center', justifyContent: 'center' },
  eye: { width: s(20), height: s(20) },
  inlineAction: { color: colors.accent, fontSize: s(14), fontWeight: '700' },
  disabled: { opacity: 0.55 },
  row: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  send: { minWidth: s(88), paddingHorizontal: s(12) },
});
