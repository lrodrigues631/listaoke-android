import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import {
  anaMember,
  brunoMember,
  createQueueItem,
  currentMember,
  manualMember,
} from '../../src/storybook/mocks/roomMocks';
import type { QueueItem } from '../../src/types/queueTypes';
import { StageCard } from '../../src/views/components/room/StageCard';

const currentOnStageItem = createQueueItem({
  id: 'queue-ana-stage',
  member_id: 'member-ana',
  status: 'on_stage',
  position: 0,
});

const meOnStageItem = createQueueItem({
  id: 'queue-current-stage',
  member_id: 'member-current',
  status: 'on_stage',
  position: 0,
});

const manualOnStageItem = createQueueItem({
  id: 'queue-manual-stage',
  member_id: 'member-manual',
  status: 'on_stage',
  position: 0,
});

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
      <StorybookScreen>
        <Story />
      </StorybookScreen>
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
    currentOnStage: currentOnStageItem,
    currentOnStageMember: anaMember,
  },
};

export const MeSinging: Story = {
  name: 'Usuário atual cantando',
  args: {
    ...baseArgs,
    currentOnStage: meOnStageItem,
    currentOnStageMember: currentMember,
    isMeOnStage: true,
  },
};

export const OwnerWatchingSomeoneSinging: Story = {
  name: 'Dono vendo outra pessoa cantar',
  args: {
    ...baseArgs,
    currentOnStage: createQueueItem({
      id: 'queue-bruno-stage',
      member_id: 'member-bruno',
      status: 'on_stage',
      position: 0,
    }),
    currentOnStageMember: brunoMember,
    isOwner: true,
  },
};

export const ManualSingerOnStage: Story = {
  name: 'Pessoa adicionada pelo dono',
  args: {
    ...baseArgs,
    currentOnStage: manualOnStageItem,
    currentOnStageMember: manualMember,
    isOwner: true,
  },
};

export const MysterySinger: Story = {
  name: 'Pessoa sem membro encontrado',
  args: {
    ...baseArgs,
    currentOnStage: createQueueItem({
      id: 'queue-mystery-stage',
      member_id: 'member-missing',
      status: 'on_stage',
      position: 0,
    }),
    currentOnStageMember: null,
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
    currentOnStage: meOnStageItem,
    currentOnStageMember: currentMember,
    isMeOnStage: true,
    isChangingQueue: true,
  },
};

export const RemovedWhileOnStage: Story = {
  name: 'Usuário removido enquanto estava no palco',
  args: {
    ...baseArgs,
    currentOnStage: meOnStageItem,
    currentOnStageMember: currentMember,
    isMeOnStage: true,
    wasRemovedFromRoom: true,
  },
};

export const ClosedRoom: Story = {
  name: 'Sala encerrada',
  args: {
    ...baseArgs,
    currentOnStage: currentOnStageItem,
    currentOnStageMember: anaMember,
    isRoomClosed: true,
  },
};

export const AllStageStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <StageCard
        {...baseArgs}
        currentOnStage={null}
        currentOnStageMember={null}
      />

      <StageCard
        {...baseArgs}
        currentOnStage={currentOnStageItem}
        currentOnStageMember={anaMember}
      />

      <StageCard
        {...baseArgs}
        currentOnStage={meOnStageItem}
        currentOnStageMember={currentMember}
        isMeOnStage
      />

      <StageCard
        {...baseArgs}
        currentOnStage={createQueueItem({
          id: 'queue-bruno-stage',
          member_id: 'member-bruno',
          status: 'on_stage',
          position: 0,
        })}
        currentOnStageMember={brunoMember}
        isOwner
      />

      <StageCard
        {...baseArgs}
        currentOnStage={manualOnStageItem}
        currentOnStageMember={manualMember}
        isOwner
      />

      <StageCard
        {...baseArgs}
        currentOnStage={currentOnStageItem}
        currentOnStageMember={anaMember}
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