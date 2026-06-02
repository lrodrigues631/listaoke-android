import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../../../constants/theme';
import type { QueueItem } from '../../../types/queueTypes';
import type { RoomMember } from '../../../types/roomTypes';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { AnimatedEntrance, GlowPulse } from '../ui/MicroInteractions';

type StageQueueItem = QueueItem & {
  song_title?: string | null;
  songTitle?: string | null;
  artist_name?: string | null;
  artistName?: string | null;
};

type StageCardProps = {
  currentOnStage: QueueItem | null;
  currentOnStageMember: RoomMember | null;
  isLoadingRoom: boolean;
  isLoadingQueue: boolean;
  isRoomClosed: boolean;
  isMeOnStage: boolean;
  isOwner: boolean;
  isChangingQueue: boolean;
  wasRemovedFromRoom: boolean;
  showOwnerControls?: boolean;
  onFinishTurn: () => void;
  onSkipTurn: () => void;
  onStopSinging: () => void;
  onOwnerFinishTurn: (item: QueueItem) => void;
  onOwnerSkipTurn: (item: QueueItem) => void;
  onOwnerRemoveFromStage: (item: QueueItem) => void;
};

type StageQuickActionButtonProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: 'finish' | 'skip' | 'trash';
  variant: 'danger' | 'primary' | 'success';
  onPress: () => void;
};

function getSongLabel(item: QueueItem | null): string | null {
  if (!item) {
    return null;
  }

  const stageItem = item as StageQueueItem;
  const songTitle = stageItem.song_title ?? stageItem.songTitle ?? null;
  const artistName = stageItem.artist_name ?? stageItem.artistName ?? null;

  if (songTitle && artistName) {
    return `${songTitle} - ${artistName}`;
  }

  return songTitle ?? artistName;
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke={color}
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SkipIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M5 7l7 5-7 5V7ZM14 7l5 5-5 5V7Z" fill={color} />
    </Svg>
  );
}

function FinishIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.2 4.2L19 6.8"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StageQuickActionButton({
  accessibilityLabel,
  disabled = false,
  icon,
  variant,
  onPress,
}: StageQuickActionButtonProps) {
  const iconColor =
    variant === 'primary'
      ? theme.colors.background
      : variant === 'success'
        ? theme.colors.success
        : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stageQuickButton,
        variant === 'danger' && styles.stageQuickButtonDanger,
        variant === 'primary' && styles.stageQuickButtonPrimary,
        variant === 'success' && styles.stageQuickButtonSuccess,
        disabled && styles.stageQuickButtonDisabled,
        pressed && !disabled && styles.stageQuickButtonPressed,
      ]}
    >
      {icon === 'trash' ? <TrashIcon color={iconColor} /> : null}
      {icon === 'skip' ? <SkipIcon color={iconColor} /> : null}
      {icon === 'finish' ? <FinishIcon color={iconColor} /> : null}
    </Pressable>
  );
}

export function StageCard({
  currentOnStage,
  currentOnStageMember,
  isLoadingRoom,
  isLoadingQueue,
  isRoomClosed,
  isMeOnStage,
  isOwner,
  isChangingQueue,
  wasRemovedFromRoom,
  showOwnerControls = true,
  onFinishTurn,
  onSkipTurn,
  onStopSinging,
  onOwnerFinishTurn,
  onOwnerSkipTurn,
  onOwnerRemoveFromStage,
}: StageCardProps) {
  const isBusy = isChangingQueue || isRoomClosed;
  const isManualSinger = Boolean(currentOnStageMember?.is_manual);
  const hasSinger = Boolean(currentOnStage && !isRoomClosed);
  const singerName = currentOnStageMember?.name ?? 'Alguém misterioso';
  const songLabel = getSongLabel(currentOnStage);
  const showOwnerQuickActions = isOwner && !isMeOnStage && Boolean(currentOnStage);
  const stageHint = isMeOnStage
    ? 'Você está no palco. Manda ver.'
    : isOwner
      ? null
      : 'Acompanhe a apresentação. A fila anda automaticamente.';

  return (
    <AnimatedEntrance type="slideUp">
      <GlowPulse active={hasSinger || isChangingQueue} borderRadius={theme.radius.xl}>
        <AppCard variant="accent" style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Agora no palco</Text>
              <Text accessibilityRole="header" style={styles.title}>
                Momento da vez
              </Text>
            </View>

            <AppBadge
              label={isRoomClosed ? 'Encerrado' : hasSinger ? 'Ao vivo' : 'Livre'}
              variant={isRoomClosed ? 'danger' : hasSinger ? 'primary' : 'neutral'}
            />
          </View>

          {isLoadingRoom || isLoadingQueue ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Atualizando o palco...</Text>
            </View>
          ) : hasSinger && currentOnStage ? (
            <AnimatedEntrance key={currentOnStage.id} type="fade">
              <View style={[styles.stageHero, showOwnerQuickActions && styles.stageHeroWithActions]}>
                <View style={styles.stageHeroCopy}>
                  <Text style={styles.stageLabel}>
                    {isManualSinger ? 'Adicionado pelo dono' : 'Cantando agora'}
                  </Text>
                  <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={2} style={styles.singerName}>
                    {singerName}
                  </Text>
                  {songLabel ? <Text style={styles.songText}>{songLabel}</Text> : null}
                </View>

                {showOwnerQuickActions ? (
                  <View style={styles.stageQuickActions}>
                    <StageQuickActionButton
                      icon="trash"
                      variant="danger"
                      accessibilityLabel={`Remover ${singerName} do palco`}
                      disabled={isBusy}
                      onPress={() => onOwnerRemoveFromStage(currentOnStage)}
                    />
                    <StageQuickActionButton
                      icon="skip"
                      variant="primary"
                      accessibilityLabel={`Pular a vez de ${singerName}`}
                      disabled={isBusy}
                      onPress={() => onOwnerSkipTurn(currentOnStage)}
                    />
                    <StageQuickActionButton
                      icon="finish"
                      variant="success"
                      accessibilityLabel={`Concluir a música de ${singerName}`}
                      disabled={isBusy}
                      onPress={() => onOwnerFinishTurn(currentOnStage)}
                    />
                  </View>
                ) : null}
              </View>

              {stageHint ? <Text style={[styles.hint, styles.stageHint]}>{stageHint}</Text> : null}

              {isMeOnStage && !wasRemovedFromRoom ? (
                <View style={styles.buttonGroup}>
                  <AppButton
                    title="Concluir e voltar ao fim"
                    accessibilityLabel="Concluir minha apresentação e voltar ao fim da fila"
                    loading={isChangingQueue}
                    disabled={isBusy}
                    onPress={onFinishTurn}
                  />

                  <View style={styles.inlineActions}>
                    <AppButton
                      title="Pular vez"
                      accessibilityLabel="Pular minha vez e voltar ao fim da fila"
                      variant="secondary"
                      size="compact"
                      loading={isChangingQueue}
                      disabled={isBusy}
                      onPress={onSkipTurn}
                    />

                    <AppButton
                      title="Parar"
                      accessibilityLabel="Parar de cantar e sair da fila"
                      variant="dangerOutline"
                      size="compact"
                      loading={isChangingQueue}
                      disabled={isBusy}
                      onPress={onStopSinging}
                    />
                  </View>
                </View>
              ) : null}

              {isOwner && showOwnerControls && !isMeOnStage && !showOwnerQuickActions ? (
                <View style={styles.buttonGroup}>
                  <AppButton
                    title="Finalizar vez"
                    accessibilityLabel={`Finalizar a vez de ${singerName}`}
                    loading={isChangingQueue}
                    disabled={isBusy}
                    onPress={() => onOwnerFinishTurn(currentOnStage)}
                  />
                </View>
              ) : null}
            </AnimatedEntrance>
          ) : (
            <View style={styles.emptyStage}>
              <Text style={styles.emptyTitle}>{isRoomClosed ? 'Palco fechado' : 'Palco livre'}</Text>
              <Text style={styles.hint}>
                {isRoomClosed
                  ? 'A noite terminou.'
                  : 'Quando alguém entrar na fila, a próxima vez aparece aqui.'}
              </Text>
            </View>
          )}
        </AppCard>
      </GlowPulse>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: theme.colors.borderStrong,
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    ...theme.glow.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  stageHero: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.xs,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    position: 'relative',
  },
  stageHeroWithActions: {
    minHeight: 142,
    paddingRight: 56,
  },
  stageHeroCopy: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    minWidth: 0,
  },
  stageLabel: {
    color: theme.colors.accentStrong,
    textAlign: 'left',
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  singerName: {
    color: theme.colors.text,
    fontSize: 40,
    lineHeight: 45,
    fontWeight: '900',
    textAlign: 'left',
  },
  songText: {
    color: theme.colors.textMuted,
    textAlign: 'left',
    ...theme.typography.body,
  },
  stageQuickActions: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  stageQuickButton: {
    width: 31,
    height: 31,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stageQuickButtonDanger: {
    backgroundColor: theme.colors.dangerMuted,
    borderColor: theme.colors.dangerBorder,
  },
  stageQuickButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.glow.primary,
  },
  stageQuickButtonSuccess: {
    backgroundColor: theme.colors.successMuted,
    borderColor: theme.colors.success,
  },
  stageQuickButtonDisabled: {
    opacity: 0.42,
  },
  stageQuickButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  hint: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  stageHint: {
    marginTop: theme.spacing.lg,
  },
  buttonGroup: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  inlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  emptyStage: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    color: theme.colors.text,
    ...theme.typography.title,
  },
});
