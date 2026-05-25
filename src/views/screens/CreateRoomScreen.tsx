import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { ScreenShell } from '../components/ui/ScreenShell';

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
      setLocalError('Dá um nome para a sala. "Karaokê aleatório" até vale, mas precisa ter nome.');
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
      <ScreenShell contentStyle={styles.container}>
        <View style={styles.header}>
          <AppButton title="Voltar" variant="ghost" size="small" disabled={isCreating} onPress={onBack} />
          <Text style={styles.badge}>Nova sala</Text>
          <Text style={styles.title}>Monte o palco.</Text>
          <Text style={styles.subtitle}>Dê um nome para a sala e para quem vai administrar.</Text>
        </View>

        <View style={styles.formCard}>
          <AppTextInput
            editable={!isCreating}
            value={roomName}
            onChangeText={setRoomName}
            label="Nome da sala"
            placeholder="Ex: Karaokê de sábado"
            maxLength={60}
          />

          <AppTextInput
            editable={!isCreating}
            value={ownerName}
            onChangeText={setOwnerName}
            label="Seu nome"
            placeholder="Ex: Leandro"
            maxLength={40}
          />

          {(localError || errorMessage) && (
            <Text style={styles.errorText}>{localError || errorMessage}</Text>
          )}

          <AppButton title="Criar sala" loading={isCreating} disabled={isCreating} onPress={handleCreateRoom} />
        </View>

        <Text style={styles.footerText}>Os convidados entram depois pelo código.</Text>
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
