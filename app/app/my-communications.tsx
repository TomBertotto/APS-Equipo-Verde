import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useMyCommunicationsViewModel } from '../src/viewmodels/useMyCommunicationsViewModel';
import { formatSentAt } from '../src/models/CommunicationsService';
import { Card } from '../src/views/Card';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading, StatusView } from '../src/views/StatusView';
import { BodyText, ErrorText, Label } from '../src/views/Typography';
import { colors, fonts, spacing } from '../src/views/theme';

export default function MyCommunications() {
  const auth = useAuth();
  const allowed = auth.can('communications.view_own') && !!auth.currentUser?.teamId;
  const vm = useMyCommunicationsViewModel(allowed);

  if (auth.loading || vm.loading) return <Loading />;
  if (!auth.can('communications.view_own')) return <AccessDenied />;
  if (!auth.currentUser?.teamId) return <StatusView message="No tenés una escudería asignada" />;

  return (
    <Screen title={`Comunicaciones · ${auth.currentUser.teamName}`}>
      <ErrorText>{vm.error}</ErrorText>
      {vm.communications.length === 0 ? (
        <BodyText muted>Tu escudería todavía no recibió comunicaciones oficiales.</BodyText>
      ) : null}
      {vm.communications.map((c) => (
        <Card key={c.id}>
          <View style={styles.header}>
            <Text style={styles.subject}>{c.subject}</Text>
            <Label>{formatSentAt(c.created_at)}</Label>
          </View>
          <BodyText>{c.body}</BodyText>
          <Label>FIA · {c.sender ?? 'Administrador'}</Label>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  subject: { fontFamily: fonts.black, fontSize: 18, color: colors.text, flex: 1 },
});
