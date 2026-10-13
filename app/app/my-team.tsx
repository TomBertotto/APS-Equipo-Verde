import { View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useDriversViewModel } from '../src/viewmodels/useDriversViewModel';
import { countryName } from '../src/models/countries';
import { LINEUPS, LINEUP_LABELS } from '../src/models/ProfilesService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { ListRow } from '../src/views/ListRow';
import { OptionPicker } from '../src/views/OptionPicker';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading, StatusView } from '../src/views/StatusView';
import { TextField } from '../src/views/TextField';
import { ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { spacing } from '../src/views/theme';

export default function MyTeam() {
  const auth = useAuth();
  const teamId = auth.currentUser?.teamId ?? undefined;
  const drivers = useDriversViewModel(teamId);

  if (auth.loading) return <Loading />;
  if (!auth.can('drivers.manage_own')) return <AccessDenied />;
  if (!teamId) return <StatusView message="No tenés una escudería asignada" />;

  return (
    <Screen title={`Mi escudería · ${auth.currentUser?.teamName}`}>
      <Card>
        <SectionTitle>{drivers.editingId ? 'Editar piloto' : 'Nuevo piloto'}</SectionTitle>
        <TextField label="Nombre" value={drivers.name} onChangeText={drivers.setName} />
        <TextField label="País" value={drivers.nationality} onChangeText={drivers.setNationality} />
        <TextField label="Número" keyboardType="numeric" value={drivers.number} onChangeText={drivers.setNumber} />
        <Label>Clasificación</Label>
        <OptionPicker
          options={LINEUPS.map((l) => ({ label: LINEUP_LABELS[l], value: l }))}
          selected={drivers.lineup}
          onSelect={drivers.setLineup}
        />
        <ErrorText>{drivers.error}</ErrorText>
        <View style={{ gap: spacing.sm }}>
          <AppButton title={drivers.editingId ? 'Guardar cambios' : 'Agregar piloto'} onPress={drivers.save} />
          {drivers.editingId ? <AppButton title="Cancelar" variant="secondary" onPress={drivers.cancel} /> : null}
        </View>
      </Card>

      <SectionTitle>Pilotos</SectionTitle>
      <Card>
        {drivers.drivers.map((driver) => (
          <ListRow
            key={driver.id}
            title={`${driver.number ?? '-'} · ${driver.name}`}
            detail={[countryName(driver.nationality), LINEUP_LABELS[driver.lineup] ?? driver.lineup].filter(Boolean).join(' · ')}
          >
            <AppButton title="Editar" variant="secondary" small onPress={() => drivers.edit(driver)} />
            <AppButton title="Eliminar" variant="danger" small onPress={() => drivers.remove(driver.id)} />
          </ListRow>
        ))}
      </Card>
    </Screen>
  );
}
