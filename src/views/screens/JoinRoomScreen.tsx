import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { normalizeRoomCode } from '../../utils/normalizeRoomCode';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { ScreenShell } from '../components/ui/ScreenShell';

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
      <ScreenShell contentStyle={styles.container}>
        <View style={styles.header}>
          <AppButton title="Voltar" variant="ghost" size="small" disabled={isJoining} onPress={onBack} />
          <Text style={styles.badge}>Entrar na sala</Text>
          <Text style={styles.title}>Digite o código.</Text>
          <Text style={styles.subtitle}>São 4 números. Seu apelido vem logo abaixo.</Text>
        </View>

        <View style={styles.formCard}>
          <AppTextInput
            editable={!isJoining}
            value={roomCode}
            onChangeText={(value) => setRoomCode(normalizeRoomCode(value))}
            label="Código da sala"
            placeholder="0427"
            keyboardType="number-pad"
            maxLength={4}
            isCode
          />

          <AppTextInput
            editable={!isJoining}
            value={guestName}
            onChangeText={setGuestName}
            label="Seu nome"
            placeholder="Ex: Ana"
            maxLength={40}
          />

          {(localError || errorMessage) && (
            <Text style={styles.errorText}>{localError || errorMessage}</Text>
          )}

          <AppButton
            title="Entrar na sala"
            loading={isJoining}
            disabled={isJoining}
            onPress={handleJoinRoom}
          />
        </View>

        <Text style={styles.footerText}>Você entra na sala primeiro. A fila é uma escolha.</Text>
      </ScreenShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    justifyContent: 'space-between',
    gap: 28,
  },
  header: {
    gap: 12,
  },
  badge: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 18,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
  },
  footerText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    paddingBottom: 4,
  },
});
