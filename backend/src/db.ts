import pg from 'pg';

// DATE como 'YYYY-MM-DD' y TIME como 'HH:MM' (evita conversiones de zona horaria)
pg.types.setTypeParser(1082, (v) => v);
pg.types.setTypeParser(1083, (v) => v.slice(0, 5));

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Permisos que un rol recibe por defecto. Cada uno se otorga una sola vez (queda registrado en
// default_grants_applied), así no reaparece si el admin lo quita desde "Usuarios y permisos".
const DEFAULT_GRANTS: [string, string][] = [
  ['team_manager', 'drivers.manage_own'],
  ['team_manager', 'results.confirm_own'],
  ['team_manager', 'communications.view_own'],
];

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
    ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id);
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS lineup TEXT NOT NULL DEFAULT 'titular';
    CREATE TABLE IF NOT EXISTS role_permissions (
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (role, permission)
    );
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      circuit TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'F1',
      event_date DATE NOT NULL,
      event_time TIME,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT NOT NULL DEFAULT '',
      deleted_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS race_results (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id),
      driver_id INTEGER NOT NULL REFERENCES drivers(id),
      team_id INTEGER REFERENCES teams(id),
      position INTEGER,
      points INTEGER NOT NULL DEFAULT 0,
      UNIQUE (event_id, driver_id)
    );
    CREATE TABLE IF NOT EXISTS result_confirmations (
      event_id INTEGER NOT NULL REFERENCES events(id),
      team_id INTEGER NOT NULL REFERENCES teams(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      confirmed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (event_id, team_id)
    );
    CREATE TABLE IF NOT EXISTS communications (
      id SERIAL PRIMARY KEY,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS communication_recipients (
      communication_id INTEGER NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
      team_id INTEGER NOT NULL REFERENCES teams(id),
      PRIMARY KEY (communication_id, team_id)
    );
    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id),
      identifier TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS technical_checks (
      id SERIAL PRIMARY KEY,
      car_id INTEGER NOT NULL REFERENCES cars(id),
      check_type TEXT NOT NULL,
      check_date DATE NOT NULL,
      result TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS default_grants_applied (
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (role, permission)
    );
    INSERT INTO users (username, password, role) VALUES ('admin@admin.com', 'admin@admin.com', 'admin')
      ON CONFLICT (username) DO UPDATE SET role = 'admin';
  `);
  for (const [role, permission] of DEFAULT_GRANTS) {
    const applied = await pool.query(
      'INSERT INTO default_grants_applied (role, permission) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [role, permission],
    );
    if (applied.rowCount) {
      await pool.query(
        'INSERT INTO role_permissions (role, permission) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [role, permission],
      );
    }
  }
}
