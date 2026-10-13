import { Router } from 'express';
import { randomUUID } from 'crypto';
import { pool } from './db.js';
import { AuthUser, getToken, getUserByToken } from './permissions.js';

export const authRouter = Router();

function publicUser(user: AuthUser) {
  const { username, role, teamId, teamName, permissions } = user;
  return { username, role, teamId, teamName, permissions };
}

async function createSession(userId: number) {
  const token = randomUUID();
  await pool.query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [token, userId]);
  return { token, ...publicUser((await getUserByToken(token))!) };
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
  res.json(await createSession(result.rows[0].id));
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
  res.json(await createSession(result.rows[0].id));
});

authRouter.post('/logout', async (req, res) => {
  await pool.query('DELETE FROM sessions WHERE token = $1', [getToken(req)]);
  res.json({ ok: true });
});

authRouter.get('/me', async (req, res) => {
  const user = await getUserByToken(getToken(req));
  if (!user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  res.json(publicUser(user));
});
