import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { theme } from '../../../constants/theme';
import type { QueueItem } from '../../../types/queueTypes';
import type { RoomMember } from '../../../types/roomTypes';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedEntrance, GlowPulse } from '../ui/MicroInteractions';

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
  onOwnerAddManualQueueItem: (name: string) => void;
  onOwnerMoveQueueItem: (item: QueueItem, direction: QueueMoveDirection) => void;
  onOwnerRemoveQueueItem: (item: QueueItem) => void;
};

function getMemberRoleLabel(member: RoomMember | undefined) {
  if (!member) {
    return 'Participante';
  }

  if (member.is_manual) {
    return 'Adicionado pelo dono';
  }

  return member.role === 'owner' ? 'Dono da sala' : 'Convidado';
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
  onOwnerAddManualQueueItem,
  onOwnerMoveQueueItem,
  onOwnerRemoveQueueItem,
}: QueueCardProps) {
  const [manualName, setManualName] = useState('');
  const nextItem = waitingQueue[0] ?? null;

  function handleAddManualPerson() {
    const cleanName = manualName.trim();

    if (!cleanName) {
      return;
    }

    onOwnerAddManualQueueItem(cleanName);
    setManualName('');
  }

  return (
    <AnimatedEntrance type="slideUp">
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Fila de espera</Text>

            <Text accessibilityRole="header" style={styles.title}>
              {waitingQueue.length === 1
                ? '1 pessoa na fila'
                : `${waitingQueue.length} pessoas na fila`}
            </Text>
          </View>

          <AppBadge
            label={`${waitingQueue.length}`}
            variant={waitingQueue.length ? 'primary' : 'neutral'}
          />
        </View>

        {isOwner && !isRoomClosed ? (
          <View style={styles.manualQueueBox}>
            <Text style={styles.manualTitle}>Adicionar sem app</Text>

            <TextInput
              accessibilityHint="Digite o nome para colocar a pessoa na fila."
              accessibilityLabel="Nome do cantor"
              value={manualName}
              onChangeText={setManualName}
              placeholder="Nome da pessoa"
              placeholderTextColor={theme.colors.textSoft}
              editable={!isChangingQueue}
              returnKeyType="done"
              onSubmitEditing={handleAddManualPerson}
              style={styles.manualQueueInput}
            />

            <AppButton
              title="Colocar na fila"
              accessibilityLabel="Adicionar cantor manualmente à fila"
              size="compact"
              disabled={isChangingQueue || !manualName.trim()}
              loading={isChangingQueue}
              onPress={handleAddManualPerson}
            />
          </View>
        ) : null}

        {isLoadingQueue ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando a fila...</Text>
          </View>
        ) : null}

        {queueError ? <Text style={styles.errorText}>{queueError}</Text> : null}

        {!isLoadingQueue && !queueError && waitingQueue.length === 0 ? (
          <EmptyState
            badge={isRoomClosed ? 'Encerrada' : 'Fila vazia'}
            title={isRoomClosed ? 'A fila foi encerrada.' : 'Ninguém esperando agora.'}
            message={
              isRoomClosed
                ? 'O resumo da noite fica logo acima.'
                : isOwner
                  ? 'Chame a turma pelo código ou adicione alguém sem app.'
                  : 'Quando alguém entrar, a ordem aparece aqui.'
            }
          />
        ) : null}

        {!isLoadingQueue && !queueError && !isRoomClosed && nextItem ? (
          <View style={styles.nextBox}>
            <Text style={styles.nextLabel}>Próximo</Text>
            <Text style={styles.nextName}>
              {membersById[nextItem.member_id]?.name ?? 'Participante'}
            </Text>
          </View>
        ) : null}

        {!isLoadingQueue && !queueError && !isRoomClosed ? (
          <View style={styles.queueList}>
            {waitingQueue.map((item, index) => {
              const member = membersById[item.member_id];
              const isThisMe = item.member_id === currentMemberId;
              const isFirst = index === 0;
              const isLast = index === waitingQueue.length - 1;

              return (
                <GlowPulse key={item.id} active={isThisMe} borderRadius={theme.radius.lg}>
                  <View
                    style={[
                      styles.queueItem,
                      isFirst && styles.nextItem,
                      isThisMe && styles.myItem,
                    ]}
                  >
                    <View style={styles.queueItemMain}>
                      <Text
                        style={[
                          styles.queuePosition,
                          isThisMe && styles.myQueuePosition,
                        ]}
                      >
                        {index + 1}
                      </Text>

                      <View style={styles.queueInfo}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.memberName}
                        >
                          {member?.name ?? 'Participante'}
                        </Text>

                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.memberRole}
                        >
                          {getMemberRoleLabel(member)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.badges}>
                      {isFirst ? <AppBadge label="Próximo" variant="primary" /> : null}
                      {isThisMe ? <AppBadge label="Você" variant="accent" /> : null}
                      {member?.is_manual ? (
                        <AppBadge label="Manual" variant="neutral" />
                      ) : null}
                    </View>

                    {isOwner ? (
                      <View style={styles.queueAdminActions}>
                        <View style={styles.actionButton}>
                          <AppButton
                            title="Subir"
                            accessibilityLabel={`Subir ${member?.name ?? 'participante'} na fila`}
                            variant="secondary"
                            size="compact"
                            disabled={isChangingQueue || isRoomClosed || isFirst}
                            onPress={() => onOwnerMoveQueueItem(item, 'up')}
                          />
                        </View>

                        <View style={styles.actionButton}>
                          <AppButton
                            title="Descer"
                            accessibilityLabel={`Descer ${member?.name ?? 'participante'} na fila`}
                            variant="secondary"
                            size="compact"
                            disabled={isChangingQueue || isRoomClosed || isLast}
                            onPress={() => onOwnerMoveQueueItem(item, 'down')}
                          />
                        </View>

                        <View style={styles.actionButtonFull}>
                          <AppButton
                            title="Remover"
                            accessibilityLabel={`Remover ${member?.name ?? 'participante'} da fila`}
                            variant="dangerOutline"
                            size="compact"
                            disabled={isChangingQueue || isRoomClosed}
                            onPress={() => onOwnerRemoveQueueItem(item)}
                          />
                        </View>
                      </View>
                    ) : null}
                  </View>
                </GlowPulse>
              );
            })}
          </View>
        ) : null}
      </AppCard>
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
    minWidth: 0,
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
  manualQueueBox: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  manualTitle: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  manualQueueInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
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
  errorText: {
    color: theme.colors.danger,
    ...theme.typography.body,
  },
  nextBox: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  nextLabel: {
    color: theme.colors.accentStrong,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  nextName: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  queueList: {
    gap: theme.spacing.sm,
  },
  queueItem: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  nextItem: {
    borderColor: theme.colors.primarySoft,
  },
  myItem: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.borderStrong,
  },
  queueItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    width: '100%',
  },
  queuePosition: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 17,
    fontWeight: '900',
    overflow: 'hidden',
  },
  myQueuePosition: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
  },
  queueInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  memberName: {
    color: theme.colors.text,
    minWidth: 0,
    ...theme.typography.bodyStrong,
  },
  memberRole: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    width: '100%',
  },
  queueAdminActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    width: '100%',
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 110,
  },
  actionButtonFull: {
    flexGrow: 1,
    flexBasis: '100%',
  },
});