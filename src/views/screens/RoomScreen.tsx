import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { loadRoomMembers } from '../../controllers/memberController';
import {
  callNextToStage,
  finishCurrentPerformance,
  finishMyPerformance,
  joinQueue,
  leaveQueue,
  loadRoomQueue,
} from '../../controllers/queueController';
import { subscribeToRoomMembers, subscribeToRoomQueue } from '../../controllers/realtimeController';
import type { QueueItem } from '../../types/queueTypes';
import type { CurrentRoom, RoomMember } from '../../types/roomTypes';

type RoomScreenProps = {
  room: CurrentRoom;
  onBackHome: () => void;
};

export function RoomScreen({ room, onBackHome }: RoomScreenProps) {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isChangingQueue, setIsChangingQueue] = useState(false);

  const [membersError, setMembersError] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);

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

  const fetchQueue = useCallback(async () => {
    try {
      setQueueError(null);

      const loadedQueue = await loadRoomQueue(room.roomId);

      setQueueItems(loadedQueue);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao carregar fila.';

      setQueueError(errorMessage);
    } finally {
      setIsLoadingQueue(false);
    }
  }, [room.roomId]);

  useEffect(() => {
    fetchMembers();
    fetchQueue();

    const unsubscribeMembers = subscribeToRoomMembers({
      roomId: room.roomId,
      onChange: fetchMembers,
    });

    const unsubscribeQueue = subscribeToRoomQueue({
      roomId: room.roomId,
      onChange: fetchQueue,
    });

    return () => {
      unsubscribeMembers();
      unsubscribeQueue();
    };
  }, [fetchMembers, fetchQueue, room.roomId]);

  const membersById = useMemo(() => {
    return members.reduce<Record<string, RoomMember>>((accumulator, member) => {
      accumulator[member.id] = member;
      return accumulator;
    }, {});
  }, [members]);

  const currentOnStage = queueItems.find((item) => item.status === 'on_stage') ?? null;
  const waitingQueue = queueItems.filter((item) => item.status === 'waiting');
  const myQueueItem = queueItems.find((item) => item.member_id === room.memberId) ?? null;

  const isOwner = room.memberRole === 'owner';
  const isInQueue = Boolean(myQueueItem);
  const isMeOnStage = myQueueItem?.status === 'on_stage';

  async function runQueueAction(action: () => Promise<void>) {
    try {
      setIsChangingQueue(true);
      setQueueError(null);

      await action();
      await fetchQueue();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao mexer na fila.';

      Alert.alert('Não consegui mexer na fila', errorMessage);
    } finally {
      setIsChangingQueue(false);
    }
  }

  const roleLabel = isOwner ? 'Dono' : 'Convidado';
  const currentOnStageMember = currentOnStage ? membersById[currentOnStage.member_id] : null;

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
        <Text style={styles.cardValue}>{roleLabel}</Text>
      </View>

      <View style={styles.stageCard}>
        <Text style={styles.sectionTitle}>Cantando agora</Text>

        {currentOnStage ? (
          <>
            <Text style={styles.stageName}>
              {currentOnStageMember?.name ?? 'Alguém misterioso'}
            </Text>

            {isMeOnStage && (
              <Text style={styles.stageHint}>Você está no palco. Manda ver.</Text>
            )}

            {(isOwner || isMeOnStage) && (
              <TouchableOpacity
                disabled={isChangingQueue}
                style={[styles.primaryButton, isChangingQueue && styles.disabledButton]}
                onPress={() =>
                  runQueueAction(async () => {
                    if (isOwner) {
                      await finishCurrentPerformance(room.roomId);
                      return;
                    }

                    await finishMyPerformance(room.roomId, room.memberId);
                  })
                }
              >
                {isChangingQueue ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.primaryButtonText}>Concluir apresentação</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.emptyText}>
              Ninguém no palco ainda. O microfone está julgando em silêncio.
            </Text>

            {isOwner && (
              <TouchableOpacity
                disabled={isChangingQueue || waitingQueue.length === 0}
                style={[
                  styles.primaryButton,
                  (isChangingQueue || waitingQueue.length === 0) && styles.disabledButton,
                ]}
                onPress={() => runQueueAction(() => callNextToStage(room.roomId))}
              >
                {isChangingQueue ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.primaryButtonText}>Chamar próximo</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Minha participação</Text>

        {isMeOnStage ? (
          <>
            <Text style={styles.participationText}>
              Você está no palco. Manda ver.
            </Text>

            <TouchableOpacity
              disabled={isChangingQueue}
              style={[styles.primaryButton, isChangingQueue && styles.disabledButton]}
              onPress={() =>
                runQueueAction(() => finishMyPerformance(room.roomId, room.memberId))
              }
            >
              {isChangingQueue ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.primaryButtonText}>Concluir minha vez</Text>
              )}
            </TouchableOpacity>
          </>
        ) : isInQueue ? (
          <>
            <Text style={styles.participationText}>
              Você está na fila. Já vai aquecendo a voz, ou pelo menos inventando confiança.
            </Text>

            <TouchableOpacity
              disabled={isChangingQueue}
              style={[styles.dangerButton, isChangingQueue && styles.disabledButton]}
              onPress={() => runQueueAction(() => leaveQueue(room.roomId, room.memberId))}
            >
              {isChangingQueue ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.dangerButtonText}>Sair da fila</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.participationText}>
              Você ainda não entrou na fila. Está só observando o caos por enquanto.
            </Text>

            <TouchableOpacity
              disabled={isChangingQueue}
              style={[styles.primaryButton, isChangingQueue && styles.disabledButton]}
              onPress={() => runQueueAction(() => joinQueue(room.roomId, room.memberId))}
            >
              {isChangingQueue ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.primaryButtonText}>Entrar na fila</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fila</Text>
          <Text style={styles.counter}>{waitingQueue.length}</Text>
        </View>

        {isLoadingQueue && (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Carregando a fila...</Text>
          </View>
        )}

        {queueError && <Text style={styles.errorText}>{queueError}</Text>}

        {!isLoadingQueue && !queueError && waitingQueue.length === 0 && (
          <Text style={styles.emptyText}>A fila está vazia. Coragem, alguém precisa começar.</Text>
        )}

        {!isLoadingQueue &&
          !queueError &&
          waitingQueue.map((item, index) => {
            const member = membersById[item.member_id];

            return (
              <View key={item.id} style={styles.queueItem}>
                <Text style={styles.queuePosition}>{index + 1}</Text>

                <View style={styles.queueInfo}>
                  <Text style={styles.memberName}>{member?.name ?? 'Participante'}</Text>
                  <Text style={styles.memberRole}>
                    {member?.role === 'owner' ? 'Dono da sala' : 'Convidado'}
                  </Text>
                </View>

                {item.member_id === room.memberId && <Text style={styles.youBadge}>Você</Text>}
              </View>
            );
          })}
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
  stageCard: {
    backgroundColor: '#13231D',
    borderRadius: 22,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#285343',
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
  stageName: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  stageHint: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
  participationText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
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
  queueItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  queuePosition: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.primary,
    color: colors.background,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '900',
  },
  queueInfo: {
    flex: 1,
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
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '900',
  },
  dangerButton: {
    backgroundColor: '#3A1F25',
    borderColor: '#7F2D3A',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.55,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
});