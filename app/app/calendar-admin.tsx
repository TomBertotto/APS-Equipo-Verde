import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthViewModel } from '../src/viewmodels/useAuthViewModel';
import { useCalendarViewModel } from '../src/viewmodels/useCalendarViewModel';
import { EVENT_CATEGORIES, EVENT_STATUSES } from '../src/models/CalendarService';
import { OptionPicker } from '../src/views/OptionPicker';
import { formStyles } from '../src/views/styles';

export default function CalendarAdmin() {
  const auth = useAuthViewModel();
  const vm = useCalendarViewModel();

  if (auth.loading || vm.loading) {
    return (
      <View style={formStyles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!auth.can('calendar.manage')) {
    return (
      <View style={formStyles.container}>
        <Text>Acceso denegado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.column}>
        <Text style={styles.title}>Gestión del calendario de carreras y eventos</Text>

        <TextInput
          style={formStyles.input}
          placeholder="Nombre del evento"
          value={vm.name}
          onChangeText={vm.setName}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Circuito"
          value={vm.circuit}
          onChangeText={vm.setCircuit}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Localidad"
          value={vm.location}
          onChangeText={vm.setLocation}
        />

        <Text>Categoría:</Text>
        <OptionPicker
          options={EVENT_CATEGORIES.map((c) => ({ label: c, value: c }))}
          selected={vm.category}
          onSelect={vm.setCategory}
        />

        <TextInput
          style={formStyles.input}
          placeholder="Fecha (YYYY-MM-DD)"
          value={vm.eventDate}
          onChangeText={vm.setEventDate}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Hora (HH:MM)"
          value={vm.eventTime}
          onChangeText={vm.setEventTime}
        />

        <Text>Estado:</Text>
        <OptionPicker
          options={EVENT_STATUSES.map((s) => ({ label: s, value: s }))}
          selected={vm.status}
          onSelect={vm.setStatus}
        />

        <TextInput
          style={[formStyles.input, styles.multiline]}
          placeholder="Notas"
          value={vm.notes}
          multiline
          numberOfLines={3}
          onChangeText={vm.setNotes}
        />

        {vm.error ? <Text style={formStyles.error}>{vm.error}</Text> : null}

        <Button title={vm.editingId ? 'Guardar cambios' : 'Crear evento'} onPress={vm.save} disabled={vm.saving} />
        {vm.editingId ? <Button title="Cancelar" onPress={vm.cancel} /> : null}

        <Text style={styles.title}>Eventos</Text>
        {vm.events.map((ev) => (
          <View key={ev.id} style={styles.row}>
            <Text style={styles.rowText}>
              {ev.event_date}
              {ev.event_time ? ` ${ev.event_time}` : ''} · {ev.name}
              {ev.circuit ? ` · ${ev.circuit}` : ''}
              {ev.location ? ` · ${ev.location}` : ''}
              {ev.category ? ` · ${ev.category}` : ''}
              {ev.status ? ` · ${ev.status}` : ''}
            </Text>
            <Button title="Editar" onPress={() => vm.edit(ev)} />
            <Button title="Eliminar" onPress={() => vm.remove(ev.id)} />
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowText: { flex: 1 },
  multiline: { height: 80, textAlignVertical: 'top' },
});
