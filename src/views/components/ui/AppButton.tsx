import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

import { colors } from '../../../constants/colors';

type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerOutline' | 'ghost';
type AppButtonSize = 'default' | 'small';

type AppButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const indicatorColor = variant === 'primary' ? colors.background : colors.text;

  const variantTextStyle = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    danger: styles.dangerText,
    dangerOutline: styles.dangerOutlineText,
    ghost: styles.ghostText,
  }[variant];

  const sizeTextStyle = size === 'small' ? styles.smallText : styles.defaultText;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text style={[styles.text, variantTextStyle, sizeTextStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  default: {
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  small: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderSoft,
  },
  danger: {
    backgroundColor: colors.dangerMuted,
    borderColor: '#6E2638',
  },
  dangerOutline: {
    backgroundColor: 'transparent',
    borderColor: '#6E2638',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.borderSoft,
  },
  text: {
    fontWeight: '900',
    textAlign: 'center',
  },
  defaultText: {
    fontSize: 16,
  },
  smallText: {
    fontSize: 12,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryText: {
    color: colors.text,
  },
  dangerText: {
    color: colors.danger,
  },
  dangerOutlineText: {
    color: colors.danger,
  },
  ghostText: {
    color: colors.textMuted,
  },
  disabled: {
    opacity: 0.55,
  },
});