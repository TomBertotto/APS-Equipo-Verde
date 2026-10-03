import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';
import { Event } from '../models/CalendarService';

export function usePublicCalendarViewModel() {
  const { calendarService } = useContainer();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setEvents(await calendarService.getEvents());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  }

  // Recargar al entrar a la pantalla para reflejar los cambios del administrador FIA
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  async function download() {
    try {
      await Linking.openURL(calendarService.icsUrl());
    } catch {
      setError('No se pudo descargar el calendario');
    }
  }

  return { events, loading, error, reload: load, download };
}
