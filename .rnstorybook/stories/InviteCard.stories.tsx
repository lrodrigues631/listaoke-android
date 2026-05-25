import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { InviteCard } from '../../src/views/components/room/InviteCard';

const baseArgs = {
  roomCode: 'LK82P',
  isCopyingInvite: false,
  onCopyInvite: () => console.log('Mock: copiar convite'),
  onCopyCode: () => console.log('Mock: copiar código'),
};

const meta = {
  title: 'Room/InviteCard',
  component: InviteCard,
  decorators: [
    (Story) => (
      <StorybookScreen>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: baseArgs,
  argTypes: {
    roomCode: {
      control: 'text',
    },
    isCopyingInvite: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof InviteCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Convite padrão',
  args: {
    ...baseArgs,
    roomCode: 'LK82P',
  },
};

export const LongCode: Story = {
  name: 'Código maior',
  args: {
    ...baseArgs,
    roomCode: 'CANTA7',
  },
};

export const ShortCode: Story = {
  name: 'Código curto',
  args: {
    ...baseArgs,
    roomCode: 'A1B2',
  },
};

export const CopyingInvite: Story = {
  name: 'Copiando convite',
  args: {
    ...baseArgs,
    roomCode: 'LK82P',
    isCopyingInvite: true,
  },
};

export const AllInviteStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <InviteCard
        roomCode="LK82P"
        isCopyingInvite={false}
        onCopyInvite={() => console.log('Mock: copiar convite LK82P')}
        onCopyCode={() => console.log('Mock: copiar código LK82P')}
      />

      <InviteCard
        roomCode="CANTA7"
        isCopyingInvite={false}
        onCopyInvite={() => console.log('Mock: copiar convite CANTA7')}
        onCopyCode={() => console.log('Mock: copiar código CANTA7')}
      />

      <InviteCard
        roomCode="A1B2"
        isCopyingInvite={false}
        onCopyInvite={() => console.log('Mock: copiar convite A1B2')}
        onCopyCode={() => console.log('Mock: copiar código A1B2')}
      />

      <InviteCard
        roomCode="LK82P"
        isCopyingInvite
        onCopyInvite={() => console.log('Mock: copiando convite')}
        onCopyCode={() => console.log('Mock: copiando código')}
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
});