import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_SALES = path.join(__dirname, "../data/sales.json");

// --- helpers robustos ---
function safeReadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const txt = fs.readFileSync(filePath, "utf8").trim();
    if (txt === "") return [];
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch {
    // si está corrupto, no tumbamos la API
    return [];
  }
}

function safeWriteJSON(filePath, data) {
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, filePath);
}

// key única por venta (club + fecha + match)
function saleKey(s) {
  return `${s.clubId}__${new Date(s.onSaleAt).toISOString()}__${(
    s.match || ""
  ).toLowerCase()}`;
}

// --- API del “repo” ---
export function readSales() {
  return safeReadJSON(DATA_SALES);
}

export function writeSales(arr) {
  safeWriteJSON(DATA_SALES, arr);
}

// upsert SIN duplicados
export function upsertSales(newOnes) {
  const current = readSales();
  const byKey = new Map(current.map((s) => [saleKey(s), s]));
  for (const s of newOnes) {
    byKey.set(saleKey(s), { ...byKey.get(saleKey(s)), ...s });
  }
  const merged = Array.from(byKey.values())
    .filter((s) => Number.isFinite(Date.parse(s.onSaleAt)))
    .sort((a, b) => new Date(a.onSaleAt) - new Date(b.onSaleAt));

  writeSales(merged);
  return merged;
}
