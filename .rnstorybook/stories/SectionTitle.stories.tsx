import type { Meta, StoryObj } from '@storybook/react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AppBadge } from '../../src/views/components/ui/AppBadge';
import { SectionTitle } from '../../src/views/components/ui/SectionTitle';

const meta = {
  title: 'UI/SectionTitle',
  component: SectionTitle,
  decorators: [
    (Story) => (
      <StorybookScreen withCard centered>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: {
    eyebrow: 'Sala ativa',
    title: 'Agora no palco',
  },
} satisfies Meta<typeof SectionTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  render: (args) => <SectionTitle {...args} action={<AppBadge label="4 na fila" />} />,
};
