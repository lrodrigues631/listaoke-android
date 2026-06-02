import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DraggableFlatList, {
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import Svg, { Path } from 'react-native-svg';

import type { QueueItem } from '../../../types/queueTypes';
import type { RoomMember } from '../../../types/roomTypes';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

type QueueMoveDirection = 'up' | 'down';

type QueueReorderPayload = {
  item: QueueItem;
  from: number;
  to: number;
  orderedItems: QueueItem[];
};

type QueueCardProps = {
  waitingQueue: QueueItem[];
  membersById: Record<string, RoomMember>;
  currentMemberId: string;
  isLoadingQueue: boolean;
  queueError: string | null;
  isRoomClosed: boolean;
  isOwner: boolean;
  isChangingQueue: boolean;
  showOwnerControls?: boolean;
  compact?: boolean;
  onOwnerAddManualQueueItem: (name: string) => void;
  onOwnerMoveQueueItem: (item: QueueItem, direction: QueueMoveDirection) => void;
  onOwnerRemoveQueueItem: (item: QueueItem) => void;
  onOwnerReorderQueue?: (payload: QueueReorderPayload) => void;
  onCurrentMemberReorderQueue?: (payload: QueueReorderPayload) => void;
  onCurrentMemberLeaveQueue?: () => void;
  onCurrentMemberMoveDown?: () => void;
};

type QueueIconButtonProps = {
  icon?: 'trash';
  label?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  danger?: boolean;
  onPress: () => void;
};

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function QueueIconButton({
  icon,
  label,
  accessibilityLabel,
  disabled = false,
  danger = false,
  onPress,
}: QueueIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        danger && styles.iconButtonDanger,
        disabled && styles.iconButtonDisabled,
        pressed && !disabled && styles.iconButtonPressed,
      ]}
    >
      {icon === 'trash' ? (
        <TrashIcon color={disabled ? 'rgba(255,255,255,0.55)' : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.iconButtonText,
            danger && styles.iconButtonTextDanger,
            disabled && styles.iconButtonTextDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function QueueSeparator() {
  return <View style={styles.queueSeparator} />;
}

export function QueueCard({
  waitingQueue,
  membersById,
  currentMemberId,
  isLoadingQueue,
  queueError,
  isRoomClosed,
  isOwner,
  isChangingQueue,
  showOwnerControls = true,
  compact = false,
  onOwnerAddManualQueueItem,
  onOwnerMoveQueueItem,
  onOwnerRemoveQueueItem,
  onOwnerReorderQueue,
  onCurrentMemberReorderQueue,
  onCurrentMemberLeaveQueue,
  onCurrentMemberMoveDown,
}: QueueCardProps) {
  const [manualName, setManualName] = useState('');

  const canAddManual =
    isOwner &&
    showOwnerControls &&
    !isRoomClosed &&
    !isChangingQueue &&
    manualName.trim().length > 0;

  const canOwnerDrag =
    isOwner &&
    !isRoomClosed &&
    !isChangingQueue &&
    Boolean(onOwnerReorderQueue);

  function handleAddManual() {
    const cleanName = manualName.trim();

    if (!cleanName) {
      return;
    }

    onOwnerAddManualQueueItem(cleanName);
    setManualName('');
  }

  function renderQueueItem({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<QueueItem>) {
    const currentIndex = getIndex();
    const index =
      typeof currentIndex === 'number'
        ? currentIndex
        : waitingQueue.findIndex((queueItem) => queueItem.id === item.id);

    const member = membersById[item.member_id];
    const displayName = member?.name ?? 'Participante';
    const isThisMe = item.member_id === currentMemberId;
    const isFirst = index === 0;
    const isLast = index === waitingQueue.length - 1;

    const canRemove = isOwner || isThisMe;
    const canMoveUp = isOwner && showOwnerControls && !isFirst;
    const canMoveDown = isOwner
      ? showOwnerControls && !isLast
      : isThisMe && !isLast && Boolean(onCurrentMemberMoveDown);

    const canCurrentMemberDrag =
      !isOwner &&
      isThisMe &&
      !isLast &&
      !isRoomClosed &&
      !isChangingQueue &&
      Boolean(onCurrentMemberReorderQueue);

    const canDragItem = canOwnerDrag || canCurrentMemberDrag;
    const showActions = canRemove || (isOwner && showOwnerControls) || isThisMe;

    const dragAccessibilityLabel = isOwner
      ? `Reorganizar ${displayName} na fila`
      : 'Adiar minha vez na fila';

    const dragAccessibilityHint = isOwner
      ? 'Segure e arraste para mudar a posição na fila.'
      : 'Segure e arraste para baixo para adiar sua vez.';

    const dragHint = isOwner ? 'segure e arraste' : 'arraste para baixo';

    return (
      <Pressable
        accessibilityRole={canDragItem ? 'button' : undefined}
        accessibilityLabel={canDragItem ? dragAccessibilityLabel : undefined}
        accessibilityHint={canDragItem ? dragAccessibilityHint : undefined}
        disabled={!canDragItem || isActive}
        delayLongPress={220}
        onLongPress={canDragItem ? drag : undefined}
        style={({ pressed }) => [
          styles.queueItem,
          compact && styles.queueItemCompact,
          isFirst && styles.queueItemFirst,
          isThisMe && styles.queueItemMe,
          canDragItem && styles.queueItemDraggable,
          pressed && canDragItem && !isActive && styles.queueItemPressed,
          isActive && styles.queueItemActive,
        ]}
      >
        <View style={styles.positionArea}>
          <View
            style={[
              styles.positionBadge,
              compact && styles.positionBadgeCompact,
              isActive && styles.positionBadgeActive,
            ]}
          >
            <Text style={[styles.positionText, compact && styles.positionTextCompact]}>
              {index + 1}
            </Text>
          </View>
        </View>

        <View style={styles.nameArea}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.name, compact && styles.nameCompact]}
          >
            {displayName}
          </Text>

          {canDragItem ? (
            <Text
              numberOfLines={1}
              style={[styles.dragHint, isActive && styles.dragHintActive]}
            >
              {dragHint}
            </Text>
          ) : null}
        </View>

        <View style={styles.actionsArea}>
          {canRemove ? (
            <QueueIconButton
              icon={isOwner ? 'trash' : undefined}
              label={isOwner ? undefined : '×'}
              danger
              accessibilityLabel={
                isOwner
                  ? `Remover ${displayName} da fila`
                  : 'Sair da fila'
              }
              disabled={isChangingQueue || isRoomClosed}
              onPress={() => {
                if (isOwner) {
                  onOwnerRemoveQueueItem(item);
                  return;
                }

                onCurrentMemberLeaveQueue?.();
              }}
            />
          ) : (
            null
          )}

          {isOwner && showOwnerControls ? (
            <QueueIconButton
              label="↑"
              accessibilityLabel={`Subir ${displayName} na fila`}
              disabled={isChangingQueue || isRoomClosed || !canMoveUp}
              onPress={() => onOwnerMoveQueueItem(item, 'up')}
            />
          ) : (
            null
          )}

          {showActions && (!isOwner || showOwnerControls) ? (
            <QueueIconButton
              label="↓"
              accessibilityLabel={
                isOwner ? `Descer ${displayName} na fila` : 'Adiar minha vez'
              }
              disabled={isChangingQueue || isRoomClosed || !canMoveDown}
              onPress={() => {
                if (isOwner) {
                  onOwnerMoveQueueItem(item, 'down');
                  return;
                }

                onCurrentMemberMoveDown?.();
              }}
            />
          ) : (
            null
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Fila de espera</Text>

          <Text
            accessibilityRole="header"
            style={[styles.title, compact && styles.compactTitle]}
          >
            {waitingQueue.length === 1
              ? '1 pessoa na fila'
              : `${waitingQueue.length} pessoas na fila`}
          </Text>
        </View>

        <View style={styles.counter}>
          <Text style={styles.counterText}>{waitingQueue.length}</Text>
        </View>
      </View>

      {isOwner && showOwnerControls && !isRoomClosed ? (
        <View style={styles.manualBox}>
          <Text style={styles.manualTitle}>Adicionar sem app</Text>

          <View style={styles.manualRow}>
            <TextInput
              accessibilityLabel="Nome da pessoa"
              value={manualName}
              onChangeText={setManualName}
              placeholder="Nome"
              placeholderTextColor="rgba(255,255,255,0.38)"
              editable={!isChangingQueue}
              returnKeyType="done"
              onSubmitEditing={handleAddManual}
              style={styles.manualInput}
            />

            <AppButton
              title="+"
              size="compact"
              disabled={!canAddManual}
              loading={isChangingQueue}
              onPress={handleAddManual}
            />
          </View>
        </View>
      ) : null}

      {isLoadingQueue ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#F04BFF" />
          <Text style={styles.loadingText}>Carregando a fila...</Text>
        </View>
      ) : null}

      {queueError ? <Text style={styles.errorText}>{queueError}</Text> : null}

      {!isLoadingQueue && !queueError && waitingQueue.length === 0 ? (
        <Text style={styles.emptyText}>
          {isRoomClosed ? 'A fila foi encerrada.' : 'Ninguém esperando agora.'}
        </Text>
      ) : null}

      {!isLoadingQueue && !queueError && !isRoomClosed && waitingQueue.length > 0 ? (
        <View style={styles.queueWrap}>
          <DraggableFlatList
            data={waitingQueue}
            keyExtractor={(item) => item.id}
            renderItem={renderQueueItem}
            ItemSeparatorComponent={QueueSeparator}
            scrollEnabled={false}
            activationDistance={8}
            dragItemOverflow
            removeClippedSubviews={false}
            containerStyle={styles.queueList}
            contentContainerStyle={styles.queueListContent}
            onDragEnd={({ data, from, to }) => {
              if (from === to) {
                return;
              }

              const movedItem = waitingQueue[from];

              if (!movedItem) {
                return;
              }

              if (canOwnerDrag) {
                onOwnerReorderQueue?.({
                  item: movedItem,
                  from,
                  to,
                  orderedItems: data,
                });
                return;
              }

              const canCurrentMemberSaveDrag =
                !isOwner &&
                movedItem.member_id === currentMemberId &&
                Boolean(onCurrentMemberReorderQueue);

              if (!canCurrentMemberSaveDrag) {
                return;
              }

              if (to <= from) {
                return;
              }

              onCurrentMemberReorderQueue?.({
                item: movedItem,
                from,
                to,
                orderedItems: data,
              });
            }}
          />
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: '#F04BFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
  },
  compactTitle: {
    fontSize: 22,
    lineHeight: 27,
  },
  counter: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240, 75, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(240, 75, 255, 0.25)',
  },
  counterText: {
    color: '#FF9BFF',
    fontSize: 15,
    fontWeight: '900',
  },
  manualBox: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 10,
  },
  manualTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  manualInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: 'rgba(9, 7, 19, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
  },
  errorText: {
    color: '#FF8DA3',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 15,
    lineHeight: 21,
  },
  queueWrap: {
    overflow: 'visible',
  },
  queueList: {
    overflow: 'visible',
  },
  queueListContent: {
    paddingVertical: 2,
  },
  queueSeparator: {
    height: 10,
  },
  queueItem: {
    minHeight: 76,
    borderRadius: 22,
    paddingLeft: 10,
    paddingRight: 9,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  queueItemCompact: {
    minHeight: 62,
    borderRadius: 18,
    paddingVertical: 7,
  },
  queueItemFirst: {
    borderColor: 'rgba(240, 75, 255, 0.42)',
    backgroundColor: 'rgba(240, 75, 255, 0.065)',
  },
  queueItemMe: {
    borderColor: 'rgba(255, 155, 255, 0.52)',
  },
  queueItemDraggable: {
    borderColor: 'rgba(255,255,255,0.16)',
  },
  queueItemPressed: {
    opacity: 0.94,
  },
  queueItemActive: {
    borderColor: 'rgba(240, 75, 255, 0.82)',
    backgroundColor: 'rgba(34, 21, 54, 0.98)',
    shadowColor: '#F04BFF',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 7,
    zIndex: 20,
  },
  positionArea: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 6, 18, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  positionBadgeCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  positionBadgeActive: {
    borderColor: 'rgba(240, 75, 255, 0.75)',
    backgroundColor: 'rgba(8, 6, 18, 0.98)',
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  positionTextCompact: {
    fontSize: 15,
    lineHeight: 18,
  },
  nameArea: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  dragHint: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 1,
  },
  nameCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  dragHintActive: {
    color: 'rgba(255,255,255,0.6)',
  },
  actionsArea: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconButton: {
    width: 30,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 11, 30, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  iconButtonDanger: {
    backgroundColor: 'rgba(95, 22, 41, 0.34)',
    borderColor: 'rgba(255, 99, 132, 0.58)',
  },
  iconButtonDisabled: {
    opacity: 0.26,
  },
  iconButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  iconButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
  iconButtonTextDanger: {
    color: '#FF8DA3',
    fontSize: 18,
    lineHeight: 18,
  },
  iconButtonTextDisabled: {
    color: 'rgba(255,255,255,0.55)',
  },
  iconGhost: {
    width: 30,
    height: 22,
  },
});
