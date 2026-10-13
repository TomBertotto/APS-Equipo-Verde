import { View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useCalendarViewModel } from '../src/viewmodels/useCalendarViewModel';
import { EVENT_CATEGORIES, EVENT_STATUSES, EVENT_STATUS_LABELS } from '../src/models/CalendarService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { ListRow } from '../src/views/ListRow';
import { OptionPicker } from '../src/views/OptionPicker';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading } from '../src/views/StatusView';
import { TextField } from '../src/views/TextField';
import { ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { spacing } from '../src/views/theme';

export default function CalendarAdmin() {
  const auth = useAuth();
  const vm = useCalendarViewModel();

  if (auth.loading || vm.loading) return <Loading />;
  if (!auth.can('calendar.manage')) return <AccessDenied />;

  return (
    <Screen title="Gestionar calendario">
      <Card>
        <SectionTitle>{vm.editingId ? 'Editar evento' : 'Nuevo evento'}</SectionTitle>
        <TextField label="Nombre del evento" value={vm.name} onChangeText={vm.setName} />
        <TextField label="Circuito" value={vm.circuit} onChangeText={vm.setCircuit} />
        <TextField label="Localidad" value={vm.location} onChangeText={vm.setLocation} />
        <Label>Categoría</Label>
        <OptionPicker
          options={EVENT_CATEGORIES.map((c) => ({ label: c, value: c }))}
          selected={vm.category}
          onSelect={vm.setCategory}
        />
        <TextField
          label="Fecha"
          placeholder="YYYY-MM-DD"
          value={vm.eventDate}
          onChangeText={vm.setEventDate}
        />
        <TextField label="Hora" placeholder="HH:MM" value={vm.eventTime} onChangeText={vm.setEventTime} />
        <Label>Estado</Label>
        <OptionPicker
          options={EVENT_STATUSES.map((s) => ({ label: EVENT_STATUS_LABELS[s] ?? s, value: s }))}
          selected={vm.status}
          onSelect={vm.setStatus}
        />
        <TextField label="Notas" value={vm.notes} multiline numberOfLines={3} onChangeText={vm.setNotes} />
        <ErrorText>{vm.error}</ErrorText>
        <View style={{ gap: spacing.sm }}>
          <AppButton
            title={vm.editingId ? 'Guardar cambios' : 'Crear evento'}
            onPress={vm.save}
            disabled={vm.saving}
          />
          {vm.editingId ? <AppButton title="Cancelar" variant="secondary" onPress={vm.cancel} /> : null}
        </View>
      </Card>

      <SectionTitle>Eventos</SectionTitle>
      <Card>
        {vm.events.map((ev) => (
          <ListRow
            key={ev.id}
            title={ev.name}
            detail={[
              `${ev.event_date}${ev.event_time ? ` ${ev.event_time}` : ''}`,
              ev.circuit,
              ev.location,
              ev.category,
              EVENT_STATUS_LABELS[ev.status] ?? ev.status,
            ]
              .filter(Boolean)
              .join(' · ')}
          >
            <AppButton title="Editar" variant="secondary" small onPress={() => vm.edit(ev)} />
            <AppButton title="Eliminar" variant="danger" small onPress={() => vm.remove(ev.id)} />
          </ListRow>
        ))}
      </Card>
    </Screen>
  );
}
