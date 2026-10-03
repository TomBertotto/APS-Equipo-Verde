import pg from 'pg';

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'F1',
      deleted_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS drivers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      nationality TEXT NOT NULL DEFAULT '',
      number INTEGER,
      team_id INTEGER REFERENCES teams(id),
      deleted_at TIMESTAMP
    );
    INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin')
      ON CONFLICT (username) DO UPDATE SET role = 'admin';
  `);
}
