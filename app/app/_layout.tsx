import { Stack } from 'expo-router';
import { ContainerProvider } from '../src/di/container';

export default function RootLayout() {
  return (
    <ContainerProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'FIA Connect' }} />
        <Stack.Screen name="register" options={{ title: 'Registrarse' }} />
        <Stack.Screen name="admin" options={{ title: 'Administrar perfiles' }} />
        <Stack.Screen name="access" options={{ title: 'Usuarios y permisos' }} />
        <Stack.Screen name="calendar" options={{ title: 'Calendario' }} />
        <Stack.Screen name="calendar-admin" options={{ title: 'Gestionar calendario' }} />
        <Stack.Screen name="my-team" options={{ title: 'Mi escudería' }} />
        <Stack.Screen name="drivers" options={{ title: 'Pilotos por escudería' }} />
      </Stack>
    </ContainerProvider>
  );
}
