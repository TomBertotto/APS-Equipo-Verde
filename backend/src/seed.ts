import { PoolClient } from 'pg';
import { pool } from './db.js';
import { pointsFor } from './results.js';

// Datos de prueba: se cargan solo en una base vacía (sin escuderías)

const TEAMS = [
  { name: 'McLaren', country: 'Reino Unido' },
  { name: 'Ferrari', country: 'Italia' },
  { name: 'Red Bull Racing', country: 'Austria' },
  { name: 'Mercedes', country: 'Alemania' },
  { name: 'Aston Martin', country: 'Reino Unido' },
  { name: 'Alpine', country: 'Francia' },
  { name: 'Williams', country: 'Reino Unido' },
  { name: 'Racing Bulls', country: 'Italia' },
  { name: 'Audi', country: 'Alemania' },
  { name: 'Haas', country: 'Estados Unidos' },
  { name: 'Cadillac', country: 'Estados Unidos' },
];

const DRIVERS = [
  { team: 'McLaren', name: 'Lando Norris', nationality: 'Reino Unido', number: 4, lineup: 'titular' },
  { team: 'McLaren', name: 'Oscar Piastri', nationality: 'Australia', number: 81, lineup: 'titular' },
  { team: 'McLaren', name: "Pato O'Ward", nationality: 'México', number: 29, lineup: 'suplente' },
  { team: 'Ferrari', name: 'Charles Leclerc', nationality: 'Mónaco', number: 16, lineup: 'titular' },
  { team: 'Ferrari', name: 'Lewis Hamilton', nationality: 'Reino Unido', number: 44, lineup: 'titular' },
  { team: 'Ferrari', name: 'Antonio Giovinazzi', nationality: 'Italia', number: 99, lineup: 'suplente' },
  { team: 'Ferrari', name: 'Zhou Guanyu', nationality: 'China', number: 24, lineup: 'suplente' },
  { team: 'Red Bull Racing', name: 'Max Verstappen', nationality: 'Países Bajos', number: 1, lineup: 'titular' },
  { team: 'Red Bull Racing', name: 'Isack Hadjar', nationality: 'Francia', number: 6, lineup: 'titular' },
  { team: 'Mercedes', name: 'George Russell', nationality: 'Reino Unido', number: 63, lineup: 'titular' },
  { team: 'Mercedes', name: 'Andrea Kimi Antonelli', nationality: 'Italia', number: 12, lineup: 'titular' },
  { team: 'Mercedes', name: 'Frederik Vesti', nationality: 'Dinamarca', number: 36, lineup: 'suplente' },
  { team: 'Aston Martin', name: 'Fernando Alonso', nationality: 'España', number: 14, lineup: 'titular' },
  { team: 'Aston Martin', name: 'Lance Stroll', nationality: 'Canadá', number: 18, lineup: 'titular' },
  { team: 'Alpine', name: 'Pierre Gasly', nationality: 'Francia', number: 10, lineup: 'titular' },
  { team: 'Alpine', name: 'Franco Colapinto', nationality: 'Argentina', number: 43, lineup: 'titular' },
  { team: 'Williams', name: 'Alexander Albon', nationality: 'Tailandia', number: 23, lineup: 'titular' },
  { team: 'Williams', name: 'Carlos Sainz', nationality: 'España', number: 55, lineup: 'titular' },
  { team: 'Racing Bulls', name: 'Liam Lawson', nationality: 'Nueva Zelanda', number: 30, lineup: 'titular' },
  { team: 'Racing Bulls', name: 'Arvid Lindblad', nationality: 'Reino Unido', number: 41, lineup: 'titular' },
  { team: 'Audi', name: 'Nico Hülkenberg', nationality: 'Alemania', number: 27, lineup: 'titular' },
  { team: 'Audi', name: 'Gabriel Bortoleto', nationality: 'Brasil', number: 5, lineup: 'titular' },
  { team: 'Haas', name: 'Esteban Ocon', nationality: 'Francia', number: 31, lineup: 'titular' },
  { team: 'Haas', name: 'Oliver Bearman', nationality: 'Reino Unido', number: 87, lineup: 'titular' },
  { team: 'Cadillac', name: 'Sergio Pérez', nationality: 'México', number: 11, lineup: 'titular' },
  { team: 'Cadillac', name: 'Valtteri Bottas', nationality: 'Finlandia', number: 77, lineup: 'titular' },
];

// Usuario y contraseña iguales; el admin lo crea initDb
const SEED_USERS = [
  { username: 'ferrari@ferrari.com', role: 'team_manager', team: 'Ferrari' },
  { username: 'mclaren@mclaren.com', role: 'team_manager', team: 'McLaren' },
  { username: 'juancarlos@juancarlos.com', role: 'team_manager', team: null },
  { username: 'publico@publico.com', role: 'user', team: null },
];

const EVENTS: { name: string; circuit: string; location: string; date: string; time: string; status?: string; notes?: string }[] = [
  { name: 'Gran Premio de Australia', circuit: 'Albert Park', location: 'Melbourne, Australia', date: '2026-03-08', time: '01:00' },
  { name: 'Gran Premio de China', circuit: 'Circuito Internacional de Shanghái', location: 'Shanghái, China', date: '2026-03-15', time: '04:00', notes: 'Fin de semana con carrera sprint' },
  { name: 'Gran Premio de Japón', circuit: 'Suzuka', location: 'Suzuka, Japón', date: '2026-03-29', time: '02:00' },
  { name: 'Gran Premio de Baréin', circuit: 'Circuito Internacional de Baréin', location: 'Sakhir, Baréin', date: '2026-04-12', time: '12:00', status: 'cancelled', notes: 'Cancelado por razones de seguridad' },
  { name: 'Gran Premio de Arabia Saudita', circuit: 'Circuito de la Corniche de Yeda', location: 'Yeda, Arabia Saudita', date: '2026-04-19', time: '14:00' },
  { name: 'Gran Premio de Miami', circuit: 'Autódromo Internacional de Miami', location: 'Miami, Estados Unidos', date: '2026-05-03', time: '17:00', notes: 'Fin de semana con carrera sprint' },
  { name: 'Gran Premio de Canadá', circuit: 'Circuito Gilles Villeneuve', location: 'Montreal, Canadá', date: '2026-05-24', time: '18:00' },
  { name: 'Gran Premio de Mónaco', circuit: 'Circuito de Mónaco', location: 'Montecarlo, Mónaco', date: '2026-06-07', time: '13:00' },
  { name: 'Gran Premio de Barcelona-Cataluña', circuit: 'Circuit de Barcelona-Catalunya', location: 'Montmeló, España', date: '2026-06-14', time: '13:00' },
  { name: 'Gran Premio de Austria', circuit: 'Red Bull Ring', location: 'Spielberg, Austria', date: '2026-06-28', time: '13:00' },
  { name: 'Gran Premio de Gran Bretaña', circuit: 'Silverstone', location: 'Silverstone, Reino Unido', date: '2026-07-05', time: '14:00' },
  { name: 'Gran Premio de Bélgica', circuit: 'Spa-Francorchamps', location: 'Stavelot, Bélgica', date: '2026-07-19', time: '13:00' },
  { name: 'Gran Premio de Hungría', circuit: 'Hungaroring', location: 'Mogyoród, Hungría', date: '2026-07-26', time: '13:00' },
  { name: 'Gran Premio de los Países Bajos', circuit: 'Zandvoort', location: 'Zandvoort, Países Bajos', date: '2026-08-23', time: '13:00' },
  { name: 'Gran Premio de Italia', circuit: 'Autodromo Nazionale Monza', location: 'Monza, Italia', date: '2026-09-06', time: '13:00' },
  { name: 'Gran Premio de España', circuit: 'Madring', location: 'Madrid, España', date: '2026-09-13', time: '13:00', notes: 'Primera edición en Madrid' },
  { name: 'Gran Premio de Azerbaiyán', circuit: 'Circuito Callejero de Bakú', location: 'Bakú, Azerbaiyán', date: '2026-09-26', time: '11:00' },
  { name: 'Gran Premio de Singapur', circuit: 'Marina Bay', location: 'Singapur', date: '2026-10-11', time: '12:00' },
  { name: 'Gran Premio de Estados Unidos', circuit: 'Circuito de las Américas', location: 'Austin, Estados Unidos', date: '2026-10-25', time: '19:00' },
  { name: 'Gran Premio de México', circuit: 'Autódromo Hermanos Rodríguez', location: 'Ciudad de México, México', date: '2026-11-01', time: '20:00' },
  { name: 'Gran Premio de São Paulo', circuit: 'Interlagos', location: 'São Paulo, Brasil', date: '2026-11-08', time: '17:00', status: 'postponed', notes: 'Fecha a confirmar' },
  { name: 'Gran Premio de Las Vegas', circuit: 'Circuito Callejero de Las Vegas', location: 'Las Vegas, Estados Unidos', date: '2026-11-21', time: '04:00' },
  { name: 'Gran Premio de Catar', circuit: 'Circuito Internacional de Lusail', location: 'Lusail, Catar', date: '2026-11-29', time: '16:00' },
  { name: 'Gran Premio de Abu Dabi', circuit: 'Yas Marina', location: 'Abu Dabi, Emiratos Árabes Unidos', date: '2026-12-06', time: '13:00' },
];

async function inTransaction(work: (client: PoolClient) => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await work(client);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function seedBase(client: PoolClient) {
  const teamIds: Record<string, number> = {};
  for (const team of TEAMS) {
    const result = await client.query(
      "INSERT INTO teams (name, country, category) VALUES ($1, $2, 'F1') RETURNING id",
      [team.name, team.country],
    );
    teamIds[team.name] = result.rows[0].id;
  }
  for (const d of DRIVERS) {
    await client.query(
      'INSERT INTO drivers (name, nationality, number, team_id, lineup) VALUES ($1, $2, $3, $4, $5)',
      [d.name, d.nationality, d.number, teamIds[d.team], d.lineup],
    );
  }
  for (const u of SEED_USERS) {
    await client.query(
      `INSERT INTO users (username, password, role, team_id) VALUES ($1, $1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, u.role, u.team ? teamIds[u.team] : null],
    );
  }
  const today = new Date().toISOString().slice(0, 10);
  for (const e of EVENTS) {
    await client.query(
      `INSERT INTO events (name, circuit, location, category, event_date, event_time, status, notes)
       VALUES ($1, $2, $3, 'F1', $4, $5, $6, $7)`,
      [e.name, e.circuit, e.location, e.date, e.time, e.status ?? (e.date < today ? 'completed' : 'scheduled'), e.notes ?? ''],
    );
  }
}

// PRNG determinístico (mulberry32), para que los resultados de ejemplo sean siempre los mismos
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Resultados de las carreras ya corridas, con los pilotos titulares actuales de la base
async function seedResults(client: PoolClient) {
  const events = await client.query(
    "SELECT id FROM events WHERE status = 'completed' AND deleted_at IS NULL ORDER BY event_date",
  );
  const drivers = await client.query(
    "SELECT id, team_id FROM drivers WHERE lineup = 'titular' AND team_id IS NOT NULL AND deleted_at IS NULL ORDER BY id",
  );
  if (!events.rowCount || !drivers.rowCount) return false;

  const ferrari = await client.query("SELECT id, team_id FROM users WHERE username = 'ferrari@ferrari.com'");
  const rand = random(2026);
  for (const [index, event] of events.rows.entries()) {
    const order = [...drivers.rows];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const retired = Math.floor(rand() * 3); // 0 a 2 abandonos por carrera
    for (const [i, driver] of order.entries()) {
      const position = i < order.length - retired ? i + 1 : null;
      await client.query(
        'INSERT INTO race_results (event_id, driver_id, team_id, position, points) VALUES ($1, $2, $3, $4, $5)',
        [event.id, driver.id, driver.team_id, position, pointsFor(position)],
      );
    }
    // Ferrari confirmó la recepción de una carrera sí y otra no; McLaren tiene todo pendiente
    const manager = ferrari.rows[0];
    if (manager?.team_id && index % 2 === 0) {
      await client.query(
        `INSERT INTO result_confirmations (event_id, team_id, user_id, confirmed_at)
         SELECT $1, $2, $3, e.event_date + INTERVAL '2 days' FROM events e WHERE e.id = $1`,
        [event.id, manager.team_id, manager.id],
      );
    }
  }
  return true;
}

const carIdentifier = (team: string, n: number) => `${team} · Auto ${n}`;

async function seedCars(client: PoolClient) {
  const teams = await client.query('SELECT id, name FROM teams WHERE deleted_at IS NULL ORDER BY id');
  for (const team of teams.rows) {
    for (const n of [1, 2]) {
      await client.query('INSERT INTO cars (team_id, identifier) VALUES ($1, $2)', [
        team.id,
        carIdentifier(team.name, n),
      ]);
    }
  }
}

const CHECKS: { team: string; car: number; type: string; date: string; result: string; notes?: string }[] = [
  { team: 'Ferrari', car: 1, type: 'min_weight', date: '2026-03-05', result: 'approved' },
  { team: 'Ferrari', car: 2, type: 'min_weight', date: '2026-03-05', result: 'approved' },
  { team: 'Ferrari', car: 1, type: 'floor_wear', date: '2026-04-16', result: 'failed', notes: 'Plancha por debajo del espesor mínimo' },
  { team: 'Ferrari', car: 1, type: 'floor_wear', date: '2026-05-21', result: 'approved', notes: 'Se cambió la plancha y se repitió el control' },
  { team: 'McLaren', car: 1, type: 'fuel_analysis', date: '2026-03-12', result: 'approved' },
  { team: 'McLaren', car: 2, type: 'software_electronics', date: '2026-04-02', result: 'failed', notes: 'Versión de software no homologada' },
  { team: 'McLaren', car: 2, type: 'software_electronics', date: '2026-04-09', result: 'approved' },
  { team: 'Mercedes', car: 1, type: 'safety_extraction', date: '2026-06-11', result: 'approved' },
  { team: 'Red Bull Racing', car: 2, type: 'min_weight', date: '2026-07-02', result: 'failed', notes: 'Distribución de peso fuera de tolerancia' },
  { team: 'Williams', car: 1, type: 'fuel_analysis', date: '2026-08-20', result: 'approved' },
];

async function seedTechnicalChecks(client: PoolClient) {
  const admin = await client.query("SELECT id FROM users WHERE username = 'admin@admin.com'");
  let loaded = 0;
  for (const c of CHECKS) {
    const car = await client.query('SELECT id FROM cars WHERE identifier = $1', [carIdentifier(c.team, c.car)]);
    if (!car.rowCount) continue;
    await client.query(
      `INSERT INTO technical_checks (car_id, check_type, check_date, result, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [car.rows[0].id, c.type, c.date, c.result, c.notes ?? '', admin.rows[0]?.id ?? null],
    );
    loaded++;
  }
  return loaded > 0;
}

// Cada sección se carga solo si su tabla está vacía, así nunca pisa datos existentes
export async function seedDb() {
  const teams = await pool.query('SELECT COUNT(*)::int AS count FROM teams');
  if (teams.rows[0].count === 0) {
    await inTransaction(seedBase);
    console.log('Datos de prueba cargados');
  }
  const results = await pool.query('SELECT COUNT(*)::int AS count FROM race_results');
  if (results.rows[0].count === 0) {
    let loaded = false;
    await inTransaction(async (client) => {
      loaded = await seedResults(client);
    });
    if (loaded) console.log('Resultados de prueba cargados');
  }
  const cars = await pool.query('SELECT COUNT(*)::int AS count FROM cars');
  if (cars.rows[0].count === 0) {
    await inTransaction(seedCars);
  }
  const checks = await pool.query('SELECT COUNT(*)::int AS count FROM technical_checks');
  if (checks.rows[0].count === 0) {
    let loaded = false;
    await inTransaction(async (client) => {
      loaded = await seedTechnicalChecks(client);
    });
    if (loaded) console.log('Controles técnicos de prueba cargados');
  }
}
