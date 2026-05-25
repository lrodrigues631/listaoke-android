import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import type { RoomEvent, RoomSummary } from '../../src/types/eventTypes';
import type { QueueItem } from '../../src/types/queueTypes';
import type { RoomMember } from '../../src/types/roomTypes';
import { AdminCard } from '../../src/views/components/room/AdminCard';
import { FinalSummaryCard } from '../../src/views/components/room/FinalSummaryCard';
import { HistoryPreviewCard } from '../../src/views/components/room/HistoryPreviewCard';
import { MembersCard } from '../../src/views/components/room/MembersCard';
import { MyParticipationCard } from '../../src/views/components/room/MyParticipationCard';
import { QueueCard } from '../../src/views/components/room/QueueCard';
import { RoomHeader } from '../../src/views/components/room/RoomHeader';
import { StageCard } from '../../src/views/components/room/StageCard';
import { roomStyles } from '../../src/views/components/room/roomStyles';
import { AppButton } from '../../src/views/components/ui/AppButton';

type QueueMoveDirection = 'up' | 'down';

type RoomScenarioProps = {
  title: string;
  roomStatus: 'open' | 'closed';
  currentMemberId: string;
  isOwner: boolean;
  wasRemovedFromRoom?: boolean;
  currentOnStage: QueueItem | null;
  queueItems: QueueItem[];
  members: RoomMember[];
  events: RoomEvent[];
  summary: RoomSummary;
  isLoading?: boolean;
  roomError?: string | null;
  queueError?: string | null;
  membersError?: string | null;
  eventsError?: string | null;
  summaryError?: string | null;
};

function createMember(overrides: Partial<RoomMember> = {}): RoomMember {
  return {
    id: 'member-1',
    room_id: 'room-1',
    name: 'Ana',
    role: 'guest',
    is_owner: false,
    is_manual: false,
    created_at: '2026-05-25T21:00:00.000Z',
    updated_at: '2026-05-25T21:00:00.000Z',
    ...overrides,
  } as RoomMember;
}

function createQueueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: 'queue-item-1',
    room_id: 'room-1',
    member_id: 'member-1',
    position: 1,
    status: 'waiting',
    created_at: '2026-05-25T21:00:00.000Z',
    updated_at: '2026-05-25T21:00:00.000Z',
    ...overrides,
  } as QueueItem;
}

type MockRoomEvent = RoomEvent & {
  message?: string;
};

function createEvent(overrides: Partial<MockRoomEvent> = {}): RoomEvent {
  return {
    id: 'event-1',
    room_id: 'room-1',
    event_type: 'mock_event',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
    payload: {},
    ...overrides,
  } as unknown as RoomEvent;
}

function createSummary(overrides: Partial<RoomSummary> = {}): RoomSummary {
  return {
    total_performances: 0,
    total_skips: 0,
    total_queue_exits: 0,
    total_removals: 0,
    total_participants: 0,
    ranking: [],
    ...overrides,
  } as RoomSummary;
}

const ownerMember = createMember({
  id: 'member-owner',
  name: 'Leandro',
  role: 'owner',
  is_owner: true,
});

const currentMember = createMember({
  id: 'member-current',
  name: 'Você',
  role: 'guest',
});

const anaMember = createMember({
  id: 'member-ana',
  name: 'Ana',
  role: 'guest',
});

const brunoMember = createMember({
  id: 'member-bruno',
  name: 'Bruno',
  role: 'guest',
});

const carlaMember = createMember({
  id: 'member-carla',
  name: 'Carla',
  role: 'guest',
});

const manualMember = createMember({
  id: 'member-manual',
  name: 'Carlos sem app',
  role: 'guest',
  is_manual: true,
});

const fullMembers = [
  ownerMember,
  currentMember,
  anaMember,
  brunoMember,
  carlaMember,
  manualMember,
];

const guestWaitingQueue = [
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-ana',
    member_id: 'member-ana',
    position: 2,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 3,
    status: 'waiting',
  }),
];

const ownerQueue = [
  createQueueItem({
    id: 'queue-stage',
    member_id: 'member-ana',
    position: 0,
    status: 'on_stage',
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 2,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-manual',
    member_id: 'member-manual',
    position: 3,
    status: 'waiting',
  }),
];

const meOnStageQueue = [
  createQueueItem({
    id: 'queue-current-stage',
    member_id: 'member-current',
    position: 0,
    status: 'on_stage',
  }),
  createQueueItem({
    id: 'queue-ana',
    member_id: 'member-ana',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 2,
    status: 'waiting',
  }),
];

const recentEvents = [
  createEvent({
    id: 'event-1',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
  }),
  createEvent({
    id: 'event-2',
    created_at: '2026-05-25T21:04:00.000Z',
    message: 'Bruno começou a cantar.',
  }),
  createEvent({
    id: 'event-3',
    created_at: '2026-05-25T21:08:00.000Z',
    message: 'Você entrou na fila.',
  }),
  createEvent({
    id: 'event-4',
    created_at: '2026-05-25T21:12:00.000Z',
    message: 'Carlos sem app foi adicionado pelo dono.',
  }),
];

const finalSummary = createSummary({
  total_performances: 9,
  total_participants: 5,
  total_skips: 2,
  total_queue_exits: 1,
  total_removals: 1,
  ranking: [
    {
      member_id: 'member-ana',
      name: 'Ana',
      performances: 3,
    },
    {
      member_id: 'member-bruno',
      name: 'Bruno',
      performances: 2,
    },
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 2,
    },
    {
      member_id: 'member-carla',
      name: 'Carla',
      performances: 2,
    },
  ],
});

const emptySummary = createSummary();

const mockActions = {
  onBackHome: () => console.log('Mock: voltar para início'),
  onCopyCode: () => console.log('Mock: copiar código'),
  onCopyInvite: () => console.log('Mock: copiar convite'),
  onCloseRoom: () => console.log('Mock: fechar sala'),
  onFinishTurn: () => console.log('Mock: concluir vez'),
  onSkipTurn: () => console.log('Mock: pular vez'),
  onStopSinging: () => console.log('Mock: parar de cantar'),
  onMoveTurnDown: () => console.log('Mock: adiar minha vez'),
  onLeaveQueue: () => console.log('Mock: sair da fila'),
  onJoinQueue: () => console.log('Mock: entrar na fila'),
  onTransferOwnership: (member: RoomMember) =>
    console.log('Mock: transferir dono para', member),
  onRemoveMember: (member: RoomMember) =>
    console.log('Mock: remover membro', member),
  onOwnerAddManualQueueItem: (name: string) =>
    console.log('Mock: adicionar pessoa sem app', name),
  onOwnerMoveQueueItem: (item: QueueItem, direction: QueueMoveDirection) =>
    console.log('Mock: mover item', item, direction),
  onOwnerRemoveQueueItem: (item: QueueItem) =>
    console.log('Mock: remover item da fila', item),
  onOwnerFinishTurn: (item: QueueItem) =>
    console.log('Mock: concluir vez do participante', item),
  onOwnerSkipTurn: (item: QueueItem) =>
    console.log('Mock: pular vez do participante', item),
  onOwnerRemoveFromStage: (item: QueueItem) =>
    console.log('Mock: remover do palco', item),
};

function formatMockMessage(event: RoomEvent): string {
  const mockEvent = event as MockRoomEvent;

  return mockEvent.message ?? 'Evento registrado na sala.';
}

function formatMockTime(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function RoomScenario({
  title,
  roomStatus,
  currentMemberId,
  isOwner,
  wasRemovedFromRoom = false,
  currentOnStage,
  queueItems,
  members,
  events,
  summary,
  isLoading = false,
  roomError = null,
  queueError = null,
  membersError = null,
  eventsError = null,
  summaryError = null,
}: RoomScenarioProps) {
  const isRoomClosed = roomStatus === 'closed';

  const membersById = members.reduce<Record<string, RoomMember>>((accumulator, member) => {
    accumulator[member.id] = member;
    return accumulator;
  }, {});

  const waitingQueue = queueItems.filter((item) => item.status === 'waiting');
  const currentOnStageMember = currentOnStage ? membersById[currentOnStage.member_id] : null;
  const myQueueItem = queueItems.find((item) => item.member_id === currentMemberId) ?? null;

  const isMeOnStage = myQueueItem?.status === 'on_stage';
  const isMeWaiting = myQueueItem?.status === 'waiting';
  const myWaitingQueueIndex = waitingQueue.findIndex((item) => item.member_id === currentMemberId);
  const myQueuePosition = myWaitingQueueIndex >= 0 ? myWaitingQueueIndex + 1 : null;

  const canMoveMyTurnDown =
    isMeWaiting &&
    waitingQueue.length > 1 &&
    waitingQueue[waitingQueue.length - 1]?.member_id !== currentMemberId;

  const transferableMembers = members.filter(
    (member) => member.id !== currentMemberId && !member.is_manual
  );

  const removableMembers = members.filter((member) => member.id !== currentMemberId);

  const historyCard = (
    <HistoryPreviewCard
      events={events}
      isLoadingEvents={isLoading}
      eventsError={eventsError}
      isExpanded={events.length > 2}
      onToggleExpanded={() => console.log('Mock: alternar histórico')}
      formatMessage={formatMockMessage}
      formatTime={formatMockTime}
    />
  );

  const membersCard = (
    <MembersCard
      members={members}
      currentMemberId={currentMemberId}
      isLoadingMembers={isLoading}
      membersError={membersError}
      isOwner={isOwner}
      isRoomClosed={isRoomClosed}
      isChangingMember={false}
      onTransferOwnership={mockActions.onTransferOwnership}
      onRemoveMember={mockActions.onRemoveMember}
    />
  );

  return (
    <ScrollView contentContainerStyle={roomStyles.container}>
      <Text style={styles.scenarioLabel}>{title}</Text>

      <RoomHeader
        roomName="Noite do Karaokê"
        roomCode="LK82P"
        isRoomClosed={isRoomClosed}
        onCopyCode={mockActions.onCopyCode}
      />

      {roomError ? <Text style={roomStyles.errorText}>{roomError}</Text> : null}

      {isRoomClosed ? (
        <>
          <FinalSummaryCard
            summary={summary}
            isLoadingSummary={isLoading}
            summaryError={summaryError}
          />

          {historyCard}
          {membersCard}
        </>
      ) : (
        <>
          {wasRemovedFromRoom ? (
            <View style={roomStyles.closedBanner}>
              <Text style={roomStyles.closedTitle}>Você não está mais nesta sala.</Text>
              <Text style={roomStyles.closedText}>
                O dono removeu sua participação. Para voltar, só entrando de novo se a sala ainda
                estiver aberta.
              </Text>
            </View>
          ) : null}

          <StageCard
            currentOnStage={currentOnStage}
            currentOnStageMember={currentOnStageMember}
            isLoadingRoom={isLoading}
            isLoadingQueue={isLoading}
            isRoomClosed={isRoomClosed}
            isMeOnStage={isMeOnStage}
            isOwner={isOwner}
            isChangingQueue={false}
            wasRemovedFromRoom={wasRemovedFromRoom}
            onFinishTurn={mockActions.onFinishTurn}
            onSkipTurn={mockActions.onSkipTurn}
            onStopSinging={mockActions.onStopSinging}
            onOwnerFinishTurn={mockActions.onOwnerFinishTurn}
            onOwnerSkipTurn={mockActions.onOwnerSkipTurn}
            onOwnerRemoveFromStage={mockActions.onOwnerRemoveFromStage}
          />

          <MyParticipationCard
            isRoomClosed={isRoomClosed}
            wasRemovedFromRoom={wasRemovedFromRoom}
            isMeOnStage={isMeOnStage}
            isMeWaiting={isMeWaiting}
            queuePosition={myQueuePosition}
            isChangingQueue={false}
            canMoveMyTurnDown={canMoveMyTurnDown}
            onFinishTurn={mockActions.onFinishTurn}
            onSkipTurn={mockActions.onSkipTurn}
            onStopSinging={mockActions.onStopSinging}
            onMoveTurnDown={mockActions.onMoveTurnDown}
            onLeaveQueue={mockActions.onLeaveQueue}
            onJoinQueue={mockActions.onJoinQueue}
          />

          {isOwner ? (
            <AdminCard
              transferableCount={transferableMembers.length}
              removableCount={removableMembers.length}
              isCopyingInvite={false}
              isClosingRoom={false}
              onCopyInvite={mockActions.onCopyInvite}
              onCloseRoom={mockActions.onCloseRoom}
            />
          ) : null}

          <QueueCard
            waitingQueue={waitingQueue}
            membersById={membersById}
            currentMemberId={currentMemberId}
            isLoadingQueue={isLoading}
            queueError={queueError}
            isRoomClosed={isRoomClosed}
            isOwner={isOwner}
            isChangingQueue={false}
            onOwnerAddManualQueueItem={mockActions.onOwnerAddManualQueueItem}
            onOwnerMoveQueueItem={mockActions.onOwnerMoveQueueItem}
            onOwnerRemoveQueueItem={mockActions.onOwnerRemoveQueueItem}
          />

          {membersCard}
          {historyCard}
        </>
      )}

      <View style={roomStyles.footerActions}>
        <AppButton
          title="Voltar para início"
          variant="secondary"
          onPress={mockActions.onBackHome}
        />

        {!isRoomClosed && !wasRemovedFromRoom ? (
          <AppButton
            title="Sair da sala"
            variant="dangerOutline"
            onPress={() => console.log('Mock: sair da sala')}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const meta = {
  title: 'Screens/RoomScenarios',
  component: RoomScenario,
  args: {
    title: 'Sala como convidado fora da fila',
    roomStatus: 'open',
    currentMemberId: 'member-current',
    isOwner: false,
    wasRemovedFromRoom: false,
    currentOnStage: null,
    queueItems: [],
    members: fullMembers,
    events: recentEvents,
    summary: emptySummary,
  },
} satisfies Meta<typeof RoomScenario>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GuestOutsideQueue: Story = {
  name: 'Convidado fora da fila',
  args: {
    title: 'Sala como convidado fora da fila',
    roomStatus: 'open',
    currentMemberId: 'member-current',
    isOwner: false,
    currentOnStage: null,
    queueItems: [],
    members: fullMembers,
    events: recentEvents,
    summary: emptySummary,
  },
};

export const GuestWaiting: Story = {
  name: 'Convidado esperando',
  args: {
    title: 'Sala como convidado esperando',
    roomStatus: 'open',
    currentMemberId: 'member-current',
    isOwner: false,
    currentOnStage: null,
    queueItems: guestWaitingQueue,
    members: fullMembers,
    events: recentEvents,
    summary: emptySummary,
  },
};

export const GuestOnStage: Story = {
  name: 'Usuário no palco',
  args: {
    title: 'Sala com usuário atual no palco',
    roomStatus: 'open',
    currentMemberId: 'member-current',
    isOwner: false,
    currentOnStage: meOnStageQueue[0],
    queueItems: meOnStageQueue,
    members: fullMembers,
    events: recentEvents,
    summary: emptySummary,
  },
};

export const OwnerManagingRoom: Story = {
  name: 'Dono gerenciando sala',
  args: {
    title: 'Sala como dono gerenciando fila',
    roomStatus: 'open',
    currentMemberId: 'member-owner',
    isOwner: true,
    currentOnStage: ownerQueue[0],
    queueItems: ownerQueue,
    members: fullMembers,
    events: recentEvents,
    summary: emptySummary,
  },
};

export const RemovedGuest: Story = {
  name: 'Convidado removido',
  args: {
    title: 'Sala com usuário removido',
    roomStatus: 'open',
    currentMemberId: 'member-current',
    isOwner: false,
    wasRemovedFromRoom: true,
    currentOnStage: null,
    queueItems: guestWaitingQueue.filter((item) => item.member_id !== 'member-current'),
    members: fullMembers.filter((member) => member.id !== 'member-current'),
    events: recentEvents,
    summary: emptySummary,
  },
};

export const ClosedRoom: Story = {
  name: 'Sala encerrada',
  args: {
    title: 'Sala encerrada com resumo final',
    roomStatus: 'closed',
    currentMemberId: 'member-current',
    isOwner: false,
    currentOnStage: null,
    queueItems: [],
    members: fullMembers,
    events: recentEvents,
    summary: finalSummary,
  },
};

export const LoadingRoom: Story = {
  name: 'Sala carregando',
  args: {
    title: 'Sala carregando dados',
    roomStatus: 'open',
    currentMemberId: 'member-current',
    isOwner: false,
    currentOnStage: null,
    queueItems: [],
    members: [],
    events: [],
    summary: emptySummary,
    isLoading: true,
  },
};

export const ErrorRoom: Story = {
  name: 'Sala com erros',
  args: {
    title: 'Sala com erros de carregamento',
    roomStatus: 'open',
    currentMemberId: 'member-current',
    isOwner: false,
    currentOnStage: null,
    queueItems: [],
    members: [],
    events: [],
    summary: emptySummary,
    roomError: 'Não foi possível carregar os dados da sala.',
    queueError: 'Não foi possível carregar a fila.',
    membersError: 'Não foi possível carregar os membros.',
    eventsError: 'Não foi possível carregar o histórico.',
  },
};

const styles = StyleSheet.create({
  scenarioLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
});