import { StyleSheet, Text, View } from 'react-native';
import { usePublicCalendarViewModel } from '../src/viewmodels/usePublicCalendarViewModel';
import { EVENT_STATUS_LABELS } from '../src/models/CalendarService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { Screen } from '../src/views/Screen';
import { Loading } from '../src/views/StatusView';
import { BodyText, ErrorText, Label } from '../src/views/Typography';
import { colors, fonts, radius, spacing } from '../src/views/theme';

const STATUS_COLORS: Record<string, string> = {
  scheduled: colors.dark,
  completed: colors.muted,
  cancelled: colors.danger,
  postponed: '#B26B00',
};

export default function Calendar() {
  const vm = usePublicCalendarViewModel();

  if (vm.loading) return <Loading />;

  return (
    <Screen title="Calendario de carreras y eventos">
      <View style={styles.actions}>
        <AppButton title="Descargar calendario (.ics)" onPress={vm.download} />
        <AppButton title="Actualizar" variant="secondary" onPress={vm.reload} />
      </View>

      <ErrorText>{vm.error}</ErrorText>
      {vm.events.length === 0 ? <BodyText muted>No hay eventos cargados.</BodyText> : null}

      {vm.events.map((ev, index) => (
        <Card key={ev.id} style={ev.status === 'completed' && styles.past}>
          <View style={styles.header}>
            <Text style={styles.round}>Ronda {index + 1}</Text>
            <View style={[styles.badge, { backgroundColor: STATUS_COLORS[ev.status] ?? colors.dark }]}>
              <Text style={styles.badgeText}>{EVENT_STATUS_LABELS[ev.status] ?? ev.status}</Text>
            </View>
          </View>
          <Label>
            {ev.event_date}
            {ev.event_time ? ` · ${ev.event_time}` : ''} · {ev.category}
          </Label>
          <Text style={styles.name}>{ev.name}</Text>
          {ev.circuit || ev.location ? (
            <BodyText muted>{[ev.circuit, ev.location].filter(Boolean).join(' · ')}</BodyText>
          ) : null}
          {ev.notes ? <BodyText>{ev.notes}</BodyText> : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  past: { opacity: 0.75 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  round: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  badge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.onDark, textTransform: 'uppercase' },
  name: { fontFamily: fonts.black, fontSize: 20, color: colors.text, textTransform: 'uppercase' },
});
