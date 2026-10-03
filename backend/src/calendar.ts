import { Router } from 'express';
import { pool } from './db.js';
import { requirePermission } from './permissions.js';

export const EVENT_CATEGORIES = ['F1', 'F2', 'F3', 'F1 Academy'];
export const EVENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'postponed'];

export const eventsRouter = Router();

function validateEvent(name: unknown, date: unknown, time: unknown) {
  if (typeof name !== 'string' || !name.trim()) return 'El nombre es obligatorio';
  const parsed = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(`${date}T00:00:00Z`);
  if (!parsed || isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return 'La fecha del evento es obligatoria y debe ser válida (YYYY-MM-DD)';
  }
  if (time != null && (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) {
    return 'La hora debe tener formato HH:MM';
  }
  return '';
}

async function listEvents() {
  const result = await pool.query(`
    SELECT id, name, circuit, location, category, event_date, event_time, status, notes
    FROM events
    WHERE deleted_at IS NULL
    ORDER BY event_date ASC, event_time ASC NULLS LAST, id ASC
  `);
  return result.rows;
}

const ICS_STATUS: Record<string, string> = {
  scheduled: 'CONFIRMED',
  completed: 'CONFIRMED',
  postponed: 'TENTATIVE',
  cancelled: 'CANCELLED',
};

function icsText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

eventsRouter.get('/', async (_req, res) => {
  res.json(await listEvents());
});

// Descarga del calendario en formato iCalendar (RFC 5545), importable en Google Calendar, Outlook, etc.
eventsRouter.get('/calendar.ics', async (_req, res) => {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FIA Connect//Calendario//ES', 'X-WR-CALNAME:Calendario FIA'];
  for (const ev of await listEvents()) {
    const date = ev.event_date.replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:event-${ev.id}@fia-connect`,
      `DTSTAMP:${stamp}`,
      ...(ev.event_time
        ? [`DTSTART:${date}T${ev.event_time.replace(':', '')}00`, 'DURATION:PT2H']
        : [`DTSTART;VALUE=DATE:${date}`]),
      `SUMMARY:${icsText(`${ev.name} (${ev.category})`)}`,
      `LOCATION:${icsText([ev.circuit, ev.location].filter(Boolean).join(', '))}`,
      `DESCRIPTION:${icsText(ev.notes)}`,
      `STATUS:${ICS_STATUS[ev.status] ?? 'CONFIRMED'}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="calendario-fia.ics"');
  res.send(lines.join('\r\n') + '\r\n');
});

eventsRouter.get('/:id', async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, circuit, location, category, event_date, event_time, status, notes
     FROM events
     WHERE id = $1 AND deleted_at IS NULL`,
    [req.params.id],
  );
  if (!result.rowCount) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  res.json(result.rows[0]);
});

eventsRouter.post('/', requirePermission('calendar.manage'), async (req, res) => {
  const { name, circuit, location, category, event_date, event_time, status, notes } = req.body;
  const error = validateEvent(name, event_date, event_time);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const cat = category && EVENT_CATEGORIES.includes(category) ? category : 'F1';
  const st = status && EVENT_STATUSES.includes(status) ? status : 'scheduled';

  const result = await pool.query(
    `INSERT INTO events (name, circuit, location, category, event_date, event_time, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, circuit, location, category, event_date, event_time, status, notes`,
    [
      name.trim(),
      circuit ?? '',
      location ?? '',
      cat,
      event_date,
      event_time ?? null,
      st,
      notes ?? '',
    ],
  );
  res.json(result.rows[0]);
});

eventsRouter.put('/:id', requirePermission('calendar.manage'), async (req, res) => {
  const { name, circuit, location, category, event_date, event_time, status, notes } = req.body;
  const error = validateEvent(name, event_date, event_time);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const cat = category && EVENT_CATEGORIES.includes(category) ? category : 'F1';
  const st = status && EVENT_STATUSES.includes(status) ? status : 'scheduled';

  const result = await pool.query(
    `UPDATE events
     SET name = $1, circuit = $2, location = $3, category = $4, event_date = $5, event_time = $6, status = $7, notes = $8
     WHERE id = $9 AND deleted_at IS NULL
     RETURNING id, name, circuit, location, category, event_date, event_time, status, notes`,
    [
      name.trim(),
      circuit ?? '',
      location ?? '',
      cat,
      event_date,
      event_time ?? null,
      st,
      notes ?? '',
      req.params.id,
    ],
  );
  if (!result.rowCount) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  res.json(result.rows[0]);
});

eventsRouter.delete('/:id', requirePermission('calendar.manage'), async (req, res) => {
  await pool.query('UPDATE events SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [
    req.params.id,
  ]);
  res.json({ ok: true });
});
