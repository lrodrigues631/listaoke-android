import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import type { RoomEvent } from '../../src/types/eventTypes';
import { HistoryPreviewCard } from '../../src/views/components/room/HistoryPreviewCard';

type MockRoomEvent = RoomEvent & {
  message?: string;
};

function createEvent(overrides: Partial<MockRoomEvent> = {}): RoomEvent {
  return {
    id: 'event-1',
    room_id: 'room-1',
    event_type: 'mock_event',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
    payload: {},
    ...overrides,
  } as unknown as RoomEvent;
}

const recentEvents: RoomEvent[] = [
  createEvent({
    id: 'event-1',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
  }),
  createEvent({
    id: 'event-2',
    created_at: '2026-05-25T21:04:00.000Z',
    message: 'Bruno começou a cantar.',
  }),
];

const manyEvents: RoomEvent[] = [
  createEvent({
    id: 'event-1',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
  }),
  createEvent({
    id: 'event-2',
    created_at: '2026-05-25T21:04:00.000Z',
    message: 'Bruno começou a cantar.',
  }),
  createEvent({
    id: 'event-3',
    created_at: '2026-05-25T21:08:00.000Z',
    message: 'Você entrou na fila.',
  }),
  createEvent({
    id: 'event-4',
    created_at: '2026-05-25T21:12:00.000Z',
    message: 'Carla pulou a vez.',
  }),
  createEvent({
    id: 'event-5',
    created_at: '2026-05-25T21:16:00.000Z',
    message: 'Carlos sem app foi adicionado pelo dono.',
  }),
  createEvent({
    id: 'event-6',
    created_at: '2026-05-25T21:20:00.000Z',
    message: 'Ana concluiu a música e voltou para o fim da fila.',
  }),
];

function formatMockMessage(event: RoomEvent): string {
  const mockEvent = event as MockRoomEvent;

  return mockEvent.message ?? 'Evento registrado na sala.';
}

function formatMockTime(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const baseArgs = {
  events: recentEvents,
  isLoadingEvents: false,
  eventsError: null,
  isExpanded: false,
  onToggleExpanded: () => console.log('Mock: alternar histórico'),
  formatMessage: formatMockMessage,
  formatTime: formatMockTime,
};

const meta = {
  title: 'Room/HistoryPreviewCard',
  component: HistoryPreviewCard,
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
    isLoadingEvents: {
      control: 'boolean',
    },
    eventsError: {
      control: 'text',
    },
    isExpanded: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof HistoryPreviewCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyHistory: Story = {
  name: 'Sem eventos',
  args: {
    ...baseArgs,
    events: [],
    isExpanded: false,
  },
};

export const TwoRecentEvents: Story = {
  name: '2 eventos recentes',
  args: {
    ...baseArgs,
    events: recentEvents,
    isExpanded: false,
  },
};

export const CollapsedHistory: Story = {
  name: 'Histórico recolhido com botão',
  args: {
    ...baseArgs,
    events: manyEvents,
    isExpanded: false,
  },
};

export const ExpandedHistory: Story = {
  name: 'Histórico expandido',
  args: {
    ...baseArgs,
    events: manyEvents,
    isExpanded: true,
  },
};

export const Loading: Story = {
  name: 'Carregando histórico',
  args: {
    ...baseArgs,
    events: [],
    isLoadingEvents: true,
  },
};

export const ErrorState: Story = {
  name: 'Erro',
  args: {
    ...baseArgs,
    events: [],
    eventsError: 'Não foi possível carregar o histórico da sala.',
  },
};

export const AllHistoryStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <HistoryPreviewCard
        {...baseArgs}
        events={[]}
      />

      <HistoryPreviewCard
        {...baseArgs}
        events={recentEvents}
      />

      <HistoryPreviewCard
        {...baseArgs}
        events={manyEvents}
        isExpanded={false}
      />

      <HistoryPreviewCard
        {...baseArgs}
        events={manyEvents}
        isExpanded
      />

      <HistoryPreviewCard
        {...baseArgs}
        events={[]}
        isLoadingEvents
      />

      <HistoryPreviewCard
        {...baseArgs}
        events={[]}
        eventsError="Não foi possível carregar o histórico da sala."
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