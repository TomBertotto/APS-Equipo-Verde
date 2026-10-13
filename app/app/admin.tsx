import { View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useTeamsViewModel } from '../src/viewmodels/useTeamsViewModel';
import { useDriversViewModel } from '../src/viewmodels/useDriversViewModel';
import { countryName } from '../src/models/countries';
import { CATEGORIES, LINEUPS, LINEUP_LABELS } from '../src/models/ProfilesService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { ListRow } from '../src/views/ListRow';
import { OptionPicker } from '../src/views/OptionPicker';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading } from '../src/views/StatusView';
import { TextField } from '../src/views/TextField';
import { ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { spacing } from '../src/views/theme';

export default function Admin() {
  const auth = useAuth();
  const teams = useTeamsViewModel();
  const drivers = useDriversViewModel();

  if (auth.loading) return <Loading />;
  if (!auth.can('profiles.manage')) return <AccessDenied />;

  async function saveTeam() {
    await teams.save();
    await drivers.reload();
  }

  async function removeTeam(id: number) {
    await teams.remove(id);
    await drivers.reload();
  }

  return (
    <Screen title="Administrar perfiles">
      <Card>
        <SectionTitle>{teams.editingId ? 'Editar escudería' : 'Nueva escudería'}</SectionTitle>
        <TextField label="Nombre" value={teams.name} onChangeText={teams.setName} />
        <TextField label="País" value={teams.country} onChangeText={teams.setCountry} />
        <Label>Categoría</Label>
        <OptionPicker
          options={CATEGORIES.map((c) => ({ label: c, value: c }))}
          selected={teams.category}
          onSelect={teams.setCategory}
        />
        <ErrorText>{teams.error}</ErrorText>
        <View style={{ gap: spacing.sm }}>
          <AppButton title={teams.editingId ? 'Guardar cambios' : 'Crear escudería'} onPress={saveTeam} />
          {teams.editingId ? <AppButton title="Cancelar" variant="secondary" onPress={teams.cancel} /> : null}
        </View>
      </Card>

      <SectionTitle>Escuderías</SectionTitle>
      <Card>
        {teams.teams.map((team) => (
          <ListRow key={team.id} title={team.name} detail={[team.country, team.category].filter(Boolean).join(' · ')}>
            <AppButton title="Editar" variant="secondary" small onPress={() => teams.edit(team)} />
            <AppButton title="Eliminar" variant="danger" small onPress={() => removeTeam(team.id)} />
          </ListRow>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
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
        <Label>Escudería</Label>
        <OptionPicker
          options={[
            { label: 'Sin escudería', value: null as number | null },
            ...teams.teams.map((t) => ({ label: t.name, value: t.id as number | null })),
          ]}
          selected={drivers.teamId}
          onSelect={drivers.setTeamId}
        />
        <ErrorText>{drivers.error}</ErrorText>
        <View style={{ gap: spacing.sm }}>
          <AppButton title={drivers.editingId ? 'Guardar cambios' : 'Crear piloto'} onPress={drivers.save} />
          {drivers.editingId ? <AppButton title="Cancelar" variant="secondary" onPress={drivers.cancel} /> : null}
        </View>
      </Card>

      <SectionTitle>Pilotos</SectionTitle>
      <Card>
        {drivers.drivers.map((driver) => (
          <ListRow
            key={driver.id}
            title={`${driver.number ?? '-'} · ${driver.name}`}
            detail={[
              countryName(driver.nationality),
              driver.team_name ?? 'Sin escudería',
              LINEUP_LABELS[driver.lineup] ?? driver.lineup,
            ]
              .filter(Boolean)
              .join(' · ')}
          >
            <AppButton title="Editar" variant="secondary" small onPress={() => drivers.edit(driver)} />
            <AppButton title="Eliminar" variant="danger" small onPress={() => drivers.remove(driver.id)} />
          </ListRow>
        ))}
      </Card>
    </Screen>
  );
}
