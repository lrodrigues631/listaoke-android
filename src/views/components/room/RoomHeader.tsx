import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { colors } from '../../../constants/colors';

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
  onCopyCode?: () => void;
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
  onCopyCode,
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

      Alert.alert('Código copiado', 'Agora manda no grupo.');
    } catch {
      Alert.alert(
        'Não consegui copiar',
        'Copia o código manualmente por enquanto. Chato, mas funciona.'
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.status}>{resolvedStatusLabel}</Text>

        {resolvedRoomCode ? (
          <Pressable
            onPress={handleCopyCode}
            style={({ pressed }) => [styles.codePill, pressed && styles.codePillPressed]}
          >
            <Text style={styles.codeLabel}>Código</Text>
            <Text style={styles.codeText}>{resolvedRoomCode}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{resolvedRoomName}</Text>

      {resolvedRoomCode ? (
        <Text style={styles.hint}>Toque no código para copiar.</Text>
      ) : (
        <Text style={styles.hint}>Sala pronta para a cantoria.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingTop: 48,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  status: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  codePillPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  codeLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  codeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});