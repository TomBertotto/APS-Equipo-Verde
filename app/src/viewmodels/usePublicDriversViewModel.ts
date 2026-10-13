import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Driver, Team } from '../models/ProfilesService';

export function usePublicDriversViewModel() {
  const { profilesService } = useContainer();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTeams() {
    try {
      const list = await profilesService.getTeams();
      setTeams(list);
      if (list.length && teamId === null) setTeamId(list[0].id);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDrivers(id: number) {
    try {
      setDrivers(await profilesService.getDrivers(id));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (teamId !== null) loadDrivers(teamId);
  }, [teamId]);

  return {
    teams,
    teamId,
    setTeamId,
    starters: drivers.filter((d) => d.lineup === 'titular'),
    reserves: drivers.filter((d) => d.lineup === 'suplente'),
    loading,
    error,
    reload: () => (teamId !== null ? loadDrivers(teamId) : loadTeams()),
  };
}
