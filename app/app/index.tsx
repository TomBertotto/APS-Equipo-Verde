import { Button, Text, TextInput, View } from 'react-native';
import { useAuthViewModel } from '../src/viewmodels/useAuthViewModel';
import { formStyles as styles } from '../src/views/styles';

export default function Home() {
  const vm = useAuthViewModel();

  if (vm.loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (vm.currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Text>Sesión iniciada como {vm.currentUser.username}</Text>
          {vm.isAdmin ? <Button title="Administrar perfiles" onPress={vm.goToAdmin} /> : null}
          <Button title="Cerrar sesión" onPress={vm.logout} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          autoCapitalize="none"
          value={vm.username}
          onChangeText={vm.setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={vm.password}
          onChangeText={vm.setPassword}
        />
        {vm.error ? <Text style={styles.error}>{vm.error}</Text> : null}
        <Button title="Iniciar sesión" onPress={vm.login} />
        <Button title="Registrarse" onPress={vm.goToRegister} />
      </View>
    </View>
  );
}
