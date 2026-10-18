import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Team } from '../models/ProfilesService';
import { Car, CHECK_RESULTS, CHECK_TYPES, TechnicalCheck } from '../models/TechnicalChecksService';

export function useTechnicalChecksAdminViewModel() {
  const { technicalChecksService, profilesService } = useContainer();
  const [checks, setChecks] = useState<TechnicalCheck[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [teamId, setTeamId] = useState<number | null>(null);
  const [carId, setCarId] = useState<number | null>(null);
  const [checkType, setCheckType] = useState<string>(CHECK_TYPES[0]);
  const [checkDate, setCheckDate] = useState('');
  const [result, setResult] = useState<string>(CHECK_RESULTS[0]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const teamCars = cars.filter((car) => car.team_id === teamId);

  function selectTeam(id: number | null) {
    setTeamId(id);
    setCarId(null);
  }

  async function load() {
    setLoading(true);
    try {
      const [checkList, carList, teamList] = await Promise.all([
        technicalChecksService.getChecks(),
        technicalChecksService.getCars(),
        profilesService.getTeams(),
      ]);
      setChecks(checkList);
      setCars(carList);
      setTeams(teamList);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar controles técnicos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setTeamId(null);
    setCarId(null);
    setCheckType(CHECK_TYPES[0]);
    setCheckDate('');
    setResult(CHECK_RESULTS[0]);
    setNotes('');
    setEditingId(null);
    setError('');
  }

  function edit(check: TechnicalCheck) {
    setEditingId(check.id);
    setTeamId(check.team_id);
    setCarId(check.car_id);
    setCheckType(check.check_type);
    setCheckDate(check.check_date);
    setResult(check.result);
    setNotes(check.notes ?? '');
    setError('');
  }

  function cancel() {
    resetForm();
  }

  async function save() {
    if (carId === null || !checkDate.trim()) {
      setError('El auto y la fecha del control son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        car_id: carId,
        check_type: checkType,
        check_date: checkDate.trim(),
        result,
        notes: notes.trim(),
      };
      if (editingId) {
        await technicalChecksService.updateCheck(editingId, payload);
      } else {
        await technicalChecksService.createCheck(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el control técnico');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      await technicalChecksService.deleteCheck(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el control técnico');
    }
  }

  return {
    checks,
    cars,
    teams,
    loading,
    saving,
    error,
    teamId,
    selectTeam,
    teamCars,
    carId,
    setCarId,
    checkType,
    setCheckType,
    checkDate,
    setCheckDate,
    result,
    setResult,
    notes,
    setNotes,
    editingId,
    edit,
    cancel,
    save,
    remove,
    reload: load,
  };
}
