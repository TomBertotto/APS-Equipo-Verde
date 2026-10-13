import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Driver, Team } from '../models/ProfilesService';

export function usePublicDriversViewModel() {
  const { profilesService } = useContainer();
  const [teams, setTeams] = useState<Team[]>([]);
  // null = todas las escuderías
  const [teamId, setTeamId] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTeams() {
    try {
      setTeams(await profilesService.getTeams());
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDrivers(id: number | null) {
    try {
      setDrivers(await profilesService.getDrivers(id ?? undefined));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    loadDrivers(teamId);
  }, [teamId]);

  return {
    teams,
    teamId,
    setTeamId,
    starters: drivers.filter((d) => d.lineup === 'titular'),
    reserves: drivers.filter((d) => d.lineup === 'suplente'),
    loading,
    error,
    reload: () => loadDrivers(teamId),
  };
}
