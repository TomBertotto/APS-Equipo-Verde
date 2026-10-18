import { View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useTechnicalChecksAdminViewModel } from '../src/viewmodels/useTechnicalChecksAdminViewModel';
import {
  CHECK_RESULT_LABELS,
  CHECK_RESULTS,
  CHECK_TYPE_LABELS,
  CHECK_TYPES,
} from '../src/models/TechnicalChecksService';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { ListRow } from '../src/views/ListRow';
import { OptionPicker } from '../src/views/OptionPicker';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading } from '../src/views/StatusView';
import { TextField } from '../src/views/TextField';
import { BodyText, ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { spacing } from '../src/views/theme';

export default function TechnicalChecksAdmin() {
  const auth = useAuth();
  const vm = useTechnicalChecksAdminViewModel();

  if (auth.loading || vm.loading) return <Loading />;
  if (!auth.can('technical_checks.manage')) return <AccessDenied />;

  return (
    <Screen title="Gestionar controles técnicos">
      <Card>
        <SectionTitle>{vm.editingId ? 'Editar control' : 'Nuevo control'}</SectionTitle>

        <Label>Escudería</Label>
        <OptionPicker
          options={vm.teams.map((t) => ({ label: t.name, value: t.id }))}
          selected={vm.teamId}
          onSelect={vm.selectTeam}
        />

        {vm.teamId !== null ? (
          <>
            <Label>Auto controlado</Label>
            {vm.teamCars.length === 0 ? (
              <BodyText muted>Esta escudería todavía no tiene autos. Agregá uno abajo.</BodyText>
            ) : (
              <OptionPicker
                options={vm.teamCars.map((c) => ({ label: c.identifier, value: c.id }))}
                selected={vm.carId}
                onSelect={vm.setCarId}
              />
            )}
          </>
        ) : null}

        <Label>Tipo de control</Label>
        <OptionPicker
          options={CHECK_TYPES.map((t) => ({ label: CHECK_TYPE_LABELS[t] ?? t, value: t }))}
          selected={vm.checkType}
          onSelect={vm.setCheckType}
        />
        <TextField
          label="Fecha"
          placeholder="YYYY-MM-DD"
          value={vm.checkDate}
          onChangeText={vm.setCheckDate}
        />
        <Label>Resultado</Label>
        <OptionPicker
          options={CHECK_RESULTS.map((r) => ({ label: CHECK_RESULT_LABELS[r] ?? r, value: r }))}
          selected={vm.result}
          onSelect={vm.setResult}
        />
        <TextField label="Notas" value={vm.notes} multiline numberOfLines={3} onChangeText={vm.setNotes} />
        <ErrorText>{vm.error}</ErrorText>
        <View style={{ gap: spacing.sm }}>
          <AppButton
            title={vm.editingId ? 'Guardar cambios' : 'Registrar control'}
            onPress={vm.save}
            disabled={vm.saving}
          />
          {vm.editingId ? <AppButton title="Cancelar" variant="secondary" onPress={vm.cancel} /> : null}
        </View>
      </Card>

      <SectionTitle>Controles registrados</SectionTitle>
      <Card>
        {vm.checks.length === 0 ? <BodyText muted>Todavía no hay controles registrados.</BodyText> : null}
        {vm.checks.map((check) => (
          <ListRow
            key={check.id}
            title={CHECK_TYPE_LABELS[check.check_type] ?? check.check_type}
            detail={[
              check.team_name,
              check.car_identifier,
              check.check_date,
              CHECK_RESULT_LABELS[check.result] ?? check.result,
              check.notes,
            ]
              .filter(Boolean)
              .join(' · ')}
          >
            <AppButton title="Editar" variant="secondary" small onPress={() => vm.edit(check)} />
            <AppButton title="Eliminar" variant="danger" small onPress={() => vm.remove(check.id)} />
          </ListRow>
        ))}
      </Card>
    </Screen>
  );
}
