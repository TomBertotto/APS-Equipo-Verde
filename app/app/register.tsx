import { Button, Text, TextInput, View } from 'react-native';
import { useRegisterViewModel } from '../src/viewmodels/useRegisterViewModel';
import { formStyles as styles } from '../src/views/styles';

export default function Register() {
  const vm = useRegisterViewModel();

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
        <Button title="Crear cuenta" onPress={vm.register} />
        <Button title="Volver" onPress={vm.goBack} />
      </View>
    </View>
  );
}
