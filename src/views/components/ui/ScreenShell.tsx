import { ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '../../../constants/colors';

type ScreenShellProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenShell({ children, scroll = true, contentStyle }: ScreenShellProps) {
  if (!scroll) {
    return <View style={[styles.fullScreen, contentStyle]}>{children}</View>;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 24,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 24,
  },
});
