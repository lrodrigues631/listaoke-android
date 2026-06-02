import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import { AppButton } from '../ui/AppButton';

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
  canJoinQueue?: boolean;
  isChangingQueue?: boolean;
  onCopyCode?: () => void;
  onCopyInvite?: () => void;
  onOpenOwnerPanel?: () => void;
  onOpenMenu?: () => void;
  onJoinQueue?: () => void;
  [key: string]: unknown;
};

export function RoomHeader({
  room,
  roomName,
  name,
  title,
  status,
  statusLabel,
  roomStatus,
  isRoomClosed,
  canJoinQueue = false,
  isChangingQueue = false,
  onOpenMenu,
  onJoinQueue,
}: RoomHeaderProps) {
  const resolvedRoomName = roomName ?? room?.roomName ?? name ?? title ?? 'Sala';

  const resolvedIsClosed =
    typeof isRoomClosed === 'boolean'
      ? isRoomClosed
      : roomStatus === 'closed' || room?.roomStatus === 'closed';

  const resolvedStatusLabel =
    statusLabel ?? status ?? (resolvedIsClosed ? 'Sala encerrada' : 'Sala ativa');
  const showJoinShortcut = canJoinQueue && !resolvedIsClosed && Boolean(onJoinQueue);

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>L</Text>
          </View>
          <Text style={styles.brandText}>Listaokê</Text>
        </View>

        <View style={styles.headerActions}>
          {onOpenMenu ? (
            <AppButton
              title="Menu"
              accessibilityLabel="Abrir menu da sala"
              variant="secondary"
              size="compact"
              style={styles.menuButton}
              onPress={onOpenMenu}
            />
          ) : (
            <Text style={styles.statusText}>{resolvedStatusLabel}</Text>
          )}

          {showJoinShortcut ? (
            <AppButton
              title="Entrar na fila"
              accessibilityHint="Coloca você no fim da fila para cantar."
              size="compact"
              loading={isChangingQueue}
              disabled={isChangingQueue}
              style={styles.joinButton}
              onPress={() => onJoinQueue?.()}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.roomBlock}>
        <Text style={styles.eyebrow}>{resolvedStatusLabel}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  brandLockup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minWidth: 0,
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
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    flexShrink: 0,
  },
  menuButton: {
    minWidth: 92,
    paddingHorizontal: theme.spacing.md,
  },
  joinButton: {
    minWidth: 128,
  },
  statusText: {
    color: theme.colors.textMuted,
    textAlign: 'right',
    textTransform: 'uppercase',
    ...theme.typography.label,
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
    minHeight: 42,
    ...theme.typography.titleLarge,
  },
});
