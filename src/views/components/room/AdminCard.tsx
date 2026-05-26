import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { AppTextInput } from '../ui/AppTextInput';
import {
  AppBottomSheet,
  FeedbackToast,
  GlowPulse,
} from '../ui/MicroInteractions';

type AdminSheet = 'addSinger' | 'closeRoom' | null;

type AdminCardProps = {
  transferableCount: number;
  removableCount: number;
  isCopyingInvite: boolean;
  isClosingRoom: boolean;
  waitingCount?: number;
  hasCurrentSinger?: boolean;
  isChangingQueue?: boolean;
  initialSheet?: AdminSheet;
  onCopyInvite: () => void;
  onCloseRoom: () => void | Promise<void>;
  onAddManualQueueItem?: (name: string) => void | Promise<void>;
  onFinishCurrentTurn?: () => void;
  onCallNext?: () => void;
  onViewQueue?: () => void;
  onViewMembers?: () => void;
  onViewHistory?: () => void;
};

export function AdminCard({
  transferableCount,
  removableCount,
  isCopyingInvite,
  isClosingRoom,
  waitingCount = 0,
  hasCurrentSinger = false,
  isChangingQueue = false,
  initialSheet = null,
  onCopyInvite,
  onCloseRoom,
  onAddManualQueueItem,
  onFinishCurrentTurn,
  onCallNext,
  onViewQueue,
  onViewMembers,
  onViewHistory,
}: AdminCardProps) {
  const [activeSheet, setActiveSheet] = useState<AdminSheet>(initialSheet);
  const [manualName, setManualName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isAddingManual, setIsAddingManual] = useState(false);

  const isBusy = isChangingQueue || isAddingManual || isClosingRoom;
  const canAddManual = Boolean(onAddManualQueueItem);

  async function handleAddManualSinger() {
    const cleanName = manualName.trim();

    if (!cleanName || !onAddManualQueueItem) {
      return;
    }

    try {
      setIsAddingManual(true);
      await onAddManualQueueItem(cleanName);
      setManualName('');
      setActiveSheet(null);
      setFeedbackMessage(`${cleanName} entrou na fila.`);
      setTimeout(() => setFeedbackMessage(null), 1400);
    } finally {
      setIsAddingManual(false);
    }
  }

  async function handleConfirmCloseRoom() {
    await onCloseRoom();
    setActiveSheet(null);
  }

  return (
    <View style={styles.wrapper}>
      <AppCard variant="raised" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Mesa do dono</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Controle a noite
            </Text>
            <Text style={styles.subtitle}>Ações rápidas para manter a fila andando.</Text>
          </View>

          <AppBadge label="Dono" variant="accent" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{waitingCount}</Text>
            <Text style={styles.statLabel}>na fila</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{removableCount}</Text>
            <Text style={styles.statLabel}>pessoas</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{transferableCount}</Text>
            <Text style={styles.statLabel}>podem virar dono</Text>
          </View>
        </View>

        <View style={styles.primaryActions}>
          <GlowPulse active={canAddManual && !isBusy} borderRadius={theme.radius.lg}>
            <AppButton
              title="Adicionar cantor"
              accessibilityHint="Abre um painel para adicionar alguém sem app à fila."
              disabled={!canAddManual || isBusy}
              loading={isAddingManual}
              onPress={() => setActiveSheet('addSinger')}
            />
          </GlowPulse>

          {onFinishCurrentTurn ? (
            <AppButton
              title="Finalizar vez"
              accessibilityHint="Finaliza a apresentação atual."
              variant="secondary"
              disabled={isBusy || !hasCurrentSinger}
              loading={isChangingQueue}
              onPress={onFinishCurrentTurn}
            />
          ) : null}

          {onCallNext ? (
            <AppButton
              title="Chamar próximo"
              accessibilityHint="Chama a próxima pessoa da fila quando a ação estiver disponível."
              variant="secondary"
              disabled={isBusy || waitingCount === 0}
              loading={isChangingQueue}
              onPress={onCallNext}
            />
          ) : null}
        </View>

        <View style={styles.secondaryActions}>
          <AppButton
            title="Compartilhar"
            accessibilityLabel="Compartilhar convite da sala"
            variant="secondary"
            size="compact"
            loading={isCopyingInvite}
            disabled={isCopyingInvite}
            onPress={onCopyInvite}
          />

          {onViewQueue ? (
            <AppButton title="Ver fila" variant="ghost" size="compact" onPress={onViewQueue} />
          ) : null}

          {onViewMembers ? (
            <AppButton
              title="Membros"
              variant="ghost"
              size="compact"
              onPress={onViewMembers}
            />
          ) : null}

          {onViewHistory ? (
            <AppButton
              title="Histórico"
              variant="ghost"
              size="compact"
              onPress={onViewHistory}
            />
          ) : null}
        </View>

        {transferableCount === 0 && removableCount === 0 ? (
          <Text style={styles.hint}>Só você está na sala por enquanto.</Text>
        ) : null}

        <View style={styles.dangerZone}>
          <View style={styles.dangerCopy}>
            <Text style={styles.dangerTitle}>Encerrar sala</Text>
            <Text style={styles.dangerText}>Finalize a noite e gere o resumo.</Text>
          </View>

          <AppButton
            title="Encerrar"
            accessibilityLabel="Encerrar sala"
            variant="dangerOutline"
            size="compact"
            loading={isClosingRoom}
            disabled={isClosingRoom}
            onPress={() => setActiveSheet('closeRoom')}
          />
        </View>

        <FeedbackToast
          visible={Boolean(feedbackMessage)}
          message={feedbackMessage ?? ''}
          variant="success"
          accessibilityLiveRegion="polite"
        />
      </AppCard>

      <AppBottomSheet
        visible={activeSheet === 'addSinger'}
        title="Adicionar cantor"
        onDismiss={() => setActiveSheet(null)}
        footer={
          <AppButton
            title="Adicionar à fila"
            accessibilityLabel="Adicionar cantor manualmente à fila"
            loading={isAddingManual || isChangingQueue}
            disabled={!manualName.trim() || isAddingManual || isChangingQueue}
            onPress={handleAddManualSinger}
          />
        }
      >
        <Text style={styles.sheetText}>Coloque alguém na fila sem precisar do app.</Text>
        <AppTextInput
          autoFocus
          forceFocused
          editable={!isAddingManual && !isChangingQueue}
          label="Nome do cantor"
          placeholder="Ex: Bruno"
          value={manualName}
          onChangeText={setManualName}
          maxLength={40}
        />
      </AppBottomSheet>

      <AppBottomSheet
        visible={activeSheet === 'closeRoom'}
        title="Encerrar sala?"
        onDismiss={() => setActiveSheet(null)}
        footer={
          <View style={styles.sheetActions}>
            <AppButton
              title="Cancelar"
              variant="secondary"
              disabled={isClosingRoom}
              onPress={() => setActiveSheet(null)}
            />

            <AppButton
              title="Encerrar sala"
              accessibilityHint="Confirma o encerramento da sala e a geração do resumo."
              variant="danger"
              loading={isClosingRoom}
              disabled={isClosingRoom}
              onPress={handleConfirmCloseRoom}
            />
          </View>
        }
      >
        <Text style={styles.sheetText}>Encerrar a sala finaliza a noite e gera o resumo.</Text>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  card: {
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
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
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statBox: {
    flexGrow: 1,
    flexBasis: '30%',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  statNumber: {
    color: theme.colors.primary,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  primaryActions: {
    gap: theme.spacing.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  hint: {
    color: theme.colors.textSoft,
    ...theme.typography.body,
  },
  dangerZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.dangerMuted,
    borderColor: theme.colors.dangerBorder,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  dangerCopy: {
    flex: 1,
    gap: 2,
  },
  dangerTitle: {
    color: theme.colors.danger,
    ...theme.typography.bodyStrong,
  },
  dangerText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  sheetText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  sheetActions: {
    gap: theme.spacing.sm,
  },
});
