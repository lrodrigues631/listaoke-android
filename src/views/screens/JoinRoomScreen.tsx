import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { theme } from '../../constants/theme';
import { normalizeRoomCode } from '../../utils/normalizeRoomCode';
import { AnimatedEntrance } from '../components/ui/MicroInteractions';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppTextInput } from '../components/ui/AppTextInput';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ScreenShell } from '../components/ui/ScreenShell';

type JoinRoomScreenProps = {
  isJoining: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onJoinRoom: (roomCode: string, guestName: string) => void;
  initialRoomCode?: string;
  initialGuestName?: string;
};

export function JoinRoomScreen({
  isJoining,
  errorMessage,
  onBack,
  onJoinRoom,
  initialRoomCode = '',
  initialGuestName = '',
}: JoinRoomScreenProps) {
  const [roomCode, setRoomCode] = useState(normalizeRoomCode(initialRoomCode));
  const [guestName, setGuestName] = useState(initialGuestName);
  const [localError, setLocalError] = useState<string | null>(null);
  const [didPasteCode, setDidPasteCode] = useState(false);

  const displayError =
    localError || (errorMessage ? 'Esse código não bate. Confere com quem criou a sala.' : null);

  function handleJoinRoom() {
    const cleanRoomCode = normalizeRoomCode(roomCode);
    const cleanGuestName = guestName.trim();

    if (!cleanRoomCode || cleanRoomCode.length !== 4) {
      setLocalError('Esse código não bate. Confere com quem criou a sala.');
      return;
    }

    if (!cleanGuestName) {
      setLocalError('Coloca seu nome ou apelido para entrar na sala.');
      return;
    }

    setLocalError(null);
    onJoinRoom(cleanRoomCode, cleanGuestName);
  }

  async function handlePasteCode() {
    const clipboardValue = await Clipboard.getStringAsync();
    const pastedCode = normalizeRoomCode(clipboardValue);

    if (pastedCode) {
      setRoomCode(pastedCode.slice(0, 4));
      setDidPasteCode(true);
      setLocalError(null);
    }
  }

  const codeDigits = roomCode.padEnd(4, ' ').slice(0, 4).split('');

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
              disabled={isJoining}
              onPress={onBack}
            />
            <BrandLogo variant="horizontal" />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>Código recebido?</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Entrar na sala
            </Text>
            <Text style={styles.subtitle}>Digite o código que te mandaram.</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance type="slideUp" delay={80}>
          <AppCard variant="raised" style={styles.formCard}>
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              style={styles.codePreview}
            >
              {codeDigits.map((digit, index) => (
                <View key={`${index}-${digit}`} style={styles.codeDigitBox}>
                  <Text style={styles.codeDigit}>{digit.trim() || ' '}</Text>
                </View>
              ))}
            </View>

            <AppTextInput
              editable={!isJoining}
              value={roomCode}
              onChangeText={(value) => {
                setDidPasteCode(false);
                setRoomCode(normalizeRoomCode(value).slice(0, 4));
              }}
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

            {didPasteCode ? (
              <Text accessibilityLiveRegion="polite" style={styles.successText}>
                Código colado.
              </Text>
            ) : null}
            {displayError ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {displayError}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <AppButton
                title="Entrar"
                accessibilityHint="Entra na sala com o código e o nome informados."
                loading={isJoining}
                disabled={isJoining}
                onPress={handleJoinRoom}
              />

              <AppButton
                title="Colar código"
                accessibilityHint="Lê o código copiado na área de transferência."
                variant="secondary"
                disabled={isJoining}
                onPress={handlePasteCode}
              />
            </View>
          </AppCard>
        </AnimatedEntrance>

        <Text style={styles.footerText}>Você entra na sala primeiro. A fila é uma escolha.</Text>
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
  codePreview: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  codeDigitBox: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  codeDigit: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  actions: {
    gap: theme.spacing.sm,
  },
  successText: {
    color: theme.colors.success,
    ...theme.typography.body,
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
