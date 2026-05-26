import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../src/constants/theme';
import {
  buildMembersById,
  currentMember,
  meOnStageQueue,
} from '../../src/storybook/mocks/roomMocks';
import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import { StageCard } from '../../src/views/components/room/StageCard';
import { AppButton } from '../../src/views/components/ui/AppButton';
import { AppCard } from '../../src/views/components/ui/AppCard';
import { AppTextInput } from '../../src/views/components/ui/AppTextInput';
import { EmptyState } from '../../src/views/components/ui/EmptyState';
import {
  AnimatedEntrance,
  AppBottomSheet,
  GlowPulse,
  PressFeedback,
  SkeletonBlock,
} from '../../src/views/components/ui/MicroInteractions';
import { RoomCodeChip } from '../../src/views/components/ui/RoomCodeChip';

const meta = {
  title: 'UI/MicroInteractions',
  component: View,
  decorators: [
    (Story) => (
      <StorybookScreen>
        <Story />
      </StorybookScreen>
    ),
  ],
} satisfies Meta<typeof View>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonPressFeedback: Story = {
  render: () => (
    <View style={styles.stack}>
      <Text style={styles.note}>Pressione o botao para ver o feedback de toque.</Text>
      <AppButton title="Entrar na fila" onPress={() => console.log('Press feedback')} />
    </View>
  ),
};

export const PressableCard: Story = {
  render: () => (
    <PressFeedback onPress={() => console.log('Card pressionado')}>
      <AppCard variant="raised">
        <Text style={styles.title}>Card com press feedback</Text>
        <Text style={styles.text}>Use em cards acionaveis sem espalhar animacao pela tela.</Text>
      </AppCard>
    </PressFeedback>
  ),
};

export const RoomCodeCopied: Story = {
  render: () => {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }

    return (
      <View style={styles.stack}>
        <RoomCodeChip code="0427" copied={copied} onPress={handleCopy} />
        <Text style={styles.note}>Toque no chip para disparar brilho e feedback textual.</Text>
      </View>
    );
  },
};

export const AppCardEntrance: Story = {
  render: () => (
    <AnimatedEntrance type="slideUp">
      <AppCard variant="accent">
        <Text style={styles.title}>Entrada suave</Text>
        <Text style={styles.text}>Fade com slide leve para cards que aparecem apos uma acao.</Text>
      </AppCard>
    </AnimatedEntrance>
  ),
};

export const EmptyStateEntrance: Story = {
  render: () => (
    <AnimatedEntrance type="fade">
      <EmptyState
        badge="Fila vazia"
        title="Ninguem esperando agora."
        message="Compartilhe o codigo ou adicione alguem manualmente."
      />
    </AnimatedEntrance>
  ),
};

export const BottomSheetVisual: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <View style={styles.sheetDemo}>
        <AppButton title="Abrir modal" onPress={() => setVisible(true)} />

        <AppBottomSheet
          visible={visible}
          title="Adicionar cantor"
          onDismiss={() => setVisible(false)}
          footer={
            <AppButton
              title="Adicionar a fila"
              onPress={() => {
                console.log('Adicionar participante manual');
                setVisible(false);
              }}
            />
          }
        >
          <Text style={styles.text}>Bottom sheet visual com entrada suave e acao clara.</Text>
          <AppTextInput forceFocused label="Nome da pessoa" placeholder="Ex: Bruno" value="" />
        </AppBottomSheet>
      </View>
    );
  },
};

export const StageGlowActive: Story = {
  render: () => {
    const currentOnStage = meOnStageQueue[0];
    const membersById = buildMembersById([currentMember]);

    return (
      <GlowPulse active borderRadius={theme.radius.xl}>
        <StageCard
          currentOnStage={currentOnStage}
          currentOnStageMember={membersById[currentOnStage.member_id]}
          isLoadingRoom={false}
          isLoadingQueue={false}
          isRoomClosed={false}
          isMeOnStage
          isOwner={false}
          isChangingQueue={false}
          wasRemovedFromRoom={false}
          onFinishTurn={() => console.log('Concluir vez')}
          onSkipTurn={() => console.log('Pular vez')}
          onStopSinging={() => console.log('Parar de cantar')}
          onOwnerFinishTurn={() => console.log('Dono concluir')}
          onOwnerSkipTurn={() => console.log('Dono pular')}
          onOwnerRemoveFromStage={() => console.log('Dono remover')}
        />
      </GlowPulse>
    );
  },
};

export const LoadingSkeleton: Story = {
  render: () => (
    <AppCard>
      <SkeletonBlock width="42%" height={14} />
      <SkeletonBlock height={24} />
      <SkeletonBlock width="78%" height={16} />
      <SkeletonBlock width="56%" height={16} />
    </AppCard>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
  note: {
    color: theme.colors.textSoft,
    ...theme.typography.body,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  text: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  sheetDemo: {
    minHeight: 560,
    position: 'relative',
    justifyContent: 'center',
  },
});
