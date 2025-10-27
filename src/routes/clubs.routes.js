
import { Router } from 'express';
import { listClubs } from '../controllers/clubs.controller.js';

const clubsRoutes = Router();
clubsRoutes.get('/', listClubs);

export default clubsRoutes;

