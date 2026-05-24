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
  finishMyTurn,
  joinQueue,
  leaveQueue,
  loadRoomQueue,
  moveMyTurnDown,
  ownerRemoveFromQueue,
  skipMyTurn,
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
  const isMeOnStage = myQueueItem?.status === 'on_stage';
  const isMeWaiting = myQueueItem?.status === 'waiting';
  const isInQueue = Boolean(myQueueItem);

  const canMoveMyTurnDown =
    isMeWaiting && waitingQueue.length > 1 && waitingQueue.at(-1)?.member_id !== room.memberId;

  const currentOnStageMember = currentOnStage ? membersById[currentOnStage.member_id] : null;
  const roleLabel = isOwner ? 'Dono' : 'Convidado';

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

  function confirmOwnerRemoveQueueItem(item: QueueItem) {
    const targetMember = membersById[item.member_id];
    const targetName = targetMember?.name ?? 'Participante';

    Alert.alert(
      'Remover da fila?',
      `Você quer remover ${targetName} ${item.status === 'on_stage' ? 'do palco' : 'da fila'}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () =>
            runQueueAction(() => ownerRemoveFromQueue(room.roomId, room.memberId, item.id)),
        },
      ]
    );
  }

  function confirmStopSinging() {
    Alert.alert(
      'Parar de cantar?',
      'Você vai sair da fila. Para voltar, é só entrar de novo depois.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Parar de cantar',
          style: 'destructive',
          onPress: () => runQueueAction(() => leaveQueue(room.roomId, room.memberId)),
        },
      ]
    );
  }

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

            {isMeOnStage ? (
              <Text style={styles.stageHint}>
                Você está no palco. Concluir ou pular manda você para o fim da fila.
              </Text>
            ) : (
              <Text style={styles.stageHint}>A vez está rolando. Respeita o show.</Text>
            )}

            {isMeOnStage && (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  disabled={isChangingQueue}
                  style={[styles.primaryButton, isChangingQueue && styles.disabledButton]}
                  onPress={() => runQueueAction(() => finishMyTurn(room.roomId, room.memberId))}
                >
                  {isChangingQueue ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.primaryButtonText}>Concluir e voltar ao fim</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isChangingQueue}
                  style={[styles.warningButton, isChangingQueue && styles.disabledButton]}
                  onPress={() => runQueueAction(() => skipMyTurn(room.roomId, room.memberId))}
                >
                  {isChangingQueue ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.warningButtonText}>Pular e voltar ao fim</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isChangingQueue}
                  style={[styles.dangerButton, isChangingQueue && styles.disabledButton]}
                  onPress={confirmStopSinging}
                >
                  {isChangingQueue ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.dangerButtonText}>Parar de cantar</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {isOwner && !isMeOnStage && (
              <TouchableOpacity
                disabled={isChangingQueue}
                style={[styles.dangerButton, isChangingQueue && styles.disabledButton]}
                onPress={() => confirmOwnerRemoveQueueItem(currentOnStage)}
              >
                {isChangingQueue ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.dangerButtonText}>Remover do palco</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>
            Ninguém no palco agora. Quando alguém entrar na fila, o app chama sozinho.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Minha participação</Text>

        {isMeOnStage ? (
          <>
            <Text style={styles.participationText}>
              Você está cantando agora. Depois da sua vez, pode voltar para o fim da fila ou parar.
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                disabled={isChangingQueue}
                style={[styles.primaryButton, isChangingQueue && styles.disabledButton]}
                onPress={() => runQueueAction(() => finishMyTurn(room.roomId, room.memberId))}
              >
                {isChangingQueue ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.primaryButtonText}>Concluir e voltar ao fim</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isChangingQueue}
                style={[styles.warningButton, isChangingQueue && styles.disabledButton]}
                onPress={() => runQueueAction(() => skipMyTurn(room.roomId, room.memberId))}
              >
                {isChangingQueue ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.warningButtonText}>Pular e voltar ao fim</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isChangingQueue}
                style={[styles.dangerButton, isChangingQueue && styles.disabledButton]}
                onPress={confirmStopSinging}
              >
                {isChangingQueue ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.dangerButtonText}>Parar de cantar</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : isMeWaiting ? (
          <>
            <Text style={styles.participationText}>
              Você está esperando sua vez. Pode adiar ou sair da fila.
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                disabled={isChangingQueue || !canMoveMyTurnDown}
                style={[
                  styles.secondaryActionButton,
                  (isChangingQueue || !canMoveMyTurnDown) && styles.disabledButton,
                ]}
                onPress={() => runQueueAction(() => moveMyTurnDown(room.roomId, room.memberId))}
              >
                {isChangingQueue ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.secondaryActionButtonText}>Adiar minha vez</Text>
                )}
              </TouchableOpacity>

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
            </View>
          </>
        ) : (
          <>
            <Text style={styles.participationText}>
              Você ainda não entrou na fila. Quando entrar, se o palco estiver vazio, sua vez começa na hora.
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
          <Text style={styles.sectionTitle}>Fila de espera</Text>
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
          <Text style={styles.emptyText}>
            Ninguém esperando. Quem está no palco pode continuar girando ou parar de cantar.
          </Text>
        )}

        {!isLoadingQueue &&
          !queueError &&
          waitingQueue.map((item, index) => {
            const member = membersById[item.member_id];
            const isThisMe = item.member_id === room.memberId;

            return (
              <View key={item.id} style={styles.queueItem}>
                <Text style={styles.queuePosition}>{index + 1}</Text>

                <View style={styles.queueInfo}>
                  <Text style={styles.memberName}>{member?.name ?? 'Participante'}</Text>
                  <Text style={styles.memberRole}>
                    {member?.role === 'owner' ? 'Dono da sala' : 'Convidado'}
                  </Text>
                </View>

                {isThisMe && <Text style={styles.youBadge}>Você</Text>}

                {isOwner && (
                  <TouchableOpacity
                    disabled={isChangingQueue}
                    style={[styles.smallDangerButton, isChangingQueue && styles.disabledButton]}
                    onPress={() => confirmOwnerRemoveQueueItem(item)}
                  >
                    <Text style={styles.smallDangerButtonText}>Remover</Text>
                  </TouchableOpacity>
                )}
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
  buttonGroup: {
    gap: 10,
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
    gap: 10,
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
  secondaryActionButton: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryActionButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  warningButton: {
    backgroundColor: '#3A321E',
    borderColor: '#7A6428',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  warningButtonText: {
    color: '#FDE68A',
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
  smallDangerButton: {
    backgroundColor: '#3A1F25',
    borderColor: '#7F2D3A',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallDangerButtonText: {
    color: colors.danger,
    fontSize: 12,
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