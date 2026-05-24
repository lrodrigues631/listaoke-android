import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import type { CurrentRoom } from '../../types/roomTypes';

type RoomScreenProps = {
  room: CurrentRoom;
  onBackHome: () => void;
};

export function RoomScreen({ room, onBackHome }: RoomScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Sala criada</Text>
        <Text style={styles.title}>{room.roomName}</Text>
        <Text style={styles.subtitle}>Agora é só chamar a turma. A fila ainda está vazia.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Código da sala</Text>
        <Text style={styles.roomCode}>{room.roomCode}</Text>
        <Text style={styles.cardHint}>Convite copiado? Ainda não. Essa parte vem daqui a pouco.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Seu cargo</Text>
        <Text style={styles.cardValue}>{room.memberRole === 'owner' ? 'Dono' : 'Convidado'}</Text>

        <Text style={styles.cardLabel}>Seu nome</Text>
        <Text style={styles.cardValue}>{room.memberName}</Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>A fila está vazia.</Text>
        <Text style={styles.emptyText}>Coragem, alguém precisa começar.</Text>
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={onBackHome}>
        <Text style={styles.secondaryButtonText}>Voltar para início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    gap: 18,
  },
  header: {
    gap: 12,
    paddingTop: 56,
  },
  badge: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roomCode: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#181820',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 'auto',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
});