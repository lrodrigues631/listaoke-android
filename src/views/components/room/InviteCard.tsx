import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../../constants/colors';

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
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Convite</Text>
        <Text style={styles.hint}>Toque no código para copiar</Text>
      </View>

      <Pressable
        disabled={isCopyingInvite}
        onPress={onCopyCode}
        style={({ pressed }) => [
          styles.codeBox,
          pressed && styles.codeBoxPressed,
          isCopyingInvite && styles.disabled,
        ]}
      >
        <Text style={styles.code}>{roomCode}</Text>
      </Pressable>

      <Text style={styles.text}>
        Compartilhe o convite com a turma. O código também copia direto tocando nele.
      </Text>

      <TouchableOpacity
        disabled={isCopyingInvite}
        style={[styles.primaryButton, isCopyingInvite && styles.disabled]}
        onPress={onCopyInvite}
      >
        {isCopyingInvite ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.primaryButtonText}>Copiar convite</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13231D',
    borderRadius: 28,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: '#285343',
  },
  headerRow: {
    gap: 4,
  },
  label: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
  },
  codeBox: {
    backgroundColor: '#193B2F',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  codeBoxPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  code: {
    color: colors.text,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: 8,
    fontWeight: '900',
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.6,
  },
});