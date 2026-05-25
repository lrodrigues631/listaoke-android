import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import type { QueueItem } from '../../src/types/queueTypes';
import type { RoomMember } from '../../src/types/roomTypes';
import { QueueCard } from '../../src/views/components/room/QueueCard';

type QueueMoveDirection = 'up' | 'down';

function createQueueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: 'queue-item-1',
    room_id: 'room-1',
    member_id: 'member-1',
    position: 1,
    status: 'waiting',
    created_at: '2026-05-25T12:00:00.000Z',
    updated_at: '2026-05-25T12:00:00.000Z',
    ...overrides,
  } as QueueItem;
}

function createMember(overrides: Partial<RoomMember> = {}): RoomMember {
  return {
    id: 'member-1',
    room_id: 'room-1',
    name: 'Ana',
    role: 'guest',
    is_owner: false,
    is_manual: false,
    created_at: '2026-05-25T12:00:00.000Z',
    updated_at: '2026-05-25T12:00:00.000Z',
    ...overrides,
  } as RoomMember;
}

const membersById: Record<string, RoomMember> = {
  'member-owner': createMember({
    id: 'member-owner',
    name: 'Leandro',
    role: 'owner',
    is_owner: true,
  }),

  'member-current': createMember({
    id: 'member-current',
    name: 'Você',
    role: 'guest',
  }),

  'member-ana': createMember({
    id: 'member-ana',
    name: 'Ana',
    role: 'guest',
  }),

  'member-bruno': createMember({
    id: 'member-bruno',
    name: 'Bruno',
    role: 'guest',
  }),

  'member-carla': createMember({
    id: 'member-carla',
    name: 'Carla',
    role: 'guest',
  }),

  'member-manual': createMember({
    id: 'member-manual',
    name: 'Carlos sem app',
    role: 'guest',
    is_manual: true,
  }),
};

const onePersonQueue: QueueItem[] = [
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 1,
  }),
];

const multiplePeopleQueue: QueueItem[] = [
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 1,
  }),
  createQueueItem({
    id: 'queue-ana',
    member_id: 'member-ana',
    position: 2,
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 3,
  }),
  createQueueItem({
    id: 'queue-manual',
    member_id: 'member-manual',
    position: 4,
  }),
];

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
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.preview}>
          <Story />
        </View>
      </ScrollView>
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
    waitingQueue: multiplePeopleQueue,
    isOwner: true,
    currentMemberId: 'member-owner',
  },
};

export const QueueWithManualPerson: Story = {
  name: 'Fila com pessoa sem app',
  args: {
    ...baseArgs,
    waitingQueue: [
      createQueueItem({
        id: 'queue-ana',
        member_id: 'member-ana',
        position: 1,
      }),
      createQueueItem({
        id: 'queue-manual',
        member_id: 'member-manual',
        position: 2,
      }),
    ],
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
    waitingQueue: multiplePeopleQueue,
    isOwner: true,
    isChangingQueue: true,
    currentMemberId: 'member-owner',
  },
};

export const AllQueueStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <QueueCard {...baseArgs} waitingQueue={[]} />

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
        waitingQueue={multiplePeopleQueue}
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
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  preview: {
    backgroundColor: colors.background,
  },
  stack: {
    gap: 16,
  },
});