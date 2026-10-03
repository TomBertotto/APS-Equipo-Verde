import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';
import { User } from '../models/AuthService';

export function useAuthViewModel() {
  const { authService, tokenStorage } = useContainer();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (await tokenStorage.get()) {
          try {
            setCurrentUser(await authService.me());
          } catch {
            await tokenStorage.clear();
          }
        }
        setLoading(false);
      })();
    }, []),
  );

  function clearForm() {
    setUsername('');
    setPassword('');
    setError('');
  }

  async function login() {
    setError('');
    try {
      const session = await authService.login(username, password);
      await tokenStorage.set(session.token);
      setCurrentUser({
        username: session.username,
        role: session.role,
        permissions: session.permissions,
      });
      clearForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function logout() {
    await authService.logout().catch(() => {});
    await tokenStorage.clear();
    setCurrentUser(null);
  }

  function goToRegister() {
    clearForm();
    router.push('/register');
  }

  function can(permission: string) {
    return currentUser?.permissions.includes(permission) ?? false;
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    currentUser,
    can,
    error,
    loading,
    login,
    logout,
    goToRegister,
    goToAdmin: () => router.push('/admin'),
    goToAccess: () => router.push('/access'),
    goToCalendarAdmin: () => router.push('/calendar-admin'),
    goToCalendar: () => router.push('/calendar'),
  };
}
