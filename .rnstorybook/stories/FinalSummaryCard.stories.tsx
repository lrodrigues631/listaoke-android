import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../src/constants/colors';
import type { RoomSummary } from '../../src/types/eventTypes';
import { FinalSummaryCard } from '../../src/views/components/room/FinalSummaryCard';

function createSummary(overrides: Partial<RoomSummary> = {}): RoomSummary {
  return {
    total_performances: 0,
    total_participants: 0,
    total_skips: 0,
    total_queue_exits: 0,
    ranking: [],
    ...overrides,
  } as RoomSummary;
}

const emptySummary = createSummary();

const rankingSummary = createSummary({
  total_performances: 8,
  total_participants: 4,
  total_skips: 2,
  total_queue_exits: 1,
  ranking: [
    {
      member_id: 'member-ana',
      name: 'Ana',
      performances: 3,
    },
    {
      member_id: 'member-bruno',
      name: 'Bruno',
      performances: 2,
    },
    {
      member_id: 'member-carla',
      name: 'Carla',
      performances: 2,
    },
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 1,
    },
  ],
});

const manyParticipantsSummary = createSummary({
  total_performances: 18,
  total_participants: 9,
  total_skips: 5,
  total_queue_exits: 3,
  ranking: [
    {
      member_id: 'member-ana',
      name: 'Ana',
      performances: 5,
    },
    {
      member_id: 'member-bruno',
      name: 'Bruno',
      performances: 4,
    },
    {
      member_id: 'member-carla',
      name: 'Carla',
      performances: 3,
    },
    {
      member_id: 'member-diego',
      name: 'Diego',
      performances: 2,
    },
    {
      member_id: 'member-elisa',
      name: 'Elisa',
      performances: 1,
    },
    {
      member_id: 'member-felipe',
      name: 'Felipe',
      performances: 1,
    },
    {
      member_id: 'member-gabi',
      name: 'Gabi',
      performances: 1,
    },
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 1,
    },
  ],
});

const oneSongSummary = createSummary({
  total_performances: 1,
  total_participants: 2,
  total_skips: 0,
  total_queue_exits: 0,
  ranking: [
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 1,
    },
  ],
});

const baseArgs = {
  summary: rankingSummary,
  isLoadingSummary: false,
  summaryError: null,
};

const meta = {
  title: 'Room/FinalSummaryCard',
  component: FinalSummaryCard,
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
    isLoadingSummary: {
      control: 'boolean',
    },
    summaryError: {
      control: 'text',
    },
  },
} satisfies Meta<typeof FinalSummaryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptySummary: Story = {
  name: 'Sem músicas cantadas',
  args: {
    ...baseArgs,
    summary: emptySummary,
  },
};

export const OneSong: Story = {
  name: 'Uma música cantada',
  args: {
    ...baseArgs,
    summary: oneSongSummary,
  },
};

export const WithRanking: Story = {
  name: 'Com ranking',
  args: {
    ...baseArgs,
    summary: rankingSummary,
  },
};

export const ManyParticipants: Story = {
  name: 'Muitos participantes',
  args: {
    ...baseArgs,
    summary: manyParticipantsSummary,
  },
};

export const ClosedRoomFinalScore: Story = {
  name: 'Sala encerrada com placar final',
  args: {
    ...baseArgs,
    summary: rankingSummary,
  },
};

export const Loading: Story = {
  name: 'Carregando resumo',
  args: {
    ...baseArgs,
    summary: emptySummary,
    isLoadingSummary: true,
  },
};

export const ErrorState: Story = {
  name: 'Erro',
  args: {
    ...baseArgs,
    summary: emptySummary,
    summaryError: 'Não foi possível montar o resumo da noite.',
  },
};

export const AllSummaryStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <FinalSummaryCard
        summary={emptySummary}
        isLoadingSummary={false}
        summaryError={null}
      />

      <FinalSummaryCard
        summary={oneSongSummary}
        isLoadingSummary={false}
        summaryError={null}
      />

      <FinalSummaryCard
        summary={rankingSummary}
        isLoadingSummary={false}
        summaryError={null}
      />

      <FinalSummaryCard
        summary={manyParticipantsSummary}
        isLoadingSummary={false}
        summaryError={null}
      />

      <FinalSummaryCard
        summary={emptySummary}
        isLoadingSummary
        summaryError={null}
      />

      <FinalSummaryCard
        summary={emptySummary}
        isLoadingSummary={false}
        summaryError="Não foi possível montar o resumo da noite."
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