import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import type { RoomMember } from '../../../types/roomTypes';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedEntrance } from '../ui/MicroInteractions';

type MembersCardProps = {
  members: RoomMember[];
  currentMemberId: string;
  isLoadingMembers: boolean;
  membersError: string | null;
  isOwner: boolean;
  isRoomClosed: boolean;
  isChangingMember: boolean;
  currentOnStageMemberId?: string | null;
  queuedMemberIds?: string[];
  onTransferOwnership: (member: RoomMember) => void;
  onRemoveMember: (member: RoomMember) => void;
};

function getMemberRoleLabel(member: RoomMember) {
  if (member.is_manual) {
    return 'Adicionado pelo dono';
  }

  return member.role === 'owner' ? 'Dono da sala' : 'Convidado';
}

function getMemberStateLabel(
  member: RoomMember,
  currentOnStageMemberId: string | null | undefined,
  queuedMemberIds: string[]
) {
  if (member.id === currentOnStageMemberId) {
    return 'Cantando agora';
  }

  if (queuedMemberIds.includes(member.id)) {
    return 'Na fila';
  }

  return 'Fora da fila';
}

export function MembersCard({
  members,
  currentMemberId,
  isLoadingMembers,
  membersError,
  isOwner,
  isRoomClosed,
  isChangingMember,
  currentOnStageMemberId = null,
  queuedMemberIds = [],
  onTransferOwnership,
  onRemoveMember,
}: MembersCardProps) {
  const onStageCount = currentOnStageMemberId ? 1 : 0;
  const queuedCount = queuedMemberIds.length;
  const outsideCount = Math.max(members.length - onStageCount - queuedCount, 0);

  return (
    <AnimatedEntrance type="slideUp">
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Pessoas</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Membros da sala
            </Text>
            <Text style={styles.subtitle}>Sala, fila e palco não são a mesma coisa.</Text>
          </View>

          <AppBadge label={`${members.length}`} variant="neutral" />
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{onStageCount}</Text>
            <Text style={styles.summaryLabel}>no palco</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{queuedCount}</Text>
            <Text style={styles.summaryLabel}>na fila</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{outsideCount}</Text>
            <Text style={styles.summaryLabel}>fora da fila</Text>
          </View>
        </View>

        {isLoadingMembers ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando a turma...</Text>
          </View>
        ) : null}

        {membersError ? <Text style={styles.errorText}>{membersError}</Text> : null}

        {!isLoadingMembers && !membersError && members.length === 0 ? (
          <EmptyState
            badge="Sala vazia"
            title="Ninguém apareceu ainda."
            message="Quando alguém entrar na sala, a lista aparece aqui."
          />
        ) : null}

        {!isLoadingMembers && !membersError ? (
          <View style={styles.memberList}>
            {members.map((member) => {
              const isThisMe = member.id === currentMemberId;
              const stateLabel = getMemberStateLabel(member, currentOnStageMemberId, queuedMemberIds);
              const canManageThisMember = isOwner && !isThisMe && !isRoomClosed;
              const canTransferToThisMember = canManageThisMember && !member.is_manual;

              return (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {isThisMe ? <AppBadge label="Você" variant="accent" /> : null}
                    </View>

                    <Text style={styles.memberRole}>{getMemberRoleLabel(member)}</Text>
                  </View>

                  <View style={styles.memberMeta}>
                    <AppBadge
                      label={stateLabel}
                      variant={
                        stateLabel === 'Cantando agora'
                          ? 'primary'
                          : stateLabel === 'Na fila'
                            ? 'accent'
                            : 'neutral'
                      }
                    />
                    {member.is_manual ? <AppBadge label="Manual" variant="neutral" /> : null}
                  </View>

                  {canTransferToThisMember || canManageThisMember ? (
                    <View style={styles.memberActions}>
                      {canTransferToThisMember ? (
                        <AppButton
                          title="Virar dono"
                          accessibilityLabel={`Transferir administração para ${member.name}`}
                          size="compact"
                          disabled={isChangingMember}
                          onPress={() => onTransferOwnership(member)}
                        />
                      ) : null}

                      {canManageThisMember ? (
                        <AppButton
                          title="Remover"
                          accessibilityLabel={`Remover ${member.name} da sala`}
                          variant="dangerOutline"
                          size="compact"
                          disabled={isChangingMember}
                          onPress={() => onRemoveMember(member)}
                        />
                      ) : null}
                    </View>
                  ) : null}
                </View>
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
    gap: 3,
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
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  summaryBox: {
    flexGrow: 1,
    flexBasis: '30%',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  summaryNumber: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
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
  memberList: {
    gap: theme.spacing.sm,
  },
  memberItem: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  memberInfo: {
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  memberName: {
    color: theme.colors.text,
    flexShrink: 1,
    ...theme.typography.bodyStrong,
  },
  memberRole: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  memberMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  memberActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
