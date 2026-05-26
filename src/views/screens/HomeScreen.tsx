import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../constants/theme';
import { AnimatedEntrance } from '../components/ui/MicroInteractions';
import { AppBadge } from '../components/ui/AppBadge';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ScreenShell } from '../components/ui/ScreenShell';

type HomeScreenProps = {
  userId: string | null;
  authMessage: string;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
};

const steps = ['Entre ou crie uma sala', 'Entre na fila', 'Cante na sua vez'];

export function HomeScreen({ userId, authMessage, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  return (
    <ScreenShell contentStyle={styles.container}>
      <AnimatedEntrance type="slideUp" style={styles.hero}>
        <View style={styles.topRow}>
          <BrandLogo variant="vertical" style={styles.logo} />
          <AppBadge label="Ao vivo" variant={userId ? 'success' : 'neutral'} />
        </View>

        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            Seu karaokê sem bagunça.
          </Text>
          <Text style={styles.subtitle}>Organize a fila, acompanhe o palco e deixe o rolê andar.</Text>
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance type="slideUp" delay={80}>
        <AppCard variant="raised" style={styles.stepsCard}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </AppCard>
      </AnimatedEntrance>

      <AnimatedEntrance type="slideUp" delay={120} style={styles.bottom}>
        <View style={styles.actions}>
          <AppButton
            title="Entrar em uma sala"
            accessibilityHint="Abre a tela para digitar o código da sala."
            onPress={onJoinRoom}
          />
          <AppButton
            title="Criar uma sala"
            accessibilityHint="Abre a tela para criar uma nova sala de karaokê."
            variant="secondary"
            onPress={onCreateRoom}
          />
        </View>

        <View accessibilityLiveRegion="polite" style={styles.statusBox}>
          <View style={[styles.statusDot, userId ? styles.statusDotOn : styles.statusDotOff]} />
          <Text style={styles.statusText}>
            {userId ? authMessage : 'Conectando usuário anônimo...'}
          </Text>
        </View>
      </AnimatedEntrance>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    gap: theme.spacing.xl,
  },
  hero: {
    gap: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  logo: {
    flexShrink: 0,
  },
  copy: {
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 42,
    lineHeight: 47,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  stepsCard: {
    gap: theme.spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryMuted,
    color: theme.colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 15,
    fontWeight: '900',
    overflow: 'hidden',
  },
  stepText: {
    color: theme.colors.text,
    flex: 1,
    ...theme.typography.bodyStrong,
  },
  bottom: {
    gap: theme.spacing.lg,
  },
  actions: {
    gap: theme.spacing.md,
  },
  statusBox: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
  },
  statusDotOn: {
    backgroundColor: theme.colors.success,
  },
  statusDotOff: {
    backgroundColor: theme.colors.textSoft,
  },
  statusText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
