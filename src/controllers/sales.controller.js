// src/controllers/sales.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clubsPath = path.join(__dirname, "../data/clubs.json");
const salesPath = path.join(__dirname, "../data/sales.json");

const byId = new Map(
  JSON.parse(fs.readFileSync(clubsPath, "utf8")).map((c) => [c.id, c])
);
const sameHost = (a, b) => new URL(a).host === new URL(b).host;

export async function listSales(req, res) {
  const fs = await import("fs/promises");
  const path = await import("path");
  const { fileURLToPath } = await import("url");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const salesPath = path.join(__dirname, "../data/sales.json");
  const clubsPath = path.join(__dirname, "../data/clubs.json");

  const { date, region } = req.query;

  const rawSales = JSON.parse(
    await fs.readFile(salesPath, "utf8").catch(() => "[]")
  );
  const clubsArr = JSON.parse(
    await fs.readFile(clubsPath, "utf8").catch(() => "[]")
  );
  const clubMap = new Map(clubsArr.map((c) => [c.id, c]));

  // Enriquecer fila con datos del club (para mostrar en cards)
  let rows = rawSales.map((s) => {
    const club = clubMap.get(s.clubId) || {};
    return {
      ...s,
      clubName: club.name || s.clubId,
      league: club.league || "",
      country: (club.country || "").toLowerCase(),
      officialStore: club.officialStore || "",
      link: s.link || club.officialStore || "#",
    };
  });

  // Filtro por fecha (YYYY-MM-DD): onSaleAt cae ese día (UTC)
  if (date) {
    const from = new Date(`${date}T00:00:00Z`).getTime();
    const to = new Date(`${date}T23:59:59Z`).getTime();
    rows = rows.filter((s) => {
      const t = new Date(s.onSaleAt).getTime();
      return t >= from && t <= to;
    });
  }

  // Filtro por región simple
  if (region === "europe") {
    const EU = new Set([
      "es",
      "it",
      "fr",
      "pt",
      "de",
      "gb",
      "uk",
      "nl",
      "be",
      "dk",
      "se",
      "no",
      "fi",
      "pl",
      "ie",
      "at",
      "ch",
    ]);
    rows = rows.filter((s) => EU.has(s.country));
  } else if (region === "argentina") {
    rows = rows.filter((s) => s.country === "ar");
  }

  res.json(rows);
}

export async function createSale(req, res) {
  const { clubId, match, onSaleAt, requiresMembership, link } = req.body;

  const club = byId.get(clubId);
  if (!club) return res.status(400).json({ error: "Club not found" });

  if (!sameHost(link, club.officialStore)) {
    return res
      .status(400)
      .json({ error: "link must point to the official store" });
  }

  const exists = fs.existsSync(salesPath);
  const sales = exists ? JSON.parse(fs.readFileSync(salesPath, "utf8")) : [];

  const sale = {
    id: crypto.randomUUID(),
    clubId,
    match,
    onSaleAt,
    requiresMembership,
    link,
  };

  sales.push(sale);
  fs.writeFileSync(salesPath, JSON.stringify(sales, null, 2));
  res.status(201).json(sale);
}
