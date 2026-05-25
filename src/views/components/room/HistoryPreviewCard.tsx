import { ActivityIndicator, Text, View } from 'react-native';

import type { RoomEvent } from '../../../types/eventTypes';
import { AppButton } from '../ui/AppButton';
import { roomStyles as styles } from './roomStyles';

type HistoryPreviewCardProps = {
  events: RoomEvent[];
  isLoadingEvents: boolean;
  eventsError: string | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  formatMessage: (event: RoomEvent) => string;
  formatTime: (dateValue: string) => string;
};

export function HistoryPreviewCard({
  events,
  isLoadingEvents,
  eventsError,
  isExpanded,
  onToggleExpanded,
  formatMessage,
  formatTime,
}: HistoryPreviewCardProps) {
  const visibleEvents = isExpanded ? events.slice(0, 30) : events.slice(0, 2);
  const canToggle = events.length > 2;

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Histórico recente</Text>
        <Text style={styles.counter}>{events.length}</Text>
      </View>

      {isLoadingEvents && (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Carregando os acontecimentos...</Text>
        </View>
      )}

      {eventsError && <Text style={styles.errorText}>{eventsError}</Text>}

      {!isLoadingEvents && !eventsError && events.length === 0 && (
        <Text style={styles.emptyText}>Nada aconteceu ainda. Silêncio constrangedor.</Text>
      )}

      {!isLoadingEvents &&
        !eventsError &&
        visibleEvents.map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <Text style={styles.eventTime}>{formatTime(event.created_at)}</Text>
            <Text style={styles.eventText}>{formatMessage(event)}</Text>
          </View>
        ))}

      {!isLoadingEvents && !eventsError && canToggle && (
        <AppButton
          title={isExpanded ? 'Recolher histórico' : 'Ver histórico completo'}
          variant="ghost"
          onPress={onToggleExpanded}
        />
      )}
    </View>
  );
}
