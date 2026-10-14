import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useCommunicationsAdminViewModel } from '../src/viewmodels/useCommunicationsAdminViewModel';
import { formatSentAt } from '../src/models/CommunicationsService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { ListRow } from '../src/views/ListRow';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading } from '../src/views/StatusView';
import { TextField } from '../src/views/TextField';
import { BodyText, ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { colors, fonts, radius, spacing } from '../src/views/theme';

export default function CommunicationsAdmin() {
  const auth = useAuth();
  const vm = useCommunicationsAdminViewModel();

  if (auth.loading || vm.loading) return <Loading />;
  if (!auth.can('communications.send')) return <AccessDenied />;

  return (
    <Screen title="Comunicaciones oficiales">
      <Card>
        <SectionTitle>Nueva comunicación</SectionTitle>
        <TextField label="Asunto" value={vm.subject} onChangeText={vm.setSubject} />
        <TextField label="Contenido" value={vm.body} onChangeText={vm.setBody} multiline />
        <Label>Escuderías destinatarias</Label>
        <View style={styles.teams}>
          {vm.teams.map((t) => {
            const active = vm.teamIds.includes(t.id);
            return (
              <Pressable
                key={t.id}
                onPress={() => vm.toggleTeam(t.id)}
                style={[styles.team, active && styles.teamActive]}
              >
                <Text style={[styles.teamText, active && styles.teamTextActive]}>{t.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <ErrorText>{vm.error}</ErrorText>
        {vm.message ? <Text style={styles.message}>{vm.message}</Text> : null}
        <AppButton title="Enviar comunicación" onPress={vm.send} disabled={vm.sending} />
      </Card>

      <SectionTitle>Enviadas</SectionTitle>
      <Card>
        {vm.sent.length === 0 ? <BodyText muted>Todavía no se envió ninguna comunicación.</BodyText> : null}
        {vm.sent.map((c) => (
          <ListRow
            key={c.id}
            title={c.subject}
            detail={`Para: ${c.team_names.join(', ') || 'Sin destinatarios'} · ${formatSentAt(c.created_at)}`}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  teams: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  team: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  teamActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  teamText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  teamTextActive: { color: colors.onDark },
  message: { fontFamily: fonts.semibold, fontSize: 14, color: colors.success },
});
