import { ActivityIndicator, Text, View } from 'react-native';

import type { QueueItem } from '../../../types/queueTypes';
import type { RoomMember } from '../../../types/roomTypes';
import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

type QueueMoveDirection = 'up' | 'down';

type QueueCardProps = {
  waitingQueue: QueueItem[];
  membersById: Record<string, RoomMember>;
  currentMemberId: string;
  isLoadingQueue: boolean;
  queueError: string | null;
  isRoomClosed: boolean;
  isOwner: boolean;
  isChangingQueue: boolean;
  onOwnerMoveQueueItem: (item: QueueItem, direction: QueueMoveDirection) => void;
  onOwnerRemoveQueueItem: (item: QueueItem) => void;
};

export function QueueCard({
  waitingQueue,
  membersById,
  currentMemberId,
  isLoadingQueue,
  queueError,
  isRoomClosed,
  isOwner,
  isChangingQueue,
  onOwnerMoveQueueItem,
  onOwnerRemoveQueueItem,
}: QueueCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fila de espera</Text>
        <Text style={styles.counter}>{waitingQueue.length}</Text>
      </View>

      {isLoadingQueue && (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Carregando a fila...</Text>
        </View>
      )}

      {queueError && <Text style={styles.errorText}>{queueError}</Text>}

      {!isLoadingQueue && !queueError && waitingQueue.length === 0 && (
        <Text style={styles.emptyText}>
          {isRoomClosed ? 'A fila foi encerrada.' : 'Ninguém esperando agora.'}
        </Text>
      )}

      {!isLoadingQueue &&
        !queueError &&
        !isRoomClosed &&
        waitingQueue.map((item, index) => {
          const member = membersById[item.member_id];
          const isThisMe = item.member_id === currentMemberId;
          const isFirst = index === 0;
          const isLast = index === waitingQueue.length - 1;

          return (
            <View key={item.id} style={styles.queueItem}>
              <Text style={styles.queuePosition}>{index + 1}</Text>

              <View style={styles.queueInfo}>
                <Text style={styles.memberName}>{member?.name ?? 'Participante'}</Text>
                <Text style={styles.memberRole}>
                  {member?.role === 'owner' ? 'Dono da sala' : 'Convidado'}
                </Text>
              </View>

              {isThisMe && <Text style={styles.youBadge}>Você</Text>}

              {isOwner && (
                <View style={styles.queueAdminActions}>
                  <AppButton
                    title="↑"
                    variant="secondary"
                    size="small"
                    disabled={isChangingQueue || isRoomClosed || isFirst}
                    onPress={() => onOwnerMoveQueueItem(item, 'up')}
                  />

                  <AppButton
                    title="↓"
                    variant="secondary"
                    size="small"
                    disabled={isChangingQueue || isRoomClosed || isLast}
                    onPress={() => onOwnerMoveQueueItem(item, 'down')}
                  />

                  <AppButton
                    title="Remover"
                    variant="dangerOutline"
                    size="small"
                    disabled={isChangingQueue || isRoomClosed}
                    onPress={() => onOwnerRemoveQueueItem(item)}
                  />
                </View>
              )}
            </View>
          );
        })}
    </View>
  );
}
