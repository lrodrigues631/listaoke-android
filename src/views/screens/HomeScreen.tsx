import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';

type HomeScreenProps = {
  userId: string | null;
  authMessage: string;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
};

export function HomeScreen({ userId, authMessage, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Listaokê Mobile</Text>

        <Text style={styles.title}>Karaokê sem guerra civil na fila.</Text>

        <Text style={styles.subtitle}>
          Crie uma sala, compartilhe o código e deixe todo mundo acompanhar quem canta agora,
          quem está na fila e quem está só enrolando.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={onCreateRoom}>
          <Text style={styles.primaryButtonText}>Criar sala</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onJoinRoom}>
          <Text style={styles.secondaryButtonText}>Entrar com código</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {userId ? authMessage : 'Conectando usuário anônimo...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    gap: 16,
    paddingTop: 64,
  },
  badge: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 26,
  },
  actions: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  footer: {
    paddingBottom: 16,
  },
  footerText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
  },
});