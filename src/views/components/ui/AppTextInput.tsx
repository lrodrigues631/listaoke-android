import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { theme } from '../../../constants/theme';

type AppTextInputProps = TextInputProps & {
  label: string;
  errorMessage?: string | null;
  isCode?: boolean;
  forceFocused?: boolean;
};

type TextInputFocusEvent = Parameters<NonNullable<TextInputProps['onFocus']>>[0];
type TextInputBlurEvent = Parameters<NonNullable<TextInputProps['onBlur']>>[0];

export function AppTextInput({
  label,
  errorMessage,
  isCode = false,
  forceFocused = false,
  style,
  onBlur,
  onFocus,
  editable = true,
  accessibilityLabel,
  accessibilityHint,
  ...inputProps
}: AppTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const showFocus = forceFocused || isFocused;
  const showError = Boolean(errorMessage);

  function handleFocus(event: TextInputFocusEvent) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: TextInputBlurEvent) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, showFocus && styles.focusedLabel, showError && styles.errorLabel]}>
        {label}
      </Text>

      <TextInput
        accessibilityHint={errorMessage ?? accessibilityHint}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !editable }}
        editable={editable}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor={theme.colors.textDisabled}
        selectionColor={theme.colors.accentStrong}
        style={[
          styles.input,
          showFocus && styles.focusedInput,
          showError && styles.errorInput,
          !editable && styles.disabledInput,
          isCode && styles.codeInput,
          style,
        ]}
        {...inputProps}
      />

      {errorMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    ...theme.typography.label,
    textTransform: 'uppercase',
  },
  focusedLabel: {
    color: theme.colors.accentStrong,
  },
  errorLabel: {
    color: theme.colors.danger,
  },
  input: {
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 15,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  focusedInput: {
    borderColor: theme.colors.accentStrong,
    backgroundColor: theme.colors.surfaceLight,
    ...theme.glow.accent,
  },
  errorInput: {
    borderColor: theme.colors.dangerBorder,
    backgroundColor: theme.colors.dangerMuted,
  },
  disabledInput: {
    opacity: 0.56,
  },
  codeInput: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 18,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});
