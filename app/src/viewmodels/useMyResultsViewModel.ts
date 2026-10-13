import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';
import { TeamRaceResults } from '../models/ResultsService';

export function useMyResultsViewModel(enabled: boolean) {
  const { resultsService } = useContainer();
  const [races, setRaces] = useState<TeamRaceResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setRaces(await resultsService.getMyTeamResults());
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

  async function confirm(eventId: number) {
    setError('');
    try {
      const { confirmed_at } = await resultsService.confirm(eventId);
      setRaces((current) => current.map((r) => (r.event_id === eventId ? { ...r, confirmed_at } : r)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return {
    races,
    pending: races.filter((r) => !r.confirmed_at).length,
    loading,
    error,
    confirm,
  };
}
