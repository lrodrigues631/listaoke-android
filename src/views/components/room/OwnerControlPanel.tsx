import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../../constants/theme';
import type { QueueItem } from '../../../types/queueTypes';
import type { RoomMember } from '../../../types/roomTypes';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { RoomCodeChip } from '../ui/RoomCodeChip';
import { useReducedMotion } from '../ui/MicroInteractions';

type OwnerPanelView = 'main' | 'closeRoom';

type OwnerControlPanelProps = {
  visible: boolean;
  roomName: string;
  roomCode: string;
  peopleCount: number;
  waitingCount: number;
  currentOnStage: QueueItem | null;
  currentOnStageMember: RoomMember | null;
  nextQueueItem: QueueItem | null;
  nextQueueMember: RoomMember | null;
  isCopyingInvite: boolean;
  isChangingQueue: boolean;
  isClosingRoom: boolean;
  initialView?: OwnerPanelView;
  onDismiss: () => void;
  onCopyCode: () => void;
  onCopyInvite: () => void;
  onAddManualQueueItem: (name: string) => void | Promise<void>;
  onFinishCurrentTurn?: () => void | Promise<void>;
  onCallNext?: () => void | Promise<void>;
  onViewQueue?: () => void;
  onViewMembers?: () => void;
  onViewHistory?: () => void;
  onCloseRoom: () => void | Promise<void>;
};

function getMemberName(member: RoomMember | null, fallback: string) {
  return member?.name ?? fallback;
}

export function OwnerControlPanel({
  visible,
  roomName,
  roomCode,
  peopleCount,
  waitingCount,
  currentOnStage,
  currentOnStageMember,
  nextQueueItem,
  nextQueueMember,
  isCopyingInvite,
  isChangingQueue,
  isClosingRoom,
  initialView = 'main',
  onDismiss,
  onCopyCode,
  onCopyInvite,
  onAddManualQueueItem,
  onFinishCurrentTurn,
  onCallNext,
  onViewQueue,
  onViewMembers,
  onViewHistory,
  onCloseRoom,
}: OwnerControlPanelProps) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(visible || reducedMotion ? 1 : 0)).current;
  const [activeView, setActiveView] = useState<OwnerPanelView>(initialView);
  const [manualName, setManualName] = useState('');
  const [isAddingManual, setIsAddingManual] = useState(false);

  const hasCurrentSinger = Boolean(currentOnStage);
  const nextSingerName = nextQueueItem
    ? getMemberName(nextQueueMember, 'Proximo cantor')
    : 'Fila vazia';
  const stageName = hasCurrentSinger
    ? getMemberName(currentOnStageMember, 'Participante')
    : 'Palco livre';
  const isBusy = isChangingQueue || isClosingRoom || isAddingManual;
  const canAddManual = manualName.trim().length > 0 && !isBusy;

  useEffect(() => {
    if (visible) {
      setActiveView(initialView);
    }
  }, [initialView, visible]);

  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }

    if (reducedMotion) {
      progress.setValue(1);
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: theme.animation.slow,
      useNativeDriver: true,
    }).start();
  }, [progress, reducedMotion, visible]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  async function handleAddManualSinger() {
    const cleanName = manualName.trim();

    if (!cleanName) {
      return;
    }

    try {
      setIsAddingManual(true);
      await onAddManualQueueItem(cleanName);
      setManualName('');
    } finally {
      setIsAddingManual(false);
    }
  }

  async function handleCloseRoom() {
    await onCloseRoom();
    setActiveView('main');
  }

  const content = (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.titleGroup}>
          <Text style={styles.eyebrow}>Painel do dono</Text>
          <Text
            accessibilityRole="header"
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            numberOfLines={1}
            style={styles.title}
          >
            {roomName}
          </Text>
        </View>

        <AppButton title="Voltar" variant="primary" size="compact" onPress={onDismiss} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeView === 'main' ? (
          <>
            <AppCard style={styles.compactCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardLabel}>Codigo da sala</Text>
                  <Text style={styles.mutedText}>Copie ou compartilhe com a turma.</Text>
                </View>
              </View>

              <View style={styles.inlineActions}>
                <RoomCodeChip
                  code={roomCode}
                  highlighted
                  showCopiedFeedback={false}
                  onPress={onCopyCode}
                />
                <AppButton
                  title="Compartilhar"
                  variant="secondary"
                  size="compact"
                  loading={isCopyingInvite}
                  disabled={isCopyingInvite}
                  onPress={onCopyInvite}
                />
              </View>
            </AppCard>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{peopleCount}</Text>
                <Text style={styles.statLabel}>pessoas</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{waitingCount}</Text>
                <Text style={styles.statLabel}>na fila</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{hasCurrentSinger ? 1 : 0}</Text>
                <Text style={styles.statLabel}>no palco</Text>
              </View>
            </View>

            <AppCard variant="accent" style={styles.focusCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardLabel}>No palco</Text>
                  <Text style={styles.sectionTitle}>{stageName}</Text>
                </View>

                <AppBadge label={hasCurrentSinger ? 'Ao vivo' : 'Livre'} variant={hasCurrentSinger ? 'primary' : 'neutral'} />
              </View>

              {hasCurrentSinger && onFinishCurrentTurn ? (
                <AppButton
                  title="Finalizar vez"
                  loading={isChangingQueue}
                  disabled={isBusy}
                  onPress={onFinishCurrentTurn}
                />
              ) : (
                <Text style={styles.mutedText}>Quando alguem subir, a acao principal aparece aqui.</Text>
              )}
            </AppCard>

            <AppCard style={styles.compactCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardLabel}>Proximo</Text>
                  <Text style={styles.sectionTitle}>{nextSingerName}</Text>
                </View>

                <AppBadge label={`${waitingCount}`} variant={waitingCount ? 'accent' : 'neutral'} />
              </View>

              {onCallNext && nextQueueItem ? (
                <AppButton
                  title="Chamar proximo"
                  variant="secondary"
                  loading={isChangingQueue}
                  disabled={isBusy}
                  onPress={onCallNext}
                />
              ) : null}
            </AppCard>

            <View style={styles.manualBox}>
              <Text style={styles.manualTitle}>Adicionar sem app</Text>

              <View style={styles.manualRow}>
                <TextInput
                  accessibilityLabel="Nome do cantor"
                  value={manualName}
                  onChangeText={setManualName}
                  placeholder="Nome"
                  placeholderTextColor={theme.colors.textDisabled}
                  editable={!isBusy}
                  returnKeyType="done"
                  onSubmitEditing={handleAddManualSinger}
                  style={styles.manualInput}
                />

                <AppButton
                  title="+"
                  accessibilityLabel="Adicionar cantor a fila"
                  size="compact"
                  loading={isAddingManual || isChangingQueue}
                  disabled={!canAddManual}
                  style={styles.manualAddButton}
                  onPress={handleAddManualSinger}
                />
              </View>
            </View>

            {onViewQueue || onViewMembers || onViewHistory ? (
              <View style={styles.shortcutGrid}>
                {onViewQueue ? (
                  <View style={styles.shortcutItem}>
                    <AppButton
                      title="Ver fila"
                      variant="secondary"
                      size="compact"
                      style={styles.shortcutButton}
                      onPress={onViewQueue}
                    />
                  </View>
                ) : null}
                {onViewMembers ? (
                  <View style={styles.shortcutItem}>
                    <AppButton
                      title="Ver membros"
                      variant="secondary"
                      size="compact"
                      style={styles.shortcutButton}
                      onPress={onViewMembers}
                    />
                  </View>
                ) : null}
                {onViewHistory ? (
                  <View style={styles.shortcutItem}>
                    <AppButton
                      title="Ver historico"
                      variant="secondary"
                      size="compact"
                      style={styles.shortcutButton}
                      onPress={onViewHistory}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}

            <AppCard variant="danger" style={styles.dangerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.dangerTitle}>Encerrar sala</Text>
                  <Text style={styles.mutedText}>
                    Encerrar a sala finaliza a noite e gera o resumo.
                  </Text>
                </View>
              </View>

              <AppButton
                title="Encerrar sala"
                variant="dangerOutline"
                loading={isClosingRoom}
                disabled={isBusy}
                onPress={() => setActiveView('closeRoom')}
              />
            </AppCard>
          </>
        ) : null}

        {activeView === 'closeRoom' ? (
          <AppCard variant="danger" style={styles.focusCard}>
            <Text style={styles.cardLabel}>Confirmacao obrigatoria</Text>
            <Text style={styles.sectionTitle}>Encerrar sala?</Text>
            <Text style={styles.mutedText}>
              Encerrar a sala finaliza a noite e gera o resumo.
            </Text>
            <View style={styles.formActions}>
              <AppButton
                title="Cancelar"
                variant="secondary"
                disabled={isClosingRoom}
                onPress={() => setActiveView('main')}
              />
              <AppButton
                title="Encerrar sala"
                variant="danger"
                loading={isClosingRoom}
                disabled={isClosingRoom}
                onPress={handleCloseRoom}
              />
            </View>
          </AppCard>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <Modal
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.screen, { opacity: progress, transform: [{ translateX }] }]}>
        {content}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eyebrow: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.title,
  },
  content: {
    flexGrow: 1,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  scroll: {
    flex: 1,
  },
  compactCard: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  focusCard: {
    gap: theme.spacing.lg,
  },
  dangerCard: {
    gap: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  cardLabel: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.typography.title,
  },
  mutedText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  inlineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  statNumber: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  manualBox: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  manualTitle: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  manualInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: theme.spacing.md,
  },
  manualAddButton: {
    minWidth: 52,
    paddingHorizontal: theme.spacing.md,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  shortcutItem: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  shortcutButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
  dangerTitle: {
    color: theme.colors.danger,
    ...theme.typography.bodyStrong,
  },
  formActions: {
    gap: theme.spacing.sm,
  },
});
