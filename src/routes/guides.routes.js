import { Router } from "express";
import { getGuide } from "../controllers/guides.controller.js";

const router = Router();

// GET /api/guides?sale=<saleId>&lang=en
router.get("/", getGuide);

export default router;
