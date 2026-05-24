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
import { normalizeRoomCode } from '../../utils/normalizeRoomCode';

type JoinRoomScreenProps = {
  isJoining: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onJoinRoom: (roomCode: string, guestName: string) => void;
};

export function JoinRoomScreen({
  isJoining,
  errorMessage,
  onBack,
  onJoinRoom,
}: JoinRoomScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  function handleJoinRoom() {
    const cleanRoomCode = normalizeRoomCode(roomCode);
    const cleanGuestName = guestName.trim();

    if (!cleanRoomCode) {
      setLocalError('Digite o código da sala. Sem código, sem karaokê.');
      return;
    }

    if (cleanRoomCode.length !== 4) {
      setLocalError('O código da sala tem 4 números. Confere aí antes de culpar o app.');
      return;
    }

    if (!cleanGuestName) {
      setLocalError('Coloca seu nome ou apelido. A fila precisa saber quem é você.');
      return;
    }

    setLocalError(null);
    onJoinRoom(cleanRoomCode, cleanGuestName);
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity disabled={isJoining} onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.badge}>Entrar na sala</Text>

          <Text style={styles.title}>Ache o karaokê da turma.</Text>

          <Text style={styles.subtitle}>
            Digite os 4 números que mandaram no grupo e escolha o nome que vai aparecer para todo mundo.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Código da sala</Text>

            <TextInput
              editable={!isJoining}
              value={roomCode}
              onChangeText={(value) => setRoomCode(normalizeRoomCode(value))}
              placeholder="Ex: 0427"
              placeholderTextColor="#737380"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Seu nome</Text>

            <TextInput
              editable={!isJoining}
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Ex: Ana"
              placeholderTextColor="#737380"
              style={styles.input}
              maxLength={40}
            />
          </View>

          {(localError || errorMessage) && (
            <Text style={styles.errorText}>{localError || errorMessage}</Text>
          )}

          <TouchableOpacity
            disabled={isJoining}
            style={[styles.primaryButton, isJoining && styles.disabledButton]}
            onPress={handleJoinRoom}
          >
            {isJoining ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryButtonText}>Entrar na sala</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Entrar na sala não te coloca automaticamente na fila. Primeiro você chega, depois decide se vai encarar o microfone.
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