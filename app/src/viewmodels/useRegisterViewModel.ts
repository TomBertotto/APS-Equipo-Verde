import { useState } from 'react';
import { router } from 'expo-router';
import { useContainer } from '../di/container';

export function useRegisterViewModel() {
  const { authService, tokenStorage } = useContainer();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function register() {
    setError('');
    try {
      const session = await authService.register(username, password);
      await tokenStorage.set(session.token);
      goBack();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return { username, setUsername, password, setPassword, error, register, goBack };
}
