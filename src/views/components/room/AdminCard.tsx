import { Text, View } from 'react-native';

import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

type AdminCardProps = {
  transferableCount: number;
  removableCount: number;
  isCopyingInvite: boolean;
  isClosingRoom: boolean;
  onCopyInvite: () => void;
  onCloseRoom: () => void;
};

export function AdminCard({
  transferableCount,
  removableCount,
  isCopyingInvite,
  isClosingRoom,
  onCopyInvite,
  onCloseRoom,
}: AdminCardProps) {
  return (
    <View style={styles.adminCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Controle do dono</Text>
        <Text style={styles.ownerBadge}>Dono</Text>
      </View>

      <View style={styles.ownerActions}>
        <AppButton
          title="Copiar convite"
          variant="secondary"
          size="small"
          loading={isCopyingInvite}
          disabled={isCopyingInvite}
          onPress={onCopyInvite}
        />

        <Text style={styles.ownerHint}>Gerencie pessoas abaixo</Text>
      </View>

      <AppButton
        title="Fechar sala"
        variant="dangerOutline"
        loading={isClosingRoom}
        disabled={isClosingRoom}
        onPress={onCloseRoom}
      />

      {transferableCount === 0 && removableCount === 0 && (
        <Text style={styles.adminText}>Só você está na sala por enquanto.</Text>
      )}
    </View>
  );
}
