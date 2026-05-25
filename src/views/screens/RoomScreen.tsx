import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { AdminCard } from '../components/room/AdminCard';
import { FinalSummaryCard } from '../components/room/FinalSummaryCard';
import { HistoryPreviewCard } from '../components/room/HistoryPreviewCard';
import { MembersCard } from '../components/room/MembersCard';
import { MyParticipationCard } from '../components/room/MyParticipationCard';
import { QueueCard } from '../components/room/QueueCard';
import { RoomHeader } from '../components/room/RoomHeader';
import { StageCard } from '../components/room/StageCard';
import { roomStyles as styles } from '../components/room/roomStyles';
import { AppButton } from '../components/ui/AppButton';
import {
  formatRoomEventMessage,
  loadRoomEvents,
  loadRoomSummary,
} from '../../controllers/eventController';
import {
  leaveRoom,
  loadRoomMembers,
  removeRoomMember,
  transferRoomOwnership,
} from '../../controllers/memberController';
import {
  finishMyTurn,
  joinQueue,
  leaveQueue,
  loadRoomQueue,
  moveMyTurnDown,
  ownerRemoveFromQueue,
  skipMyTurn,
} from '../../controllers/queueController';
import { closeRoom, loadRoom } from '../../controllers/roomController';
import { copyRoomCode, copyRoomInvite } from '../../controllers/shareController';
import {
  subscribeToRoom,
  subscribeToRoomEvents,
  subscribeToRoomMembers,
  subscribeToRoomQueue,
} from '../../controllers/realtimeController';
import type { RoomEvent, RoomSummary } from '../../types/eventTypes';
import type { QueueItem } from '../../types/queueTypes';
import type { CurrentRoom, RoomMember, RoomStatus } from '../../types/roomTypes';

type RoomScreenProps = {
  room: CurrentRoom;
  onBackHome: () => void;
};

const emptySummary: RoomSummary = {
  total_performances: 0,
  total_skips: 0,
  total_queue_exits: 0,
  total_removals: 0,
  total_participants: 0,
  ranking: [],
};

function formatEventTime(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RoomScreen({ room, onBackHome }: RoomScreenProps) {
  const [roomStatus, setRoomStatus] = useState<RoomStatus>(room.roomStatus);

  const [members, setMembers] = useState<RoomMember[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [events, setEvents] = useState<RoomEvent[]>([]);
  const [summary, setSummary] = useState<RoomSummary>(emptySummary);

  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const [isChangingQueue, setIsChangingQueue] = useState(false);
  const [isClosingRoom, setIsClosingRoom] = useState(false);
  const [isChangingMember, setIsChangingMember] = useState(false);
  const [isCopyingInvite, setIsCopyingInvite] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const [roomError, setRoomError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    try {
      setRoomError(null);

      const loadedRoom = await loadRoom(room.roomId);

      setRoomStatus(loadedRoom.status);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao carregar sala.';

      setRoomError(errorMessage);
    } finally {
      setIsLoadingRoom(false);
    }
  }, [room.roomId]);

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

  const fetchEvents = useCallback(async () => {
    try {
      setEventsError(null);

      const loadedEvents = await loadRoomEvents(room.roomId);

      setEvents(loadedEvents);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao carregar histórico.';

      setEventsError(errorMessage);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [room.roomId]);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoadingSummary(true);
      setSummaryError(null);

      const loadedSummary = await loadRoomSummary(room.roomId);

      setSummary(loadedSummary);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao carregar resumo.';

      setSummaryError(errorMessage);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [room.roomId]);

  useEffect(() => {
    fetchRoom();
    fetchMembers();
    fetchQueue();
    fetchEvents();

    const unsubscribeRoom = subscribeToRoom({
      roomId: room.roomId,
      onChange: () => {
        fetchRoom();
        fetchSummary();
      },
    });

    const unsubscribeMembers = subscribeToRoomMembers({
      roomId: room.roomId,
      onChange: () => {
        fetchMembers();
        fetchQueue();
        fetchEvents();
      },
    });

    const unsubscribeQueue = subscribeToRoomQueue({
      roomId: room.roomId,
      onChange: () => {
        fetchQueue();
        fetchEvents();
      },
    });

    const unsubscribeEvents = subscribeToRoomEvents({
      roomId: room.roomId,
      onChange: () => {
        fetchEvents();
        fetchSummary();
      },
    });

    return () => {
      unsubscribeRoom();
      unsubscribeMembers();
      unsubscribeQueue();
      unsubscribeEvents();
    };
  }, [fetchRoom, fetchMembers, fetchQueue, fetchEvents, fetchSummary, room.roomId]);

  useEffect(() => {
    if (roomStatus === 'closed') {
      fetchSummary();
    }
  }, [roomStatus, fetchSummary]);

  const membersById = useMemo(() => {
    return members.reduce<Record<string, RoomMember>>((accumulator, member) => {
      accumulator[member.id] = member;
      return accumulator;
    }, {});
  }, [members]);

  const currentMember = membersById[room.memberId] ?? null;
  const isCurrentMemberActive = Boolean(currentMember);
  const currentRole = currentMember?.role ?? room.memberRole;

  const isOwner = currentRole === 'owner';
  const isRoomClosed = roomStatus === 'closed';
  const wasRemovedFromRoom = !isLoadingMembers && !isCurrentMemberActive;

  const currentOnStage = queueItems.find((item) => item.status === 'on_stage') ?? null;
  const waitingQueue = queueItems.filter((item) => item.status === 'waiting');
  const myQueueItem = queueItems.find((item) => item.member_id === room.memberId) ?? null;

  const isMeOnStage = myQueueItem?.status === 'on_stage';
  const isMeWaiting = myQueueItem?.status === 'waiting';
  const myWaitingQueueIndex = waitingQueue.findIndex((item) => item.member_id === room.memberId);
  const myQueuePosition = myWaitingQueueIndex >= 0 ? myWaitingQueueIndex + 1 : null;
  const canMoveMyTurnDown =
    isMeWaiting &&
    waitingQueue.length > 1 &&
    waitingQueue[waitingQueue.length - 1]?.member_id !== room.memberId;

  const currentOnStageMember = currentOnStage ? membersById[currentOnStage.member_id] : null;

  const transferableMembers = members.filter((member) => member.id !== room.memberId);
  const removableMembers = members.filter((member) => member.id !== room.memberId);

  async function runQueueAction(action: () => Promise<void>) {
    if (isRoomClosed) {
      Alert.alert(
        'Sala encerrada',
        'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.'
      );
      return;
    }

    if (wasRemovedFromRoom) {
      Alert.alert('Você saiu da sala', 'Você não faz mais parte desta sala.');
      return;
    }

    try {
      setIsChangingQueue(true);
      setQueueError(null);

      await action();
      await fetchQueue();
      await fetchEvents();
      await fetchSummary();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao mexer na fila.';

      Alert.alert('Não consegui mexer na fila', errorMessage);
    } finally {
      setIsChangingQueue(false);
    }
  }

  async function runMemberAction(action: () => Promise<void>) {
    if (isRoomClosed) {
      Alert.alert(
        'Sala encerrada',
        'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.'
      );
      return;
    }

    try {
      setIsChangingMember(true);
      setMembersError(null);

      await action();
      await fetchMembers();
      await fetchQueue();
      await fetchEvents();
      await fetchSummary();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao mexer nos membros.';

      Alert.alert('Não consegui alterar os membros', errorMessage);
    } finally {
      setIsChangingMember(false);
    }
  }

  async function handleCopyCode() {
    try {
      setIsCopyingInvite(true);
      await copyRoomCode(room.roomCode);
      Alert.alert('Código copiado', 'Agora manda no grupo antes que alguém invente de cantar sem fila.');
    } catch {
      Alert.alert('Não consegui copiar', 'Copia o código manualmente por enquanto. Chato, mas funciona.');
    } finally {
      setIsCopyingInvite(false);
    }
  }

  async function handleCopyInvite() {
    try {
      setIsCopyingInvite(true);
      await copyRoomInvite({
        roomName: room.roomName,
        roomCode: room.roomCode,
      });

      Alert.alert('Convite copiado', 'Agora manda no grupo.');
    } catch {
      Alert.alert('Não consegui copiar', 'Copia o código manualmente por enquanto. Chato, mas funciona.');
    } finally {
      setIsCopyingInvite(false);
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

  function confirmCloseRoom() {
    Alert.alert(
      'Fechar sala?',
      'Isso encerra o karaokê para todo mundo e mostra o resumo final da noite.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Fechar sala',
          style: 'destructive',
          onPress: handleCloseRoom,
        },
      ]
    );
  }

  async function handleCloseRoom() {
    try {
      setIsClosingRoom(true);
      setRoomError(null);

      await closeRoom(room.roomId, room.memberId);
      await fetchRoom();
      await fetchQueue();
      await fetchEvents();
      await fetchSummary();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao fechar sala.';

      Alert.alert('Não consegui fechar a sala', errorMessage);
    } finally {
      setIsClosingRoom(false);
    }
  }

  function confirmLeaveRoom() {
    if (isRoomClosed || wasRemovedFromRoom) {
      return;
    }

    if (isOwner) {
      Alert.alert(
        'Você é o dono',
        members.length > 1
          ? 'Transfira a administração antes de sair.'
          : 'Você é o único dono da sala. Feche a sala para encerrar.'
      );
      return;
    }

    Alert.alert(
      'Sair da sala?',
      'Você sai da sala e também sai da fila ou do palco.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair da sala',
          style: 'destructive',
          onPress: handleLeaveRoom,
        },
      ]
    );
  }

  async function handleLeaveRoom() {
    try {
      setIsLeavingRoom(true);
      setMembersError(null);
      setQueueError(null);
      setEventsError(null);

      await leaveRoom(room.roomId, room.memberId);
      await fetchMembers();
      await fetchQueue();
      await fetchEvents();
      await fetchSummary();

      onBackHome();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao sair da sala.';

      Alert.alert('Não consegui sair da sala', errorMessage);
    } finally {
      setIsLeavingRoom(false);
    }
  }

  function confirmTransferOwnership(targetMember: RoomMember) {
    Alert.alert(
      'Transferir administração?',
      `Você quer passar a sala para ${targetMember.name}? Você continuará na sala como convidado.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Transferir',
          onPress: () =>
            runMemberAction(() =>
              transferRoomOwnership(room.roomId, room.memberId, targetMember.id)
            ),
        },
      ]
    );
  }

  function confirmRemoveMember(targetMember: RoomMember) {
    Alert.alert(
      'Remover membro?',
      `Você quer remover ${targetMember.name} da sala? Essa pessoa também sairá da fila ou do palco.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () =>
            runMemberAction(() =>
              removeRoomMember(room.roomId, room.memberId, targetMember.id)
            ),
        },
      ]
    );
  }

  const historyCard = (
    <HistoryPreviewCard
      events={events}
      isLoadingEvents={isLoadingEvents}
      eventsError={eventsError}
      isExpanded={isHistoryExpanded}
      onToggleExpanded={() => setIsHistoryExpanded((currentValue) => !currentValue)}
      formatMessage={formatRoomEventMessage}
      formatTime={formatEventTime}
    />
  );

  const membersCard = (
    <MembersCard
      members={members}
      currentMemberId={room.memberId}
      isLoadingMembers={isLoadingMembers}
      membersError={membersError}
      isOwner={isOwner}
      isRoomClosed={isRoomClosed}
      isChangingMember={isChangingMember}
      onTransferOwnership={confirmTransferOwnership}
      onRemoveMember={confirmRemoveMember}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RoomHeader
        roomName={room.roomName}
        roomCode={room.roomCode}
        isClosed={isRoomClosed}
        isCopyingCode={isCopyingInvite}
        onCopyCode={handleCopyCode}
      />

      {roomError && <Text style={styles.errorText}>{roomError}</Text>}

      {isRoomClosed ? (
        <>
          <FinalSummaryCard
            summary={summary}
            isLoadingSummary={isLoadingSummary}
            summaryError={summaryError}
          />

          {historyCard}
          {membersCard}
        </>
      ) : (
        <>
          {wasRemovedFromRoom && (
            <View style={styles.closedBanner}>
              <Text style={styles.closedTitle}>Você não está mais nesta sala.</Text>
              <Text style={styles.closedText}>
                O dono removeu sua participação. Para voltar, só entrando de novo se a sala ainda
                estiver aberta.
              </Text>
            </View>
          )}

          <StageCard
            currentOnStage={currentOnStage}
            currentOnStageMember={currentOnStageMember}
            isLoadingRoom={isLoadingRoom}
            isLoadingQueue={isLoadingQueue}
            isRoomClosed={isRoomClosed}
            isMeOnStage={isMeOnStage}
            isOwner={isOwner}
            isChangingQueue={isChangingQueue}
            wasRemovedFromRoom={wasRemovedFromRoom}
            onFinishTurn={() => runQueueAction(() => finishMyTurn(room.roomId, room.memberId))}
            onSkipTurn={() => runQueueAction(() => skipMyTurn(room.roomId, room.memberId))}
            onStopSinging={confirmStopSinging}
            onOwnerRemoveFromStage={confirmOwnerRemoveQueueItem}
          />

          <MyParticipationCard
            isRoomClosed={isRoomClosed}
            wasRemovedFromRoom={wasRemovedFromRoom}
            isMeOnStage={isMeOnStage}
            isMeWaiting={isMeWaiting}
            queuePosition={myQueuePosition}
            isChangingQueue={isChangingQueue}
            canMoveMyTurnDown={canMoveMyTurnDown}
            onFinishTurn={() => runQueueAction(() => finishMyTurn(room.roomId, room.memberId))}
            onSkipTurn={() => runQueueAction(() => skipMyTurn(room.roomId, room.memberId))}
            onStopSinging={confirmStopSinging}
            onMoveTurnDown={() => runQueueAction(() => moveMyTurnDown(room.roomId, room.memberId))}
            onLeaveQueue={() => runQueueAction(() => leaveQueue(room.roomId, room.memberId))}
            onJoinQueue={() => runQueueAction(() => joinQueue(room.roomId, room.memberId))}
          />

          {isOwner && (
            <AdminCard
              transferableCount={transferableMembers.length}
              removableCount={removableMembers.length}
              isCopyingInvite={isCopyingInvite}
              isClosingRoom={isClosingRoom}
              onCopyInvite={handleCopyInvite}
              onCloseRoom={confirmCloseRoom}
            />
          )}

          <QueueCard
            waitingQueue={waitingQueue}
            membersById={membersById}
            currentMemberId={room.memberId}
            isLoadingQueue={isLoadingQueue}
            queueError={queueError}
            isRoomClosed={isRoomClosed}
            isOwner={isOwner}
            isChangingQueue={isChangingQueue}
            onOwnerRemoveQueueItem={confirmOwnerRemoveQueueItem}
          />

          {membersCard}

          {historyCard}
        </>
      )}

      <View style={styles.footerActions}>
        <AppButton title="Voltar para início" variant="secondary" onPress={onBackHome} />

        {!isRoomClosed && !wasRemovedFromRoom && (
          <AppButton
            title="Sair da sala"
            variant="dangerOutline"
            loading={isLeavingRoom}
            disabled={isLeavingRoom}
            onPress={confirmLeaveRoom}
          />
        )}
      </View>
    </ScrollView>
  );
}
