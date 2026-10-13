import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useResultsAdminViewModel } from '../src/viewmodels/useResultsAdminViewModel';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { ListRow } from '../src/views/ListRow';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading } from '../src/views/StatusView';
import { TextField } from '../src/views/TextField';
import { BodyText, ErrorText, SectionTitle } from '../src/views/Typography';
import { colors, fonts, spacing } from '../src/views/theme';

export default function ResultsAdmin() {
  const auth = useAuth();
  const vm = useResultsAdminViewModel();

  if (auth.loading || vm.loading) return <Loading />;
  if (!auth.can('results.manage')) return <AccessDenied />;

  if (vm.selectedEvent) {
    return (
      <Screen title={`Resultados · ${vm.selectedEvent.name}`} maxWidth={720}>
        <View style={styles.top}>
          <AppButton title="Volver a carreras" variant="secondary" small onPress={vm.back} />
        </View>
        <BodyText muted>
          Cargá la posición final de cada piloto; los puntos se calculan solos (25-18-15-12-10-8-6-4-2-1) y se
          pueden corregir. Dejá la posición vacía y los puntos en 0 si no terminó, o todo vacío si no corrió.
        </BodyText>
        <BodyText muted>Guardar invalida las confirmaciones que las escuderías hayan hecho de esta carrera.</BodyText>
        <Card>
          <View style={styles.header}>
            <Text style={[styles.headerText, styles.main]}>Piloto</Text>
            <Text style={[styles.headerText, styles.field]}>Pos</Text>
            <Text style={[styles.headerText, styles.field]}>Pts</Text>
          </View>
          {vm.rows.map((r) => (
            <View key={r.driverId} style={styles.row}>
              <View style={styles.main}>
                <Text style={styles.name}>
                  {r.number ?? '-'} · {r.driverName}
                </Text>
                <Text style={styles.team}>{r.teamName}</Text>
              </View>
              <View style={styles.field}>
                <TextField
                  keyboardType="numeric"
                  value={r.position}
                  onChangeText={(v) => vm.setPosition(r.driverId, v)}
                  accessibilityLabel={`Posición de ${r.driverName}`}
                />
              </View>
              <View style={styles.field}>
                <TextField
                  keyboardType="numeric"
                  value={r.points}
                  onChangeText={(v) => vm.setPoints(r.driverId, v)}
                  accessibilityLabel={`Puntos de ${r.driverName}`}
                />
              </View>
            </View>
          ))}
        </Card>
        <ErrorText>{vm.error}</ErrorText>
        {vm.message ? <Text style={styles.message}>{vm.message}</Text> : null}
        <AppButton title="Guardar resultados" onPress={vm.save} disabled={vm.saving} />
      </Screen>
    );
  }

  return (
    <Screen title="Cargar resultados">
      <ErrorText>{vm.error}</ErrorText>
      <SectionTitle>Carreras</SectionTitle>
      <Card>
        {vm.events.map((e) => (
          <ListRow
            key={e.id}
            title={e.name}
            detail={`${e.event_date} · ${vm.withResults.has(e.id) ? 'Con resultados' : 'Sin resultados'}`}
          >
            <AppButton
              title={vm.withResults.has(e.id) ? 'Editar' : 'Cargar'}
              variant={vm.withResults.has(e.id) ? 'secondary' : 'primary'}
              small
              onPress={() => vm.select(e.id)}
            />
          </ListRow>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-start' },
  header: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.xs },
  headerText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  main: { flex: 1 },
  field: { width: 64 },
  name: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  team: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  message: { fontFamily: fonts.semibold, fontSize: 14, color: colors.success },
});
