// src/routes/sales.routes.js
import { Router } from 'express';
import { listSales, createSale } from '../controllers/sales.controller.js';
import validate from '../middlewares/validate.js';
import { saleSchema } from '../validators/sale.schema.js';

const salesRoutes = Router();

salesRoutes.get('/', listSales);
salesRoutes.post('/', validate(saleSchema), createSale);

export default salesRoutes;
