import { StyleSheet, Text, View } from 'react-native';
import { usePublicTechnicalChecksViewModel } from '../src/viewmodels/usePublicTechnicalChecksViewModel';
import { CHECK_RESULT_LABELS, CHECK_TYPE_LABELS } from '../src/models/TechnicalChecksService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { Screen } from '../src/views/Screen';
import { Loading } from '../src/views/StatusView';
import { BodyText, ErrorText, Label } from '../src/views/Typography';
import { colors, fonts, radius, spacing } from '../src/views/theme';

export default function TechnicalChecks() {
  const vm = usePublicTechnicalChecksViewModel();

  if (vm.loading) return <Loading />;

  return (
    <Screen title="Controles técnicos">
      <View style={styles.actions}>
        <AppButton title="Actualizar" variant="secondary" onPress={vm.reload} />
      </View>

      <ErrorText>{vm.error}</ErrorText>
      {vm.checks.length === 0 ? <BodyText muted>No hay controles técnicos registrados.</BodyText> : null}

      {vm.checks.map((check) => (
        <Card key={check.id}>
          <View style={styles.header}>
            <Text style={styles.team}>{check.team_name}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: check.result === 'approved' ? colors.success : colors.danger },
              ]}
            >
              <Text style={styles.badgeText}>{CHECK_RESULT_LABELS[check.result] ?? check.result}</Text>
            </View>
          </View>
          <Label>
            {check.check_date} · {check.car_identifier}
          </Label>
          <Text style={styles.name}>{CHECK_TYPE_LABELS[check.check_type] ?? check.check_type}</Text>
          {check.notes ? <BodyText>{check.notes}</BodyText> : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  team: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  badge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.onDark, textTransform: 'uppercase' },
  name: { fontFamily: fonts.black, fontSize: 20, color: colors.text, textTransform: 'uppercase' },
});
