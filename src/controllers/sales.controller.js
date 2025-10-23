import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const salesPath = path.join(__dirname, '../data/sales.json')

export async function listSales(_req, res) {
  const raw = await fs.readFile(salesPath, 'utf8')
  const sales = JSON.parse(raw)
  // ordena por fecha de salida asc
  sales.sort((a,b)=> new Date(a.onSaleAt) - new Date(b.onSaleAt))
  res.json(sales)
}

export async function createSale(req, res) {
  const { clubId, match, onSaleAt, requiresMembership, link } = req.body
  if (!clubId || !match || !onSaleAt || !link) {
    return res.status(400).json({ error: 'clubId, match, onSaleAt y link son requeridos' })
  }
  const raw = await fs.readFile(salesPath, 'utf8')
  const sales = JSON.parse(raw)
  const sale = {
    id: crypto.randomUUID(),
    clubId,
    match,
    onSaleAt,               // ISO string: "2025-11-01T09:00:00Z"
    requiresMembership: !!requiresMembership,
    link
  }
  sales.push(sale)
  await fs.writeFile(salesPath, JSON.stringify(sales, null, 2))
  res.status(201).json(sale)
}
