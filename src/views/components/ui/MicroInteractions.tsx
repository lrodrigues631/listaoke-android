import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { theme } from '../../../constants/theme';

export function useReducedMotion() {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isMounted) {
        setIsReducedMotionEnabled(isEnabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return isReducedMotionEnabled;
}

type PressFeedbackProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  pressedScale?: number;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
};

export function PressFeedback({
  children,
  style,
  contentStyle,
  pressedScale = 0.98,
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  ...pressableProps
}: PressFeedbackProps) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  function animateScale(value: number) {
    if (reducedMotion) {
      scale.setValue(1);
      return;
    }

    Animated.timing(scale, {
      toValue: value,
      duration: theme.animation.fast,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      onPress={onPress}
      onPressIn={(event) => {
        animateScale(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateScale(1);
        onPressOut?.(event);
      }}
      style={({ pressed }) => [style, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Animated.View style={[contentStyle, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

type AnimatedEntranceProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  type?: 'fade' | 'slideUp';
  style?: StyleProp<ViewStyle>;
};

export function AnimatedEntrance({
  children,
  delay = 0,
  distance = 12,
  type = 'fade',
  style,
}: AnimatedEntranceProps) {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration: theme.animation.slow,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, progress, reducedMotion]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [type === 'slideUp' ? distance : 0, 0],
  });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

type GlowPulseProps = {
  active: boolean;
  children: ReactNode;
  borderRadius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function GlowPulse({
  active,
  children,
  borderRadius = theme.radius.lg,
  color = theme.colors.primary,
  style,
}: GlowPulseProps) {
  const reducedMotion = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    if (reducedMotion) {
      pulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: theme.animation.normal,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: theme.animation.slow,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [active, pulse, reducedMotion]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.44],
  });

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });

  return (
    <View style={[styles.glowWrapper, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.glowRing,
          {
            borderColor: color,
            borderRadius,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
      {children}
    </View>
  );
}

type FeedbackToastProps = {
  visible: boolean;
  message: string;
  variant?: 'default' | 'success' | 'danger';
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  style?: StyleProp<ViewStyle>;
};

export function FeedbackToast({
  visible,
  message,
  variant = 'default',
  accessibilityLiveRegion,
  style,
}: FeedbackToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <AnimatedEntrance type="slideUp" distance={6} style={style}>
      <View accessibilityLiveRegion={accessibilityLiveRegion} style={[styles.toast, styles[variant]]}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </AnimatedEntrance>
  );
}

type AppBottomSheetProps = {
  visible: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onDismiss?: () => void;
};

export function AppBottomSheet({
  visible,
  title,
  children,
  footer,
  onDismiss,
}: AppBottomSheetProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.sheetLayer} pointerEvents="box-none">
      <Pressable
        accessibilityLabel="Fechar painel"
        accessibilityRole="button"
        style={styles.sheetOverlay}
        onPress={onDismiss}
      />
      <AnimatedEntrance type="slideUp" distance={28} style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.sheetTitle}>
            {title}
          </Text>
        </View>
        <View style={styles.sheetBody}>{children}</View>
        {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
      </AnimatedEntrance>
    </View>
  );
}

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({
  width = '100%',
  height = 18,
  radius = theme.radius.sm,
  style,
}: SkeletonBlockProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0.48)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.62);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.82,
          duration: theme.animation.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.48,
          duration: theme.animation.slow,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  glowWrapper: {
    position: 'relative',
  },
  glowRing: {
    borderWidth: 1,
  },
  toast: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
  },
  default: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
  },
  success: {
    backgroundColor: theme.colors.successMuted,
    borderColor: theme.colors.success,
  },
  danger: {
    backgroundColor: theme.colors.dangerMuted,
    borderColor: theme.colors.dangerBorder,
  },
  toastText: {
    color: theme.colors.text,
    ...theme.typography.buttonSmall,
  },
  sheetLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.borderStrong,
  },
  sheetTitle: {
    color: theme.colors.text,
    ...theme.typography.title,
  },
  sheetBody: {
    gap: theme.spacing.md,
  },
  sheetFooter: {
    gap: theme.spacing.sm,
  },
  skeleton: {
    backgroundColor: theme.colors.surfaceLight,
  },
});
