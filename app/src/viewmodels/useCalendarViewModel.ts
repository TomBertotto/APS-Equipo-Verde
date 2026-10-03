import { useEffect, useState } from 'react';
import { useContainer } from '../di/container';
import { Event, EVENT_CATEGORIES, EVENT_STATUSES } from '../models/CalendarService';

export function useCalendarViewModel() {
  const { calendarService } = useContainer();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [circuit, setCircuit] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [status, setStatus] = useState<string>(EVENT_STATUSES[0]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const list = await calendarService.getEvents();
      setEvents(list);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setName('');
    setCircuit('');
    setLocation('');
    setCategory(EVENT_CATEGORIES[0]);
    setEventDate('');
    setEventTime('');
    setStatus(EVENT_STATUSES[0]);
    setNotes('');
    setEditingId(null);
    setError('');
  }

  function edit(event: Event) {
    setEditingId(event.id);
    setName(event.name);
    setCircuit(event.circuit ?? '');
    setLocation(event.location ?? '');
    setCategory(event.category ?? EVENT_CATEGORIES[0]);
    setEventDate(event.event_date);
    setEventTime(event.event_time ?? '');
    setStatus(event.status ?? EVENT_STATUSES[0]);
    setNotes(event.notes ?? '');
    setError('');
  }

  function cancel() {
    resetForm();
  }

  async function save() {
    if (!name.trim() || !eventDate.trim()) {
      setError('Nombre y fecha del evento son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        circuit: circuit.trim(),
        location: location.trim(),
        category,
        event_date: eventDate.trim(),
        event_time: eventTime.trim() ? eventTime.trim() : null,
        status,
        notes: notes.trim(),
      };
      if (editingId) {
        await calendarService.updateEvent(editingId, payload);
      } else {
        await calendarService.createEvent(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar evento');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      await calendarService.deleteEvent(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar evento');
    }
  }

  return {
    events,
    loading,
    saving,
    error,
    name,
    setName,
    circuit,
    setCircuit,
    location,
    setLocation,
    category,
    setCategory,
    eventDate,
    setEventDate,
    eventTime,
    setEventTime,
    status,
    setStatus,
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
