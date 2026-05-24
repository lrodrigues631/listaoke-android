import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { loadRoomMembers } from '../../controllers/memberController';
import { subscribeToRoomMembers } from '../../controllers/realtimeController';
import type { CurrentRoom, RoomMember } from '../../types/roomTypes';

type RoomScreenProps = {
  room: CurrentRoom;
  onBackHome: () => void;
};

export function RoomScreen({ room, onBackHome }: RoomScreenProps) {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setMembersError(null);

      const loadedMembers = await loadRoomMembers(room.roomId);

      setMembers(loadedMembers);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao carregar membros.';

      setMembersError(errorMessage);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [room.roomId]);

  useEffect(() => {
    fetchMembers();

    const unsubscribe = subscribeToRoomMembers({
      roomId: room.roomId,
      onChange: fetchMembers,
    });

    return () => {
      unsubscribe();
    };
  }, [fetchMembers, room.roomId]);

  const ownerLabel = room.memberRole === 'owner' ? 'Dono' : 'Convidado';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Sala ativa</Text>
        <Text style={styles.title}>{room.roomName}</Text>
        <Text style={styles.subtitle}>Código da sala: {room.roomCode}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Você</Text>
        <Text style={styles.cardValue}>{room.memberName}</Text>

        <Text style={styles.cardLabel}>Seu cargo</Text>
        <Text style={styles.cardValue}>{ownerLabel}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Membros</Text>
          <Text style={styles.counter}>{members.length}</Text>
        </View>

        {isLoadingMembers && (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Carregando a turma...</Text>
          </View>
        )}

        {membersError && <Text style={styles.errorText}>{membersError}</Text>}

        {!isLoadingMembers && !membersError && members.length === 0 && (
          <Text style={styles.emptyText}>Ninguém apareceu ainda. Nem o tio do “só uma música”.</Text>
        )}

        {!isLoadingMembers &&
          !membersError &&
          members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>
                  {member.role === 'owner' ? 'Dono da sala' : 'Convidado'}
                </Text>
              </View>

              {member.id === room.memberId && <Text style={styles.youBadge}>Você</Text>}
            </View>
          ))}
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>A fila está vazia.</Text>
        <Text style={styles.emptyText}>Coragem, alguém precisa começar.</Text>
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={onBackHome}>
        <Text style={styles.secondaryButtonText}>Voltar para início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    gap: 12,
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
  cardValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  counter: {
    minWidth: 32,
    textAlign: 'center',
    color: colors.background,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: '900',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  memberItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  memberRole: {
    color: colors.textSoft,
    fontSize: 13,
    marginTop: 3,
  },
  youBadge: {
    color: colors.background,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '900',
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
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
});