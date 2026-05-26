import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { RoomCodeChip } from '../ui/RoomCodeChip';

type InviteCardProps = {
  roomCode: string;
  onCopyInvite: () => void;
  onCopyCode: () => void;
  isCopyingInvite: boolean;
};

export function InviteCard({
  roomCode,
  onCopyInvite,
  onCopyCode,
  isCopyingInvite,
}: InviteCardProps) {
  return (
    <AppCard variant="accent" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.label}>Convite</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Chame a turma
          </Text>
        </View>

        <RoomCodeChip
          code={roomCode}
          compact
          highlighted
          accessibilityLabel={`Código da sala ${roomCode}. Toque para copiar.`}
          onPress={onCopyCode}
        />
      </View>

      <Text style={styles.text}>
        O código fica fácil de copiar e o convite pronto para mandar no grupo.
      </Text>

      <View style={styles.actions}>
        <AppButton
          title="Compartilhar convite"
          accessibilityHint="Copia ou compartilha o convite da sala."
          loading={isCopyingInvite}
          disabled={isCopyingInvite}
          onPress={onCopyInvite}
        />

        <AppButton
          title="Copiar código"
          accessibilityLabel="Copiar código da sala"
          variant="ghost"
          disabled={isCopyingInvite}
          onPress={onCopyCode}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: theme.colors.borderStrong,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  label: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.title,
  },
  text: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
