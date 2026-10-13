import { ApiClient } from './ApiClient';

// Escala de puntos F1 por posición final (top 10); misma que en el backend
export const POINTS_BY_POSITION = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export function pointsFor(position: number | null) {
  return position ? (POINTS_BY_POSITION[position - 1] ?? 0) : 0;
}

export type RaceWithResults = { id: number; name: string; event_date: string; category: string; results: number };

export type RaceResult = {
  driver_id: number;
  driver_name: string;
  number: number | null;
  nationality: string;
  team_id: number | null;
  team_name: string | null;
  position: number | null; // null = no terminó
  points: number;
};

export type DriverStanding = {
  id: number;
  name: string;
  number: number | null;
  nationality: string;
  team_name: string | null;
  points: number;
  wins: number;
};
export type TeamStanding = { id: number; name: string; points: number; wins: number };
export type Standings = { drivers: DriverStanding[]; teams: TeamStanding[] };

export type TeamRaceResults = {
  event_id: number;
  event_name: string;
  event_date: string;
  confirmed_at: string | null;
  total_points: number;
  drivers: { driver_id: number; driver_name: string; number: number | null; position: number | null; points: number }[];
};

export type ResultInput = { driverId: number; position: number | null; points: number };

export class ResultsService {
  constructor(private api: ApiClient) {}

  getRacesWithResults() {
    return this.api.request<RaceWithResults[]>('/results/events');
  }

  getRaceResults(eventId: number) {
    return this.api.request<RaceResult[]>(`/results/${eventId}`);
  }

  getStandings() {
    return this.api.request<Standings>('/results/standings');
  }

  saveRaceResults(eventId: number, results: ResultInput[]) {
    return this.api.request(`/results/${eventId}`, 'PUT', { results });
  }

  getMyTeamResults() {
    return this.api.request<TeamRaceResults[]>('/results/my-team');
  }

  confirm(eventId: number) {
    return this.api.request<{ confirmed_at: string }>(`/results/${eventId}/confirm`, 'POST');
  }
}

// Fecha y hora de una confirmación en formato DD/MM/AAAA HH:MM (hora local)
export function formatConfirmation(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
