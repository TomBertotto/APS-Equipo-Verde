import { Stack } from 'expo-router';
import {
  TitilliumWeb_400Regular,
  TitilliumWeb_600SemiBold,
  TitilliumWeb_700Bold,
  TitilliumWeb_900Black,
  useFonts,
} from '@expo-google-fonts/titillium-web';
import { ContainerProvider } from '../src/di/container';
import { AuthProvider } from '../src/viewmodels/AuthProvider';
import { NavBar } from '../src/views/NavBar';
import { colors } from '../src/views/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
    TitilliumWeb_700Bold,
    TitilliumWeb_900Black,
  });

  if (!fontsLoaded) return null;

  return (
    <ContainerProvider>
      <AuthProvider>
        <NavBar />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" options={{ title: 'FIA Connect' }} />
          <Stack.Screen name="login" options={{ title: 'Ingresar' }} />
          <Stack.Screen name="register" options={{ title: 'Registrarse' }} />
          <Stack.Screen name="admin" options={{ title: 'Administrar perfiles' }} />
          <Stack.Screen name="access" options={{ title: 'Usuarios y permisos' }} />
          <Stack.Screen name="calendar" options={{ title: 'Calendario' }} />
          <Stack.Screen name="calendar-admin" options={{ title: 'Gestionar calendario' }} />
          <Stack.Screen name="my-team" options={{ title: 'Mi escudería' }} />
          <Stack.Screen name="drivers" options={{ title: 'Pilotos por escudería' }} />
          <Stack.Screen name="results" options={{ title: 'Resultados' }} />
          <Stack.Screen name="results-admin" options={{ title: 'Cargar resultados' }} />
          <Stack.Screen name="my-results" options={{ title: 'Mis puntajes' }} />
        </Stack>
      </AuthProvider>
    </ContainerProvider>
  );
}
