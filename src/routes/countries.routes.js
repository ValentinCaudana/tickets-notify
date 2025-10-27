
import { Router } from 'express';
import { listCountries } from '../controllers/countries.controller.js';

const countriesRoutes = Router();
countriesRoutes.get('/', listCountries);

export default countriesRoutes;
