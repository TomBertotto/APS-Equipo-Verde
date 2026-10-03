import express from 'express';
import cors from 'cors';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API listening on :${port}`));
