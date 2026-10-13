import { router } from 'expo-router';
import { useRegisterViewModel } from '../src/viewmodels/useRegisterViewModel';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { Screen } from '../src/views/Screen';
import { TextField } from '../src/views/TextField';
import { ErrorText } from '../src/views/Typography';

export default function Register() {
  const vm = useRegisterViewModel();

  return (
    <Screen title="Registrarse" maxWidth={420}>
      <Card>
        <TextField
          label="Usuario"
          autoCapitalize="none"
          value={vm.username}
          onChangeText={vm.setUsername}
        />
        <TextField
          label="Contraseña"
          secureTextEntry
          value={vm.password}
          onChangeText={vm.setPassword}
          onSubmitEditing={vm.register}
        />
        <ErrorText>{vm.error}</ErrorText>
        <AppButton title="Crear cuenta" onPress={vm.register} />
        <AppButton title="Ya tengo cuenta" variant="ghost" onPress={() => router.navigate('/login')} />
      </Card>
    </Screen>
  );
}
