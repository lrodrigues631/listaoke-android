import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { theme } from '../../../constants/theme';
import { AppBadge } from './AppBadge';

type EmptyStateProps = {
  title: string;
  message: string;
  badge?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ title, message, badge, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {badge ? <AppBadge label={badge} variant="accent" /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  message: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  action: {
    marginTop: theme.spacing.sm,
  },
});
