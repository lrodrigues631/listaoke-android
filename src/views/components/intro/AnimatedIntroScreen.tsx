import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { theme } from '../../../constants/theme';
import { useReducedMotion } from '../ui/MicroInteractions';

export const INTRO_DURATION_MS = 1600;

const favIcon = require('../../../../resources/fav-icon.svg');
const horizontalLogo = require('../../../../resources/logo-horizontal.png');

const EQUALIZER_BASE_HEIGHTS = [0.34, 0.68, 0.44, 0.88, 0.52, 0.76, 0.38, 0.94, 0.56, 0.82, 0.42, 0.64];
const EQUALIZER_DURATIONS = [420, 520, 460, 620, 500, 580, 440, 640, 480, 600, 460, 540];

type AnimatedIntroScreenProps = {
  durationMs?: number;
  reduceMotion?: boolean;
  finalState?: boolean;
  initialState?: boolean;
  autoFinish?: boolean;
  showBrandAsset?: boolean;
  onReady?: () => void;
  onFinish?: () => void;
};

export function AnimatedIntroScreen({
  durationMs = INTRO_DURATION_MS,
  reduceMotion,
  finalState = false,
  initialState = false,
  autoFinish,
  showBrandAsset = true,
  onReady,
  onFinish,
}: AnimatedIntroScreenProps) {
  const systemReducedMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotion ?? systemReducedMotion;
  const shouldAutoFinish = autoFinish ?? Boolean(onFinish);
  const entry = useRef(new Animated.Value(finalState || shouldReduceMotion || initialState ? 1 : 0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(finalState ? 0.92 : 0)).current;
  const glow = useRef(new Animated.Value(finalState || shouldReduceMotion ? 0.78 : 0.38)).current;
  const bars = useRef(
    EQUALIZER_BASE_HEIGHTS.map((scale) => new Animated.Value(finalState || shouldReduceMotion ? scale : 0.28))
  ).current;
  const didFinishRef = useRef(false);

  const iconAsset = useMemo(() => Image.resolveAssetSource(favIcon), []);
  const logoAsset = useMemo(() => Image.resolveAssetSource(horizontalLogo), []);
  const canRenderBrandAssets = showBrandAsset && Boolean(iconAsset?.uri && logoAsset);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    didFinishRef.current = false;

    function finish() {
      if (didFinishRef.current) {
        return;
      }

      didFinishRef.current = true;
      onFinish?.();
    }

    if (initialState) {
      entry.setValue(1);
      exit.setValue(0);
      spin.setValue(0);
      glow.setValue(0.36);
      bars.forEach((bar) => bar.setValue(0.28));
      return undefined;
    }

    if (finalState || shouldReduceMotion) {
      entry.setValue(1);
      exit.setValue(0);
      spin.setValue(0.92);
      glow.setValue(0.72);
      bars.forEach((bar, index) => bar.setValue(EQUALIZER_BASE_HEIGHTS[index] ?? 0.54));

      if (!shouldAutoFinish || finalState) {
        return undefined;
      }

      const reducedTimer = setTimeout(finish, Math.min(durationMs, 700));
      return () => clearTimeout(reducedTimer);
    }

    entry.setValue(0);
    exit.setValue(0);
    spin.setValue(0);
    glow.setValue(0.38);

    const spinLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(spin, {
          toValue: 1,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(spin, {
          toValue: 0,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.82,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.42,
          duration: 620,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const barLoops = bars.map((bar, index) => {
      const base = EQUALIZER_BASE_HEIGHTS[index] ?? 0.5;
      const low = Math.max(base - 0.22, 0.18);
      const high = Math.min(base + 0.24, 1);

      bar.setValue(low);

      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: high,
            duration: EQUALIZER_DURATIONS[index] ?? 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: low,
            duration: (EQUALIZER_DURATIONS[index] ?? 520) + 130,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    });

    spinLoop.start();
    glowLoop.start();
    barLoops.forEach((loop) => loop.start());

    const introAnimation = shouldAutoFinish
      ? Animated.sequence([
          Animated.timing(entry, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(durationMs - 540, 0)),
          Animated.timing(exit, {
            toValue: 1,
            duration: 320,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      : Animated.timing(entry, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });

    introAnimation.start(({ finished }) => {
      if (finished && shouldAutoFinish) {
        finish();
      }
    });

    const fallbackTimer = shouldAutoFinish ? setTimeout(finish, durationMs + 600) : null;

    return () => {
      spinLoop.stop();
      glowLoop.stop();
      barLoops.forEach((loop) => loop.stop());
      introAnimation.stop();

      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [
    bars,
    durationMs,
    entry,
    exit,
    finalState,
    glow,
    initialState,
    onFinish,
    shouldAutoFinish,
    shouldReduceMotion,
    spin,
  ]);

  const screenOpacity = Animated.multiply(
    entry,
    exit.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    })
  );

  const contentTranslateY = entry.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const coinScaleX = spin.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.18, 0.94, 0.2, 1],
  });

  const coinRotate = spin.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-2deg', '2deg', '-1deg'],
  });

  const coinOpacity = spin.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.62, 0.94, 0.68, 1],
  });

  const glowScale = glow.interpolate({
    inputRange: [0.36, 0.82],
    outputRange: [0.94, 1.04],
  });

  return (
    <Animated.View
      accessibilityRole="summary"
      accessibilityLabel="Intro animada do Listaoke"
      style={[styles.screen, { opacity: screenOpacity }]}
    >
      <View style={styles.backdrop}>
        <View style={styles.spotlightLeft} />
        <View style={styles.spotlightRight} />
        <View style={styles.floorGlow} />

        <Animated.View
          style={[
            styles.centerStage,
            {
              opacity: entry,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.coinGlow,
              {
                opacity: glow,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.coinShadow,
              {
                opacity: glow.interpolate({
                  inputRange: [0.36, 0.82],
                  outputRange: [0.26, 0.46],
                }),
              },
            ]}
          />

          <Animated.View
            style={[
              styles.coin,
              {
                opacity: coinOpacity,
                transform: [{ perspective: 900 }, { scaleX: coinScaleX }, { rotate: coinRotate }],
              },
            ]}
          >
            <View style={styles.coinFace}>
              {canRenderBrandAssets ? (
                <SvgUri uri={iconAsset.uri} width={70} height={70} />
              ) : (
                <Text style={styles.fallbackIcon}>L</Text>
              )}
            </View>
          </Animated.View>

          {canRenderBrandAssets ? (
            <Image source={horizontalLogo} resizeMode="contain" style={styles.wordmarkImage} />
          ) : (
            <Text style={styles.wordmarkText}>Listaoke</Text>
          )}

          {!shouldReduceMotion ? (
            <View style={styles.equalizer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {bars.map((bar, index) => (
                <View key={`intro-bar-${index}`} style={styles.barSlot}>
                  <Animated.View
                    style={[
                      styles.bar,
                      index % 3 === 0 && styles.barLilac,
                      index % 4 === 0 && styles.barDimmed,
                      {
                        transform: [{ scaleY: bar }],
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.reducedLine} />
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
  spotlightLeft: {
    position: 'absolute',
    top: -90,
    left: -70,
    width: 230,
    height: 520,
    backgroundColor: 'rgba(123, 77, 255, 0.10)',
    borderRadius: 120,
    opacity: 0.52,
    transform: [{ rotate: '-18deg' }],
  },
  spotlightRight: {
    position: 'absolute',
    top: -120,
    right: -82,
    width: 240,
    height: 540,
    backgroundColor: 'rgba(255, 87, 232, 0.08)',
    borderRadius: 130,
    opacity: 0.48,
    transform: [{ rotate: '20deg' }],
  },
  floorGlow: {
    position: 'absolute',
    bottom: 120,
    width: 260,
    height: 36,
    backgroundColor: 'rgba(243, 78, 243, 0.14)',
    borderRadius: theme.radius.pill,
    transform: [{ scaleX: 1.35 }],
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  coinGlow: {
    position: 'absolute',
    top: -28,
    width: 176,
    height: 176,
    backgroundColor: theme.colors.primaryMuted,
    borderColor: 'rgba(243, 78, 243, 0.22)',
    borderRadius: 88,
    borderWidth: 1,
    shadowColor: theme.colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
  },
  coinShadow: {
    position: 'absolute',
    top: 120,
    width: 120,
    height: 16,
    backgroundColor: 'rgba(243, 78, 243, 0.32)',
    borderRadius: theme.radius.pill,
    transform: [{ scaleX: 0.72 }],
  },
  coin: {
    width: 118,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 59,
  },
  coinFace: {
    width: 102,
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    borderColor: theme.colors.primarySoft,
    borderRadius: 51,
    borderWidth: 1,
    shadowColor: theme.colors.neonLilac,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 8,
  },
  fallbackIcon: {
    color: theme.colors.primary,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '900',
  },
  wordmarkImage: {
    width: 164,
    height: 46,
    marginTop: theme.spacing.xxl,
  },
  wordmarkText: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    marginTop: theme.spacing.xxl,
  },
  equalizer: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: theme.spacing.lg,
  },
  barSlot: {
    width: 5,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 4,
    height: 34,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
  },
  barLilac: {
    backgroundColor: theme.colors.accentStrong,
  },
  barDimmed: {
    opacity: 0.72,
  },
  reducedLine: {
    width: 86,
    height: 3,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.pill,
    marginTop: theme.spacing.xl,
  },
});
