import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { theme } from '../../../constants/theme';

type AppCardVariant = 'default' | 'raised' | 'accent' | 'danger';

type AppCardProps = {
  children: ReactNode;
  variant?: AppCardVariant;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, variant = 'default', style }: AppCardProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  default: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
  },
  raised: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    ...theme.shadows.raised,
  },
  accent: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.borderStrong,
  },
  danger: {
    backgroundColor: theme.colors.dangerMuted,
    borderColor: theme.colors.dangerBorder,
  },
});
