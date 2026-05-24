import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HomeScreenProps = {
  userId: string | null;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
};

export function HomeScreen({ userId, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Listaokê Mobile</Text>
        <Text style={styles.title}>Karaokê sem bagunça na fila.</Text>
        <Text style={styles.subtitle}>
          Crie uma sala, compartilhe o código e deixe a turma disputar o microfone com um pouco mais de dignidade.
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
          {userId ? 'Usuário anônimo conectado. Tudo certo por aqui.' : 'Conectando usuário anônimo...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101014',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    gap: 16,
    paddingTop: 64,
  },
  badge: {
    color: '#A7F3D0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
  },
  subtitle: {
    color: '#C9C9D1',
    fontSize: 17,
    lineHeight: 26,
  },
  actions: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: '#A7F3D0',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#101014',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#24242D',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#353542',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  footer: {
    paddingBottom: 16,
  },
  footerText: {
    color: '#8E8E9A',
    fontSize: 13,
    lineHeight: 20,
  },
});