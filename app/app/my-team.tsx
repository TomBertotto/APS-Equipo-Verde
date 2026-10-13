import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthViewModel } from '../src/viewmodels/useAuthViewModel';
import { useDriversViewModel } from '../src/viewmodels/useDriversViewModel';
import { LINEUPS, LINEUP_LABELS } from '../src/models/ProfilesService';
import { OptionPicker } from '../src/views/OptionPicker';
import { formStyles } from '../src/views/styles';

export default function MyTeam() {
  const auth = useAuthViewModel();
  const teamId = auth.currentUser?.teamId ?? undefined;
  const drivers = useDriversViewModel(teamId);

  if (auth.loading) {
    return (
      <View style={formStyles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!auth.can('drivers.manage_own')) {
    return (
      <View style={formStyles.container}>
        <Text>Acceso denegado</Text>
      </View>
    );
  }

  if (!teamId) {
    return (
      <View style={formStyles.container}>
        <Text>No tenés una escudería asignada</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.column}>
        <Text style={styles.title}>Pilotos de {auth.currentUser?.teamName}</Text>
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
        <OptionPicker
          options={LINEUPS.map((l) => ({ label: LINEUP_LABELS[l], value: l }))}
          selected={drivers.lineup}
          onSelect={drivers.setLineup}
        />
        {drivers.error ? <Text style={formStyles.error}>{drivers.error}</Text> : null}
        <Button title={drivers.editingId ? 'Guardar cambios' : 'Agregar piloto'} onPress={drivers.save} />
        {drivers.editingId ? <Button title="Cancelar" onPress={drivers.cancel} /> : null}
        {drivers.drivers.map((driver) => (
          <View key={driver.id} style={styles.row}>
            <Text style={styles.rowText}>
              {driver.number ?? '-'} · {driver.name} · {driver.nationality} ·{' '}
              {LINEUP_LABELS[driver.lineup] ?? driver.lineup}
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
