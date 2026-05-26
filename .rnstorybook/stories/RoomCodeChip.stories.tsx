import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { RoomCodeChip } from '../../src/views/components/ui/RoomCodeChip';

const meta = {
  title: 'UI/RoomCodeChip',
  component: RoomCodeChip,
  decorators: [
    (Story) => (
      <StorybookScreen withCard centered>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: {
    code: '0427',
    onPress: () => console.log('Codigo copiado'),
  },
} satisfies Meta<typeof RoomCodeChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Copied: Story = {
  args: {
    code: '0427',
    copied: true,
  },
};

export const Compact: Story = {
  args: {
    code: '0427',
    compact: true,
  },
};

export const Highlighted: Story = {
  args: {
    code: '0427',
    highlighted: true,
  },
};

export const LongCode: Story = {
  args: {
    code: 'CANTA7',
  },
};

export const AllStates: Story = {
  render: () => (
    <View style={styles.stack}>
      <RoomCodeChip code="0427" onPress={() => console.log('Codigo 0427')} />
      <RoomCodeChip
        code="CANTA7"
        label="Sala"
        highlighted
        onPress={() => console.log('Codigo CANTA7')}
      />
      <RoomCodeChip code="8421" compact onPress={() => console.log('Codigo 8421')} />
      <RoomCodeChip code="7777" copied onPress={() => console.log('Codigo copiado')} />
      <RoomCodeChip code="----" disabled />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
});
