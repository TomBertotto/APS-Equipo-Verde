import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useHomeViewModel } from '../src/viewmodels/useHomeViewModel';
import { useMyResultsViewModel } from '../src/viewmodels/useMyResultsViewModel';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { Screen } from '../src/views/Screen';
import { BodyText, Label, SectionTitle } from '../src/views/Typography';
import { colors, fonts, radius, spacing } from '../src/views/theme';

export default function Home() {
  const auth = useAuth();
  const vm = useHomeViewModel();
  const myResults = useMyResultsViewModel(auth.can('results.confirm_own') && !!auth.currentUser?.teamId);

  return (
    <Screen maxWidth={900}>
      <View style={styles.hero}>
        <View style={styles.heroStripe} />
        <Text style={styles.heroKicker}>Plataforma oficial</Text>
        <Text style={styles.heroTitle}>FIA CONNECT</Text>
        <Text style={styles.heroText}>
          Calendario, escuderías y pilotos del campeonato en un solo lugar.
        </Text>
        {auth.currentUser ? (
          <Text style={styles.heroText}>Hola, {auth.currentUser.username}</Text>
        ) : auth.loading ? null : (
          <View style={styles.heroActions}>
            <AppButton title="Ingresar" onPress={() => router.navigate('/login')} />
            <AppButton title="Registrarse" variant="light" onPress={() => router.navigate('/register')} />
          </View>
        )}
      </View>

      {myResults.pending > 0 ? (
        <View style={styles.notice}>
          <View style={styles.noticeMain}>
            <Text style={styles.noticeTitle}>
              Tenés {myResults.pending} {myResults.pending === 1 ? 'resultado' : 'resultados'} sin confirmar
            </Text>
            <BodyText muted>La FIA publicó puntajes de tu escudería que todavía no confirmaste.</BodyText>
          </View>
          <AppButton title="Ver mis puntajes" small onPress={() => router.navigate('/my-results')} />
        </View>
      ) : null}

      <SectionTitle>Próxima carrera</SectionTitle>
      <Card>
        {vm.loading ? (
          <BodyText muted>Cargando...</BodyText>
        ) : vm.nextEvent ? (
          <>
            <Label>
              {vm.nextEvent.event_date}
              {vm.nextEvent.event_time ? ` · ${vm.nextEvent.event_time}` : ''} · {vm.nextEvent.category}
            </Label>
            <Text style={styles.eventName}>{vm.nextEvent.name}</Text>
            <BodyText muted>
              {[vm.nextEvent.circuit, vm.nextEvent.location].filter(Boolean).join(' · ')}
            </BodyText>
          </>
        ) : (
          <BodyText muted>No hay carreras programadas.</BodyText>
        )}
        <View style={styles.cardAction}>
          <AppButton title="Ver calendario" variant="secondary" small onPress={() => router.navigate('/calendar')} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.dark,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  heroStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.primary },
  heroKicker: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary, textTransform: 'uppercase', letterSpacing: 2 },
  heroTitle: { fontFamily: fonts.black, fontSize: 40, color: colors.onDark, letterSpacing: 1 },
  heroText: { fontFamily: fonts.regular, fontSize: 16, color: '#C9C9CF' },
  heroActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: radius.sm,
  },
  noticeMain: { flex: 1, minWidth: 200 },
  noticeTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  eventName: { fontFamily: fonts.black, fontSize: 24, color: colors.text, textTransform: 'uppercase' },
  cardAction: { alignItems: 'flex-start', marginTop: spacing.xs },
});
