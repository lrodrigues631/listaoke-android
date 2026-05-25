import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import { RoomHeader } from '../../src/views/components/room/RoomHeader';

const meta = {
  title: 'Room/RoomHeader',
  component: RoomHeader,
  decorators: [
    (Story) => (
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.preview}>
          <Story />
        </View>
      </ScrollView>
    ),
  ],
  args: {
    roomName: 'Noite do Karaokê',
    roomCode: 'LK82P',
    roomStatus: 'open',
    onCopyCode: () => console.log('Código copiado no Storybook'),
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
  },
} satisfies Meta<typeof RoomHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActiveRoom: Story = {
  name: 'Sala ativa',
  args: {
    roomName: 'Noite do Karaokê',
    roomCode: 'LK82P',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
    isRoomClosed: false,
  },
};

export const ClosedRoom: Story = {
  name: 'Sala encerrada',
  args: {
    roomName: 'Noite do Karaokê',
    roomCode: 'LK82P',
    roomStatus: 'closed',
    statusLabel: 'Sala encerrada',
    isRoomClosed: true,
  },
};

export const CopyableCode: Story = {
  name: 'Código copiável',
  args: {
    roomName: 'Sextou no Microfone',
    roomCode: 'CANTA7',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
    onCopyCode: () => console.log('Mock: código CANTA7 copiado'),
  },
};

export const WithoutCode: Story = {
  name: 'Sem código visível',
  args: {
    roomName: 'Sala privada',
    roomCode: '',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
  },
};

export const LongRoomName: Story = {
  name: 'Nome de sala grande',
  args: {
    roomName: 'Aniversário da Firma com Pagode, Sertanejo e Clássicos Duvidosos',
    roomCode: 'FESTA9',
    roomStatus: 'open',
    statusLabel: 'Sala ativa',
  },
};

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  preview: {
    backgroundColor: colors.background,
    borderColor: colors.borderSoft,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
});