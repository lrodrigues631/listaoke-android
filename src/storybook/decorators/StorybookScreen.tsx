import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../constants/theme';

type StorybookScreenProps = {
  children: ReactNode;
  withCard?: boolean;
  centered?: boolean;
};

export function StorybookScreen({
  children,
  withCard = false,
  centered = false,
}: StorybookScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.screen, centered && styles.centered]}
        showsVerticalScrollIndicator={false}
      >
        {withCard ? <View style={styles.card}>{children}</View> : children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screen: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  centered: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
  },
});
