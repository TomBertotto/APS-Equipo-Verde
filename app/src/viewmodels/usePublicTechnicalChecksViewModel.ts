import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';
import { TechnicalCheck } from '../models/TechnicalChecksService';

export function usePublicTechnicalChecksViewModel() {
  const { technicalChecksService } = useContainer();
  const [checks, setChecks] = useState<TechnicalCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setChecks(await technicalChecksService.getChecks());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los controles técnicos');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  return { checks, loading, error, reload: load };
}
