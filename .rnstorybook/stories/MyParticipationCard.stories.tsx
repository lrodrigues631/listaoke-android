import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import { MyParticipationCard } from '../../src/views/components/room/MyParticipationCard';

const mockActions = {
  onFinishTurn: () => console.log('Mock: concluir vez'),
  onSkipTurn: () => console.log('Mock: pular vez'),
  onStopSinging: () => console.log('Mock: parar de cantar'),
  onMoveTurnDown: () => console.log('Mock: adiar minha vez'),
  onLeaveQueue: () => console.log('Mock: sair da fila'),
  onJoinQueue: () => console.log('Mock: entrar na fila'),
};

const baseArgs = {
  isRoomClosed: false,
  wasRemovedFromRoom: false,
  isMeOnStage: false,
  isMeWaiting: false,
  queuePosition: null,
  isChangingQueue: false,
  canMoveMyTurnDown: true,
  ...mockActions,
};

const meta = {
  title: 'Room/MyParticipationCard',
  component: MyParticipationCard,
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
    isRoomClosed: {
      control: 'boolean',
    },
    wasRemovedFromRoom: {
      control: 'boolean',
    },
    isMeOnStage: {
      control: 'boolean',
    },
    isMeWaiting: {
      control: 'boolean',
    },
    queuePosition: {
      control: 'number',
    },
    isChangingQueue: {
      control: 'boolean',
    },
    canMoveMyTurnDown: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MyParticipationCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OutsideQueue: Story = {
  name: 'Usuário fora da fila',
  args: {
    ...baseArgs,
    isMeWaiting: false,
    isMeOnStage: false,
    queuePosition: null,
  },
};

export const WaitingFirstPosition: Story = {
  name: 'Usuário esperando em primeiro',
  args: {
    ...baseArgs,
    isMeWaiting: true,
    isMeOnStage: false,
    queuePosition: 1,
    canMoveMyTurnDown: true,
  },
};

export const WaitingMiddlePosition: Story = {
  name: 'Usuário esperando no meio da fila',
  args: {
    ...baseArgs,
    isMeWaiting: true,
    isMeOnStage: false,
    queuePosition: 4,
    canMoveMyTurnDown: true,
  },
};

export const WaitingCannotMoveDown: Story = {
  name: 'Usuário esperando sem poder adiar',
  args: {
    ...baseArgs,
    isMeWaiting: true,
    isMeOnStage: false,
    queuePosition: 1,
    canMoveMyTurnDown: false,
  },
};

export const OnStage: Story = {
  name: 'Usuário no palco',
  args: {
    ...baseArgs,
    isMeOnStage: true,
    isMeWaiting: false,
    queuePosition: null,
  },
};

export const RemovedFromRoom: Story = {
  name: 'Usuário removido',
  args: {
    ...baseArgs,
    wasRemovedFromRoom: true,
    isMeWaiting: false,
    isMeOnStage: false,
    queuePosition: null,
  },
};

export const ClosedRoom: Story = {
  name: 'Sala fechada',
  args: {
    ...baseArgs,
    isRoomClosed: true,
    isMeWaiting: true,
    isMeOnStage: false,
    queuePosition: 2,
  },
};

export const ChangingQueueOutside: Story = {
  name: 'Entrando na fila com loading',
  args: {
    ...baseArgs,
    isChangingQueue: true,
    isMeWaiting: false,
    isMeOnStage: false,
    queuePosition: null,
  },
};

export const ChangingQueueWaiting: Story = {
  name: 'Alterando posição com loading',
  args: {
    ...baseArgs,
    isChangingQueue: true,
    isMeWaiting: true,
    isMeOnStage: false,
    queuePosition: 3,
    canMoveMyTurnDown: true,
  },
};

export const AllParticipationStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <MyParticipationCard {...baseArgs} />

      <MyParticipationCard
        {...baseArgs}
        isMeWaiting
        queuePosition={1}
        canMoveMyTurnDown={false}
      />

      <MyParticipationCard
        {...baseArgs}
        isMeWaiting
        queuePosition={4}
        canMoveMyTurnDown
      />

      <MyParticipationCard
        {...baseArgs}
        isMeOnStage
      />

      <MyParticipationCard
        {...baseArgs}
        wasRemovedFromRoom
      />

      <MyParticipationCard
        {...baseArgs}
        isRoomClosed
        isMeWaiting
        queuePosition={2}
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