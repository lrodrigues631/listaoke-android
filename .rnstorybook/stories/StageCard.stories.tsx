import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import type { QueueItem } from '../../src/types/queueTypes';
import type { RoomMember } from '../../src/types/roomTypes';
import { StageCard } from '../../src/views/components/room/StageCard';

function createQueueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: 'queue-item-1',
    room_id: 'room-1',
    member_id: 'member-1',
    position: 1,
    status: 'on_stage',
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

const defaultQueueItem = createQueueItem();
const defaultMember = createMember();

const mockActions = {
  onFinishTurn: () => console.log('Mock: concluir e voltar ao fim'),
  onSkipTurn: () => console.log('Mock: pular vez'),
  onStopSinging: () => console.log('Mock: parar de cantar'),
  onOwnerFinishTurn: (item: QueueItem) => console.log('Mock dono: concluir vez', item),
  onOwnerSkipTurn: (item: QueueItem) => console.log('Mock dono: pular vez', item),
  onOwnerRemoveFromStage: (item: QueueItem) => console.log('Mock dono: remover do palco', item),
};

const baseArgs = {
  currentOnStage: null,
  currentOnStageMember: null,
  isLoadingRoom: false,
  isLoadingQueue: false,
  isRoomClosed: false,
  isMeOnStage: false,
  isOwner: false,
  isChangingQueue: false,
  wasRemovedFromRoom: false,
  ...mockActions,
};

const meta = {
  title: 'Room/StageCard',
  component: StageCard,
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
    isLoadingRoom: {
      control: 'boolean',
    },
    isLoadingQueue: {
      control: 'boolean',
    },
    isRoomClosed: {
      control: 'boolean',
    },
    isMeOnStage: {
      control: 'boolean',
    },
    isOwner: {
      control: 'boolean',
    },
    isChangingQueue: {
      control: 'boolean',
    },
    wasRemovedFromRoom: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof StageCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyStage: Story = {
  name: 'Palco vazio',
  args: {
    ...baseArgs,
    currentOnStage: null,
    currentOnStageMember: null,
  },
};

export const SomeoneSinging: Story = {
  name: 'Alguém cantando',
  args: {
    ...baseArgs,
    currentOnStage: defaultQueueItem,
    currentOnStageMember: createMember({
      id: 'member-ana',
      member_id: 'member-ana',
      name: 'Ana',
    } as Partial<RoomMember>),
  },
};

export const MeSinging: Story = {
  name: 'Usuário atual cantando',
  args: {
    ...baseArgs,
    currentOnStage: createQueueItem({
      id: 'queue-me',
      member_id: 'member-me',
    }),
    currentOnStageMember: createMember({
      id: 'member-me',
      member_id: 'member-me',
      name: 'Você',
    } as Partial<RoomMember>),
    isMeOnStage: true,
  },
};

export const OwnerWatchingSomeoneSinging: Story = {
  name: 'Dono vendo outra pessoa cantar',
  args: {
    ...baseArgs,
    currentOnStage: createQueueItem({
      id: 'queue-bruno',
      member_id: 'member-bruno',
    }),
    currentOnStageMember: createMember({
      id: 'member-bruno',
      member_id: 'member-bruno',
      name: 'Bruno',
    } as Partial<RoomMember>),
    isOwner: true,
  },
};

export const ManualSingerOnStage: Story = {
  name: 'Pessoa adicionada pelo dono',
  args: {
    ...baseArgs,
    currentOnStage: createQueueItem({
      id: 'queue-manual',
      member_id: 'manual-singer-1',
    }),
    currentOnStageMember: createMember({
      id: 'manual-singer-1',
      member_id: 'manual-singer-1',
      name: 'Carlos sem app',
      is_manual: true,
    } as Partial<RoomMember>),
    isOwner: true,
  },
};

export const Loading: Story = {
  name: 'Carregando palco',
  args: {
    ...baseArgs,
    isLoadingRoom: true,
    isLoadingQueue: true,
  },
};

export const ChangingQueue: Story = {
  name: 'Alterando fila',
  args: {
    ...baseArgs,
    currentOnStage: createQueueItem({
      id: 'queue-me-loading',
      member_id: 'member-me',
    }),
    currentOnStageMember: createMember({
      id: 'member-me',
      member_id: 'member-me',
      name: 'Você',
    } as Partial<RoomMember>),
    isMeOnStage: true,
    isChangingQueue: true,
  },
};

export const ClosedRoom: Story = {
  name: 'Sala encerrada',
  args: {
    ...baseArgs,
    currentOnStage: defaultQueueItem,
    currentOnStageMember: defaultMember,
    isRoomClosed: true,
  },
};

export const AllStageStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <StageCard {...baseArgs} currentOnStage={null} currentOnStageMember={null} />

      <StageCard
        {...baseArgs}
        currentOnStage={defaultQueueItem}
        currentOnStageMember={createMember({
          name: 'Ana',
        } as Partial<RoomMember>)}
      />

      <StageCard
        {...baseArgs}
        currentOnStage={createQueueItem({
          id: 'queue-me',
          member_id: 'member-me',
        })}
        currentOnStageMember={createMember({
          id: 'member-me',
          member_id: 'member-me',
          name: 'Você',
        } as Partial<RoomMember>)}
        isMeOnStage
      />

      <StageCard
        {...baseArgs}
        currentOnStage={createQueueItem({
          id: 'queue-owner-view',
          member_id: 'member-bruno',
        })}
        currentOnStageMember={createMember({
          id: 'member-bruno',
          member_id: 'member-bruno',
          name: 'Bruno',
        } as Partial<RoomMember>)}
        isOwner
      />

      <StageCard
        {...baseArgs}
        currentOnStage={defaultQueueItem}
        currentOnStageMember={defaultMember}
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