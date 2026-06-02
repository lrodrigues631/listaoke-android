import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { theme } from '../../../constants/theme';
import { FeedbackToast, GlowPulse, PressFeedback } from './MicroInteractions';

type RoomCodeChipProps = {
  code: string;
  label?: string;
  copied?: boolean;
  copiedMessage?: string;
  compact?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  showCopiedFeedback?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function RoomCodeChip({
  code,
  label = 'Código',
  copied = false,
  copiedMessage = 'Código copiado.',
  compact = false,
  highlighted = false,
  disabled = false,
  showCopiedFeedback = true,
  accessibilityLabel,
  onPress,
  style,
}: RoomCodeChipProps) {
  const [internalCopied, setInternalCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showCopied = copied || internalCopied;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handlePress() {
    onPress?.();

    if (showCopiedFeedback && !copied) {
      setInternalCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setInternalCopied(false);
      }, 1200);
    }
  }

  return (
    <View style={[styles.wrapper, style]}>
      <GlowPulse active={showCopied || highlighted} borderRadius={theme.radius.pill}>
        <PressFeedback
          accessibilityHint={onPress ? 'Toque duas vezes para copiar o código da sala.' : undefined}
          accessibilityLabel={accessibilityLabel ?? `${label} da sala: ${code}`}
          accessibilityRole={onPress ? 'button' : 'text'}
          accessibilityState={{ disabled: disabled || !onPress, selected: highlighted }}
          disabled={disabled || !onPress}
          hitSlop={8}
          onPress={handlePress}
          contentStyle={[
            styles.container,
            compact && styles.compactContainer,
            highlighted && styles.highlightedContainer,
            disabled && styles.disabledContainer,
          ]}
        >
          <View style={styles.dot} />
          {!compact ? <Text style={styles.label}>{label}</Text> : null}
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
            style={[styles.code, compact && styles.compactCode]}
          >
            {code}
          </Text>
        </PressFeedback>
      </GlowPulse>

      {showCopiedFeedback ? (
        <FeedbackToast
          visible={showCopied}
          message={copiedMessage}
          variant="success"
          accessibilityLiveRegion="polite"
          style={styles.toast}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    gap: theme.spacing.sm,
  },
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 9,
  },
  compactContainer: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
  },
  highlightedContainer: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  disabledContainer: {
    opacity: 0.62,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  code: {
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: 1.4,
    maxWidth: 140,
  },
  compactCode: {
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: 1,
    maxWidth: 96,
  },
  toast: {
    marginLeft: theme.spacing.xs,
  },
});
