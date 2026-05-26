import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AppTextInput } from '../../src/views/components/ui/AppTextInput';

const meta = {
  title: 'UI/AppTextInput',
  component: AppTextInput,
  decorators: [
    (Story) => (
      <StorybookScreen withCard centered>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: {
    label: 'Nome',
    placeholder: 'Ex: Ana',
    value: '',
  },
} satisfies Meta<typeof AppTextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: (args) => {
    const [value, setValue] = useState('');

    return <AppTextInput {...args} value={value} onChangeText={setValue} />;
  },
};

export const FocusVisual: Story = {
  render: (args) => (
    <AppTextInput
      {...args}
      forceFocused
      label="Codigo da sala"
      placeholder="0427"
      value="0427"
      isCode
    />
  ),
};

export const Error: Story = {
  render: (args) => {
    const [value, setValue] = useState('12');

    return (
      <AppTextInput
        {...args}
        label="Codigo da sala"
        placeholder="0427"
        value={value}
        onChangeText={setValue}
        errorMessage="Esse codigo nao bate. Confere com quem criou a sala."
        isCode
      />
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <View style={styles.stack}>
      <AppTextInput label="Nome" placeholder="Ex: Ana" value="" />
      <AppTextInput forceFocused label="Sala" placeholder="Karaoke de sexta" value="Karaoke de sexta" />
      <AppTextInput
        label="Codigo da sala"
        placeholder="0427"
        value="12"
        errorMessage="Digite os 4 numeros do codigo."
        isCode
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: 18,
  },
});
