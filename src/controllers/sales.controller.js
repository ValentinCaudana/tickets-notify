import fs from 'node:fs/promises'
import path from 'node:path'
import sales from '../data/sales.json' assert { type: 'json' }

// util simple para persistir JSON
const saveJSON = async (file, data) =>
  fs.writeFile(path.resolve('src/data', file), JSON.stringify(data, null, 2))

export const listSales = (req, res) => {
  const { clubId } = req.query
  const rows = clubId ? sales.filter(s => s.clubId === clubId) : sales
  res.json(rows)
}

export const createSale = async (req, res, next) => {
  try {
    const { clubId, match, onSaleAt, requiresMembership, link, boxOffice } = req.body
    if (!clubId || !match || !onSaleAt) {
      return res.status(400).json({ error: 'clubId, match, onSaleAt are required' })
    }
    const row = {
      id: 'sale_' + Date.now(),
      clubId, match,
      onSaleAt, // ISO string
      requiresMembership: !!requiresMembership,
      link: link || null,
      boxOffice: boxOffice || null, // dirección física si aplica
      createdAt: new Date().toISOString()
    }
    sales.push(row)
    await saveJSON('sales.json', sales)
    res.status(201).json(row)
  } catch (e) { next(e) }
}
