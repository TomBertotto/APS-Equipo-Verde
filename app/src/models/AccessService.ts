import { ApiClient } from './ApiClient';

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador FIA',
  team_manager: 'Responsable de escudería',
  user: 'Sin perfil',
};

export const PERMISSION_LABELS: Record<string, string> = {
  'profiles.manage': 'Administrar escuderías y pilotos',
  'users.manage': 'Administrar usuarios y permisos',
  'calendar.manage': 'Gestionar calendario de carreras',
};

export type UserRow = { id: number; username: string; role: string };
export type PermissionsInfo = {
  roles: string[];
  permissions: string[];
  grants: Record<string, string[]>;
};

export class AccessService {
  constructor(private api: ApiClient) {}

  getUsers() {
    return this.api.request<UserRow[]>('/access/users');
  }

  setUserRole(id: number, role: string) {
    return this.api.request(`/access/users/${id}/role`, 'PUT', { role });
  }

  getPermissions() {
    return this.api.request<PermissionsInfo>('/access/permissions');
  }

  setRolePermissions(role: string, permissions: string[]) {
    return this.api.request(`/access/permissions/${role}`, 'PUT', { permissions });
  }
}
