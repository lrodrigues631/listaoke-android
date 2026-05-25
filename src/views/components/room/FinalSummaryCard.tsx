import { ActivityIndicator, Text, View } from 'react-native';

import type { RoomSummary } from '../../../types/eventTypes';
import { roomStyles as styles } from './roomStyles';

type FinalSummaryCardProps = {
  summary: RoomSummary;
  isLoadingSummary: boolean;
  summaryError: string | null;
};

export function FinalSummaryCard({
  summary,
  isLoadingSummary,
  summaryError,
}: FinalSummaryCardProps) {
  const topSinger = summary.ranking[0] ?? null;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.sectionTitle}>Resumo da noite</Text>

      {isLoadingSummary ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Montando o placar final...</Text>
        </View>
      ) : summaryError ? (
        <Text style={styles.errorText}>{summaryError}</Text>
      ) : (
        <>
          <View style={styles.scoreHero}>
            <Text style={styles.scoreNumber}>{summary.total_performances}</Text>
            <Text style={styles.scoreLabel}>
              {summary.total_performances === 1 ? 'música cantada' : 'músicas cantadas'}
            </Text>
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
            <Text style={styles.emptyText}>
              Ninguém concluiu uma música. Foi ensaio técnico, aparentemente.
            </Text>
          )}

          <View style={styles.rankingBox}>
            <Text style={styles.cardLabel}>Ranking</Text>

            {summary.ranking.length === 0 ? (
              <Text style={styles.emptyText}>Sem ranking para mostrar.</Text>
            ) : (
              summary.ranking.map((item, index) => (
                <View key={`${item.member_id}-${index}`} style={styles.rankingItem}>
                  <Text style={styles.rankingPosition}>{index + 1}</Text>

                  <View style={styles.rankingInfo}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberRole}>
                      {item.performances}{' '}
                      {item.performances === 1 ? 'música cantada' : 'músicas cantadas'}
                    </Text>
                  </View>
                </View>
              ))
            )}
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
        </>
      )}
    </View>
  );
}
