// src/controllers/sales.controller.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// importa los datos
import clubs from '../data/clubs.json' with { type: 'json' }; // o carga con fs si prefieres

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const salesPath  = path.join(__dirname, '../data/sales.json');

// cache de ventas en memoria
let sales = [];
try {
  sales = JSON.parse(await fs.readFile(salesPath, 'utf8'));
} catch {
  sales = [];
}

// utilidades para validar
const byId = new Map(clubs.map(c => [c.id, c]));
const sameHost = (a, b) => {
  try {
    return new URL(a).host === new URL(b).host;
  } catch {
    return false;
  }
};

export async function createSale(req, res) {
  const { clubId, match, onSaleAt, requiresMembership, link } = req.body;

  // 1) validar club
  const club = byId.get(clubId);
  if (!club) {
    return res.status(400).json({ error: 'Club not found' });
  }

  // 2) validar que el link apunte al mismo host que la tienda oficial
  if (!sameHost(link, club.officialStore)) {
    return res.status(400).json({
      error: 'Link must point to the official store domain',
      officialStore: club.officialStore
    });
  }

  // 3) crear y persistir
  const sale = {
    id: crypto.randomUUID(),
    clubId,
    match,
    onSaleAt,
    requiresMembership,
    link
  };

  sales.push(sale);
  await fs.writeFile(salesPath, JSON.stringify(sales, null, 2));

  // 4) responder
  return res.status(201).json(sale);
}

export function listSales(_req, res) {
  res.json(sales);
}
