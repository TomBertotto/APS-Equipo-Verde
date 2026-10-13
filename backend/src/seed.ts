import { pool } from './db.js';

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

export async function seedDb() {
  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM teams');
  if (existing.rows[0].count > 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
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
    await client.query('COMMIT');
    console.log('Datos de prueba cargados');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
