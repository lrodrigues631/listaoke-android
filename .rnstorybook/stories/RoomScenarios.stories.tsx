import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import {
  buildMembersById,
  emptySummary,
  finalSummary,
  formatMockMessage,
  formatMockTime,
  fullMembers,
  guestWaitingQueue,
  meOnStageQueue,
  ownerQueue,
  roomScenarioEvents,
  type QueueMoveDirection,
} from '../../src/storybook/mocks/roomMocks';
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

  const membersById = buildMembersById(members);
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
    events: roomScenarioEvents,
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
    events: roomScenarioEvents,
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
    events: roomScenarioEvents,
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
    events: roomScenarioEvents,
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
    events: roomScenarioEvents,
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
    events: roomScenarioEvents,
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
    events: roomScenarioEvents,
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