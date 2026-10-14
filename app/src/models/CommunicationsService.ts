import { ApiClient } from './ApiClient';

export type SentCommunication = {
  id: number;
  subject: string;
  body: string;
  created_at: string;
  sender: string | null;
  team_names: string[];
};

export type TeamCommunication = {
  id: number;
  subject: string;
  body: string;
  created_at: string;
  sender: string | null;
};

export class CommunicationsService {
  constructor(private api: ApiClient) {}

  send(subject: string, body: string, teamIds: number[]) {
    return this.api.request<{ id: number; created_at: string }>('/communications', 'POST', {
      subject,
      body,
      teamIds,
    });
  }

  getSent() {
    return this.api.request<SentCommunication[]>('/communications/sent');
  }

  getMyTeam() {
    return this.api.request<TeamCommunication[]>('/communications/my-team');
  }
}

// Fecha y hora en formato DD/MM/AAAA HH:MM (hora local)
export function formatSentAt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
