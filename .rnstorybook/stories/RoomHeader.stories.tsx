import type { Meta, StoryObj } from '@storybook/react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { RoomHeader } from '../../src/views/components/room/RoomHeader';

const meta = {
  title: 'Room/RoomHeader',
  component: RoomHeader,
  decorators: [
    (Story) => (
      <StorybookScreen>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: {
    roomName: 'Noite do Karaoke',
    roomCode: '0427',
    roomStatus: 'open',
    canJoinQueue: true,
    onOpenMenu: () => console.log('Menu aberto no Storybook'),
    onJoinQueue: () => console.log('Entrar na fila no Storybook'),
  },
  argTypes: {
    roomName: {
      control: 'text',
    },
    roomCode: {
      control: 'text',
    },
    roomStatus: {
      control: 'select',
      options: ['open', 'closed'],
    },
    statusLabel: {
      control: 'text',
    },
    isRoomClosed: {
      control: 'boolean',
    },
    isOwner: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof RoomHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  name: 'Convidado',
  args: {
    roomName: 'Noite do Karaoke',
    roomCode: '0427',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
    isRoomClosed: false,
    isOwner: false,
    canJoinQueue: true,
    onOpenMenu: () => console.log('Mock: abrir menu'),
    onJoinQueue: () => console.log('Mock: entrar na fila'),
  },
};

export const Owner: Story = {
  name: 'Dono',
  args: {
    roomName: 'Sextou no Microfone',
    roomCode: 'CANTA7',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
    isRoomClosed: false,
    isOwner: true,
    canJoinQueue: true,
    onOpenMenu: () => console.log('Mock: abrir menu'),
    onJoinQueue: () => console.log('Mock: entrar na fila'),
  },
};

export const ShortCode: Story = {
  name: 'Codigo curto',
  args: {
    roomName: 'Sala da turma',
    roomCode: '8421',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
    isOwner: true,
    canJoinQueue: false,
    onOpenMenu: () => console.log('Mock: abrir menu'),
  },
};

export const LongRoomName: Story = {
  name: 'Nome de sala grande',
  args: {
    roomName: 'Aniversario da Firma com Pagode, Sertanejo e Classicos Duvidosos',
    roomCode: 'FESTA9',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
    isOwner: true,
    canJoinQueue: true,
    onOpenMenu: () => console.log('Mock: abrir menu'),
    onJoinQueue: () => console.log('Mock: entrar na fila'),
  },
};

export const ClosedRoom: Story = {
  name: 'Sala encerrada',
  args: {
    roomName: 'Noite do Karaoke',
    roomCode: '0427',
    roomStatus: 'closed',
    statusLabel: 'Sala encerrada',
    isRoomClosed: true,
    isOwner: true,
    onOpenMenu: () => console.log('Mock: abrir menu'),
  },
};
