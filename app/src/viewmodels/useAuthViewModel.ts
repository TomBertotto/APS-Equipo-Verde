import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from './AuthProvider';

// Formulario de inicio de sesión
export function useAuthViewModel() {
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function login() {
    setError('');
    try {
      await auth.login(username, password);
      setUsername('');
      setPassword('');
      router.replace('/');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return { username, setUsername, password, setPassword, error, login };
}
