import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

import { theme } from '../../../constants/theme';
import { PressFeedback } from './MicroInteractions';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerOutline' | 'ghost';
export type AppButtonSize = 'default' | 'small' | 'compact';

type AppButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const indicatorColor =
    variant === 'primary' && !isDisabled ? theme.colors.background : theme.colors.textMuted;

  const variantTextStyle = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    danger: styles.dangerText,
    dangerOutline: styles.dangerOutlineText,
    ghost: styles.ghostText,
  }[variant];

  const sizeTextStyle = size === 'default' ? styles.defaultText : styles.smallText;

  return (
    <PressFeedback
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={8}
      contentStyle={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size={size === 'default' ? 'small' : 16} />
      ) : (
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={2}
          style={[styles.text, variantTextStyle, sizeTextStyle, isDisabled && styles.disabledText]}
        >
          {title}
        </Text>
      )}
    </PressFeedback>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  default: {
    borderRadius: theme.radius.lg,
    minHeight: 56,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 15,
  },
  small: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  compact: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.md,
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 9,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.glow.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.dangerMuted,
    borderColor: theme.colors.dangerBorder,
  },
  dangerOutline: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.dangerBorder,
  },
  ghost: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.borderSoft,
  },
  text: {
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
  defaultText: {
    ...theme.typography.button,
  },
  smallText: {
    ...theme.typography.buttonSmall,
  },
  primaryText: {
    color: theme.colors.background,
  },
  secondaryText: {
    color: theme.colors.text,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  dangerOutlineText: {
    color: theme.colors.danger,
  },
  ghostText: {
    color: theme.colors.textMuted,
  },
  disabled: {
    opacity: 0.62,
  },
  disabledText: {
    color: theme.colors.textDisabled,
  },
});
