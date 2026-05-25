import { Text, View } from 'react-native';

import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

type RoomHeaderProps = {
  roomName: string;
  roomCode: string;
  isClosed: boolean;
  isCopyingCode: boolean;
  onCopyCode: () => void;
};

export function RoomHeader({
  roomName,
  roomCode,
  isClosed,
  isCopyingCode,
  onCopyCode,
}: RoomHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={styles.badge}>{isClosed ? 'Sala encerrada' : 'Sala ativa'}</Text>
        <View style={styles.codeChip}>
          <Text style={styles.codeChipLabel}>Código</Text>
          <Text style={styles.codeChipValue}>{roomCode}</Text>
        </View>
      </View>

      <Text style={styles.title}>{roomName}</Text>

      {!isClosed && (
        <View style={styles.headerActions}>
          <AppButton
            title="Copiar código"
            variant="ghost"
            size="small"
            loading={isCopyingCode}
            disabled={isCopyingCode}
            onPress={onCopyCode}
          />
        </View>
      )}
    </View>
  );
}
