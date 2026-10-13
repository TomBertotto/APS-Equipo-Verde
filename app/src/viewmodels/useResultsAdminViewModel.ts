import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Event } from '../models/CalendarService';
import { pointsFor } from '../models/ResultsService';

// Fila editable: posición y puntos como texto (vacío = sin dato)
export type ResultRow = {
  driverId: number;
  driverName: string;
  number: number | null;
  teamName: string;
  position: string;
  points: string;
};

export function useResultsAdminViewModel() {
  const { calendarService, profilesService, resultsService } = useContainer();
  const [events, setEvents] = useState<Event[]>([]);
  const [withResults, setWithResults] = useState<Set<number>>(new Set());
  const [eventId, setEventId] = useState<number | null>(null);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadEvents() {
    try {
      const [list, races] = await Promise.all([
        calendarService.getEvents(),
        resultsService.getRacesWithResults(),
      ]);
      setEvents(list.filter((e) => e.status !== 'cancelled'));
      setWithResults(new Set(races.map((r) => r.id)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function select(id: number) {
    setEventId(id);
    setError('');
    setMessage('');
    try {
      const [drivers, results] = await Promise.all([
        profilesService.getDrivers(),
        resultsService.getRaceResults(id),
      ]);
      const byDriver = new Map(results.map((r) => [r.driver_id, r]));
      const list: ResultRow[] = drivers
        .filter((d) => d.team_id !== null || byDriver.has(d.id))
        .map((d) => {
          const r = byDriver.get(d.id);
          return {
            driverId: d.id,
            driverName: d.name,
            number: d.number,
            teamName: d.team_name ?? 'Sin escudería',
            position: r?.position != null ? String(r.position) : '',
            points: r ? String(r.points) : '',
          };
        });
      // Primero los que tienen posición (en orden), después el resto
      list.sort((a, b) => (Number(a.position) || 999) - (Number(b.position) || 999));
      setRows(list);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function setPosition(driverId: number, position: string) {
    const clean = position.replace(/\D/g, '');
    setRows((current) =>
      current.map((r) =>
        r.driverId === driverId
          ? { ...r, position: clean, points: clean ? String(pointsFor(Number(clean))) : r.points }
          : r,
      ),
    );
  }

  function setPoints(driverId: number, points: string) {
    const clean = points.replace(/\D/g, '');
    setRows((current) => current.map((r) => (r.driverId === driverId ? { ...r, points: clean } : r)));
  }

  async function save() {
    if (eventId === null) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const results = rows
        .filter((r) => r.position !== '' || r.points !== '')
        .map((r) => ({
          driverId: r.driverId,
          position: r.position ? Number(r.position) : null,
          points: r.points ? Number(r.points) : 0,
        }));
      await resultsService.saveRaceResults(eventId, results);
      setMessage('Resultados guardados');
      await loadEvents();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return {
    events,
    withResults,
    eventId,
    selectedEvent: events.find((e) => e.id === eventId) ?? null,
    rows,
    loading,
    saving,
    error,
    message,
    select,
    back: () => setEventId(null),
    setPosition,
    setPoints,
    save,
  };
}
