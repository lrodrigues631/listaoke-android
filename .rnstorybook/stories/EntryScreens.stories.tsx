import type { Meta, StoryObj } from '@storybook/react-native';

import { HomeScreen } from '../../src/views/screens/HomeScreen';
import { CreateRoomScreen } from '../../src/views/screens/CreateRoomScreen';
import { JoinRoomScreen } from '../../src/views/screens/JoinRoomScreen';

const meta = {
  title: 'Screens/Entry',
} satisfies Meta;

export default meta;

type Story = StoryObj;

const actions = {
  onCreateRoom: () => console.log('Mock: criar sala'),
  onJoinRoom: () => console.log('Mock: entrar em sala'),
  onBack: () => console.log('Mock: voltar'),
  onCreateRoomSubmit: (roomName: string, ownerName: string) =>
    console.log('Mock: criar sala', { roomName, ownerName }),
  onJoinRoomSubmit: (roomCode: string, guestName: string) =>
    console.log('Mock: entrar na sala', { roomCode, guestName }),
};

export const HomeDefault: Story = {
  name: 'Home padrão',
  render: () => (
    <HomeScreen
      userId="user-1"
      authMessage="Conectado. Bora cantar."
      onCreateRoom={actions.onCreateRoom}
      onJoinRoom={actions.onJoinRoom}
    />
  ),
};

export const HomeLoading: Story = {
  name: 'Home loading',
  render: () => (
    <HomeScreen
      userId={null}
      authMessage="Conectando..."
      onCreateRoom={actions.onCreateRoom}
      onJoinRoom={actions.onJoinRoom}
    />
  ),
};

export const CreateRoomEmpty: Story = {
  name: 'Criar sala vazio',
  render: () => (
    <CreateRoomScreen
      isCreating={false}
      errorMessage={null}
      onBack={actions.onBack}
      onCreateRoom={actions.onCreateRoomSubmit}
    />
  ),
};

export const CreateRoomFilled: Story = {
  name: 'Criar sala preenchido',
  render: () => (
    <CreateRoomScreen
      isCreating={false}
      errorMessage={null}
      initialRoomName="Karaokê de sábado"
      initialOwnerName="Leandro"
      onBack={actions.onBack}
      onCreateRoom={actions.onCreateRoomSubmit}
    />
  ),
};

export const CreateRoomLoading: Story = {
  name: 'Criar sala loading',
  render: () => (
    <CreateRoomScreen
      isCreating
      errorMessage={null}
      initialRoomName="Karaokê de sábado"
      initialOwnerName="Leandro"
      onBack={actions.onBack}
      onCreateRoom={actions.onCreateRoomSubmit}
    />
  ),
};

export const CreateRoomError: Story = {
  name: 'Criar sala erro',
  render: () => (
    <CreateRoomScreen
      isCreating={false}
      errorMessage="Não consegui criar a sala agora. Tenta de novo em instantes."
      initialRoomName="Karaokê de sábado"
      initialOwnerName="Leandro"
      onBack={actions.onBack}
      onCreateRoom={actions.onCreateRoomSubmit}
    />
  ),
};

export const JoinRoomEmpty: Story = {
  name: 'Entrar vazio',
  render: () => (
    <JoinRoomScreen
      isJoining={false}
      errorMessage={null}
      onBack={actions.onBack}
      onJoinRoom={actions.onJoinRoomSubmit}
    />
  ),
};

export const JoinRoomPartialCode: Story = {
  name: 'Entrar código parcial',
  render: () => (
    <JoinRoomScreen
      isJoining={false}
      errorMessage={null}
      initialRoomCode="04"
      initialGuestName="Ana"
      onBack={actions.onBack}
      onJoinRoom={actions.onJoinRoomSubmit}
    />
  ),
};

export const JoinRoomCompleteCode: Story = {
  name: 'Entrar código completo',
  render: () => (
    <JoinRoomScreen
      isJoining={false}
      errorMessage={null}
      initialRoomCode="0427"
      initialGuestName="Ana"
      onBack={actions.onBack}
      onJoinRoom={actions.onJoinRoomSubmit}
    />
  ),
};

export const JoinRoomLoading: Story = {
  name: 'Entrar loading',
  render: () => (
    <JoinRoomScreen
      isJoining
      errorMessage={null}
      initialRoomCode="0427"
      initialGuestName="Ana"
      onBack={actions.onBack}
      onJoinRoom={actions.onJoinRoomSubmit}
    />
  ),
};

export const JoinRoomError: Story = {
  name: 'Entrar erro',
  render: () => (
    <JoinRoomScreen
      isJoining={false}
      errorMessage="Sala não encontrada."
      initialRoomCode="9999"
      initialGuestName="Ana"
      onBack={actions.onBack}
      onJoinRoom={actions.onJoinRoomSubmit}
    />
  ),
};

export const JoinRoomPastedCode: Story = {
  name: 'Entrar código colado',
  render: () => (
    <JoinRoomScreen
      isJoining={false}
      errorMessage={null}
      initialRoomCode="8421"
      initialGuestName="Ana"
      onBack={actions.onBack}
      onJoinRoom={actions.onJoinRoomSubmit}
    />
  ),
};
