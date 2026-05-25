import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import { AdminCard } from '../../src/views/components/room/AdminCard';

const baseArgs = {
  transferableCount: 2,
  removableCount: 3,
  isCopyingInvite: false,
  isClosingRoom: false,
  onCopyInvite: () => console.log('Mock: copiar convite'),
  onCloseRoom: () => console.log('Mock: fechar sala'),
};

const meta = {
  title: 'Room/AdminCard',
  component: AdminCard,
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
    transferableCount: {
      control: 'number',
    },
    removableCount: {
      control: 'number',
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
  name: 'Controle padrão',
  args: {
    ...baseArgs,
    transferableCount: 2,
    removableCount: 3,
  },
};

export const OwnerAlone: Story = {
  name: 'Dono sozinho na sala',
  args: {
    ...baseArgs,
    transferableCount: 0,
    removableCount: 0,
  },
};

export const CanOnlyRemove: Story = {
  name: 'Só pode remover pessoas',
  args: {
    ...baseArgs,
    transferableCount: 0,
    removableCount: 2,
  },
};

export const CanTransferAndRemove: Story = {
  name: 'Pode transferir e remover',
  args: {
    ...baseArgs,
    transferableCount: 3,
    removableCount: 3,
  },
};

export const CopyingInvite: Story = {
  name: 'Copiando convite',
  args: {
    ...baseArgs,
    isCopyingInvite: true,
    isClosingRoom: false,
  },
};

export const ClosingRoom: Story = {
  name: 'Fechando sala',
  args: {
    ...baseArgs,
    isCopyingInvite: false,
    isClosingRoom: true,
  },
};

export const BusyState: Story = {
  name: 'Copiando e fechando',
  args: {
    ...baseArgs,
    isCopyingInvite: true,
    isClosingRoom: true,
  },
};

export const AllAdminStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <AdminCard
        transferableCount={2}
        removableCount={3}
        isCopyingInvite={false}
        isClosingRoom={false}
        onCopyInvite={() => console.log('Mock: copiar convite padrão')}
        onCloseRoom={() => console.log('Mock: fechar sala padrão')}
      />

      <AdminCard
        transferableCount={0}
        removableCount={0}
        isCopyingInvite={false}
        isClosingRoom={false}
        onCopyInvite={() => console.log('Mock: copiar convite dono sozinho')}
        onCloseRoom={() => console.log('Mock: fechar sala dono sozinho')}
      />

      <AdminCard
        transferableCount={0}
        removableCount={2}
        isCopyingInvite={false}
        isClosingRoom={false}
        onCopyInvite={() => console.log('Mock: copiar convite só remover')}
        onCloseRoom={() => console.log('Mock: fechar sala só remover')}
      />

      <AdminCard
        transferableCount={3}
        removableCount={3}
        isCopyingInvite
        isClosingRoom={false}
        onCopyInvite={() => console.log('Mock: copiando convite')}
        onCloseRoom={() => console.log('Mock: fechar sala')}
      />

      <AdminCard
        transferableCount={3}
        removableCount={3}
        isCopyingInvite={false}
        isClosingRoom
        onCopyInvite={() => console.log('Mock: copiar convite')}
        onCloseRoom={() => console.log('Mock: fechando sala')}
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