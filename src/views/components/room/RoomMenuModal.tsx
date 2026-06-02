import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../../constants/theme';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { RoomCodeChip } from '../ui/RoomCodeChip';
import { useReducedMotion } from '../ui/MicroInteractions';

type RoomMenuModalProps = {
  visible: boolean;
  roomName: string;
  roomCode: string;
  isOwner: boolean;
  isRoomClosed: boolean;
  canJoinQueue: boolean;
  isCopyingInvite: boolean;
  isChangingQueue: boolean;
  isClosingRoom: boolean;
  onDismiss: () => void;
  onCopyCode: () => void;
  onOpenOwnerPanel: () => void;
  onOpenMembers: () => void;
  onOpenHistory: () => void;
  onJoinQueue: () => void;
  onCloseRoom: () => void;
};

export function RoomMenuModal({
  visible,
  roomName,
  roomCode,
  isOwner,
  isRoomClosed,
  canJoinQueue,
  isCopyingInvite,
  isChangingQueue,
  isClosingRoom,
  onDismiss,
  onCopyCode,
  onOpenOwnerPanel,
  onOpenMembers,
  onOpenHistory,
  onJoinQueue,
  onCloseRoom,
}: RoomMenuModalProps) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(visible || reducedMotion ? 1 : 0)).current;
  const canCloseRoom = isOwner && !isRoomClosed;

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
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.topBar}>
            <View style={styles.titleGroup}>
              <Text style={styles.eyebrow}>Menu da sala</Text>
              <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
                {roomName}
              </Text>
            </View>

            <AppButton title="Fechar" variant="secondary" size="compact" onPress={onDismiss} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.codePanel}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.itemLabel}>Código da sala</Text>
                  <Text style={styles.mutedText}>Toque no código para copiar.</Text>
                </View>

                <AppBadge
                  label={isRoomClosed ? 'Encerrada' : 'Ativa'}
                  variant={isRoomClosed ? 'danger' : 'success'}
                />
              </View>

              <RoomCodeChip
                code={roomCode}
                highlighted
                showCopiedFeedback={false}
                disabled={isCopyingInvite}
                accessibilityLabel={`Código da sala ${roomCode}. Toque para copiar.`}
                onPress={onCopyCode}
              />
            </View>

            <View style={styles.actions}>
              {isOwner && !isRoomClosed ? (
                <AppButton
                  title="Painel do dono"
                  accessibilityLabel="Abrir painel do dono"
                  variant="secondary"
                  style={styles.actionButton}
                  onPress={onOpenOwnerPanel}
                />
              ) : null}

              <AppButton
                title="Membros da sala"
                accessibilityLabel="Abrir membros da sala"
                variant="secondary"
                style={styles.actionButton}
                onPress={onOpenMembers}
              />

              <AppButton
                title="Memória da noite"
                accessibilityLabel="Abrir memória da noite"
                variant="secondary"
                style={styles.actionButton}
                onPress={onOpenHistory}
              />
            </View>
          </ScrollView>

          {canCloseRoom || canJoinQueue ? (
            <View style={styles.footer}>
              {canCloseRoom ? (
                <AppButton
                  title="Fechar sala"
                  accessibilityLabel="Fechar sala"
                  variant="dangerOutline"
                  loading={isClosingRoom}
                  disabled={isClosingRoom || isChangingQueue}
                  onPress={onCloseRoom}
                />
              ) : null}

              {canJoinQueue ? (
                <AppButton
                  title="Entrar na fila"
                  loading={isChangingQueue}
                  disabled={isChangingQueue}
                  onPress={onJoinQueue}
                />
              ) : null}
            </View>
          ) : null}
        </SafeAreaView>
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
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  codePanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
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
  itemLabel: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  mutedText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
  footer: {
    borderColor: theme.colors.borderSoft,
    borderTopWidth: 1,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
});
