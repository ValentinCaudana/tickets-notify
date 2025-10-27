// src/controllers/sales.controller.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clubsPath = path.join(__dirname, '../data/clubs.json');
const salesPath = path.join(__dirname, '../data/sales.json');

const byId = new Map(JSON.parse(fs.readFileSync(clubsPath, 'utf8')).map(c => [c.id, c]));
const sameHost = (a, b) => new URL(a).host === new URL(b).host;

export async function listSales(_req, res) {
  const exists = fs.existsSync(salesPath);
  const sales = exists ? JSON.parse(fs.readFileSync(salesPath, 'utf8')) : [];
  res.json(sales);
}

export async function createSale(req, res) {
  const { clubId, match, onSaleAt, requiresMembership, link } = req.body;

  const club = byId.get(clubId);
  if (!club) return res.status(400).json({ error: 'Club not found' });

  if (!sameHost(link, club.officialStore)) {
    return res.status(400).json({ error: 'link must point to the official store' });
  }

  const exists = fs.existsSync(salesPath);
  const sales = exists ? JSON.parse(fs.readFileSync(salesPath, 'utf8')) : [];

  const sale = {
    id: crypto.randomUUID(),
    clubId,
    match,
    onSaleAt,
    requiresMembership,
    link
  };

  sales.push(sale);
  fs.writeFileSync(salesPath, JSON.stringify(sales, null, 2));
  res.status(201).json(sale);
}
