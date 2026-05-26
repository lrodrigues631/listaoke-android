import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import type { RoomSummary } from '../../../types/eventTypes';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedEntrance } from '../ui/MicroInteractions';

type FinalSummaryCardProps = {
  summary: RoomSummary;
  isLoadingSummary: boolean;
  summaryError: string | null;
  onShareSummary?: () => void;
  onBackHome?: () => void;
  canShareSummary?: boolean;
};

function buildSummaryText(summary: RoomSummary) {
  const topSinger = summary.ranking[0] ?? null;
  const lines = [
    'Fim do show no Listaokê!',
    `${summary.total_performances} apresentação(ões)`,
    `${summary.total_participants} participante(s)`,
  ];

  if (topSinger) {
    lines.push(`Top da noite: ${topSinger.name} com ${topSinger.performances}`);
  }

  return lines.join('\n');
}

export function FinalSummaryCard({
  summary,
  isLoadingSummary,
  summaryError,
  onShareSummary,
  onBackHome,
  canShareSummary = true,
}: FinalSummaryCardProps) {
  const topSinger = summary.ranking[0] ?? null;
  const opener = summary.ranking[0] ?? null;
  const closer = summary.ranking[summary.ranking.length - 1] ?? null;
  const canShare = canShareSummary && !isLoadingSummary && !summaryError;

  async function handleShareSummary() {
    if (onShareSummary) {
      onShareSummary();
      return;
    }

    await Share.share({
      message: buildSummaryText(summary),
    });
  }

  return (
    <AnimatedEntrance type="slideUp">
      <AppCard variant="accent" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Resumo final</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Fim do show
            </Text>
            <Text style={styles.subtitle}>Aqui está o resumo do rolê.</Text>
          </View>

          <AppBadge label="Encerrada" variant="danger" />
        </View>

        {isLoadingSummary ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Montando o placar final...</Text>
          </View>
        ) : summaryError ? (
          <Text style={styles.errorText}>{summaryError}</Text>
        ) : (
          <>
            <View style={styles.heroScore}>
              <Text style={styles.scoreNumber}>{summary.total_performances}</Text>
              <Text style={styles.scoreLabel}>
                {summary.total_performances === 1 ? 'apresentação' : 'apresentações'}
              </Text>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{summary.total_participants}</Text>
                <Text style={styles.summaryLabel}>participantes</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{summary.total_skips}</Text>
                <Text style={styles.summaryLabel}>pulos</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{summary.total_queue_exits}</Text>
                <Text style={styles.summaryLabel}>saídas da fila</Text>
              </View>
            </View>

            {topSinger ? (
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>Quem mais cantou</Text>
                <Text style={styles.highlightName}>
                  {topSinger.name} com {topSinger.performances}{' '}
                  {topSinger.performances === 1 ? 'música' : 'músicas'}
                </Text>
              </View>
            ) : (
              <EmptyState
                badge="Sem apresentações"
                title="Ninguém concluiu uma música."
                message="Foi ensaio técnico, aparentemente. Na próxima o placar aparece aqui."
              />
            )}

            <View style={styles.nightMarks}>
              <View style={styles.markBox}>
                <Text style={styles.markLabel}>Abriu a noite</Text>
                <Text style={styles.markName}>{opener?.name ?? 'Ainda sem dado'}</Text>
              </View>

              <View style={styles.markBox}>
                <Text style={styles.markLabel}>Fechou a noite</Text>
                <Text style={styles.markName}>{closer?.name ?? 'Ainda sem dado'}</Text>
              </View>
            </View>

            <View style={styles.rankingBox}>
              <Text style={styles.sectionLabel}>Ranking</Text>

              {summary.ranking.length === 0 ? (
                <Text style={styles.emptyText}>Sem ranking para mostrar.</Text>
              ) : (
                summary.ranking.map((item, index) => (
                  <AnimatedEntrance key={`${item.member_id}-${index}`} type="slideUp" delay={index * 50}>
                    <View style={styles.rankingItem}>
                      <Text style={styles.rankingPosition}>{index + 1}</Text>

                      <View style={styles.rankingInfo}>
                        <Text style={styles.rankingName}>{item.name}</Text>
                        <Text style={styles.rankingMeta}>
                          {item.performances}{' '}
                          {item.performances === 1 ? 'música cantada' : 'músicas cantadas'}
                        </Text>
                      </View>
                    </View>
                  </AnimatedEntrance>
                ))
              )}
            </View>

            <View style={styles.actions}>
              <AppButton
                title="Compartilhar resumo"
                accessibilityHint="Abre as opções nativas do celular para compartilhar o resumo."
                disabled={!canShare}
                onPress={handleShareSummary}
              />

              {onBackHome ? (
                <AppButton
                  title="Voltar para início"
                  accessibilityLabel="Voltar para a tela inicial"
                  variant="secondary"
                  onPress={onBackHome}
                />
              ) : null}
            </View>
          </>
        )}
      </AppCard>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: theme.colors.borderStrong,
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
    ...theme.typography.titleLarge,
  },
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  errorText: {
    color: theme.colors.danger,
    ...theme.typography.body,
  },
  heroScore: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  scoreNumber: {
    color: theme.colors.primary,
    fontSize: 58,
    lineHeight: 64,
    fontWeight: '900',
  },
  scoreLabel: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  summaryBox: {
    flexGrow: 1,
    flexBasis: '30%',
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  summaryNumber: {
    color: theme.colors.primary,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  highlightBox: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  highlightLabel: {
    color: theme.colors.textSoft,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  highlightName: {
    color: theme.colors.text,
    marginTop: 4,
    ...theme.typography.bodyStrong,
  },
  nightMarks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  markBox: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  markLabel: {
    color: theme.colors.textSoft,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  markName: {
    color: theme.colors.text,
    marginTop: 4,
    ...theme.typography.bodyStrong,
  },
  rankingBox: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.primary,
    textTransform: 'uppercase',
    ...theme.typography.label,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  rankingPosition: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '900',
    overflow: 'hidden',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    color: theme.colors.text,
    ...theme.typography.bodyStrong,
  },
  rankingMeta: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  emptyText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
