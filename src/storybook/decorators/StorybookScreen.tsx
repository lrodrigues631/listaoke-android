import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../constants/colors';

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
    <ScrollView contentContainerStyle={[styles.screen, centered && styles.centered]}>
      {withCard ? <View style={styles.card}>{children}</View> : children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
});