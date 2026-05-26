import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AdminCard } from '../../src/views/components/room/AdminCard';

const baseArgs = {
  transferableCount: 2,
  removableCount: 3,
  waitingCount: 4,
  hasCurrentSinger: true,
  isChangingQueue: false,
  isCopyingInvite: false,
  isClosingRoom: false,
  onCopyInvite: () => console.log('Mock: compartilhar convite'),
  onCloseRoom: () => console.log('Mock: encerrar sala'),
  onAddManualQueueItem: (name: string) => console.log('Mock: adicionar cantor', name),
  onFinishCurrentTurn: () => console.log('Mock: finalizar vez'),
  onCallNext: () => console.log('Mock visual: chamar proximo'),
  onViewQueue: () => console.log('Mock visual: ver fila'),
  onViewMembers: () => console.log('Mock visual: ver membros'),
  onViewHistory: () => console.log('Mock visual: ver historico'),
};

const meta = {
  title: 'Room/AdminCard',
  component: AdminCard,
  decorators: [
    (Story) => (
      <StorybookScreen>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: baseArgs,
  argTypes: {
    transferableCount: {
      control: 'number',
    },
    removableCount: {
      control: 'number',
    },
    waitingCount: {
      control: 'number',
    },
    hasCurrentSinger: {
      control: 'boolean',
    },
    isChangingQueue: {
      control: 'boolean',
    },
    isCopyingInvite: {
      control: 'boolean',
    },
    isClosingRoom: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof AdminCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Padrão',
  args: {
    ...baseArgs,
  },
};

export const EmptyQueue: Story = {
  name: 'Fila vazia',
  args: {
    ...baseArgs,
    waitingCount: 0,
  },
};

export const WithSingerOnStage: Story = {
  name: 'Pessoa no palco',
  args: {
    ...baseArgs,
    hasCurrentSinger: true,
  },
};

export const WithoutSingerOnStage: Story = {
  name: 'Sem pessoa no palco',
  args: {
    ...baseArgs,
    hasCurrentSinger: false,
    onFinishCurrentTurn: undefined,
  },
};

export const AddSingerSheet: Story = {
  name: 'Bottom sheet adicionar participante',
  args: {
    ...baseArgs,
    initialSheet: 'addSinger',
  },
};

export const CloseRoomConfirm: Story = {
  name: 'Confirmação de encerrar sala',
  args: {
    ...baseArgs,
    initialSheet: 'closeRoom',
  },
};

export const LoadingPrimaryAction: Story = {
  name: 'Loading em ação principal',
  args: {
    ...baseArgs,
    isChangingQueue: true,
  },
};

export const DisabledAction: Story = {
  name: 'Ação indisponível',
  args: {
    ...baseArgs,
    waitingCount: 0,
    hasCurrentSinger: false,
    onAddManualQueueItem: undefined,
    onFinishCurrentTurn: undefined,
    onCallNext: undefined,
  },
};

export const AllAdminStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <AdminCard {...baseArgs} />

      <AdminCard {...baseArgs} waitingCount={0} />

      <AdminCard {...baseArgs} hasCurrentSinger={false} onFinishCurrentTurn={undefined} />

      <AdminCard {...baseArgs} isChangingQueue />

      <AdminCard
        {...baseArgs}
        waitingCount={0}
        hasCurrentSinger={false}
        onAddManualQueueItem={undefined}
        onFinishCurrentTurn={undefined}
        onCallNext={undefined}
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
});
