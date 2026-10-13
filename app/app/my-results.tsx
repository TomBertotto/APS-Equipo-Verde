import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useMyResultsViewModel } from '../src/viewmodels/useMyResultsViewModel';
import { formatConfirmation } from '../src/models/ResultsService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { ListRow } from '../src/views/ListRow';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading, StatusView } from '../src/views/StatusView';
import { BodyText, ErrorText, Label } from '../src/views/Typography';
import { colors, fonts, radius, spacing } from '../src/views/theme';

export default function MyResults() {
  const auth = useAuth();
  const allowed = auth.can('results.confirm_own') && !!auth.currentUser?.teamId;
  const vm = useMyResultsViewModel(allowed);

  if (auth.loading || vm.loading) return <Loading />;
  if (!auth.can('results.confirm_own')) return <AccessDenied />;
  if (!auth.currentUser?.teamId) return <StatusView message="No tenés una escudería asignada" />;

  return (
    <Screen title={`Mis puntajes · ${auth.currentUser.teamName}`}>
      <BodyText muted>
        {vm.pending > 0
          ? `Tenés ${vm.pending} ${vm.pending === 1 ? 'resultado' : 'resultados'} sin confirmar.`
          : 'Todos los resultados están confirmados.'}
      </BodyText>
      <ErrorText>{vm.error}</ErrorText>
      {vm.races.length === 0 ? <BodyText muted>Tu escudería todavía no tiene resultados.</BodyText> : null}

      {vm.races.map((race) => (
        <Card key={race.event_id} style={!race.confirmed_at && styles.pendingCard}>
          <View style={styles.header}>
            <View style={styles.headerMain}>
              <Label>{race.event_date}</Label>
              <Text style={styles.race}>{race.event_name}</Text>
            </View>
            <Text style={styles.total}>{race.total_points} pts</Text>
          </View>
          {race.drivers.map((d) => (
            <ListRow
              key={d.driver_id}
              title={`${d.number ?? '-'} · ${d.driver_name}`}
              detail={`${d.position != null ? `Posición ${d.position}` : 'No terminó'} · ${d.points} pts`}
            />
          ))}
          {race.confirmed_at ? (
            <View style={styles.confirmed}>
              <Text style={styles.confirmedText}>✓ Confirmado el {formatConfirmation(race.confirmed_at)}</Text>
            </View>
          ) : (
            <View style={styles.action}>
              <AppButton title="Confirmar recepción" onPress={() => vm.confirm(race.event_id)} />
            </View>
          )}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pendingCard: { borderTopColor: colors.primary },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerMain: { flex: 1 },
  race: { fontFamily: fonts.black, fontSize: 18, color: colors.text, textTransform: 'uppercase' },
  total: { fontFamily: fonts.black, fontSize: 22, color: colors.primary },
  confirmed: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  confirmedText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.success },
  action: { alignItems: 'flex-start' },
});
