import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const salesPath = path.join(__dirname, "../data/sales.json");
const clubsPath = path.join(__dirname, "../data/clubs.json");
const guidesPath = path.join(__dirname, "../data/guides.json");

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));

// -------------------------
// Controller: get guide by saleId
// -------------------------
export async function getGuideBySale(req, res) {
  const { saleId } = req.params;

  const [sales, clubs, guides] = await Promise.all([
    readJson(salesPath),
    readJson(clubsPath),
    readJson(guidesPath),
  ]);

  // Find the sale
  const sale = sales.find((s) => (s.id || "").toString() === saleId);
  if (!sale) return res.status(404).json({ error: "Sale not found" });

  // Find related club and league
  const club = clubs.find((c) => c.id === sale.clubId) || {};
  const clubId = club.id || sale.clubId;
  const league = club.league || sale.league || "";

  // Match the guide: by club → by league → fallback
  let guide =
    guides.find((g) => g.clubId && g.clubId === clubId) ||
    guides.find(
      (g) =>
        g.league && league && g.league.toLowerCase() === league.toLowerCase()
    ) ||
    guides.find((g) => g.id && g.id.startsWith("guide-generic")) ||
    null;

  // Build the response
  res.json({
    sale: {
      id: sale.id,
      match: sale.match,
      onSaleAt: sale.onSaleAt,
      requiresMembership: !!sale.requiresMembership,
      link: sale.link,
      clubId: sale.clubId,
    },
    club: {
      id: clubId,
      name: club.name || sale.clubName || "",
      league: league,
      country: club.country || sale.country || "",
      officialStore: club.officialStore || "",
    },
    guide: guide || {
      id: "guide-fallback",
      steps: [
        "Create an account on the club’s official website.",
        "Check if you need a membership for early access.",
        "Enter the official link at the sale time.",
        "Complete your purchase and keep the confirmation email.",
      ],
      notes: "Generic guide: update with club-specific details when available.",
      officialPages: [],
    },
  });
}
