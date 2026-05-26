import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AppCard } from '../../src/views/components/ui/AppCard';
import { AppBadge } from '../../src/views/components/ui/AppBadge';

const meta = {
  title: 'UI/AppCard',
  component: AppCard,
  decorators: [
    (Story) => (
      <StorybookScreen centered>
        <Story />
      </StorybookScreen>
    ),
  ],
} satisfies Meta<typeof AppCard>;

export default meta;

type Story = StoryObj<typeof meta>;

function CardContent({ label }: { label: string }) {
  return (
    <>
      <AppBadge label={label} variant="accent" />
      <Text style={styles.title}>Agora no palco</Text>
      <Text style={styles.text}>Um card escuro, legivel e com brilho controlado.</Text>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <AppCard>
      <CardContent label="Default" />
    </AppCard>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View style={styles.stack}>
      <AppCard>
        <CardContent label="Default" />
      </AppCard>

      <AppCard variant="raised">
        <CardContent label="Raised" />
      </AppCard>

      <AppCard variant="accent">
        <CardContent label="Accent" />
      </AppCard>

      <AppCard variant="danger">
        <CardContent label="Danger" />
      </AppCard>
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  text: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
});
