import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import { AppButton } from '../../src/views/components/ui/AppButton';
import { AppCard } from '../../src/views/components/ui/AppCard';
import { ScreenShell } from '../../src/views/components/ui/ScreenShell';
import { SectionTitle } from '../../src/views/components/ui/SectionTitle';

const meta = {
  title: 'UI/ScreenShell',
  component: ScreenShell,
} satisfies Meta<typeof ScreenShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScreenShell>
      <View style={styles.stack}>
        <SectionTitle eyebrow="Listaoke" title="Base visual" />

        <AppCard variant="raised">
          <Text style={styles.text}>
            Fundo escuro, superficie elevada e contraste alto para uso em ambiente social.
          </Text>
          <AppButton title="Acao principal" onPress={() => console.log('ScreenShell action')} />
        </AppCard>
      </View>
    </ScreenShell>
  ),
};

export const NotScrollable: Story = {
  render: () => (
    <ScreenShell scroll={false}>
      <View style={styles.centered}>
        <SectionTitle eyebrow="Palco" title="Tela sem scroll" />
        <Text style={styles.text}>Para telas compactas como home e estados de entrada.</Text>
      </View>
    </ScreenShell>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  text: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
});
