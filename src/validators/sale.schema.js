import { z } from "zod";

export const saleSchema = z.object({
  clubId: z.string().min(1),
  match: z.string().min(1),
  onSaleAt: z.string().datetime().or(z.string().min(1)),
  requiresMembership: z.boolean(),
  link: z.string().url(),
});
