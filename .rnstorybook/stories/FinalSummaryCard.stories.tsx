import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import {
  emptySummary,
  manyParticipantsSummary,
  oneSongSummary,
  rankingSummary,
} from '../../src/storybook/mocks/roomMocks';
import { FinalSummaryCard } from '../../src/views/components/room/FinalSummaryCard';

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
      <StorybookScreen>
        <Story />
      </StorybookScreen>
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
  name: 'Sem apresentações',
  args: {
    ...baseArgs,
    summary: emptySummary,
  },
};

export const OneSong: Story = {
  name: 'Poucas apresentações',
  args: {
    ...baseArgs,
    summary: oneSongSummary,
  },
};

export const WithRanking: Story = {
  name: 'Ranking completo',
  args: {
    ...baseArgs,
    summary: rankingSummary,
  },
};

export const ShareAvailable: Story = {
  name: 'Compartilhamento disponível',
  args: {
    ...baseArgs,
    summary: rankingSummary,
    canShareSummary: true,
    onShareSummary: () => console.log('Mock: compartilhar resumo'),
  },
};

export const ShareUnavailable: Story = {
  name: 'Compartilhamento indisponível',
  args: {
    ...baseArgs,
    summary: rankingSummary,
    canShareSummary: false,
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
  stack: {
    gap: 16,
  },
});
