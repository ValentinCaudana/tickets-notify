import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajustá el nombre si cambiaste el archivo
const DATA_GUIDES = path.join(__dirname, "../data/guides.json");
const DATA_SALES = path.join(__dirname, "../data/sales.json");
const DATA_CLUBS = path.join(__dirname, "../data/clubs.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// score por especificidad (más alto = mejor match)
function guideScore(guide, sale) {
  const g = guide.applies || {};
  let score = 0;
  if (g.tournament && g.tournament === sale.tournament) score += 1;
  if (g.league && g.league === sale.league) score += 2;
  if (g.homeClubId && g.homeClubId === sale.homeClubId) score += 4;
  if (g.awayClubId && g.awayClubId === sale.awayClubId) score += 4;
  if (g.country && g.country === sale.country) score += 1;
  return score;
}

export async function getGuide(req, res) {
  try {
    const saleId = String(req.query.sale || "").trim();
    const lang = (String(req.query.lang || "en").slice(0, 5) || "en")
      .toLowerCase()
      .startsWith("es")
      ? "es"
      : "en";

    if (!saleId)
      return res.status(400).json({ error: "Missing sale parameter" });

    const [guides, sales, clubs] = [
      readJson(DATA_GUIDES),
      readJson(DATA_SALES),
      readJson(DATA_CLUBS),
    ];
    const clubById = new Map(clubs.map((c) => [c.id, c]));
    const sale = sales.find((s) => s.id === saleId);

    if (!sale) return res.status(404).json({ error: "Sale not found" });

    // enriquecemos el sale (por si la UI lo necesita)
    const enriched = {
      ...sale,
      league: sale.league,
      tournament: sale.tournament,
      country: clubById.get(sale.clubId)?.country || sale.country,
      homeClubId: sale.homeClubId || sale.clubId, // si ya guardás home/away, respetá tus campos
      awayClubId: sale.awayClubId || sale.opponentId,
    };

    // elegimos la guía con mejor score
    let best = null;
    let bestScore = -1;
    for (const g of guides) {
      const sc = guideScore(g, enriched);
      if (sc > bestScore) {
        best = g;
        bestScore = sc;
      }
    }

    if (!best) return res.status(404).json({ error: "Guide not found" });

    const title = best.title?.[lang] || best.title?.en || "How to buy";
    const notes = best.notes?.[lang] || best.notes?.en || "";
    const steps = best.steps?.[lang] || best.steps?.en || [];
    const links = (best.links || []).map((l) => ({
      text: l.text?.[lang] || l.text?.en || "Link",
      href: l.href,
    }));

    return res.json({ title, notes, steps, links });
  } catch (err) {
    console.error("Unhandled error (getGuide):", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
