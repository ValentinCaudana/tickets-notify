// src/validators/sale.schema.js
import { z } from 'zod';

export const saleSchema = z.object({
  clubId: z.string().min(1),
  match: z.string().min(1),
  onSaleAt: z.string().datetime().or(z.string().min(1)), // si aún no validás ISO
  requiresMembership: z.boolean(),
  link: z.string().url()
});

