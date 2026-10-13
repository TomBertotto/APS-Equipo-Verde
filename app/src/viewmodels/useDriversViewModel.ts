import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Driver, LINEUPS } from '../models/ProfilesService';

// Con fixedTeamId (responsable de escudería) solo se ven y se cargan pilotos de esa escudería
export function useDriversViewModel(fixedTeamId?: number) {
  const { profilesService } = useContainer();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [number, setNumber] = useState('');
  const [teamId, setTeamId] = useState<number | null>(fixedTeamId ?? null);
  const [lineup, setLineup] = useState<string>(LINEUPS[0]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setDrivers(await profilesService.getDrivers(fixedTeamId));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, [fixedTeamId]);

  function resetForm() {
    setEditingId(null);
    setName('');
    setNationality('');
    setNumber('');
    setLineup(LINEUPS[0]);
    setTeamId(fixedTeamId ?? null);
    setError('');
  }

  function edit(driver: Driver) {
    setEditingId(driver.id);
    setName(driver.name);
    setNationality(driver.nationality);
    setNumber(driver.number === null ? '' : String(driver.number));
    setLineup(driver.lineup);
    setTeamId(driver.team_id);
    setError('');
  }

  async function save() {
    try {
      const input = {
        name,
        nationality,
        number: number ? Number(number) : null,
        lineup,
        teamId: fixedTeamId ?? teamId,
      };
      if (editingId) await profilesService.updateDriver(editingId, input);
      else await profilesService.createDriver(input);
      resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(id: number) {
    try {
      await profilesService.deleteDriver(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return {
    drivers,
    editingId,
    name,
    setName,
    nationality,
    setNationality,
    number,
    setNumber,
    teamId,
    setTeamId,
    lineup,
    setLineup,
    error,
    edit,
    save,
    remove,
    cancel: resetForm,
    reload: load,
  };
}
