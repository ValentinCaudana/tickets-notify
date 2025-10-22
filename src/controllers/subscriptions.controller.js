import fs from 'node:fs/promises'
import path from 'node:path'
import subs from '../data/subscriptions.json' assert { type: 'json' }

const saveJSON = async (file, data) =>
  fs.writeFile(path.resolve('src/data', file), JSON.stringify(data, null, 2))

export const subscribeClub = async (req, res, next) => {
  try {
    const { email, clubId } = req.body
    if (!email || !clubId) return res.status(400).json({ error: 'email and clubId required' })
    const sub = { id: 'sub_' + Date.now(), email, clubId, createdAt: new Date().toISOString() }
    subs.push(sub)
    await saveJSON('subscriptions.json', subs)
    res.status(201).json(sub)
  } catch (e) { next(e) }
}
