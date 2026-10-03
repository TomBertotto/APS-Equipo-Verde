import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';

export function useAuthViewModel() {
  const { authService, tokenStorage } = useContainer();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const token = await tokenStorage.get();
        if (token) {
          try {
            const me = await authService.me(token);
            setCurrentUser(me.username);
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
      setCurrentUser(session.username);
      clearForm();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function logout() {
    const token = await tokenStorage.get();
    if (token) await authService.logout(token).catch(() => {});
    await tokenStorage.clear();
    setCurrentUser(null);
  }

  function goToRegister() {
    clearForm();
    router.push('/register');
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    currentUser,
    error,
    loading,
    login,
    logout,
    goToRegister,
  };
}
