import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import { AppButton, type AppButtonVariant } from './AppButton';

export type AppDialogVariant = 'default' | 'success' | 'danger';

export type AppDialogAction = {
  title: string;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void | Promise<void>;
};

type AppDialogProps = {
  visible: boolean;
  eyebrow?: string;
  title: string;
  message?: string;
  variant?: AppDialogVariant;
  actions: AppDialogAction[];
  onDismiss?: () => void;
};

export function AppDialog({
  visible,
  eyebrow,
  title,
  message,
  variant = 'default',
  actions,
  onDismiss,
}: AppDialogProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      presentationStyle="overFullScreen"
      visible={visible}
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={styles.layer}>
        <Pressable
          accessibilityLabel="Fechar aviso"
          accessibilityRole="button"
          disabled={!onDismiss}
          style={styles.backdrop}
          onPress={onDismiss}
        />

        <View
          accessibilityViewIsModal
          style={[styles.card, variant === 'success' && styles.successCard, variant === 'danger' && styles.dangerCard]}
        >
          {eyebrow ? <Text style={[styles.eyebrow, styles[variant]]}>{eyebrow}</Text> : null}
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {actions.map((action) => (
              <AppButton
                key={action.title}
                title={action.title}
                variant={action.variant ?? 'primary'}
                loading={action.loading}
                disabled={action.disabled}
                style={styles.actionButton}
                onPress={() => {
                  void action.onPress?.();
                }}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    ...theme.shadows.raised,
  },
  successCard: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successMuted,
  },
  dangerCard: {
    borderColor: theme.colors.dangerBorder,
    backgroundColor: theme.colors.dangerMuted,
  },
  eyebrow: {
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  default: {
    color: theme.colors.primary,
  },
  success: {
    color: theme.colors.success,
  },
  danger: {
    color: theme.colors.danger,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.title,
  },
  message: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  actions: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  actionButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
