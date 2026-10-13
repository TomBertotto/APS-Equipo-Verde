import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useContainer } from '../di/container';
import { Event } from '../models/CalendarService';

export function useHomeViewModel() {
  const { calendarService } = useContainer();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const events = await calendarService.getEvents();
          setNextEvent(events.find((e) => e.status === 'scheduled' && e.event_date >= today) ?? null);
        } catch {
          setNextEvent(null);
        } finally {
          setLoading(false);
        }
      })();
    }, []),
  );

  return { nextEvent, loading };
}
