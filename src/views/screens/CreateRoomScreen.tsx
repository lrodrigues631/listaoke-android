import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';

type CreateRoomScreenProps = {
  isCreating: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onCreateRoom: (roomName: string, ownerName: string) => void;
};

export function CreateRoomScreen({
  isCreating,
  errorMessage,
  onBack,
  onCreateRoom,
}: CreateRoomScreenProps) {
  const [roomName, setRoomName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  function handleCreateRoom() {
    const cleanRoomName = roomName.trim();
    const cleanOwnerName = ownerName.trim();

    if (!cleanRoomName) {
      setLocalError('Dá um nome para a sala. “Karaokê aleatório” até vale, mas precisa ter nome.');
      return;
    }

    if (!cleanOwnerName) {
      setLocalError('Coloca seu nome ou apelido. O microfone precisa saber quem manda.');
      return;
    }

    setLocalError(null);
    onCreateRoom(cleanRoomName, cleanOwnerName);
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity disabled={isCreating} onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.badge}>Nova sala</Text>

          <Text style={styles.title}>Monte o palco da turma.</Text>

          <Text style={styles.subtitle}>
            Crie uma sala, compartilhe o código e deixe a fila organizada antes que alguém grite
            “é minha vez”.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome da sala</Text>

            <TextInput
              editable={!isCreating}
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
              editable={!isCreating}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Ex: Leandro"
              placeholderTextColor="#737380"
              style={styles.input}
              maxLength={40}
            />
          </View>

          {(localError || errorMessage) && (
            <Text style={styles.errorText}>{localError || errorMessage}</Text>
          )}

          <TouchableOpacity
            disabled={isCreating}
            style={[styles.primaryButton, isCreating && styles.disabledButton]}
            onPress={handleCreateRoom}
          >
            {isCreating ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryButtonText}>Criar sala</Text>
            )}
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
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    gap: 14,
    paddingTop: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  badge: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
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
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: colors.text,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '900',
  },
  footerText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    paddingTop: 32,
    paddingBottom: 12,
  },
});