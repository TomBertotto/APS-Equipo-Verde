import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from './AuthProvider';

export function useRegisterViewModel() {
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function register() {
    setError('');
    try {
      await auth.register(username, password);
      router.replace('/');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return { username, setUsername, password, setPassword, error, register };
}
