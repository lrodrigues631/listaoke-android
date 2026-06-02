import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../../constants/theme';
import { AppButton } from '../ui/AppButton';
import { useReducedMotion } from '../ui/MicroInteractions';

type RoomModalScreenProps = {
  visible: boolean;
  eyebrow: string;
  title: string;
  children: ReactNode;
  onDismiss: () => void;
};

export function RoomModalScreen({
  visible,
  eyebrow,
  title,
  children,
  onDismiss,
}: RoomModalScreenProps) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(visible || reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }

    if (reducedMotion) {
      progress.setValue(1);
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: theme.animation.slow,
      useNativeDriver: true,
    }).start();
  }, [progress, reducedMotion, visible]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  return (
    <Modal
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.screen, { opacity: progress, transform: [{ translateX }] }]}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.topBar}>
            <View style={styles.titleGroup}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
                {title}
              </Text>
            </View>

            <AppButton title="Fechar" variant="secondary" size="compact" onPress={onDismiss} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eyebrow: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.title,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
});
