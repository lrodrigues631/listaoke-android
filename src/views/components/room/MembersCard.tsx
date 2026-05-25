import { ActivityIndicator, Text, View } from 'react-native';

import type { RoomMember } from '../../../types/roomTypes';
import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

type MembersCardProps = {
  members: RoomMember[];
  currentMemberId: string;
  isLoadingMembers: boolean;
  membersError: string | null;
  isOwner: boolean;
  isRoomClosed: boolean;
  isChangingMember: boolean;
  onTransferOwnership: (member: RoomMember) => void;
  onRemoveMember: (member: RoomMember) => void;
};

export function MembersCard({
  members,
  currentMemberId,
  isLoadingMembers,
  membersError,
  isOwner,
  isRoomClosed,
  isChangingMember,
  onTransferOwnership,
  onRemoveMember,
}: MembersCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Membros</Text>
        <Text style={styles.counter}>{members.length}</Text>
      </View>

      {isLoadingMembers && (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Carregando a turma...</Text>
        </View>
      )}

      {membersError && <Text style={styles.errorText}>{membersError}</Text>}

      {!isLoadingMembers && !membersError && members.length === 0 && (
        <Text style={styles.emptyText}>Ninguém apareceu ainda. Nem o tio do "só uma música".</Text>
      )}

      {!isLoadingMembers &&
        !membersError &&
        members.map((member) => {
          const isThisMe = member.id === currentMemberId;
          const canManageThisMember = isOwner && !isThisMe && !isRoomClosed;

          return (
            <View key={member.id} style={styles.memberItem}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>
                  {member.role === 'owner' ? 'Dono da sala' : 'Convidado'}
                </Text>
              </View>

              <View style={styles.memberActions}>
                {isThisMe && <Text style={styles.youBadge}>Você</Text>}

                {canManageThisMember && (
                  <>
                    <AppButton
                      title="Virar dono"
                      size="small"
                      disabled={isChangingMember}
                      onPress={() => onTransferOwnership(member)}
                    />

                    <AppButton
                      title="Remover"
                      variant="dangerOutline"
                      size="small"
                      disabled={isChangingMember}
                      onPress={() => onRemoveMember(member)}
                    />
                  </>
                )}
              </View>
            </View>
          );
        })}
    </View>
  );
}
