import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

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
  onFinishTurn: () => void;
  onSkipTurn: () => void;
  onStopSinging: () => void;
  onOwnerFinishTurn: (item: QueueItem) => void;
  onOwnerSkipTurn: (item: QueueItem) => void;
  onOwnerRemoveFromStage: (item: QueueItem) => void;
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
              <View style={styles.stageHero}>
                <Text style={styles.stageLabel}>
                  {isManualSinger ? 'Adicionado pelo dono' : 'Cantando agora'}
                </Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={2} style={styles.singerName}>
                  {singerName}
                </Text>
                <Text style={styles.songText}>{songLabel ?? 'Música livre'}</Text>
              </View>

              <Text style={styles.hint}>
                {isMeOnStage
                  ? 'Você está no palco. Manda ver.'
                  : isOwner
                    ? 'Você controla essa vez como dono da sala.'
                    : 'Acompanhe a apresentação. A fila anda automaticamente.'}
              </Text>

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

              {isOwner && !isMeOnStage ? (
                <View style={styles.buttonGroup}>
                  <AppButton
                    title="Finalizar vez"
                    accessibilityLabel={`Finalizar a vez de ${singerName}`}
                    loading={isChangingQueue}
                    disabled={isBusy}
                    onPress={() => onOwnerFinishTurn(currentOnStage)}
                  />

                  <View style={styles.inlineActions}>
                    <AppButton
                      title="Pular"
                      accessibilityLabel={`Pular a vez de ${singerName}`}
                      variant="secondary"
                      size="compact"
                      loading={isChangingQueue}
                      disabled={isBusy}
                      onPress={() => onOwnerSkipTurn(currentOnStage)}
                    />

                    <AppButton
                      title="Remover"
                      accessibilityLabel={`Remover ${singerName} do palco`}
                      variant="dangerOutline"
                      size="compact"
                      loading={isChangingQueue}
                      disabled={isBusy}
                      onPress={() => onOwnerRemoveFromStage(currentOnStage)}
                    />
                  </View>
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
    padding: theme.spacing.lg,
  },
  stageLabel: {
    color: theme.colors.accentStrong,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  singerName: {
    color: theme.colors.text,
    fontSize: 40,
    lineHeight: 45,
    fontWeight: '900',
  },
  songText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  hint: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
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
