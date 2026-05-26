import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../constants/theme';
import { AnimatedEntrance } from '../components/ui/MicroInteractions';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppTextInput } from '../components/ui/AppTextInput';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ScreenShell } from '../components/ui/ScreenShell';

type CreateRoomScreenProps = {
  isCreating: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onCreateRoom: (roomName: string, ownerName: string) => void;
  initialRoomName?: string;
  initialOwnerName?: string;
};

export function CreateRoomScreen({
  isCreating,
  errorMessage,
  onBack,
  onCreateRoom,
  initialRoomName = '',
  initialOwnerName = '',
}: CreateRoomScreenProps) {
  const [roomName, setRoomName] = useState(initialRoomName);
  const [ownerName, setOwnerName] = useState(initialOwnerName);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleCreateRoom() {
    const cleanRoomName = roomName.trim();
    const cleanOwnerName = ownerName.trim();

    if (!cleanRoomName) {
      setLocalError('Dá um nome para a sala antes de abrir o palco.');
      return;
    }

    if (!cleanOwnerName) {
      setLocalError('Coloca seu nome ou apelido para administrar a sala.');
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
        <AnimatedEntrance type="slideUp" style={styles.header}>
          <View style={styles.navRow}>
            <AppButton
              title="Voltar"
              accessibilityLabel="Voltar para a tela inicial"
              variant="ghost"
              size="compact"
              disabled={isCreating}
              onPress={onBack}
            />
            <BrandLogo variant="horizontal" />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>Nova sala</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Criar sala
            </Text>
            <Text style={styles.subtitle}>Monte sua sala e chame a galera para cantar.</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance type="slideUp" delay={80}>
          <AppCard variant="raised" style={styles.formCard}>
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

            {(localError || errorMessage) ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {localError || errorMessage}
              </Text>
            ) : null}

            <AppButton
              title="Criar sala"
              accessibilityHint="Cria a sala com o nome informado e entra como dono."
              loading={isCreating}
              disabled={isCreating}
              onPress={handleCreateRoom}
            />
          </AppCard>
        </AnimatedEntrance>

        <Text style={styles.footerText}>Os convidados entram depois pelo código da sala.</Text>
      </ScreenShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    justifyContent: 'space-between',
    gap: theme.spacing.xxl,
  },
  header: {
    gap: theme.spacing.xl,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  copy: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.titleLarge,
  },
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  formCard: {
    gap: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.danger,
    ...theme.typography.body,
  },
  footerText: {
    color: theme.colors.textSoft,
    paddingBottom: theme.spacing.xs,
    ...theme.typography.body,
  },
});
