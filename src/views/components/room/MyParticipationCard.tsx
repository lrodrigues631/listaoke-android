import { Text, View } from 'react-native';

import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

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
  onFinishTurn,
  onSkipTurn,
  onStopSinging,
  onMoveTurnDown,
  onLeaveQueue,
  onJoinQueue,
}: MyParticipationCardProps) {
  const stateLabel = isMeOnStage
    ? 'No palco'
    : isMeWaiting
      ? queuePosition
        ? `Em espera • posição ${queuePosition}`
        : 'Em espera'
      : 'Fora da fila';

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Minha participação</Text>
        <Text style={styles.statePill}>{stateLabel}</Text>
      </View>

      {isRoomClosed ? (
        <Text style={styles.participationText}>Sala encerrada.</Text>
      ) : wasRemovedFromRoom ? (
        <Text style={styles.participationText}>Você foi removido desta sala.</Text>
      ) : isMeOnStage ? (
        <Text style={styles.participationText}>Use os controles do palco acima.</Text>
      ) : isMeWaiting ? (
        <>
          <View style={styles.inlineButtonRow}>
            <AppButton
              title="Adiar minha vez"
              variant="secondary"
              loading={isChangingQueue}
              disabled={isChangingQueue || !canMoveMyTurnDown}
              onPress={onMoveTurnDown}
            />

            <AppButton
              title="Sair da fila"
              variant="dangerOutline"
              loading={isChangingQueue}
              disabled={isChangingQueue}
              onPress={onLeaveQueue}
            />
          </View>
        </>
      ) : (
        <>
          <AppButton
            title="Entrar na fila"
            loading={isChangingQueue}
            disabled={isChangingQueue}
            onPress={onJoinQueue}
          />
        </>
      )}
    </View>
  );
}
