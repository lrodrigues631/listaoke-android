import { Alert, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { theme } from '../../../constants/theme';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { RoomCodeChip } from '../ui/RoomCodeChip';

type BasicRoom = {
  roomName?: string;
  roomCode?: string;
  roomStatus?: 'open' | 'closed';
};

type RoomHeaderProps = {
  room?: BasicRoom;
  roomName?: string;
  name?: string;
  title?: string;
  roomCode?: string;
  code?: string;
  status?: string;
  statusLabel?: string;
  roomStatus?: 'open' | 'closed';
  isRoomClosed?: boolean;
  isOwner?: boolean;
  isCopyingInvite?: boolean;
  onCopyCode?: () => void;
  onCopyInvite?: () => void;
  [key: string]: unknown;
};

export function RoomHeader({
  room,
  roomName,
  name,
  title,
  roomCode,
  code,
  status,
  statusLabel,
  roomStatus,
  isRoomClosed,
  isOwner = false,
  isCopyingInvite = false,
  onCopyCode,
  onCopyInvite,
}: RoomHeaderProps) {
  const resolvedRoomName = roomName ?? room?.roomName ?? name ?? title ?? 'Sala';
  const resolvedRoomCode = roomCode ?? room?.roomCode ?? code ?? '';

  const resolvedIsClosed =
    typeof isRoomClosed === 'boolean'
      ? isRoomClosed
      : roomStatus === 'closed' || room?.roomStatus === 'closed';

  const resolvedStatusLabel =
    statusLabel ?? status ?? (resolvedIsClosed ? 'Sala encerrada' : 'Sala ativa');

  async function handleCopyCode() {
    if (!resolvedRoomCode) {
      return;
    }

    try {
      if (onCopyCode) {
        onCopyCode();
        return;
      }

      await Clipboard.setStringAsync(resolvedRoomCode);

      Alert.alert('Código copiado.', 'Agora manda no grupo.');
    } catch {
      Alert.alert(
        'Não consegui copiar',
        'Copia o código manualmente por enquanto. Chato, mas funciona.'
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>L</Text>
          </View>
          <Text style={styles.brandText}>Listaokê</Text>
        </View>

        <View style={styles.badgeRow}>
          {isOwner ? <AppBadge label="Dono" variant="accent" /> : null}
          <AppBadge
            label={resolvedStatusLabel}
            variant={resolvedIsClosed ? 'danger' : 'success'}
          />
        </View>
      </View>

      <View style={styles.roomBlock}>
        <Text style={styles.eyebrow}>{resolvedIsClosed ? 'Sala encerrada' : 'Sala ativa'}</Text>
        <Text
          accessibilityRole="header"
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          numberOfLines={2}
          style={styles.title}
        >
          {resolvedRoomName}
        </Text>
      </View>

      <View style={styles.codePanel}>
        <View style={styles.codeTextGroup}>
          <Text style={styles.codeTitle}>Código da sala</Text>
          <Text style={styles.hint}>
            {resolvedRoomCode
              ? isOwner
                ? 'Copie ou compartilhe para chamar a turma.'
                : 'Use como identificação da sala.'
              : 'Sala pronta para a cantoria.'}
          </Text>
        </View>

        {resolvedRoomCode ? (
          <View style={styles.codeActions}>
            <RoomCodeChip
              code={resolvedRoomCode}
              accessibilityLabel={`Código da sala ${resolvedRoomCode}. Toque para copiar.`}
              highlighted={isOwner}
              onPress={handleCopyCode}
            />

            {onCopyInvite ? (
              <AppButton
                title="Compartilhar"
                accessibilityLabel="Compartilhar convite da sala"
                variant="secondary"
                size="compact"
                loading={isCopyingInvite}
                disabled={isCopyingInvite}
                onPress={onCopyInvite}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.huge,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  brandLockup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  brandMark: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
  },
  brandMarkText: {
    color: theme.colors.primary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  brandText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    flexShrink: 1,
  },
  roomBlock: {
    gap: theme.spacing.xs,
  },
  eyebrow: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.titleLarge,
  },
  codePanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  codeTextGroup: {
    gap: 3,
  },
  codeTitle: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  hint: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
});
