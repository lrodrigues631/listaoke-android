import { StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { theme } from '../../../constants/theme';

type AppBadgeVariant = 'primary' | 'accent' | 'neutral' | 'danger' | 'success';

type AppBadgeProps = {
  label: string;
  variant?: AppBadgeVariant;
  style?: StyleProp<TextStyle>;
};

export function AppBadge({ label, variant = 'primary', style }: AppBadgeProps) {
  return <Text style={[styles.base, styles[variant], style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  primary: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    color: theme.colors.primary,
  },
  accent: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.borderStrong,
    color: theme.colors.accentStrong,
  },
  neutral: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderSoft,
    color: theme.colors.textMuted,
  },
  danger: {
    backgroundColor: theme.colors.dangerMuted,
    borderColor: theme.colors.dangerBorder,
    color: theme.colors.danger,
  },
  success: {
    backgroundColor: theme.colors.successMuted,
    borderColor: theme.colors.success,
    color: theme.colors.success,
  },
});
