import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import {
  buildMembersById,
  createQueueItem,
  fullMembers,
  guestWaitingQueue,
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

const guestQueueWithCurrentInMiddle: QueueItem[] = [
  createQueueItem({
    id: 'queue-ana-middle-test',
    member_id: 'member-ana',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-current-middle-test',
    member_id: 'member-current',
    position: 2,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-bruno-middle-test',
    member_id: 'member-bruno',
    position: 3,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-manual-middle-test',
    member_id: 'member-manual',
    position: 4,
    status: 'waiting',
  }),
];

const guestQueueWithCurrentLast: QueueItem[] = [
  createQueueItem({
    id: 'queue-ana-last-test',
    member_id: 'member-ana',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-bruno-last-test',
    member_id: 'member-bruno',
    position: 2,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-current-last-test',
    member_id: 'member-current',
    position: 3,
    status: 'waiting',
  }),
];

const mockActions = {
  onOwnerAddManualQueueItem: (name: string) =>
    console.log('Mock dono: adicionar pessoa sem app', name),

  onOwnerMoveQueueItem: (item: QueueItem, direction: QueueMoveDirection) =>
    console.log('Mock dono: mover item da fila', item, direction),

  onOwnerRemoveQueueItem: (item: QueueItem) =>
    console.log('Mock dono: remover item da fila', item),

  onCurrentMemberLeaveQueue: () =>
    console.log('Mock convidado: sair da fila'),

  onCurrentMemberMoveDown: () =>
    console.log('Mock convidado: adiar minha vez pelo botão'),
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
type QueueCardStoryProps = ComponentProps<typeof QueueCard>;

function OwnerDraggableQueueExample(args: QueueCardStoryProps) {
  const [queue, setQueue] = useState(
    ownerQueue.filter((item) => item.status === 'waiting')
  );

  return (
    <QueueCard
      {...args}
      waitingQueue={queue}
      isOwner
      currentMemberId="member-owner"
      onOwnerReorderQueue={({ item, from, to, orderedItems }) => {
        console.log('Mock dono: drag reorder', {
          item,
          from,
          to,
          orderedItems,
        });

        setQueue(orderedItems);
      }}
    />
  );
}

function GuestDraggableQueueExample(args: QueueCardStoryProps) {
  const [queue, setQueue] = useState(guestWaitingQueue);

  return (
    <QueueCard
      {...args}
      waitingQueue={queue}
      isOwner={false}
      currentMemberId="member-current"
      onCurrentMemberReorderQueue={({ item, from, to, orderedItems }) => {
        console.log('Mock convidado: drag para baixo', {
          item,
          from,
          to,
          orderedItems,
        });

        if (to <= from) {
          console.log('Mock convidado: movimento inválido ignorado');
          return;
        }

        setQueue(orderedItems);
      }}
    />
  );
}

function GuestMiddleQueueExample(args: QueueCardStoryProps) {
  const [queue, setQueue] = useState(guestQueueWithCurrentInMiddle);

  return (
    <QueueCard
      {...args}
      waitingQueue={queue}
      isOwner={false}
      currentMemberId="member-current"
      onCurrentMemberReorderQueue={({ item, from, to, orderedItems }) => {
        console.log('Mock convidado no meio: tentativa de drag', {
          item,
          from,
          to,
          orderedItems,
        });

        if (to <= from) {
          console.log('Mock convidado no meio: tentativa de subir bloqueada');
          return;
        }

        setQueue(orderedItems);
      }}
    />
  );
}

function GuestLastQueueExample(args: QueueCardStoryProps) {
  const [queue] = useState(guestQueueWithCurrentLast);

  return (
    <QueueCard
      {...args}
      waitingQueue={queue}
      isOwner={false}
      currentMemberId="member-current"
      onCurrentMemberReorderQueue={({ item, from, to, orderedItems }) => {
        console.log('Mock convidado em último: não deveria arrastar', {
          item,
          from,
          to,
          orderedItems,
        });
      }}
    />
  );
}

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

export const GuestDraggableQueue: Story = {
  name: 'Convidado adiando com drag',
  render: (args) => <GuestDraggableQueueExample {...args} />,
  args: {
    ...baseArgs,
    waitingQueue: guestWaitingQueue,
    isOwner: false,
    currentMemberId: 'member-current',
  },
};

export const GuestMiddleQueue: Story = {
  name: 'Convidado no meio da fila',
  render: (args) => <GuestMiddleQueueExample {...args} />,
  args: {
    ...baseArgs,
    waitingQueue: guestQueueWithCurrentInMiddle,
    isOwner: false,
    currentMemberId: 'member-current',
  },
};

export const GuestLastInQueue: Story = {
  name: 'Convidado em último na fila',
  render: (args) => <GuestLastQueueExample {...args} />,
  args: {
    ...baseArgs,
    waitingQueue: guestQueueWithCurrentLast,
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

export const OwnerDraggableQueue: Story = {
  name: 'Dono reorganizando com drag',
  render: (args) => <OwnerDraggableQueueExample {...args} />,
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