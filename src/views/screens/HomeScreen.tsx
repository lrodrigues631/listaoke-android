import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { AppButton } from '../components/ui/AppButton';
import { ScreenShell } from '../components/ui/ScreenShell';

type HomeScreenProps = {
  userId: string | null;
  authMessage: string;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
};

export function HomeScreen({ userId, authMessage, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  return (
    <ScreenShell scroll={false} contentStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Listaokê</Text>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>ao vivo</Text>
          </View>
        </View>

        <Text style={styles.title}>Fila de karaokê sem confusão.</Text>
        <Text style={styles.subtitle}>Crie uma sala, chame a turma e deixe o palco girar.</Text>
      </View>

      <View style={styles.actions}>
        <AppButton title="Criar sala" onPress={onCreateRoom} />
        <AppButton title="Entrar com código" variant="secondary" onPress={onJoinRoom} />
      </View>

      <View style={styles.statusBox}>
        <View style={[styles.statusDot, userId ? styles.statusDotOn : styles.statusDotOff]} />
        <Text style={styles.statusText}>
          {userId ? authMessage : 'Conectando usuário anônimo...'}
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  hero: {
    gap: 16,
    paddingTop: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  livePill: {
    backgroundColor: colors.primaryMuted,
    borderColor: '#2D6B55',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  livePillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
  },
  actions: {
    gap: 12,
  },
  statusBox: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusDotOn: {
    backgroundColor: colors.primary,
  },
  statusDotOff: {
    backgroundColor: colors.textSoft,
  },
  statusText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
