import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_SALES = path.join(__dirname, "../data/sales.json");

function readSales() {
  return JSON.parse(fs.readFileSync(DATA_SALES, "utf8"));
}
function writeSales(arr) {
  fs.writeFileSync(DATA_SALES, JSON.stringify(arr, null, 2));
}

export function upsertSales(newOnes) {
  const current = readSales();
  const byId = new Map(current.map((s) => [s.id, s]));
  for (const s of newOnes) byId.set(s.id, { ...byId.get(s.id), ...s });
  writeSales(Array.from(byId.values()));
}
