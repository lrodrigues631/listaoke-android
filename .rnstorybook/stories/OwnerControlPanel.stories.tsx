import type { Meta, StoryObj } from '@storybook/react-native';

import {
  anaMember,
  brunoMember,
  fullMembers,
  ownerQueue,
} from '../../src/storybook/mocks/roomMocks';
import { OwnerControlPanel } from '../../src/views/components/room/OwnerControlPanel';

const currentOnStage = ownerQueue.find((item) => item.status === 'on_stage') ?? null;
const waitingQueue = ownerQueue.filter((item) => item.status === 'waiting');

const baseArgs = {
  visible: true,
  roomName: 'Noite do Karaoke',
  roomCode: '5419',
  peopleCount: fullMembers.length,
  waitingCount: waitingQueue.length,
  currentOnStage,
  currentOnStageMember: anaMember,
  nextQueueItem: waitingQueue[0] ?? null,
  nextQueueMember: brunoMember,
  isCopyingInvite: false,
  isChangingQueue: false,
  isClosingRoom: false,
  onDismiss: () => console.log('Mock: fechar painel'),
  onCopyCode: () => console.log('Mock: copiar codigo'),
  onCopyInvite: () => console.log('Mock: compartilhar convite'),
  onAddManualQueueItem: (name: string) => console.log('Mock: adicionar cantor', name),
  onFinishCurrentTurn: () => console.log('Mock: finalizar vez'),
  onCallNext: () => console.log('Mock: chamar proximo'),
  onViewQueue: () => console.log('Mock: ver fila'),
  onViewMembers: () => console.log('Mock: ver membros'),
  onViewHistory: () => console.log('Mock: ver historico'),
  onCloseRoom: () => console.log('Mock: encerrar sala'),
};

const meta = {
  title: 'Room/OwnerControlPanel',
  component: OwnerControlPanel,
  args: baseArgs,
  argTypes: {
    peopleCount: {
      control: 'number',
    },
    waitingCount: {
      control: 'number',
    },
    isCopyingInvite: {
      control: 'boolean',
    },
    isChangingQueue: {
      control: 'boolean',
    },
    isClosingRoom: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof OwnerControlPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSingerOnStage: Story = {
  name: 'Com pessoa no palco',
  args: {
    ...baseArgs,
  },
};

export const WithoutSingerOnStage: Story = {
  name: 'Sem pessoa no palco',
  args: {
    ...baseArgs,
    currentOnStage: null,
    currentOnStageMember: null,
    onFinishCurrentTurn: undefined,
  },
};

export const EmptyQueue: Story = {
  name: 'Fila vazia',
  args: {
    ...baseArgs,
    waitingCount: 0,
    nextQueueItem: null,
    nextQueueMember: null,
    onCallNext: undefined,
  },
};

export const FullQueue: Story = {
  name: 'Fila cheia',
  args: {
    ...baseArgs,
    waitingCount: 8,
  },
};

export const CloseRoomConfirmation: Story = {
  name: 'Confirmacao de encerrar sala',
  args: {
    ...baseArgs,
    initialView: 'closeRoom',
  },
};
