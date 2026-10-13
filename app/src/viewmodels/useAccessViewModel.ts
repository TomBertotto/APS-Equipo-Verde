import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { PermissionsInfo, UserRow } from '../models/AccessService';
import { Team } from '../models/ProfilesService';

export function useAccessViewModel() {
  const { accessService, profilesService } = useContainer();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [info, setInfo] = useState<PermissionsInfo>({ roles: [], permissions: [], grants: {} });
  const [error, setError] = useState('');

  async function load() {
    try {
      const [u, p, t] = await Promise.all([
        accessService.getUsers(),
        accessService.getPermissions(),
        profilesService.getTeams(),
      ]);
      setUsers(u);
      setInfo(p);
      setTeams(t);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function run(action: () => Promise<unknown>) {
    setError('');
    try {
      await action();
    } catch (err) {
      setError((err as Error).message);
    }
    await load();
  }

  function setUserRole(id: number, role: string) {
    return run(() => accessService.setUserRole(id, role));
  }

  function setUserTeam(id: number, teamId: number | null) {
    return run(() => accessService.setUserTeam(id, teamId));
  }

  function togglePermission(role: string, permission: string) {
    const current = info.grants[role] ?? [];
    const next = current.includes(permission)
      ? current.filter((p) => p !== permission)
      : [...current, permission];
    return run(() => accessService.setRolePermissions(role, next));
  }

  return { users, teams, info, error, setUserRole, setUserTeam, togglePermission };
}
