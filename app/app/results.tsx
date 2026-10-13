import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ResultsTab, usePublicResultsViewModel } from '../src/viewmodels/usePublicResultsViewModel';
import { Card } from '../src/views/Card';
import { Country } from '../src/views/Country';
import { OptionPicker } from '../src/views/OptionPicker';
import { Screen } from '../src/views/Screen';
import { Loading } from '../src/views/StatusView';
import { BodyText, ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { colors, fonts, radius, spacing } from '../src/views/theme';

const TABS: { label: string; value: ResultsTab }[] = [
  { label: 'Por carrera', value: 'race' },
  { label: 'Campeonato de pilotos', value: 'drivers' },
  { label: 'Campeonato de escuderías', value: 'teams' },
];

const PODIUM = ['#C9A227', '#9EA3A8', '#B0703C'];

// Fila de tabla: posición, nombre (+ detalle opcional) y puntos
function Row({ pos, name, detail, points }: { pos: string; name: string; detail?: ReactNode; points: number }) {
  const podium = PODIUM[Number(pos) - 1];
  return (
    <View style={styles.row}>
      <View style={[styles.pos, podium ? { backgroundColor: podium } : null]}>
        <Text style={[styles.posText, podium ? styles.posTextPodium : null]}>{pos}</Text>
      </View>
      <View style={styles.rowMain}>
        <Text style={styles.name}>{name}</Text>
        {detail}
      </View>
      <Text style={styles.points}>{points}</Text>
    </View>
  );
}

function TableHeader() {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerText, styles.headerPos]}>Pos</Text>
      <Text style={[styles.headerText, styles.rowMain]}>Nombre</Text>
      <Text style={styles.headerText}>Pts</Text>
    </View>
  );
}

export default function Results() {
  const vm = usePublicResultsViewModel();

  if (vm.loading) return <Loading />;

  return (
    <Screen title="Resultados" maxWidth={800}>
      <OptionPicker options={TABS} selected={vm.tab} onSelect={vm.setTab} />
      <ErrorText>{vm.error}</ErrorText>

      {vm.races.length === 0 ? (
        <BodyText muted>Todavía no hay resultados cargados.</BodyText>
      ) : vm.tab === 'race' ? (
        <>
          <Label>Carrera</Label>
          <OptionPicker
            options={vm.races.map((r) => ({
              label: r.name.replace(/^Gran Premio (de (los |la |las )?)?/, ''),
              value: r.id as number | null,
            }))}
            selected={vm.eventId}
            onSelect={vm.setEventId}
          />
          {vm.selectedRace ? (
            <SectionTitle>
              {vm.selectedRace.name} · {vm.selectedRace.event_date}
            </SectionTitle>
          ) : null}
          <Card>
            <TableHeader />
            {vm.results.map((r) => (
              <Row
                key={r.driver_id}
                pos={r.position != null ? String(r.position) : 'AB'}
                name={`${r.number ?? '-'} · ${r.driver_name}`}
                detail={<BodyText muted>{r.team_name ?? 'Sin escudería'}</BodyText>}
                points={r.points}
              />
            ))}
          </Card>
          <BodyText muted>AB: abandonó / no terminó.</BodyText>
        </>
      ) : vm.tab === 'drivers' ? (
        <Card>
          <TableHeader />
          {vm.standings.drivers.map((d, i) => (
            <Row
              key={d.id}
              pos={String(i + 1)}
              name={d.name}
              detail={
                <View style={styles.detailRow}>
                  {d.nationality ? <Country value={d.nationality} /> : null}
                  <BodyText muted>· {d.team_name ?? 'Sin escudería'}</BodyText>
                </View>
              }
              points={d.points}
            />
          ))}
        </Card>
      ) : (
        <Card>
          <TableHeader />
          {vm.standings.teams.map((t, i) => (
            <Row
              key={t.id}
              pos={String(i + 1)}
              name={t.name}
              detail={<BodyText muted>{t.wins} {t.wins === 1 ? 'victoria' : 'victorias'}</BodyText>}
              points={t.points}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.xs },
  headerText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted, textTransform: 'uppercase' },
  headerPos: { width: 36, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pos: {
    width: 36,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posText: { fontFamily: fonts.black, fontSize: 15, color: colors.text },
  posTextPodium: { color: colors.onDark },
  rowMain: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  points: { fontFamily: fonts.black, fontSize: 18, color: colors.text, minWidth: 40, textAlign: 'right' },
});
