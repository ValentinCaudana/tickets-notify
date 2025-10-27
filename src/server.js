
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import countriesRoutes from './routes/countries.routes.js';
import clubsRoutes from './routes/clubs.routes.js';
import salesRoutes from './routes/sales.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// servir estáticos (index.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// rutas de la API
app.use('/api/countries', countriesRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/sales', salesRoutes);

// healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`);
});

import subscriptionsRoutes from './routes/subscriptions.routes.js';
app.use('/api/subscriptions', subscriptionsRoutes);