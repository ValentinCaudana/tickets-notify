import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paths of data
const salesPath = path.join(__dirname, "../data/sales.json");
const clubsPath = path.join(__dirname, "../data/clubs.json");

// Region simple: Europa (cc alfa-2) and Argentina
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

// Helpers
const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const writeJson = async (p, data) =>
  fs.writeFile(p, JSON.stringify(data, null, 2));

function ymdLocal(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function listSales(req, res) {
  const { date, from, to, region } = req.query;

  const [sales, clubs] = await Promise.all([
    readJson(salesPath),
    readJson(clubsPath),
  ]);

  const clubMap = new Map(clubs.map((c) => [c.id, c]));

  let rows = sales.map((s) => {
    const c = clubMap.get(s.clubId) || {};
    return {
      ...s,
      clubName: s.clubName ?? c.name ?? "",
      league: s.league ?? c.league ?? "",
      country: (s.country ?? c.country ?? "").toLowerCase(),
    };
  });

  // Filter for date
  if (date) {
    rows = rows.filter((s) => ymdLocal(s.onSaleAt) === date);
  } else {
    // range from/to (ISO)
    const fromMs = from ? new Date(from).getTime() : null;
    const toMs = to ? new Date(to).getTime() : null;
    if (fromMs != null)
      rows = rows.filter((s) => new Date(s.onSaleAt).getTime() >= fromMs);
    if (toMs != null)
      rows = rows.filter((s) => new Date(s.onSaleAt).getTime() <= toMs);
  }

  // Filter for region (simple)
  if (region && region !== "all") {
    if (region === "europe") {
      rows = rows.filter((s) => EUROPE.has((s.country || "").toLowerCase()));
    } else if (region === "argentina") {
      rows = rows.filter((s) => (s.country || "").toLowerCase() === "ar");
    }
  }

  rows.sort((a, b) => new Date(a.onSaleAt) - new Date(b.onSaleAt));

  res.json(rows);
}

export async function createSale(req, res) {
  const body = req.body || {};
  // simple minimun validation
  if (!body.clubId || !body.match || !body.onSaleAt || !body.link) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sales = await readJson(salesPath);
  const newSale = {
    id: crypto.randomUUID(),
    clubId: body.clubId,
    match: body.match,
    onSaleAt: body.onSaleAt,
    requiresMembership: !!body.requiresMembership,
    link: body.link,
  };

  sales.push(newSale);
  await writeJson(salesPath, sales);
  res.status(201).json(newSale);
}
