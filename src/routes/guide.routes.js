import { Router } from "express";
import { getGuideBySale } from "../controllers/guides.controller.js";

export const guidesRoutes = Router();

// GET /api/guides/by-sale/:saleId
guidesRoutes.get("/by-sale/:saleId", getGuideBySale);
