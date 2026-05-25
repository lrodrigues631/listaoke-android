import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import {
  formatMockMessage,
  formatMockTime,
  manyEvents,
  recentEvents,
} from '../../src/storybook/mocks/roomMocks';
import { HistoryPreviewCard } from '../../src/views/components/room/HistoryPreviewCard';

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
      <StorybookScreen>
        <Story />
      </StorybookScreen>
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
  stack: {
    gap: 16,
  },
});