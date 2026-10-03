import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthViewModel } from '../src/viewmodels/useAuthViewModel';
import { useTeamsViewModel } from '../src/viewmodels/useTeamsViewModel';
import { useDriversViewModel } from '../src/viewmodels/useDriversViewModel';
import { CATEGORIES } from '../src/models/ProfilesService';
import { OptionPicker } from '../src/views/OptionPicker';
import { formStyles } from '../src/views/styles';

export default function Admin() {
  const auth = useAuthViewModel();
  const teams = useTeamsViewModel();
  const drivers = useDriversViewModel();

  if (auth.loading) {
    return (
      <View style={formStyles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!auth.can('profiles.manage')) {
    return (
      <View style={formStyles.container}>
        <Text>Acceso denegado</Text>
      </View>
    );
  }

  async function saveTeam() {
    await teams.save();
    await drivers.reload();
  }

  async function removeTeam(id: number) {
    await teams.remove(id);
    await drivers.reload();
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.column}>
        <Text style={styles.title}>Escuderías</Text>
        <TextInput
          style={formStyles.input}
          placeholder="Nombre"
          value={teams.name}
          onChangeText={teams.setName}
        />
        <TextInput
          style={formStyles.input}
          placeholder="País"
          value={teams.country}
          onChangeText={teams.setCountry}
        />
        <OptionPicker
          options={CATEGORIES.map((c) => ({ label: c, value: c }))}
          selected={teams.category}
          onSelect={teams.setCategory}
        />
        {teams.error ? <Text style={formStyles.error}>{teams.error}</Text> : null}
        <Button title={teams.editingId ? 'Guardar cambios' : 'Crear escudería'} onPress={saveTeam} />
        {teams.editingId ? <Button title="Cancelar" onPress={teams.cancel} /> : null}
        {teams.teams.map((team) => (
          <View key={team.id} style={styles.row}>
            <Text style={styles.rowText}>
              {team.name} · {team.country} · {team.category}
            </Text>
            <Button title="Editar" onPress={() => teams.edit(team)} />
            <Button title="Eliminar" onPress={() => removeTeam(team.id)} />
          </View>
        ))}

        <Text style={styles.title}>Pilotos</Text>
        <TextInput
          style={formStyles.input}
          placeholder="Nombre"
          value={drivers.name}
          onChangeText={drivers.setName}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Nacionalidad"
          value={drivers.nationality}
          onChangeText={drivers.setNationality}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Número"
          keyboardType="numeric"
          value={drivers.number}
          onChangeText={drivers.setNumber}
        />
        <Text>Escudería:</Text>
        <OptionPicker
          options={[
            { label: 'Sin escudería', value: null as number | null },
            ...teams.teams.map((t) => ({ label: t.name, value: t.id as number | null })),
          ]}
          selected={drivers.teamId}
          onSelect={drivers.setTeamId}
        />
        {drivers.error ? <Text style={formStyles.error}>{drivers.error}</Text> : null}
        <Button title={drivers.editingId ? 'Guardar cambios' : 'Crear piloto'} onPress={drivers.save} />
        {drivers.editingId ? <Button title="Cancelar" onPress={drivers.cancel} /> : null}
        {drivers.drivers.map((driver) => (
          <View key={driver.id} style={styles.row}>
            <Text style={styles.rowText}>
              {driver.number ?? '-'} · {driver.name} · {driver.nationality} · {driver.team_name ?? 'Sin escudería'}
            </Text>
            <Button title="Editar" onPress={() => drivers.edit(driver)} />
            <Button title="Eliminar" onPress={() => drivers.remove(driver.id)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: 'center', padding: 24 },
  column: { width: '100%', maxWidth: 500, gap: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowText: { flex: 1 },
});
