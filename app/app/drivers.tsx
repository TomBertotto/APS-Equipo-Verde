import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePublicDriversViewModel } from '../src/viewmodels/usePublicDriversViewModel';
import { Driver } from '../src/models/ProfilesService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { OptionPicker } from '../src/views/OptionPicker';
import { Screen } from '../src/views/Screen';
import { Country } from '../src/views/Country';
import { Loading } from '../src/views/StatusView';
import { BodyText, ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { colors, fonts, spacing } from '../src/views/theme';

// Tarjetas de ancho fijo por columna, así una fila incompleta no estira sus tarjetas
function columnsFor(width: number) {
  if (width >= 700) return 3;
  if (width >= 440) return 2;
  return 1;
}

function DriverList({ title, drivers, showTeam }: { title: string; drivers: Driver[]; showTeam: boolean }) {
  const [gridWidth, setGridWidth] = useState(0);
  const columns = columnsFor(gridWidth);
  const cardWidth = (gridWidth - spacing.sm * (columns - 1)) / columns;

  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      {drivers.length === 0 ? <BodyText muted>Sin pilotos.</BodyText> : null}
      <View style={styles.grid} onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
        {drivers.map((driver) => (
          <Card key={driver.id} style={[styles.driverCard, gridWidth > 0 && { width: cardWidth }]}>
            <Text style={styles.number}>{driver.number ?? '-'}</Text>
            {showTeam ? <Text style={styles.team}>{driver.team_name ?? 'Sin escudería'}</Text> : null}
            <Text style={styles.name}>{driver.name}</Text>
            {driver.nationality ? <Country value={driver.nationality} /> : null}
          </Card>
        ))}
      </View>
    </>
  );
}

export default function Drivers() {
  const vm = usePublicDriversViewModel();

  if (vm.loading) return <Loading />;

  return (
    <Screen title="Pilotos por escudería" maxWidth={800}>
      <ErrorText>{vm.error}</ErrorText>
      {vm.teams.length === 0 ? (
        <BodyText muted>No hay escuderías cargadas.</BodyText>
      ) : (
        <>
          <Label>Escudería</Label>
          <OptionPicker
            options={[
              { label: 'Todas', value: null as number | null },
              ...vm.teams.map((t) => ({ label: t.name, value: t.id as number | null })),
            ]}
            selected={vm.teamId}
            onSelect={vm.setTeamId}
          />
          <View style={styles.actions}>
            <AppButton title="Actualizar" variant="secondary" small onPress={vm.reload} />
          </View>
          <DriverList title="Titulares" drivers={vm.starters} showTeam={vm.teamId === null} />
          <DriverList title="Suplentes" drivers={vm.reserves} showTeam={vm.teamId === null} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  driverCard: { borderTopColor: colors.primary, gap: 2 },
  number: { fontFamily: fonts.black, fontSize: 36, color: colors.primary, lineHeight: 40 },
  team: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, textTransform: 'uppercase' },
});
