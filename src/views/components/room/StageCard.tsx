import { ActivityIndicator, Text, View } from 'react-native';

import type { QueueItem } from '../../../types/queueTypes';
import type { RoomMember } from '../../../types/roomTypes';
import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

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
  onOwnerRemoveFromStage: (item: QueueItem) => void;
};

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
  onOwnerRemoveFromStage,
}: StageCardProps) {
  const isBusy = isChangingQueue || isRoomClosed;

  return (
    <View style={styles.stageCard}>
      <Text style={styles.sectionTitle}>Cantando agora</Text>

      {isLoadingRoom || isLoadingQueue ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Atualizando o palco...</Text>
        </View>
      ) : currentOnStage && !isRoomClosed ? (
        <>
          <Text style={styles.heroEyebrow}>No palco</Text>
          <Text style={styles.stageName}>{currentOnStageMember?.name ?? 'Alguém misterioso'}</Text>

          {isMeOnStage ? (
            <Text style={styles.stageHint}>Sua vez está rolando.</Text>
          ) : (
            <Text style={styles.stageHint}>A vez está rolando.</Text>
          )}

          {isMeOnStage && !wasRemovedFromRoom && (
            <View style={styles.buttonGroup}>
              <AppButton
                title="Concluir e voltar ao fim"
                loading={isChangingQueue}
                disabled={isBusy}
                onPress={onFinishTurn}
              />

              <AppButton
                title="Pular vez"
                variant="secondary"
                loading={isChangingQueue}
                disabled={isBusy}
                onPress={onSkipTurn}
              />

              <AppButton
                title="Parar de cantar"
                variant="danger"
                loading={isChangingQueue}
                disabled={isBusy}
                onPress={onStopSinging}
              />
            </View>
          )}

          {isOwner && !isMeOnStage && (
            <AppButton
              title="Remover do palco"
              variant="danger"
              loading={isChangingQueue}
              disabled={isBusy}
              onPress={() => onOwnerRemoveFromStage(currentOnStage)}
            />
          )}
        </>
      ) : (
        <View style={styles.freeStageBox}>
          <Text style={styles.heroEyebrow}>{isRoomClosed ? 'Encerrado' : 'Disponível'}</Text>
          <Text style={styles.stageName}>{isRoomClosed ? 'Palco fechado' : 'Palco livre'}</Text>
          <Text style={styles.stageHint}>
            {isRoomClosed ? 'A noite terminou.' : 'A próxima pessoa da fila entra automaticamente.'}
          </Text>
        </View>
      )}
    </View>
  );
}
