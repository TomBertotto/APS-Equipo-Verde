import { ApiClient } from './ApiClient';

export const EVENT_CATEGORIES = ['F1', 'F2', 'F3', 'F1 Academy'];
export const EVENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'postponed'];

export const EVENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
  postponed: 'Postergado',
};

export type Event = {
  id: number;
  name: string;
  circuit: string;
  location: string;
  category: string;
  event_date: string; // ISO date YYYY-MM-DD
  event_time: string | null; // HH:MM
  status: string;
  notes: string;
};

export type EventInput = Omit<Event, 'id'>;

export class CalendarService {
  constructor(private api: ApiClient) {}

  getEvents() {
    return this.api.request<Event[]>('/events');
  }

  icsUrl() {
    return this.api.url('/events/calendar.ics');
  }

  createEvent(event: EventInput) {
    return this.api.request('/events', 'POST', event);
  }

  updateEvent(id: number, event: EventInput) {
    return this.api.request(`/events/${id}`, 'PUT', event);
  }

  deleteEvent(id: number) {
    return this.api.request(`/events/${id}`, 'DELETE');
  }
}
