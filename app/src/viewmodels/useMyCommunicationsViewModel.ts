import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';
import { TeamCommunication } from '../models/CommunicationsService';

export function useMyCommunicationsViewModel(enabled: boolean) {
  const { communicationsService } = useContainer();
  const [communications, setCommunications] = useState<TeamCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setCommunications(await communicationsService.getMyTeam());
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [enabled]),
  );

  return { communications, loading, error };
}
