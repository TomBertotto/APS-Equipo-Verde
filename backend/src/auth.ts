import { Router, Request } from 'express';
import { randomUUID } from 'crypto';
import { pool } from './db.js';

export const authRouter = Router();

function getToken(req: Request) {
  return req.headers.authorization?.replace('Bearer ', '') ?? '';
}

async function createSession(userId: number) {
  const token = randomUUID();
  await pool.query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [token, userId]);
  return token;
}

authRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    return;
  }
  const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.rowCount) {
    res.status(409).json({ error: 'El usuario ya existe' });
    return;
  }
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
    [username, password],
  );
  const token = await createSession(result.rows[0].id);
  res.json({ token, username });
});

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query(
    'SELECT id FROM users WHERE username = $1 AND password = $2',
    [username, password],
  );
  if (!result.rowCount) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }
  const token = await createSession(result.rows[0].id);
  res.json({ token, username });
});

authRouter.post('/logout', async (req, res) => {
  await pool.query('DELETE FROM sessions WHERE token = $1', [getToken(req)]);
  res.json({ ok: true });
});

authRouter.get('/me', async (req, res) => {
  const result = await pool.query(
    'SELECT u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1',
    [getToken(req)],
  );
  if (!result.rowCount) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  res.json({ username: result.rows[0].username });
});
