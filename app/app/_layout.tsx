import { Stack } from 'expo-router';
import { ContainerProvider } from '../src/di/container';

export default function RootLayout() {
  return (
    <ContainerProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'FIA Connect' }} />
        <Stack.Screen name="register" options={{ title: 'Registrarse' }} />
      </Stack>
    </ContainerProvider>
  );
}
