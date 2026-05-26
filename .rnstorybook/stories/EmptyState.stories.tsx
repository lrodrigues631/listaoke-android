import type { Meta, StoryObj } from '@storybook/react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AppButton } from '../../src/views/components/ui/AppButton';
import { EmptyState } from '../../src/views/components/ui/EmptyState';

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  decorators: [
    (Story) => (
      <StorybookScreen withCard centered>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: {
    badge: 'Fila vazia',
    title: 'Ninguem esperando agora.',
    message: 'Compartilhe o codigo da sala ou adicione alguem manualmente.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  render: (args) => (
    <EmptyState
      {...args}
      action={
        <AppButton
          title="Copiar codigo"
          size="compact"
          onPress={() => console.log('Copiar codigo')}
        />
      }
    />
  ),
};
