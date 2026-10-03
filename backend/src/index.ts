import express from 'express';
import cors from 'cors';
import { pool, initDb } from './db.js';
import { authRouter } from './auth.js';
import { teamsRouter, driversRouter } from './profiles.js';
import { accessRouter } from './access.js';
import { eventsRouter } from './calendar.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', db: 'ok' });
  } catch (err) {
    res.status(500).json({ api: 'ok', db: (err as Error).message });
  }
});

app.use('/auth', authRouter);
app.use('/teams', teamsRouter);
app.use('/drivers', driversRouter);
app.use('/access', accessRouter);
app.use('/events', eventsRouter);

const port = Number(process.env.PORT ?? 3000);
await initDb();
app.listen(port, () => console.log(`API listening on :${port}`));
