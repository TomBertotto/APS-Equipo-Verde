import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';
import { RaceResult, RaceWithResults, Standings } from '../models/ResultsService';

export type ResultsTab = 'race' | 'drivers' | 'teams';

export function usePublicResultsViewModel() {
  const { resultsService } = useContainer();
  const [tab, setTab] = useState<ResultsTab>('race');
  const [races, setRaces] = useState<RaceWithResults[]>([]);
  const [eventId, setEventId] = useState<number | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [standings, setStandings] = useState<Standings>({ drivers: [], teams: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [list, table] = await Promise.all([
        resultsService.getRacesWithResults(),
        resultsService.getStandings(),
      ]);
      setRaces(list);
      setStandings(table);
      // Por defecto, la última carrera con resultados
      setEventId((current) => current ?? list[list.length - 1]?.id ?? null);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Recargar al entrar para reflejar los cambios del administrador FIA
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  useEffect(() => {
    if (eventId === null) return;
    resultsService
      .getRaceResults(eventId)
      .then(setResults)
      .catch((err) => setError((err as Error).message));
  }, [eventId, races]);

  return {
    tab,
    setTab,
    races,
    eventId,
    setEventId,
    selectedRace: races.find((r) => r.id === eventId) ?? null,
    results,
    standings,
    loading,
    error,
  };
}
