import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { InviteCard } from '../../src/views/components/room/InviteCard';

const baseArgs = {
  roomCode: '0427',
  isCopyingInvite: false,
  onCopyInvite: () => console.log('Mock: compartilhar convite'),
  onCopyCode: () => console.log('Mock: copiar codigo'),
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
  name: 'Padrao',
  args: {
    ...baseArgs,
  },
};

export const ShareAction: Story = {
  name: 'Com acao de compartilhar',
  args: {
    ...baseArgs,
    roomCode: 'CANTA7',
    onCopyInvite: () => console.log('Mock: convite CANTA7 compartilhado'),
  },
};

export const CopyingInvite: Story = {
  name: 'Compartilhando convite',
  args: {
    ...baseArgs,
    isCopyingInvite: true,
  },
};

export const AllInviteStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <InviteCard
        roomCode="0427"
        isCopyingInvite={false}
        onCopyInvite={() => console.log('Mock: compartilhar convite 0427')}
        onCopyCode={() => console.log('Mock: copiar codigo 0427')}
      />

      <InviteCard
        roomCode="CANTA7"
        isCopyingInvite={false}
        onCopyInvite={() => console.log('Mock: compartilhar convite CANTA7')}
        onCopyCode={() => console.log('Mock: copiar codigo CANTA7')}
      />

      <InviteCard
        roomCode="8421"
        isCopyingInvite
        onCopyInvite={() => console.log('Mock: compartilhando convite')}
        onCopyCode={() => console.log('Mock: copiando codigo')}
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.lg,
  },
});
