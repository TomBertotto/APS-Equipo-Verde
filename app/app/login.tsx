import { router } from 'expo-router';
import { useAuthViewModel } from '../src/viewmodels/useAuthViewModel';
import { AppButton } from '../src/views/AppButton';
import { Card } from '../src/views/Card';
import { Screen } from '../src/views/Screen';
import { TextField } from '../src/views/TextField';
import { ErrorText } from '../src/views/Typography';

export default function Login() {
  const vm = useAuthViewModel();

  return (
    <Screen title="Ingresar" maxWidth={420}>
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
          onSubmitEditing={vm.login}
        />
        <ErrorText>{vm.error}</ErrorText>
        <AppButton title="Iniciar sesión" onPress={vm.login} />
        <AppButton title="Crear una cuenta" variant="ghost" onPress={() => router.navigate('/register')} />
      </Card>
    </Screen>
  );
}
