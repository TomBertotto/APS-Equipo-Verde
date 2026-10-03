import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Driver } from '../models/ProfilesService';

export function useDriversViewModel() {
  const { profilesService } = useContainer();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [number, setNumber] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setDrivers(await profilesService.getDrivers());
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName('');
    setNationality('');
    setNumber('');
    setTeamId(null);
    setError('');
  }

  function edit(driver: Driver) {
    setEditingId(driver.id);
    setName(driver.name);
    setNationality(driver.nationality);
    setNumber(driver.number === null ? '' : String(driver.number));
    setTeamId(driver.team_id);
    setError('');
  }

  async function save() {
    try {
      const input = { name, nationality, number: number ? Number(number) : null, teamId };
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
    error,
    edit,
    save,
    remove,
    cancel: resetForm,
    reload: load,
  };
}
