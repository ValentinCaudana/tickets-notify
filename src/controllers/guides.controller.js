import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const salesPath = path.join(__dirname, "../data/sales.json");
const clubsPath = path.join(__dirname, "../data/clubs.json");
const guidesPath = path.join(__dirname, "../data/guides.json");

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));

// Simple region map for Europe (lowercased ISO alpha-2)
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

function normalizeCountry(c) {
  if (!c) return "";
  const cc = c.toLowerCase();
  if (EUROPE.has(cc)) return "eu"; // macro “eu”
  return cc;
}

// Merge sections/links/notes from multiple guides (by priority order)
function composeGuides(layers) {
  // layers are already sorted ascending by priority
  const out = {
    id: "composed-guide",
    sections: [],
    links: [],
    notes: null,
  };

  for (const g of layers) {
    if (Array.isArray(g.sections)) {
      out.sections.push(...g.sections);
    }
    if (Array.isArray(g.links)) {
      out.links.push(...g.links);
    }
    if (g.notes) {
      // last non-empty wins (club > league > country > global)
      out.notes = g.notes;
    }
  }
  return out;
}

export async function getGuideBySale(req, res) {
  const { saleId } = req.params;

  const [sales, clubs, guides] = await Promise.all([
    readJson(salesPath),
    readJson(clubsPath),
    readJson(guidesPath),
  ]);

  const sale = sales.find((s) => (s.id || "").toString() === saleId);
  if (!sale) return res.status(404).json({ error: "Sale not found" });

  const club = clubs.find((c) => c.id === sale.clubId) || {};
  const league = club.league || sale.league || "";
  const country = normalizeCountry(club.country || sale.country || "");

  // Select applicable layers (global -> country -> league -> club)
  const layers = [];

  // global
  guides
    .filter((g) => g.scope?.type === "global")
    .forEach((g) => layers.push(g));

  // country (eu/ar/etc)
  if (country) {
    guides
      .filter(
        (g) =>
          g.scope?.type === "country" &&
          g.scope?.country?.toLowerCase() === country
      )
      .forEach((g) => layers.push(g));
  }

  // league (exact match)
  if (league) {
    guides
      .filter(
        (g) =>
          g.scope?.type === "league" &&
          g.scope?.league?.toLowerCase() === league.toLowerCase()
      )
      .forEach((g) => layers.push(g));
  }

  // club (exact match)
  if (sale.clubId) {
    guides
      .filter(
        (g) => g.scope?.type === "club" && g.scope?.clubId === sale.clubId
      )
      .forEach((g) => layers.push(g));
  }

  if (!layers.length) {
    return res.json({
      sale: {
        id: sale.id,
        match: sale.match,
        onSaleAt: sale.onSaleAt,
        requiresMembership: !!sale.requiresMembership,
        link: sale.link,
        clubId: sale.clubId,
      },
      club: {
        id: club.id || sale.clubId,
        name: club.name || sale.clubName || "",
        league,
        country: club.country || sale.country || "",
        officialStore: club.officialStore || "",
      },
      guide: {
        id: "guide-fallback",
        sections: [
          {
            title: "General steps",
            items: [
              "Create an account on the official club website.",
              "Check if membership is required.",
              "Enter the official link at the on-sale time and complete purchase.",
            ],
          },
        ],
        links: sale.link ? [{ label: "Official link", url: sale.link }] : [],
        notes: "Fallback guide (no specific layer found).",
      },
    });
  }

  // sort by priority ASC, then compose
  layers.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  const guide = composeGuides(layers);

  return res.json({
    sale: {
      id: sale.id,
      match: sale.match,
      onSaleAt: sale.onSaleAt,
      requiresMembership: !!sale.requiresMembership,
      link: sale.link,
      clubId: sale.clubId,
    },
    club: {
      id: club.id || sale.clubId,
      name: club.name || sale.clubName || "",
      league,
      country: club.country || sale.country || "",
      officialStore: club.officialStore || "",
    },
    guide,
  });
}
