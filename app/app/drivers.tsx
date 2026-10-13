import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePublicDriversViewModel } from '../src/viewmodels/usePublicDriversViewModel';
import { Driver } from '../src/models/ProfilesService';
import { OptionPicker } from '../src/views/OptionPicker';
import { formStyles } from '../src/views/styles';

function DriverList({ title, drivers }: { title: string; drivers: Driver[] }) {
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      {drivers.length === 0 ? <Text>Sin pilotos.</Text> : null}
      {drivers.map((driver) => (
        <View key={driver.id} style={styles.card}>
          <Text style={styles.name}>
            {driver.number ?? '-'} · {driver.name}
          </Text>
          {driver.nationality ? <Text>{driver.nationality}</Text> : null}
        </View>
      ))}
    </>
  );
}

export default function Drivers() {
  const vm = usePublicDriversViewModel();

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
        {vm.error ? <Text style={formStyles.error}>{vm.error}</Text> : null}
        {vm.teams.length === 0 ? (
          <Text>No hay escuderías cargadas.</Text>
        ) : (
          <>
            <Text>Escudería:</Text>
            <OptionPicker
              options={vm.teams.map((t) => ({ label: t.name, value: t.id as number | null }))}
              selected={vm.teamId}
              onSelect={vm.setTeamId}
            />
            <Button title="Actualizar" onPress={vm.reload} />
            <DriverList title="Titulares" drivers={vm.starters} />
            <DriverList title="Suplentes" drivers={vm.reserves} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: 'center', padding: 24 },
  column: { width: '100%', maxWidth: 500, gap: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  card: { borderWidth: 1, padding: 8, gap: 2 },
  name: { fontSize: 16 },
});
