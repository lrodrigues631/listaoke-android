import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type CreateRoomScreenProps = {
  onBack: () => void;
  onCreateRoom: (roomName: string, ownerName: string) => void;
};

export function CreateRoomScreen({ onBack, onCreateRoom }: CreateRoomScreenProps) {
  const [roomName, setRoomName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleCreateRoom() {
    const cleanRoomName = roomName.trim();
    const cleanOwnerName = ownerName.trim();

    if (!cleanRoomName) {
      setError('Dá um nome para a sala. “Karaokê aleatório” até vale, mas precisa ter nome.');
      return;
    }

    if (!cleanOwnerName) {
      setError('Coloca seu nome ou apelido. O microfone precisa saber quem manda.');
      return;
    }

    setError(null);
    onCreateRoom(cleanRoomName, cleanOwnerName);
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.badge}>Nova sala</Text>
          <Text style={styles.title}>Monte o palco da turma.</Text>
          <Text style={styles.subtitle}>
            Crie uma sala, compartilhe o código e deixe a fila organizada antes que alguém grite “é minha vez”.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome da sala</Text>
            <TextInput
              value={roomName}
              onChangeText={setRoomName}
              placeholder="Ex: Karaokê de sábado"
              placeholderTextColor="#737380"
              style={styles.input}
              maxLength={60}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Seu nome</Text>
            <TextInput
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Ex: Leandro"
              placeholderTextColor="#737380"
              style={styles.input}
              maxLength={40}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoom}>
            <Text style={styles.primaryButtonText}>Criar sala</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          A sala começa só com você. Os convidados entram depois pelo código.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#101014',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#101014',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    gap: 14,
    paddingTop: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#24242D',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  badge: {
    color: '#A7F3D0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
  subtitle: {
    color: '#C9C9D1',
    fontSize: 17,
    lineHeight: 26,
  },
  form: {
    gap: 18,
    marginTop: 40,
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#1B1B22',
    borderWidth: 1,
    borderColor: '#353542',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#A7F3D0',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#101014',
    fontSize: 17,
    fontWeight: '900',
  },
  footerText: {
    color: '#8E8E9A',
    fontSize: 13,
    lineHeight: 20,
    paddingTop: 32,
    paddingBottom: 12,
  },
});