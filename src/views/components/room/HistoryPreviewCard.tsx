import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../constants/theme';
import type { RoomEvent } from '../../../types/eventTypes';
import { AppBadge } from '../ui/AppBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedEntrance } from '../ui/MicroInteractions';

type HistoryPreviewCardProps = {
  events: RoomEvent[];
  isLoadingEvents: boolean;
  eventsError: string | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  formatMessage: (event: RoomEvent) => string;
  formatTime: (dateValue: string) => string;
  compact?: boolean;
  showToggle?: boolean;
};

export function HistoryPreviewCard({
  events,
  isLoadingEvents,
  eventsError,
  isExpanded,
  onToggleExpanded,
  formatMessage,
  formatTime,
  compact = false,
  showToggle = true,
}: HistoryPreviewCardProps) {
  const collapsedLimit = compact ? 2 : 3;
  const isAccordionClosed = compact && !isExpanded;
  const visibleEvents = isAccordionClosed
    ? []
    : isExpanded
      ? events.slice(0, 30)
      : events.slice(0, collapsedLimit);
  const canToggle = compact || events.length > collapsedLimit;
  const toggleTitle = compact
    ? isExpanded
      ? 'Fechar história'
      : 'Abrir história'
    : isExpanded
      ? 'Recolher histórico'
      : 'Ver histórico completo';

  return (
    <AnimatedEntrance type="slideUp">
      <AppCard style={[styles.card, compact && styles.compactCard]}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>História da noite</Text>
            <Text
              accessibilityRole="header"
              style={[styles.title, compact && styles.compactTitle]}
            >
              Memória do rolê
            </Text>
          </View>

          <AppBadge label={`${events.length}`} variant={events.length ? 'accent' : 'neutral'} />
        </View>

        {!isAccordionClosed && isLoadingEvents ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando os acontecimentos...</Text>
          </View>
        ) : null}

        {!isAccordionClosed && eventsError ? <Text style={styles.errorText}>{eventsError}</Text> : null}

        {!isAccordionClosed && !isLoadingEvents && !eventsError && events.length === 0 ? (
          <EmptyState
            badge="Sem apresentações"
            title="Ninguém cantou ainda."
            message="Quando o primeiro cantor subir ao palco, a história da noite começa aqui."
          />
        ) : null}

        {!isLoadingEvents && !eventsError && visibleEvents.length > 0 ? (
          <View style={styles.timeline}>
            {visibleEvents.map((event, index) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
                  {index < visibleEvents.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>

                <View style={styles.eventCard}>
                  <Text style={styles.eventTime}>{formatTime(event.created_at)}</Text>
                  <Text style={styles.eventText}>{formatMessage(event)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {!isLoadingEvents && !eventsError && canToggle && showToggle ? (
          <AppButton
            title={toggleTitle}
            accessibilityLabel={isExpanded ? 'Fechar história da noite' : 'Abrir história da noite'}
            variant="ghost"
            onPress={onToggleExpanded}
          />
        ) : null}
      </AppCard>
    </AnimatedEntrance>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.lg,
  },
  compactCard: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
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
  compactTitle: {
    ...theme.typography.bodyStrong,
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
  timeline: {
    gap: theme.spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timelineRail: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.borderStrong,
    marginTop: 6,
  },
  timelineDotActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: theme.colors.borderSoft,
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 3,
    padding: theme.spacing.md,
  },
  eventTime: {
    color: theme.colors.textSoft,
    ...theme.typography.label,
  },
  eventText: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
});
