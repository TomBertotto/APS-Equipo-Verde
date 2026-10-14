import { Router } from 'express';
import { pool } from './db.js';
import { AuthUser, requirePermission } from './permissions.js';

export const communicationsRouter = Router();

function validate(subject: unknown, body: unknown, teamIds: unknown) {
  if (typeof subject !== 'string' || !subject.trim()) return 'El asunto es obligatorio';
  if (typeof body !== 'string' || !body.trim()) return 'El contenido es obligatorio';
  if (!Array.isArray(teamIds) || teamIds.length === 0) return 'Elegí al menos una escudería destinataria';
  if (!teamIds.every((id) => typeof id === 'number' && Number.isInteger(id))) return 'Destinatarios inválidos';
  return '';
}

communicationsRouter.post('/', requirePermission('communications.send'), async (req, res) => {
  const user: AuthUser = res.locals.user;
  const { subject, body, teamIds } = req.body;
  const error = validate(subject, body, teamIds);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const uniqueTeamIds = [...new Set(teamIds as number[])];
  const teams = await pool.query('SELECT id FROM teams WHERE id = ANY($1::int[]) AND deleted_at IS NULL', [
    uniqueTeamIds,
  ]);
  if (teams.rowCount !== uniqueTeamIds.length) {
    res.status(400).json({ error: 'Hay escuderías inexistentes entre los destinatarios' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      'INSERT INTO communications (subject, body, created_by) VALUES ($1, $2, $3) RETURNING id, created_at',
      [subject.trim(), body.trim(), user.id],
    );
    const { id, created_at } = inserted.rows[0];
    for (const teamId of uniqueTeamIds) {
      await client.query(
        'INSERT INTO communication_recipients (communication_id, team_id) VALUES ($1, $2)',
        [id, teamId],
      );
    }
    await client.query('COMMIT');
    res.json({ id, created_at });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// Historial de comunicaciones enviadas, para que el Administrador FIA pueda verificar un envío
communicationsRouter.get('/sent', requirePermission('communications.send'), async (_req, res) => {
  const result = await pool.query(`
    SELECT c.id, c.subject, c.body, c.created_at, u.username AS sender,
           COALESCE(array_agg(t.name ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL), '{}') AS team_names
    FROM communications c
    LEFT JOIN users u ON u.id = c.created_by
    LEFT JOIN communication_recipients cr ON cr.communication_id = c.id
    LEFT JOIN teams t ON t.id = cr.team_id
    GROUP BY c.id, u.username
    ORDER BY c.created_at DESC
  `);
  res.json(result.rows);
});

// Solo trae comunicaciones cuyo destinatario sea la escudería del usuario autenticado
communicationsRouter.get('/my-team', requirePermission('communications.view_own'), async (_req, res) => {
  const user: AuthUser = res.locals.user;
  if (!user.teamId) {
    res.status(403).json({ error: 'No tenés una escudería asignada' });
    return;
  }
  const result = await pool.query(
    `
    SELECT c.id, c.subject, c.body, c.created_at, u.username AS sender
    FROM communications c
    JOIN communication_recipients cr ON cr.communication_id = c.id AND cr.team_id = $1
    LEFT JOIN users u ON u.id = c.created_by
    ORDER BY c.created_at DESC
  `,
    [user.teamId],
  );
  res.json(result.rows);
});
