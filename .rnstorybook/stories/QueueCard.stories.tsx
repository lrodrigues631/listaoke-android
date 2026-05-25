import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import {
  buildMembersById,
  fullMembers,
  multiplePeopleQueue,
  onePersonQueue,
  ownerQueue,
  type QueueMoveDirection,
} from '../../src/storybook/mocks/roomMocks';
import type { QueueItem } from '../../src/types/queueTypes';
import { QueueCard } from '../../src/views/components/room/QueueCard';

const membersById = buildMembersById(fullMembers);

const queueWithManualPerson = multiplePeopleQueue.filter(
  (item) => item.member_id === 'member-ana' || item.member_id === 'member-manual'
);

const mockActions = {
  onOwnerAddManualQueueItem: (name: string) =>
    console.log('Mock dono: adicionar pessoa sem app', name),

  onOwnerMoveQueueItem: (item: QueueItem, direction: QueueMoveDirection) =>
    console.log('Mock dono: mover item da fila', item, direction),

  onOwnerRemoveQueueItem: (item: QueueItem) =>
    console.log('Mock dono: remover item da fila', item),
};

const baseArgs = {
  waitingQueue: [],
  membersById,
  currentMemberId: 'member-current',
  isLoadingQueue: false,
  queueError: null,
  isRoomClosed: false,
  isOwner: false,
  isChangingQueue: false,
  ...mockActions,
};

const meta = {
  title: 'Room/QueueCard',
  component: QueueCard,
  decorators: [
    (Story) => (
      <StorybookScreen>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: baseArgs,
  argTypes: {
    isLoadingQueue: {
      control: 'boolean',
    },
    queueError: {
      control: 'text',
    },
    isRoomClosed: {
      control: 'boolean',
    },
    isOwner: {
      control: 'boolean',
    },
    isChangingQueue: {
      control: 'boolean',
    },
    currentMemberId: {
      control: 'text',
    },
  },
} satisfies Meta<typeof QueueCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyQueue: Story = {
  name: 'Fila vazia',
  args: {
    ...baseArgs,
    waitingQueue: [],
    isOwner: false,
  },
};

export const EmptyQueueAsOwner: Story = {
  name: 'Fila vazia como dono',
  args: {
    ...baseArgs,
    waitingQueue: [],
    isOwner: true,
  },
};

export const OnePersonQueue: Story = {
  name: 'Fila com uma pessoa',
  args: {
    ...baseArgs,
    waitingQueue: onePersonQueue,
    isOwner: false,
    currentMemberId: 'member-current',
  },
};

export const MultiplePeopleAsGuest: Story = {
  name: 'Fila com várias pessoas como convidado',
  args: {
    ...baseArgs,
    waitingQueue: multiplePeopleQueue,
    isOwner: false,
    currentMemberId: 'member-current',
  },
};

export const MultiplePeopleAsOwner: Story = {
  name: 'Fila com várias pessoas como dono',
  args: {
    ...baseArgs,
    waitingQueue: ownerQueue.filter((item) => item.status === 'waiting'),
    isOwner: true,
    currentMemberId: 'member-owner',
  },
};

export const QueueWithManualPerson: Story = {
  name: 'Fila com pessoa sem app',
  args: {
    ...baseArgs,
    waitingQueue: queueWithManualPerson,
    isOwner: true,
    currentMemberId: 'member-owner',
  },
};

export const Loading: Story = {
  name: 'Loading',
  args: {
    ...baseArgs,
    waitingQueue: [],
    isLoadingQueue: true,
  },
};

export const ErrorState: Story = {
  name: 'Erro',
  args: {
    ...baseArgs,
    waitingQueue: [],
    queueError: 'Não foi possível carregar a fila. Tenta de novo em instantes.',
  },
};

export const ClosedRoom: Story = {
  name: 'Sala encerrada',
  args: {
    ...baseArgs,
    waitingQueue: [],
    isRoomClosed: true,
  },
};

export const OwnerChangingQueue: Story = {
  name: 'Dono alterando fila',
  args: {
    ...baseArgs,
    waitingQueue: ownerQueue.filter((item) => item.status === 'waiting'),
    isOwner: true,
    isChangingQueue: true,
    currentMemberId: 'member-owner',
  },
};

export const AllQueueStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <QueueCard
        {...baseArgs}
        waitingQueue={[]}
      />

      <QueueCard
        {...baseArgs}
        waitingQueue={onePersonQueue}
        currentMemberId="member-current"
      />

      <QueueCard
        {...baseArgs}
        waitingQueue={multiplePeopleQueue}
        currentMemberId="member-current"
      />

      <QueueCard
        {...baseArgs}
        waitingQueue={ownerQueue.filter((item) => item.status === 'waiting')}
        isOwner
        currentMemberId="member-owner"
      />

      <QueueCard
        {...baseArgs}
        waitingQueue={[]}
        isLoadingQueue
      />

      <QueueCard
        {...baseArgs}
        waitingQueue={[]}
        queueError="Não foi possível carregar a fila. Tenta de novo em instantes."
      />

      <QueueCard
        {...baseArgs}
        waitingQueue={[]}
        isRoomClosed
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
});