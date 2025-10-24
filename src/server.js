import express from 'express';
import cors from 'cors';
import { salesRoutes } from './routes/sales.routes.js';
import { clubsRoutes } from './routes/clubs.routes.js'; // si lo tienes

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/sales', salesRoutes);
app.use('/api/clubs', clubsRoutes); // opcional

app.listen(process.env.PORT || 4000, () => {
  console.log('API on 4000');
});

import { startReminders } from './jobs/reminders.js';
startReminders();