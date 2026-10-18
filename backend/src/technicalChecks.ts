import { Router } from 'express';
import { pool } from './db.js';
import { isValidDate } from './calendar.js';
import { AuthUser, requirePermission } from './permissions.js';

export const CHECK_TYPES = [
  'min_weight',
  'floor_wear',
  'fuel_analysis',
  'software_electronics',
  'safety_extraction',
];
export const CHECK_RESULTS = ['approved', 'failed'];
export const MAX_CARS_PER_TEAM = 2;

export const carsRouter = Router();
export const technicalChecksRouter = Router();

const isInt = (v: unknown) => typeof v === 'number' && Number.isInteger(v);
const isId = (v: unknown) => typeof v === 'string' && /^\d+$/.test(v);

carsRouter.get('/', async (_req, res) => {
  const result = await pool.query(`
    SELECT c.id, c.identifier, t.id AS team_id, t.name AS team_name
    FROM cars c
    JOIN teams t ON t.id = c.team_id AND t.deleted_at IS NULL
    ORDER BY t.name, c.identifier
  `);
  res.json(result.rows);
});

carsRouter.post('/', requirePermission('technical_checks.manage'), async (req, res) => {
  const { team_id, identifier } = req.body;
  if (typeof identifier !== 'string' || !identifier.trim()) {
    res.status(400).json({ error: 'El identificador del vehículo es obligatorio' });
    return;
  }
  if (!isInt(team_id)) {
    res.status(400).json({ error: 'Elegí la escudería del auto' });
    return;
  }
  const team = await pool.query('SELECT id FROM teams WHERE id = $1 AND deleted_at IS NULL', [team_id]);
  if (!team.rowCount) {
    res.status(400).json({ error: 'Escudería inexistente' });
    return;
  }
  const owned = await pool.query('SELECT COUNT(*)::int AS count FROM cars WHERE team_id = $1', [team_id]);
  if (owned.rows[0].count >= MAX_CARS_PER_TEAM) {
    res.status(400).json({ error: `La escudería ya tiene ${MAX_CARS_PER_TEAM} autos` });
    return;
  }
  const existing = await pool.query('SELECT id FROM cars WHERE identifier = $1', [identifier.trim()]);
  if (existing.rowCount) {
    res.status(409).json({ error: 'Ya existe un auto con ese identificador' });
    return;
  }
  const result = await pool.query(
    'INSERT INTO cars (team_id, identifier) VALUES ($1, $2) RETURNING id, team_id, identifier',
    [team_id, identifier.trim()],
  );
  res.json(result.rows[0]);
});

const CHECK_SELECT = `
  SELECT tc.id, tc.car_id, c.identifier AS car_identifier, t.id AS team_id, t.name AS team_name,
         tc.check_type, tc.check_date, tc.result, tc.notes
  FROM technical_checks tc
  JOIN cars c ON c.id = tc.car_id
  JOIN teams t ON t.id = c.team_id AND t.deleted_at IS NULL
`;

async function getCheck(id: unknown) {
  const result = await pool.query(`${CHECK_SELECT} WHERE tc.id = $1 AND tc.deleted_at IS NULL`, [id]);
  return result.rows[0];
}

function validateCheck(body: Record<string, unknown>) {
  const { car_id, check_type, check_date, result, notes } = body;
  if (!isInt(car_id)) return 'Elegí el auto controlado';
  if (!CHECK_TYPES.includes(check_type as string)) return 'Tipo de control inválido';
  if (!isValidDate(check_date)) return 'La fecha del control es obligatoria y debe ser válida (YYYY-MM-DD)';
  if (!CHECK_RESULTS.includes(result as string)) return 'El resultado debe ser aprobado o no aprobado';
  if (notes != null && typeof notes !== 'string') return 'Las notas deben ser texto';
  return '';
}

async function carExists(id: unknown) {
  const result = await pool.query(
    'SELECT c.id FROM cars c JOIN teams t ON t.id = c.team_id AND t.deleted_at IS NULL WHERE c.id = $1',
    [id],
  );
  return !!result.rowCount;
}

technicalChecksRouter.get('/', async (req, res) => {
  const { teamId } = req.query;
  if (teamId !== undefined && !isId(teamId)) {
    res.status(400).json({ error: 'Escudería inválida' });
    return;
  }
  const result = await pool.query(
    `${CHECK_SELECT}
     WHERE tc.deleted_at IS NULL AND ($1::int IS NULL OR c.team_id = $1)
     ORDER BY tc.check_date DESC, tc.id DESC`,
    [teamId ?? null],
  );
  res.json(result.rows);
});

technicalChecksRouter.post('/', requirePermission('technical_checks.manage'), async (req, res) => {
  const user: AuthUser = res.locals.user;
  const error = validateCheck(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const { car_id, check_type, check_date, result, notes } = req.body;
  if (!(await carExists(car_id))) {
    res.status(400).json({ error: 'El auto no existe' });
    return;
  }
  const inserted = await pool.query(
    `INSERT INTO technical_checks (car_id, check_type, check_date, result, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [car_id, check_type, check_date, result, (notes ?? '').trim(), user.id],
  );
  res.json(await getCheck(inserted.rows[0].id));
});

technicalChecksRouter.put('/:id', requirePermission('technical_checks.manage'), async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: 'Control no encontrado' });
    return;
  }
  const error = validateCheck(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const { car_id, check_type, check_date, result, notes } = req.body;
  if (!(await carExists(car_id))) {
    res.status(400).json({ error: 'El auto no existe' });
    return;
  }
  const updated = await pool.query(
    `UPDATE technical_checks
     SET car_id = $1, check_type = $2, check_date = $3, result = $4, notes = $5
     WHERE id = $6 AND deleted_at IS NULL
     RETURNING id`,
    [car_id, check_type, check_date, result, (notes ?? '').trim(), req.params.id],
  );
  if (!updated.rowCount) {
    res.status(404).json({ error: 'Control no encontrado' });
    return;
  }
  res.json(await getCheck(req.params.id));
});

technicalChecksRouter.delete('/:id', requirePermission('technical_checks.manage'), async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: 'Control no encontrado' });
    return;
  }
  await pool.query('UPDATE technical_checks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [
    req.params.id,
  ]);
  res.json({ ok: true });
});
