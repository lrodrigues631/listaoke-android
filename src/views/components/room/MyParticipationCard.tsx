import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { AnimatedEntrance, GlowPulse } from '../ui/MicroInteractions';

type MyParticipationCardProps = {
  isRoomClosed: boolean;
  wasRemovedFromRoom: boolean;
  isMeOnStage: boolean;
  isMeWaiting: boolean;
  queuePosition: number | null;
  isChangingQueue: boolean;
  canMoveMyTurnDown: boolean;
  onFinishTurn: () => void;
  onSkipTurn: () => void;
  onStopSinging: () => void;
  onMoveTurnDown: () => void;
  onLeaveQueue: () => void;
  onJoinQueue: () => void;
};

export function MyParticipationCard({
  isRoomClosed,
  wasRemovedFromRoom,
  isMeOnStage,
  isMeWaiting,
  queuePosition,
  isChangingQueue,
  canMoveMyTurnDown,
  onMoveTurnDown,
  onLeaveQueue,
  onJoinQueue,
}: MyParticipationCardProps) {
  const isNext = isMeWaiting && queuePosition === 1;

  const stateLabel = isMeOnStage
    ? 'No palco'
    : isNext
      ? 'Próximo'
      : isMeWaiting
        ? 'Na fila'
        : 'Fora da fila';

  const title = isRoomClosed
    ? 'Sala encerrada'
    : wasRemovedFromRoom
      ? 'Você saiu da sala'
      : isMeOnStage
        ? 'Você está no palco'
        : isNext
          ? 'Você é o próximo'
          : isMeWaiting
            ? `Você está em ${queuePosition ?? '-'}º`
            : 'Você ainda não está na fila';

  const message = isRoomClosed
    ? 'A noite terminou para esta sala.'
    : wasRemovedFromRoom
      ? 'Entre novamente se ainda tiver convite ativo.'
      : isMeOnStage
        ? 'Boa apresentação. Use os controles do palco acima.'
        : isNext
          ? 'Já vai escolhendo a música.'
          : isMeWaiting
            ? 'Acompanhe a ordem e adie sua vez se precisar.'
            : 'Entre quando quiser cantar.';

  return (
    <AnimatedEntrance type="slideUp">
      <GlowPulse active={isChangingQueue || isNext || isMeOnStage} borderRadius={theme.radius.lg}>
        <AppCard variant={isMeOnStage || isNext ? 'accent' : 'default'} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Minha vez</Text>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
            </View>

            <AppBadge
              label={stateLabel}
              variant={isMeOnStage || isNext ? 'primary' : isMeWaiting ? 'accent' : 'neutral'}
            />
          </View>

          {isMeWaiting && !isMeOnStage && !isRoomClosed && !wasRemovedFromRoom ? (
            <View style={styles.positionRow}>
              <View style={styles.positionBox}>
                <Text style={styles.positionNumber}>{queuePosition ?? '-'}</Text>
                <Text style={styles.positionLabel}>posição</Text>
              </View>

              <Text style={styles.message}>{message}</Text>
            </View>
          ) : (
            <Text style={styles.message}>{message}</Text>
          )}

          {!isRoomClosed && !wasRemovedFromRoom && !isMeOnStage && !isMeWaiting ? (
            <AppButton
              title="Entrar na fila"
              accessibilityHint="Coloca você no fim da fila para cantar."
              loading={isChangingQueue}
              disabled={isChangingQueue}
              onPress={onJoinQueue}
            />
          ) : null}

          {!isRoomClosed && !wasRemovedFromRoom && isMeWaiting ? (
            <View style={styles.actions}>
              <AppButton
                title="Sair da fila"
                accessibilityHint="Remove você da fila de espera."
                variant="dangerOutline"
                loading={isChangingQueue}
                disabled={isChangingQueue}
                onPress={onLeaveQueue}
              />

              <AppButton
                title="Adiar minha vez"
                accessibilityHint="Move sua vez uma posição para baixo na fila."
                variant="secondary"
                size="compact"
                loading={isChangingQueue}
                disabled={isChangingQueue || !canMoveMyTurnDown}
                onPress={onMoveTurnDown}
              />
            </View>
          ) : null}
        </AppCard>
      </GlowPulse>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.lg,
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
    ...theme.typography.title,
  },
  message: {
    color: theme.colors.textMuted,
    flex: 1,
    ...theme.typography.body,
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  positionBox: {
    width: 86,
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  positionNumber: {
    color: theme.colors.primary,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '900',
  },
  positionLabel: {
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
