import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePublicCalendarViewModel } from '../src/viewmodels/usePublicCalendarViewModel';
import { EVENT_STATUS_LABELS } from '../src/models/CalendarService';
import { formStyles } from '../src/views/styles';

export default function Calendar() {
  const vm = usePublicCalendarViewModel();

  if (vm.loading) {
    return (
      <View style={formStyles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.column}>
        <Text style={styles.title}>Calendario oficial de carreras y eventos</Text>
        <Button title="Descargar calendario (.ics)" onPress={vm.download} />
        <Button title="Actualizar" onPress={vm.reload} />

        {vm.error ? <Text style={formStyles.error}>{vm.error}</Text> : null}
        {vm.events.length === 0 ? <Text>No hay eventos cargados.</Text> : null}

        {vm.events.map((ev) => (
          <View key={ev.id} style={styles.card}>
            <Text style={styles.date}>
              {ev.event_date}
              {ev.event_time ? ` · ${ev.event_time}` : ''}
            </Text>
            <Text style={styles.name}>
              {ev.name} ({ev.category})
            </Text>
            {ev.circuit || ev.location ? (
              <Text>{[ev.circuit, ev.location].filter(Boolean).join(', ')}</Text>
            ) : null}
            <Text>Estado: {EVENT_STATUS_LABELS[ev.status] ?? ev.status}</Text>
            {ev.notes ? <Text>{ev.notes}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: 'center', padding: 24 },
  column: { width: '100%', maxWidth: 600, gap: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  card: { borderWidth: 1, padding: 8, gap: 2 },
  date: { fontWeight: 'bold' },
  name: { fontSize: 16 },
});
