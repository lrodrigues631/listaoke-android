import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AppBadge } from '../../src/views/components/ui/AppBadge';

const meta = {
  title: 'UI/AppBadge',
  component: AppBadge,
  decorators: [
    (Story) => (
      <StorybookScreen withCard centered>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: {
    label: 'Ao vivo',
    variant: 'primary',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'accent', 'neutral', 'danger', 'success'],
    },
  },
} satisfies Meta<typeof AppBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const AllVariants: Story = {
  render: () => (
    <View style={styles.row}>
      <AppBadge label="Ao vivo" variant="primary" />
      <AppBadge label="Dono" variant="accent" />
      <AppBadge label="Manual" variant="neutral" />
      <AppBadge label="Erro" variant="danger" />
      <AppBadge label="Copiado" variant="success" />
    </View>
  ),
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
