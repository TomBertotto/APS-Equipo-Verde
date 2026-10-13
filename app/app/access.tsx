import { StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../src/viewmodels/AuthProvider';
import { useAccessViewModel } from '../src/viewmodels/useAccessViewModel';
import { PERMISSION_LABELS, ROLE_LABELS } from '../src/models/AccessService';
import { Card } from '../src/views/Card';
import { OptionPicker } from '../src/views/OptionPicker';
import { Screen } from '../src/views/Screen';
import { AccessDenied, Loading } from '../src/views/StatusView';
import { BodyText, ErrorText, Label, SectionTitle } from '../src/views/Typography';
import { colors, fonts, spacing } from '../src/views/theme';

export default function Access() {
  const auth = useAuth();
  const vm = useAccessViewModel();

  if (auth.loading) return <Loading />;
  if (!auth.can('users.manage')) return <AccessDenied />;

  const roleOptions = vm.info.roles.map((r) => ({ label: ROLE_LABELS[r] ?? r, value: r }));
  const teamOptions = [
    { label: 'Sin escudería', value: null as number | null },
    ...vm.teams.map((t) => ({ label: t.name, value: t.id as number | null })),
  ];

  return (
    <Screen title="Usuarios y permisos">
      <ErrorText>{vm.error}</ErrorText>

      <SectionTitle>Usuarios</SectionTitle>
      {vm.users.map((user) => (
        <Card key={user.id}>
          <Text style={styles.username}>{user.username}</Text>
          {user.username === auth.currentUser?.username ? (
            <BodyText muted>{ROLE_LABELS[user.role] ?? user.role}</BodyText>
          ) : (
            <OptionPicker
              options={roleOptions}
              selected={user.role}
              onSelect={(role) => vm.setUserRole(user.id, role)}
            />
          )}
          {user.role === 'team_manager' ? (
            <>
              <Label>Escudería</Label>
              <OptionPicker
                options={teamOptions}
                selected={user.team_id}
                onSelect={(teamId) => vm.setUserTeam(user.id, teamId)}
              />
            </>
          ) : null}
        </Card>
      ))}

      <SectionTitle>Permisos por perfil</SectionTitle>
      {vm.info.roles.map((role) => (
        <Card key={role}>
          <Label>{ROLE_LABELS[role] ?? role}</Label>
          {vm.info.permissions.map((permission) => (
            <View key={permission} style={styles.row}>
              <Switch
                value={vm.info.grants[role]?.includes(permission) ?? false}
                disabled={role === 'admin'}
                onValueChange={() => vm.togglePermission(role, permission)}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
              <BodyText>{PERMISSION_LABELS[permission] ?? permission}</BodyText>
            </View>
          ))}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  username: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
});
