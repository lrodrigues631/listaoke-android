import { Text, View } from 'react-native';

import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

type InviteCardProps = {
  roomCode: string;
  isCopyingInvite: boolean;
  onCopyInvite: () => void;
  onCopyCode: () => void;
};

export function InviteCard({
  roomCode,
  isCopyingInvite,
  onCopyInvite,
  onCopyCode,
}: InviteCardProps) {
  return (
    <View style={styles.inviteCard}>
      <Text style={styles.cardLabel}>Convite</Text>
      <Text style={styles.inviteCode}>{roomCode}</Text>
      <Text style={styles.inviteText}>Compartilhe esse código para a turma entrar na sala.</Text>

      <View style={styles.buttonGroup}>
        <AppButton
          title="Copiar convite"
          loading={isCopyingInvite}
          disabled={isCopyingInvite}
          onPress={onCopyInvite}
        />

        <AppButton
          title="Copiar só o código"
          variant="secondary"
          loading={isCopyingInvite}
          disabled={isCopyingInvite}
          onPress={onCopyCode}
        />
      </View>
    </View>
  );
}
