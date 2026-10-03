import { Router } from 'express';
import { pool } from './db.js';
import { requireAdmin } from './auth.js';

export const teamsRouter = Router();
export const driversRouter = Router();

teamsRouter.get('/', async (_req, res) => {
  const result = await pool.query(
    'SELECT id, name, country, category FROM teams WHERE deleted_at IS NULL ORDER BY name',
  );
  res.json(result.rows);
});

teamsRouter.post('/', requireAdmin, async (req, res) => {
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

teamsRouter.put('/:id', requireAdmin, async (req, res) => {
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

teamsRouter.delete('/:id', requireAdmin, async (req, res) => {
  await pool.query('UPDATE teams SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [
    req.params.id,
  ]);
  res.json({ ok: true });
});

driversRouter.get('/', async (_req, res) => {
  const result = await pool.query(`
    SELECT d.id, d.name, d.nationality, d.number, t.id AS team_id, t.name AS team_name
    FROM drivers d
    LEFT JOIN teams t ON t.id = d.team_id AND t.deleted_at IS NULL
    WHERE d.deleted_at IS NULL
    ORDER BY d.name
  `);
  res.json(result.rows);
});

driversRouter.post('/', requireAdmin, async (req, res) => {
  const { name, nationality, number, teamId } = req.body;
  if (!name) {
    res.status(400).json({ error: 'El nombre es obligatorio' });
    return;
  }
  const result = await pool.query(
    'INSERT INTO drivers (name, nationality, number, team_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, nationality ?? '', number ?? null, teamId ?? null],
  );
  res.json(result.rows[0]);
});

driversRouter.put('/:id', requireAdmin, async (req, res) => {
  const { name, nationality, number, teamId } = req.body;
  if (!name) {
    res.status(400).json({ error: 'El nombre es obligatorio' });
    return;
  }
  const result = await pool.query(
    'UPDATE drivers SET name = $1, nationality = $2, number = $3, team_id = $4 WHERE id = $5 AND deleted_at IS NULL RETURNING id',
    [name, nationality ?? '', number ?? null, teamId ?? null, req.params.id],
  );
  if (!result.rowCount) {
    res.status(404).json({ error: 'Piloto no encontrado' });
    return;
  }
  res.json(result.rows[0]);
});

driversRouter.delete('/:id', requireAdmin, async (req, res) => {
  await pool.query('UPDATE drivers SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [
    req.params.id,
  ]);
  res.json({ ok: true });
});
