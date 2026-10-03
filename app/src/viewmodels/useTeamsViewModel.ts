import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { CATEGORIES, Team } from '../models/ProfilesService';

export function useTeamsViewModel() {
  const { profilesService } = useContainer();
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setTeams(await profilesService.getTeams());
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
    setCountry('');
    setCategory(CATEGORIES[0]);
    setError('');
  }

  function edit(team: Team) {
    setEditingId(team.id);
    setName(team.name);
    setCountry(team.country);
    setCategory(team.category);
    setError('');
  }

  async function save() {
    try {
      const input = { name, country, category };
      if (editingId) await profilesService.updateTeam(editingId, input);
      else await profilesService.createTeam(input);
      resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(id: number) {
    try {
      await profilesService.deleteTeam(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return {
    teams,
    editingId,
    name,
    setName,
    country,
    setCountry,
    category,
    setCategory,
    error,
    edit,
    save,
    remove,
    cancel: resetForm,
    reload: load,
  };
}
