import { z } from 'zod';

export const saleSchema = z.object({
  clubId: z.string().min(1),
  match: z.string().min(3),
  onSaleAt: z.string().datetime().or(z.coerce.date()).transform(v => new Date(v).toISOString()),
  requiresMembership: z.boolean(),
  link: z.string().url(),
});
