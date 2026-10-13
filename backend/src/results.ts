import { Router } from 'express';
import { pool } from './db.js';
import { AuthUser, requirePermission } from './permissions.js';

// Escala de puntos F1 por posición final (top 10)
export const POINTS_BY_POSITION = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export function pointsFor(position: number | null) {
  return position ? (POINTS_BY_POSITION[position - 1] ?? 0) : 0;
}

export const resultsRouter = Router();

type ResultInput = { driverId: unknown; position: unknown; points: unknown };

const isInt = (v: unknown) => typeof v === 'number' && Number.isInteger(v);

function validateResults(results: unknown): string {
  if (!Array.isArray(results)) return 'Los resultados deben ser una lista';
  const drivers = new Set<number>();
  const positions = new Set<number>();
  for (const r of results as ResultInput[]) {
    if (!isInt(r.driverId)) return 'Piloto inválido';
    if (drivers.has(r.driverId as number)) return 'Un piloto aparece más de una vez';
    drivers.add(r.driverId as number);
    if (r.position != null) {
      if (!isInt(r.position) || (r.position as number) < 1) return 'La posición debe ser un número entero mayor a 0';
      if (positions.has(r.position as number)) return `La posición ${r.position} está repetida`;
      positions.add(r.position as number);
    }
    if (!isInt(r.points) || (r.points as number) < 0) return 'Los puntos deben ser un número entero mayor o igual a 0';
  }
  return '';
}

const isId = (v: unknown) => typeof v === 'string' && /^\d+$/.test(v);

async function findEvent(id: unknown) {
  if (!isId(id)) return undefined;
  const result = await pool.query('SELECT id FROM events WHERE id = $1 AND deleted_at IS NULL', [id]);
  return result.rowCount ? result.rows[0] : undefined;
}

resultsRouter.get('/events', async (_req, res) => {
  const result = await pool.query(`
    SELECT e.id, e.name, e.event_date, e.category, COUNT(rr.id)::int AS results
    FROM events e
    JOIN race_results rr ON rr.event_id = e.id
    WHERE e.deleted_at IS NULL
    GROUP BY e.id
    ORDER BY e.event_date ASC
  `);
  res.json(result.rows);
});

resultsRouter.get('/standings', async (_req, res) => {
  const drivers = await pool.query(`
    SELECT d.id, d.name, d.number, d.nationality, t.name AS team_name,
           SUM(rr.points)::int AS points, COUNT(*) FILTER (WHERE rr.position = 1)::int AS wins
    FROM race_results rr
    JOIN events e ON e.id = rr.event_id AND e.deleted_at IS NULL
    JOIN drivers d ON d.id = rr.driver_id
    LEFT JOIN teams t ON t.id = d.team_id AND t.deleted_at IS NULL
    GROUP BY d.id, t.name
    ORDER BY points DESC, wins DESC, d.name
  `);
  const teams = await pool.query(`
    SELECT t.id, t.name, SUM(rr.points)::int AS points, COUNT(*) FILTER (WHERE rr.position = 1)::int AS wins
    FROM race_results rr
    JOIN events e ON e.id = rr.event_id AND e.deleted_at IS NULL
    JOIN teams t ON t.id = rr.team_id
    GROUP BY t.id
    ORDER BY points DESC, wins DESC, t.name
  `);
  res.json({ drivers: drivers.rows, teams: teams.rows });
});

resultsRouter.get('/my-team', requirePermission('results.confirm_own'), async (_req, res) => {
  const user: AuthUser = res.locals.user;
  if (!user.teamId) {
    res.status(403).json({ error: 'No tenés una escudería asignada' });
    return;
  }
  const result = await pool.query(
    `
    SELECT e.id AS event_id, e.name AS event_name, e.event_date, c.confirmed_at,
           d.id AS driver_id, d.name AS driver_name, d.number, rr.position, rr.points
    FROM race_results rr
    JOIN events e ON e.id = rr.event_id AND e.deleted_at IS NULL
    JOIN drivers d ON d.id = rr.driver_id
    LEFT JOIN result_confirmations c ON c.event_id = e.id AND c.team_id = rr.team_id
    WHERE rr.team_id = $1
    ORDER BY e.event_date DESC, rr.position ASC NULLS LAST, d.name
  `,
    [user.teamId],
  );
  const races = new Map<number, any>();
  for (const row of result.rows) {
    if (!races.has(row.event_id)) {
      races.set(row.event_id, {
        event_id: row.event_id,
        event_name: row.event_name,
        event_date: row.event_date,
        confirmed_at: row.confirmed_at,
        total_points: 0,
        drivers: [],
      });
    }
    const race = races.get(row.event_id);
    race.total_points += row.points;
    race.drivers.push({
      driver_id: row.driver_id,
      driver_name: row.driver_name,
      number: row.number,
      position: row.position,
      points: row.points,
    });
  }
  res.json([...races.values()]);
});

resultsRouter.get('/:eventId', async (req, res) => {
  if (!(await findEvent(req.params.eventId))) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  const result = await pool.query(
    `
    SELECT rr.driver_id, d.name AS driver_name, d.number, d.nationality,
           rr.team_id, t.name AS team_name, rr.position, rr.points
    FROM race_results rr
    JOIN drivers d ON d.id = rr.driver_id
    LEFT JOIN teams t ON t.id = rr.team_id
    WHERE rr.event_id = $1
    ORDER BY rr.position ASC NULLS LAST, rr.points DESC, d.name
  `,
    [req.params.eventId],
  );
  res.json(result.rows);
});

resultsRouter.put('/:eventId', requirePermission('results.manage'), async (req, res) => {
  if (!(await findEvent(req.params.eventId))) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  const results: ResultInput[] = req.body.results;
  const error = validateResults(results);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const ids = results.map((r) => r.driverId);
  const drivers = await pool.query(
    'SELECT id, team_id FROM drivers WHERE id = ANY($1::int[]) AND deleted_at IS NULL',
    [ids],
  );
  if (drivers.rowCount !== ids.length) {
    res.status(400).json({ error: 'Hay pilotos inexistentes en los resultados' });
    return;
  }
  const teamOf = new Map<number, number | null>(drivers.rows.map((d) => [d.id, d.team_id]));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM race_results WHERE event_id = $1', [req.params.eventId]);
    for (const r of results) {
      await client.query(
        'INSERT INTO race_results (event_id, driver_id, team_id, position, points) VALUES ($1, $2, $3, $4, $5)',
        [req.params.eventId, r.driverId, teamOf.get(r.driverId as number), r.position ?? null, r.points],
      );
    }
    // Los puntajes cambiaron: las escuderías tienen que volver a confirmar la recepción
    await client.query('DELETE FROM result_confirmations WHERE event_id = $1', [req.params.eventId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  res.json({ ok: true });
});

resultsRouter.post('/:eventId/confirm', requirePermission('results.confirm_own'), async (req, res) => {
  const user: AuthUser = res.locals.user;
  if (!user.teamId) {
    res.status(403).json({ error: 'No tenés una escudería asignada' });
    return;
  }
  if (!isId(req.params.eventId)) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  const has = await pool.query(
    `SELECT 1 FROM race_results rr JOIN events e ON e.id = rr.event_id AND e.deleted_at IS NULL
     WHERE rr.event_id = $1 AND rr.team_id = $2 LIMIT 1`,
    [req.params.eventId, user.teamId],
  );
  if (!has.rowCount) {
    res.status(400).json({ error: 'Tu escudería no tiene resultados en esa carrera' });
    return;
  }
  const result = await pool.query(
    `INSERT INTO result_confirmations (event_id, team_id, user_id) VALUES ($1, $2, $3)
     ON CONFLICT (event_id, team_id) DO UPDATE SET event_id = EXCLUDED.event_id
     RETURNING confirmed_at`,
    [req.params.eventId, user.teamId, user.id],
  );
  res.json({ confirmed_at: result.rows[0].confirmed_at });
});
