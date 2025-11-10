import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readSales, upsertSales } from "../services/sales.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clubsPath = path.join(__dirname, "../data/clubs.json");

// Europa (códigos alpha-2)
const EUROPE = new Set([
  "al",
  "ad",
  "at",
  "by",
  "be",
  "ba",
  "bg",
  "hr",
  "cy",
  "cz",
  "dk",
  "ee",
  "fi",
  "fr",
  "de",
  "gr",
  "hu",
  "is",
  "ie",
  "it",
  "lv",
  "li",
  "lt",
  "lu",
  "mt",
  "md",
  "mc",
  "me",
  "nl",
  "mk",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sm",
  "rs",
  "sk",
  "si",
  "es",
  "se",
  "ch",
  "tr",
  "ua",
  "gb",
  "xk",
]);

const readJson = async (p) => {
  try {
    const txt = (await fs.readFile(p, "utf8")).trim();
    if (!txt) return [];
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : data;
  } catch {
    return [];
  }
};

export async function listSales(req, res) {
  try {
    const sales = readSales(); // ← robusto
    const clubs = await readJson(clubsPath); // ← con await
    const byId = new Map(clubs.map((c) => [c.id, c]));

    const { date, from, to, region } = req.query;
    let rows = sales.map((s) => {
      const c = byId.get(s.clubId);
      return {
        ...s,
        clubName: c?.name ?? "",
        league: c?.league ?? "",
        country: (c?.country ?? "").toLowerCase(),
      };
    });

    // filtro de región
    if (region && region !== "all") {
      rows =
        region === "europe"
          ? rows.filter((r) => EUROPE.has(r.country))
          : region === "argentina"
          ? rows.filter((r) => r.country === "ar")
          : rows;
    }

    // filtro por día exacto
    if (date) {
      const y = Number(date.slice(0, 4));
      const m = Number(date.slice(5, 7)) - 1;
      const d = Number(date.slice(8, 10));
      const start = new Date(y, m, d, 0, 0, 0, 0).getTime();
      const end = new Date(y, m, d, 23, 59, 59, 999).getTime();
      rows = rows.filter((r) => {
        const t = Date.parse(r.onSaleAt);
        return Number.isFinite(t) && t >= start && t <= end;
      });
    }

    // filtro por rango (semana/mes desde el frontend)
    if (from && to) {
      const start = Date.parse(from);
      const end = Date.parse(to);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        rows = rows.filter((r) => {
          const t = Date.parse(r.onSaleAt);
          return Number.isFinite(t) && t >= start && t <= end;
        });
      }
    }

    rows.sort((a, b) => new Date(a.onSaleAt) - new Date(b.onSaleAt));
    return res.json(rows);
  } catch (err) {
    console.error("[listSales] error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

export async function createSale(req, res) {
  try {
    const body = req.body || {};
    if (!body.clubId || !body.match || !body.onSaleAt || !body.link) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newSale = {
      id: crypto.randomUUID(),
      clubId: body.clubId,
      match: body.match,
      onSaleAt: body.onSaleAt,
      requiresMembership: !!body.requiresMembership,
      link: body.link,
    };
    const merged = upsertSales([newSale]);
    const saved = merged.find((s) => s.id === newSale.id) ?? newSale;
    return res.status(201).json(saved);
  } catch (e) {
    console.error("[createSale] error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
