import { Router } from 'express';
import { pool } from './db.js';
import { AuthUser, requireAnyPermission, requirePermission } from './permissions.js';

export const teamsRouter = Router();
export const driversRouter = Router();

teamsRouter.get('/', async (_req, res) => {
  const result = await pool.query(
    'SELECT id, name, country, category FROM teams WHERE deleted_at IS NULL ORDER BY name',
  );
  res.json(result.rows);
});

teamsRouter.post('/', requirePermission('profiles.manage'), async (req, res) => {
  const { name, country, category } = req.body;
  if (!name) {
    res.status(400).json({ error: 'El nombre es obligatorio' });
    return;
  }
  const result = await pool.query(
    'INSERT INTO teams (name, country, category) VALUES ($1, $2, $3) RETURNING id, name, country, category',
    [name, country ?? '', category ?? 'F1'],
  );
  res.json(result.rows[0]);
});

teamsRouter.put('/:id', requirePermission('profiles.manage'), async (req, res) => {
  const { name, country, category } = req.body;
  if (!name) {
    res.status(400).json({ error: 'El nombre es obligatorio' });
    return;
  }
  const result = await pool.query(
    'UPDATE teams SET name = $1, country = $2, category = $3 WHERE id = $4 AND deleted_at IS NULL RETURNING id, name, country, category',
    [name, country ?? '', category ?? 'F1', req.params.id],
  );
  if (!result.rowCount) {
    res.status(404).json({ error: 'Escudería no encontrada' });
    return;
  }
  res.json(result.rows[0]);
});

teamsRouter.delete('/:id', requirePermission('profiles.manage'), async (req, res) => {
  await pool.query('UPDATE teams SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [
    req.params.id,
  ]);
  res.json({ ok: true });
});

const LINEUPS = ['titular', 'suplente'];
const MAX_STARTERS = 2;

// Un responsable de escudería (solo drivers.manage_own) únicamente gestiona pilotos de su propia escudería
function ownTeamOnly(user: AuthUser) {
  return !user.permissions.includes('profiles.manage');
}

async function validateDriver(
  body: { name?: string; lineup?: string },
  teamId: number | null,
  driverId: number | null,
) {
  if (!body.name) return 'El nombre es obligatorio';
  const lineup = body.lineup ?? 'titular';
  if (!LINEUPS.includes(lineup)) return 'Clasificación inválida (titular o suplente)';
  if (lineup === 'titular' && teamId !== null) {
    const starters = await pool.query(
      `SELECT COUNT(*)::int AS count FROM drivers
       WHERE team_id = $1 AND lineup = 'titular' AND deleted_at IS NULL AND id <> $2`,
      [teamId, driverId ?? 0],
    );
    if (starters.rows[0].count >= MAX_STARTERS) {
      return `La escudería ya tiene ${MAX_STARTERS} pilotos titulares`;
    }
  }
  return '';
}

async function findDriverTeam(id: unknown) {
  const result = await pool.query('SELECT team_id FROM drivers WHERE id = $1 AND deleted_at IS NULL', [id]);
  return result.rowCount ? { teamId: result.rows[0].team_id as number | null } : undefined;
}

const OWN_TEAM_ERROR = 'Solo podés gestionar pilotos de tu escudería';

driversRouter.get('/', async (req, res) => {
  const teamId = req.query.teamId ? Number(req.query.teamId) : null;
  const result = await pool.query(
    `
    SELECT d.id, d.name, d.nationality, d.number, d.lineup, t.id AS team_id, t.name AS team_name
    FROM drivers d
    LEFT JOIN teams t ON t.id = d.team_id AND t.deleted_at IS NULL
    WHERE d.deleted_at IS NULL AND ($1::int IS NULL OR d.team_id = $1)
    ORDER BY t.name NULLS LAST, d.lineup DESC, d.name
  `,
    [teamId],
  );
  res.json(result.rows);
});

const canManageDrivers = requireAnyPermission('profiles.manage', 'drivers.manage_own');

driversRouter.post('/', canManageDrivers, async (req, res) => {
  const user: AuthUser = res.locals.user;
  const { nationality, number } = req.body;
  let teamId: number | null = req.body.teamId ?? null;
  if (ownTeamOnly(user)) {
    if (!user.teamId) {
      res.status(403).json({ error: OWN_TEAM_ERROR });
      return;
    }
    teamId = user.teamId;
  }
  const error = await validateDriver(req.body, teamId, null);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const result = await pool.query(
    'INSERT INTO drivers (name, nationality, number, team_id, lineup) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [req.body.name, nationality ?? '', number ?? null, teamId, req.body.lineup ?? 'titular'],
  );
  res.json(result.rows[0]);
});

driversRouter.put('/:id', canManageDrivers, async (req, res) => {
  const user: AuthUser = res.locals.user;
  const { nationality, number } = req.body;
  const existing = await findDriverTeam(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Piloto no encontrado' });
    return;
  }
  let teamId: number | null = req.body.teamId ?? null;
  if (ownTeamOnly(user)) {
    if (!user.teamId || existing.teamId !== user.teamId) {
      res.status(403).json({ error: OWN_TEAM_ERROR });
      return;
    }
    teamId = user.teamId;
  }
  const error = await validateDriver(req.body, teamId, Number(req.params.id));
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const result = await pool.query(
    'UPDATE drivers SET name = $1, nationality = $2, number = $3, team_id = $4, lineup = $5 WHERE id = $6 AND deleted_at IS NULL RETURNING id',
    [req.body.name, nationality ?? '', number ?? null, teamId, req.body.lineup ?? 'titular', req.params.id],
  );
  res.json(result.rows[0]);
});

driversRouter.delete('/:id', canManageDrivers, async (req, res) => {
  const user: AuthUser = res.locals.user;
  if (ownTeamOnly(user)) {
    const existing = await findDriverTeam(req.params.id);
    if (existing && (!user.teamId || existing.teamId !== user.teamId)) {
      res.status(403).json({ error: OWN_TEAM_ERROR });
      return;
    }
  }
  await pool.query('UPDATE drivers SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [
    req.params.id,
  ]);
  res.json({ ok: true });
});
