import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const salesPath = path.join(__dirname, "..", "src", "data", "sales.json");
const clubsPath = path.join(__dirname, "..", "src", "data", "clubs.json");

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const writeJson = async (p, data) =>
  fs.writeFile(p, JSON.stringify(data, null, 2));

// evita duplicar: misma fecha redondeada a minuto + mismo club + mismo match
function keyOf(s) {
  const t = new Date(s.onSaleAt);
  t.setSeconds(0, 0);
  return `${s.clubId}__${s.match}__${t.toISOString()}`;
}

function isoAtLocal(hour = 10, dayOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return d.toISOString();
}

// genera fixtures simples host vs rival
function makeFixtures(club) {
  const rivals = [
    "Real Betis",
    "Girona",
    "Sevilla",
    "Athletic",
    "Osasuna",
    "Villarreal",
  ];
  return rivals.map((r) => `${club.name} vs ${r} (${club.league})`);
}

async function run() {
  const arg = (process.argv[2] || "").toLowerCase(); // 'week' | 'month'
  const days = arg === "month" ? 30 : 7;

  const [sales, clubs] = await Promise.all([
    readJson(salesPath),
    readJson(clubsPath),
  ]);

  const existing = new Set(sales.map(keyOf));

  // Elegimos algunos clubes europeos y argentinos (si existen en tu clubs.json)
  const wanted = new Set(["fcb", "rm", "atleti", "rma", "boca", "river"]); // ajusta a tus IDs reales
  const selected = clubs.filter(
    (c) =>
      wanted.has(c.id) ||
      ["es", "ar", "it", "gb", "de", "pt", "fr"].includes(
        (c.country || "").toLowerCase()
      )
  );

  const toAdd = [];

  for (const c of selected.slice(0, 6)) {
    // no más de 6 clubes para no inundar
    const matches = makeFixtures(c);

    for (let d = 0; d < days; d += 2) {
      // cada 2 días
      for (const m of matches.slice(0, 2)) {
        // 2 partidos por fecha aprox
        const sale = {
          id: crypto.randomUUID(),
          clubId: c.id,
          match: m.replace(c.name, c.name), // placeholder simple
          onSaleAt: isoAtLocal(10 + (d % 3), d), // 10:00 / 11:00 / 12:00 alternando
          requiresMembership: (c.country || "").toLowerCase() === "es", // ejemplo
          link: c.officialStore || "https://example.com",
        };

        const k = keyOf(sale);
        if (!existing.has(k)) {
          existing.add(k);
          toAdd.push(sale);
        }
      }
    }
  }

  if (toAdd.length === 0) {
    console.log("Nothing to add (looks seeded already).");
    return;
  }

  const all = sales
    .concat(toAdd)
    .sort((a, b) => new Date(a.onSaleAt) - new Date(b.onSaleAt));
  await writeJson(salesPath, all);

  console.log(`Added ${toAdd.length} sales for the next ${days} days.`);
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
