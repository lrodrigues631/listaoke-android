import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AppButton } from '../../src/views/components/ui/AppButton';

const meta = {
  title: 'UI/AppButton',
  component: AppButton,
  decorators: [
    (Story) => (
      <StorybookScreen withCard centered>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: {
    title: 'Entrar na fila',
    onPress: () => console.log('AppButton pressionado no Storybook'),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'dangerOutline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
  },
} satisfies Meta<typeof AppButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Entrar na fila',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Copiar código da sala',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    title: 'Encerrar sala',
    variant: 'danger',
  },
};

export const DangerOutline: Story = {
  args: {
    title: 'Remover participante',
    variant: 'dangerOutline',
  },
};

export const Ghost: Story = {
  args: {
    title: 'Ver histórico',
    variant: 'ghost',
  },
};

export const Small: Story = {
  args: {
    title: 'Pequeno',
    variant: 'secondary',
    size: 'small',
  },
};

export const Disabled: Story = {
  args: {
    title: 'Ação indisponível',
    variant: 'primary',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    title: 'Carregando',
    variant: 'primary',
    loading: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <View style={styles.stack}>
      <AppButton
        title="Entrar na fila"
        variant="primary"
        onPress={() => console.log('Primary')}
      />

      <AppButton
        title="Copiar código da sala"
        variant="secondary"
        onPress={() => console.log('Secondary')}
      />

      <AppButton
        title="Encerrar sala"
        variant="danger"
        onPress={() => console.log('Danger')}
      />

      <AppButton
        title="Remover participante"
        variant="dangerOutline"
        onPress={() => console.log('DangerOutline')}
      />

      <AppButton
        title="Ver histórico"
        variant="ghost"
        onPress={() => console.log('Ghost')}
      />

      <AppButton
        title="Você já está no palco"
        variant="primary"
        disabled
        onPress={() => console.log('Disabled')}
      />

      <AppButton
        title="Carregando"
        variant="primary"
        loading
        onPress={() => console.log('Loading')}
      />

      <View style={styles.smallRow}>
        <AppButton
          title="Pequeno"
          variant="secondary"
          size="small"
          onPress={() => console.log('Small secondary')}
        />

        <AppButton
          title="Sair"
          variant="dangerOutline"
          size="small"
          onPress={() => console.log('Small dangerOutline')}
        />
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  smallRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});