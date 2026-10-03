import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuthViewModel } from '../src/viewmodels/useAuthViewModel';
import { useAccessViewModel } from '../src/viewmodels/useAccessViewModel';
import { PERMISSION_LABELS, ROLE_LABELS } from '../src/models/AccessService';
import { OptionPicker } from '../src/views/OptionPicker';
import { formStyles } from '../src/views/styles';

export default function Access() {
  const auth = useAuthViewModel();
  const vm = useAccessViewModel();

  if (auth.loading) {
    return (
      <View style={formStyles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!auth.can('users.manage')) {
    return (
      <View style={formStyles.container}>
        <Text>Acceso denegado</Text>
      </View>
    );
  }

  const roleOptions = vm.info.roles.map((r) => ({ label: ROLE_LABELS[r] ?? r, value: r }));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.column}>
        {vm.error ? <Text style={formStyles.error}>{vm.error}</Text> : null}

        <Text style={styles.title}>Usuarios</Text>
        {vm.users.map((user) => (
          <View key={user.id} style={styles.block}>
            <Text>{user.username}</Text>
            {user.username === auth.currentUser?.username ? (
              <Text>{ROLE_LABELS[user.role] ?? user.role}</Text>
            ) : (
              <OptionPicker
                options={roleOptions}
                selected={user.role}
                onSelect={(role) => vm.setUserRole(user.id, role)}
              />
            )}
          </View>
        ))}

        <Text style={styles.title}>Permisos por perfil</Text>
        {vm.info.roles.map((role) => (
          <View key={role} style={styles.block}>
            <Text style={styles.roleName}>{ROLE_LABELS[role] ?? role}</Text>
            {vm.info.permissions.map((permission) => (
              <View key={permission} style={styles.row}>
                <Switch
                  value={vm.info.grants[role]?.includes(permission) ?? false}
                  disabled={role === 'admin'}
                  onValueChange={() => vm.togglePermission(role, permission)}
                />
                <Text>{PERMISSION_LABELS[permission] ?? permission}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: 'center', padding: 24 },
  column: { width: '100%', maxWidth: 500, gap: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  block: { borderWidth: 1, padding: 8, gap: 4 },
  roleName: { fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
