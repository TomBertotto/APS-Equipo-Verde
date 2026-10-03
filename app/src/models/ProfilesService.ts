import { ApiClient } from './ApiClient';

export const CATEGORIES = ['F1', 'F2', 'F3', 'F1 Academy'];

export type Team = { id: number; name: string; country: string; category: string };
export type TeamInput = Omit<Team, 'id'>;

export type Driver = {
  id: number;
  name: string;
  nationality: string;
  number: number | null;
  team_id: number | null;
  team_name: string | null;
};
export type DriverInput = {
  name: string;
  nationality: string;
  number: number | null;
  teamId: number | null;
};

export class ProfilesService {
  constructor(private api: ApiClient) {}

  getTeams() {
    return this.api.request<Team[]>('/teams');
  }

  createTeam(team: TeamInput) {
    return this.api.request('/teams', 'POST', team);
  }

  updateTeam(id: number, team: TeamInput) {
    return this.api.request(`/teams/${id}`, 'PUT', team);
  }

  deleteTeam(id: number) {
    return this.api.request(`/teams/${id}`, 'DELETE');
  }

  getDrivers() {
    return this.api.request<Driver[]>('/drivers');
  }

  createDriver(driver: DriverInput) {
    return this.api.request('/drivers', 'POST', driver);
  }

  updateDriver(id: number, driver: DriverInput) {
    return this.api.request(`/drivers/${id}`, 'PUT', driver);
  }

  deleteDriver(id: number) {
    return this.api.request(`/drivers/${id}`, 'DELETE');
  }
}
