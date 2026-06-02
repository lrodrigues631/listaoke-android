import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { AnimatedIntroScreen } from '../../src/views/components/intro/AnimatedIntroScreen';

const meta = {
  title: 'Intro/AnimatedIntroScreen',
  component: AnimatedIntroScreen,
  decorators: [
    (Story) => (
      <StorybookScreen centered>
        <View style={styles.preview}>
          <Story />
        </View>
      </StorybookScreen>
    ),
  ],
  args: {
    durationMs: 1600,
    autoFinish: false,
  },
} satisfies Meta<typeof AnimatedIntroScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Padrão',
  args: {
    autoFinish: false,
  },
};

export const ReducedMotion: Story = {
  name: 'Reduced motion',
  args: {
    autoFinish: false,
    reduceMotion: true,
  },
};

export const InitialFrame: Story = {
  name: 'Frame inicial',
  args: {
    autoFinish: false,
    initialState: true,
  },
};

export const FinalState: Story = {
  name: 'Frame final',
  args: {
    autoFinish: false,
    finalState: true,
  },
};

export const FallbackWithoutAsset: Story = {
  name: 'Fallback sem asset',
  args: {
    autoFinish: false,
    showBrandAsset: false,
  },
};

export const DarkBackground: Story = {
  name: 'Tela cheia dark',
  args: {
    autoFinish: false,
  },
  decorators: [
    (Story) => (
      <StorybookScreen centered>
        <View style={styles.darkFrame}>
          <Story />
        </View>
      </StorybookScreen>
    ),
  ],
};

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    minHeight: 560,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  darkFrame: {
    width: '100%',
    minHeight: 620,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
});
