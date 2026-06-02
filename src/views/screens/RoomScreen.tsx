import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { FinalSummaryCard } from '../components/room/FinalSummaryCard';
import { HistoryPreviewCard } from '../components/room/HistoryPreviewCard';
import { MembersCard } from '../components/room/MembersCard';
import { MyParticipationCard } from '../components/room/MyParticipationCard';
import { OwnerControlPanel } from '../components/room/OwnerControlPanel';
import { QueueCard } from '../components/room/QueueCard';
import { RoomHeader } from '../components/room/RoomHeader';
import { RoomMenuModal } from '../components/room/RoomMenuModal';
import { RoomModalScreen } from '../components/room/RoomModalScreen';
import { StageCard } from '../components/room/StageCard';
import { roomStyles as styles } from '../components/room/roomStyles';
import { AppButton } from '../components/ui/AppButton';
import {
  AppDialog,
  type AppDialogAction,
  type AppDialogVariant,
} from '../components/ui/AppDialog';
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
  ownerAddManualQueueItem,
  ownerFinishQueueItem,
  ownerMoveQueueItem,
  ownerRemoveFromQueue,
  ownerSkipQueueItem,
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

type RoomDialogState = {
  eyebrow?: string;
  title: string;
  message?: string;
  variant?: AppDialogVariant;
  actions: AppDialogAction[];
};

type MenuReturnTarget = 'history' | 'members' | 'ownerPanel';

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
  const scrollViewRef = useRef<ScrollView | null>(null);
  const sectionOffsetsRef = useRef<Record<'queue' | 'members' | 'history', number>>({
    queue: 0,
    members: 0,
    history: 0,
  });

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
  const [isOwnerPanelVisible, setIsOwnerPanelVisible] = useState(false);
  const [isRoomMenuVisible, setIsRoomMenuVisible] = useState(false);
  const [isMembersScreenVisible, setIsMembersScreenVisible] = useState(false);
  const [isHistoryScreenVisible, setIsHistoryScreenVisible] = useState(false);
  const [menuReturnTarget, setMenuReturnTarget] = useState<MenuReturnTarget | null>(null);
  const [dialogState, setDialogState] = useState<RoomDialogState | null>(null);

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

  function closeDialog() {
    setDialogState(null);
  }

  function showInfoDialog({
    eyebrow,
    title,
    message,
    variant = 'default',
  }: {
    eyebrow?: string;
    title: string;
    message: string;
    variant?: AppDialogVariant;
  }) {
    setDialogState({
      eyebrow,
      title,
      message,
      variant,
      actions: [
        {
          title: 'Entendi',
          variant: variant === 'danger' ? 'dangerOutline' : 'primary',
          onPress: closeDialog,
        },
      ],
    });
  }

  function showConfirmDialog({
    title,
    message,
    confirmTitle,
    confirmVariant = 'primary',
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmTitle: string;
    confirmVariant?: AppDialogAction['variant'];
    onConfirm: () => void | Promise<void>;
  }) {
    setDialogState({
      title,
      message,
      variant:
        confirmVariant === 'danger' || confirmVariant === 'dangerOutline'
          ? 'danger'
          : 'default',
      actions: [
        {
          title: 'Cancelar',
          variant: 'secondary',
          onPress: closeDialog,
        },
        {
          title: confirmTitle,
          variant: confirmVariant,
          onPress: () => {
            closeDialog();
            void onConfirm();
          },
        },
      ],
    });
  }

  function showErrorDialog(title: string, message: string) {
    showInfoDialog({
      eyebrow: 'Aviso',
      title,
      message,
      variant: 'danger',
    });
  }

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
  const canJoinQueueFromShortcut =
    !isRoomClosed && !wasRemovedFromRoom && !isMeOnStage && !isMeWaiting;

  const currentOnStageMember = currentOnStage ? membersById[currentOnStage.member_id] : null;
  const nextQueueItem = waitingQueue[0] ?? null;
  const nextQueueMember = nextQueueItem ? membersById[nextQueueItem.member_id] : null;
  const queuedMemberIds = waitingQueue.map((item) => item.member_id);

  async function runQueueAction(action: () => Promise<void>) {
    if (isRoomClosed) {
      showInfoDialog({
        eyebrow: 'Sala encerrada',
        title: 'Sala encerrada',
        message: 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.',
        variant: 'danger',
      });
      return;
    }

    if (wasRemovedFromRoom) {
      showInfoDialog({
        eyebrow: 'Fora da sala',
        title: 'Você saiu da sala',
        message: 'Você não faz mais parte desta sala.',
        variant: 'danger',
      });
      return;
    }

    try {
      setIsChangingQueue(true);
      setQueueError(null);

      await action();
      await fetchMembers();
      await fetchQueue();
      await fetchEvents();
      await fetchSummary();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao mexer na fila.';

      showErrorDialog('Não consegui mexer na fila', errorMessage);
    } finally {
      setIsChangingQueue(false);
    }
  }

  async function runMemberAction(action: () => Promise<void>) {
    if (isRoomClosed) {
      showInfoDialog({
        eyebrow: 'Sala encerrada',
        title: 'Sala encerrada',
        message: 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.',
        variant: 'danger',
      });
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

      showErrorDialog('Não consegui alterar os membros', errorMessage);
    } finally {
      setIsChangingMember(false);
    }
  }

  function handleOwnerReorderQueue({
    item,
    from,
    to,
  }: {
    item: QueueItem;
    from: number;
    to: number;
  }) {
    if (!isOwner || isChangingQueue || isRoomClosed || from === to) {
      return;
    }

    const direction = to > from ? 'down' : 'up';
    const steps = Math.abs(to - from);

    if (steps <= 0) {
      return;
    }

    void runQueueAction(async () => {
      for (let step = 0; step < steps; step += 1) {
        await ownerMoveQueueItem(room.roomId, room.memberId, item.id, direction);
      }
    });
  }

  function handleCurrentMemberReorderQueue({
    item,
    from,
    to,
  }: {
    item: QueueItem;
    from: number;
    to: number;
  }) {
    if (isOwner || isChangingQueue || isRoomClosed || from === to) {
      return;
    }

    if (item.member_id !== room.memberId) {
      return;
    }

    if (to <= from) {
      return;
    }

    const steps = to - from;

    if (steps <= 0) {
      return;
    }

    void runQueueAction(async () => {
      for (let step = 0; step < steps; step += 1) {
        await moveMyTurnDown(room.roomId, room.memberId);
      }
    });
  }

  async function handleCopyCode() {
    try {
      setIsCopyingInvite(true);
      await copyRoomCode(room.roomCode);
      showInfoDialog({
        eyebrow: 'Copiado',
        title: 'Código copiado',
        message: 'Agora cole no grupo ou envie para quem vai entrar na sala.',
        variant: 'success',
      });
    } catch {
      showErrorDialog(
        'Não consegui copiar',
        'Copia o código manualmente por enquanto. Chato, mas funciona.'
      );
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

      showInfoDialog({
        eyebrow: 'Copiado',
        title: 'Convite copiado',
        message: 'Agora manda no grupo.',
        variant: 'success',
      });
    } catch {
      showErrorDialog('Não consegui copiar', 'Copia o convite manualmente por enquanto.');
    } finally {
      setIsCopyingInvite(false);
    }
  }

  function confirmOwnerRemoveQueueItem(item: QueueItem) {
    const targetMember = membersById[item.member_id];
    const targetName = targetMember?.name ?? 'Participante';

    showConfirmDialog({
      title: 'Remover da fila?',
      message: `Você quer remover ${targetName} ${
        item.status === 'on_stage' ? 'do palco' : 'da fila'
      }?`,
      confirmTitle: 'Remover',
      confirmVariant: 'danger',
      onConfirm: () =>
        runQueueAction(() => ownerRemoveFromQueue(room.roomId, room.memberId, item.id)),
    });
  }

  function confirmOwnerFinishQueueItem(item: QueueItem) {
    const targetMember = membersById[item.member_id];
    const targetName = targetMember?.name ?? 'Participante';

    showConfirmDialog({
      title: 'Concluir apresentação?',
      message: `${targetName} volta para o fim da fila depois dessa música.`,
      confirmTitle: 'Concluir',
      onConfirm: () =>
        runQueueAction(() => ownerFinishQueueItem(room.roomId, room.memberId, item.id)),
    });
  }

  function confirmOwnerSkipQueueItem(item: QueueItem) {
    const targetMember = membersById[item.member_id];
    const targetName = targetMember?.name ?? 'Participante';

    showConfirmDialog({
      title: 'Pular vez?',
      message: `${targetName} volta para o fim da fila sem cantar agora.`,
      confirmTitle: 'Pular vez',
      onConfirm: () =>
        runQueueAction(() => ownerSkipQueueItem(room.roomId, room.memberId, item.id)),
    });
  }

  function confirmCurrentMemberLeaveQueue() {
    showConfirmDialog({
      title: 'Sair da fila?',
      message: 'Você sai da fila, mas continua na sala.',
      confirmTitle: 'Sair da fila',
      confirmVariant: 'danger',
      onConfirm: () => runQueueAction(() => leaveQueue(room.roomId, room.memberId)),
    });
  }

  function confirmStopSinging() {
    showConfirmDialog({
      title: 'Parar de cantar?',
      message: 'Você vai sair da fila. Para voltar, é só entrar de novo depois.',
      confirmTitle: 'Parar de cantar',
      confirmVariant: 'danger',
      onConfirm: () => runQueueAction(() => leaveQueue(room.roomId, room.memberId)),
    });
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

      showErrorDialog('Não consegui fechar a sala', errorMessage);
    } finally {
      setIsClosingRoom(false);
    }
  }

  function confirmCloseRoomFromMenu() {
    setIsRoomMenuVisible(false);

    showConfirmDialog({
      title: 'Fechar sala?',
      message: 'Fechar a sala finaliza a noite e gera o resumo.',
      confirmTitle: 'Fechar sala',
      confirmVariant: 'danger',
      onConfirm: handleCloseRoom,
    });
  }

  function handleOwnerPanelShortcut(section: 'queue' | 'members' | 'history') {
    setMenuReturnTarget(null);

    if (section === 'members') {
      setIsMembersScreenVisible(true);

      requestAnimationFrame(() => {
        setIsOwnerPanelVisible(false);
      });
      return;
    }

    if (section === 'history') {
      setIsHistoryScreenVisible(true);

      requestAnimationFrame(() => {
        setIsOwnerPanelVisible(false);
      });
      return;
    }

    setIsOwnerPanelVisible(false);

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(sectionOffsetsRef.current[section] - 12, 0),
        animated: true,
      });
    });
  }

  function openOwnerPanelFromMenu() {
    setMenuReturnTarget('ownerPanel');
    setIsOwnerPanelVisible(true);

    requestAnimationFrame(() => {
      setIsRoomMenuVisible(false);
    });
  }

  function openMembersScreenFromMenu() {
    setMenuReturnTarget('members');
    setIsMembersScreenVisible(true);

    requestAnimationFrame(() => {
      setIsRoomMenuVisible(false);
    });
  }

  function openHistoryScreenFromMenu() {
    setMenuReturnTarget('history');
    setIsHistoryScreenVisible(true);

    requestAnimationFrame(() => {
      setIsRoomMenuVisible(false);
    });
  }

  function handleJoinQueueShortcut() {
    if (isRoomClosed || wasRemovedFromRoom || isMeOnStage || isMeWaiting) {
      return;
    }

    setIsRoomMenuVisible(false);
    void runQueueAction(() => joinQueue(room.roomId, room.memberId));
  }

  function reopenRoomMenuAfterDismiss() {
    requestAnimationFrame(() => {
      setIsRoomMenuVisible(true);
    });
  }

  function handleOwnerPanelDismiss() {
    setIsOwnerPanelVisible(false);

    if (menuReturnTarget === 'ownerPanel') {
      setMenuReturnTarget(null);
      reopenRoomMenuAfterDismiss();
    }
  }

  function handleMembersScreenDismiss() {
    setIsMembersScreenVisible(false);

    if (menuReturnTarget === 'members') {
      setMenuReturnTarget(null);
      reopenRoomMenuAfterDismiss();
    }
  }

  function handleHistoryScreenDismiss() {
    setIsHistoryScreenVisible(false);

    if (menuReturnTarget === 'history') {
      setMenuReturnTarget(null);
      reopenRoomMenuAfterDismiss();
    }
  }

  function confirmLeaveRoom() {
    if (isRoomClosed || wasRemovedFromRoom) {
      return;
    }

    if (isOwner) {
      showInfoDialog({
        eyebrow: 'Painel do dono',
        title: 'Você é o dono',
        message:
          members.length > 1
            ? 'Transfira a administração antes de sair.'
            : 'Você é o único dono da sala. Feche a sala para encerrar.',
      });
      return;
    }

    showConfirmDialog({
      title: 'Sair da sala?',
      message: 'Você sai da sala e também sai da fila ou do palco.',
      confirmTitle: 'Sair da sala',
      confirmVariant: 'danger',
      onConfirm: handleLeaveRoom,
    });
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

      showErrorDialog('Não consegui sair da sala', errorMessage);
    } finally {
      setIsLeavingRoom(false);
    }
  }

  function confirmTransferOwnership(targetMember: RoomMember) {
    if (targetMember.is_manual) {
      showInfoDialog({
        eyebrow: 'Membros',
        title: 'Não dá',
        message: 'Participantes adicionados manualmente não podem virar dono da sala.',
        variant: 'danger',
      });
      return;
    }

    showConfirmDialog({
      title: 'Transferir administração?',
      message: `Você quer passar a sala para ${targetMember.name}? Você continuará na sala como convidado.`,
      confirmTitle: 'Transferir',
      onConfirm: () =>
        runMemberAction(() =>
          transferRoomOwnership(room.roomId, room.memberId, targetMember.id)
        ),
    });
  }

  function confirmRemoveMember(targetMember: RoomMember) {
    showConfirmDialog({
      title: 'Remover membro?',
      message: `Você quer remover ${targetMember.name} da sala? Essa pessoa também sairá da fila ou do palco.`,
      confirmTitle: 'Remover',
      confirmVariant: 'danger',
      onConfirm: () =>
        runMemberAction(() =>
          removeRoomMember(room.roomId, room.memberId, targetMember.id)
        ),
    });
  }

  const membersScreenCard = (
    <MembersCard
      members={members}
      currentMemberId={room.memberId}
      isLoadingMembers={isLoadingMembers}
      membersError={membersError}
      isOwner={isOwner}
      isRoomClosed={isRoomClosed}
      isChangingMember={isChangingMember}
      currentOnStageMemberId={currentOnStage?.member_id ?? null}
      queuedMemberIds={queuedMemberIds}
      onTransferOwnership={confirmTransferOwnership}
      onRemoveMember={confirmRemoveMember}
    />
  );

  const historyScreenCard = (
    <HistoryPreviewCard
      events={events}
      isLoadingEvents={isLoadingEvents}
      eventsError={eventsError}
      isExpanded
      showToggle={false}
      onToggleExpanded={() => undefined}
      formatMessage={formatRoomEventMessage}
      formatTime={formatEventTime}
    />
  );

  return (
    <>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
      <RoomHeader
        roomName={room.roomName}
        roomCode={room.roomCode}
        isRoomClosed={isRoomClosed}
        isOwner={isOwner}
        canJoinQueue={canJoinQueueFromShortcut}
        isChangingQueue={isChangingQueue}
        onOpenMenu={() => setIsRoomMenuVisible(true)}
        onJoinQueue={handleJoinQueueShortcut}
      />

      {roomError && <Text style={styles.errorText}>{roomError}</Text>}

      {isRoomClosed ? (
        <>
          <FinalSummaryCard
            summary={summary}
            isLoadingSummary={isLoadingSummary}
            summaryError={summaryError}
          />
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
            showOwnerControls={false}
            onFinishTurn={() => runQueueAction(() => finishMyTurn(room.roomId, room.memberId))}
            onSkipTurn={() => runQueueAction(() => skipMyTurn(room.roomId, room.memberId))}
            onStopSinging={confirmStopSinging}
            onOwnerFinishTurn={confirmOwnerFinishQueueItem}
            onOwnerSkipTurn={confirmOwnerSkipQueueItem}
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
            showJoinButton={false}
          />

          <View
            onLayout={(event) => {
              sectionOffsetsRef.current.queue = event.nativeEvent.layout.y;
            }}
          >
            <QueueCard
              waitingQueue={waitingQueue}
              membersById={membersById}
              currentMemberId={room.memberId}
              isLoadingQueue={isLoadingQueue}
              queueError={queueError}
              isRoomClosed={isRoomClosed}
              isOwner={isOwner}
              isChangingQueue={isChangingQueue}
              showOwnerControls={!isOwner}
              compact
              onOwnerAddManualQueueItem={(name) =>
                runQueueAction(() => ownerAddManualQueueItem(room.roomId, room.memberId, name))
              }
              onOwnerMoveQueueItem={(item, direction) =>
                runQueueAction(() =>
                  ownerMoveQueueItem(room.roomId, room.memberId, item.id, direction)
                )
              }
              onOwnerReorderQueue={handleOwnerReorderQueue}
              onOwnerRemoveQueueItem={confirmOwnerRemoveQueueItem}
              onCurrentMemberReorderQueue={handleCurrentMemberReorderQueue}
              onCurrentMemberLeaveQueue={confirmCurrentMemberLeaveQueue}
              onCurrentMemberMoveDown={() =>
                runQueueAction(() => moveMyTurnDown(room.roomId, room.memberId))
              }
            />
          </View>

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

      <RoomMenuModal
        visible={isRoomMenuVisible}
        roomName={room.roomName}
        roomCode={room.roomCode}
        isOwner={isOwner}
        isRoomClosed={isRoomClosed}
        canJoinQueue={canJoinQueueFromShortcut}
        isCopyingInvite={isCopyingInvite}
        isChangingQueue={isChangingQueue}
        isClosingRoom={isClosingRoom}
        onDismiss={() => setIsRoomMenuVisible(false)}
        onCopyCode={handleCopyCode}
        onOpenOwnerPanel={openOwnerPanelFromMenu}
        onOpenMembers={openMembersScreenFromMenu}
        onOpenHistory={openHistoryScreenFromMenu}
        onJoinQueue={handleJoinQueueShortcut}
        onCloseRoom={confirmCloseRoomFromMenu}
      />

      {isOwner && !isRoomClosed ? (
        <OwnerControlPanel
          visible={isOwnerPanelVisible}
          roomName={room.roomName}
          roomCode={room.roomCode}
          peopleCount={members.length}
          waitingCount={waitingQueue.length}
          currentOnStage={currentOnStage}
          currentOnStageMember={currentOnStageMember}
          nextQueueItem={nextQueueItem}
          nextQueueMember={nextQueueMember}
          isCopyingInvite={isCopyingInvite}
          isChangingQueue={isChangingQueue}
          isClosingRoom={isClosingRoom}
          onDismiss={handleOwnerPanelDismiss}
          onCopyCode={handleCopyCode}
          onCopyInvite={handleCopyInvite}
          onAddManualQueueItem={(name) =>
            runQueueAction(() => ownerAddManualQueueItem(room.roomId, room.memberId, name))
          }
          onFinishCurrentTurn={
            currentOnStage
              ? () => confirmOwnerFinishQueueItem(currentOnStage)
              : undefined
          }
          onViewQueue={() => handleOwnerPanelShortcut('queue')}
          onViewMembers={() => handleOwnerPanelShortcut('members')}
          onViewHistory={() => handleOwnerPanelShortcut('history')}
          onCloseRoom={handleCloseRoom}
        />
      ) : null}

      <RoomModalScreen
        visible={isMembersScreenVisible}
        eyebrow="Pessoas"
        title="Membros da sala"
        onDismiss={handleMembersScreenDismiss}
      >
        {membersScreenCard}
      </RoomModalScreen>

      <RoomModalScreen
        visible={isHistoryScreenVisible}
        eyebrow="Memória da noite"
        title="Histórico"
        onDismiss={handleHistoryScreenDismiss}
      >
        {historyScreenCard}
      </RoomModalScreen>

      {dialogState ? (
        <AppDialog
          visible
          eyebrow={dialogState.eyebrow}
          title={dialogState.title}
          message={dialogState.message}
          variant={dialogState.variant}
          actions={dialogState.actions}
          onDismiss={closeDialog}
        />
      ) : null}
    </>
  );
}
