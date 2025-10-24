import { Router } from 'express';
import { listSales, createSale } from '../controllers/sales.controller.js';
import { validate } from '../middlewares/validate.js';
import { saleSchema } from '../validators/sale.schema.js';

export const salesRoutes = Router();

salesRoutes.get('/', listSales);
salesRoutes.post('/', validate(saleSchema), createSale);

