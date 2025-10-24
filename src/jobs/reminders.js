import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const salesPath = path.join(__dirname, '../data/sales.json')

export function startReminderJob() {
  setInterval(async () => {
    try {
      const now = Date.now()
      const raw = await fs.readFile(salesPath, 'utf8')
      const sales = JSON.parse(raw)
      const soon = sales.filter(s => {
        const t = new Date(s.onSaleAt).getTime()
        return t > now && t - now <= 60 * 60 * 1000 // en 1 hora
      })
      soon.forEach(s => {
        console.log(`[REMINDER] ${s.match} abre ventas a las ${new Date(s.onSaleAt).toLocaleString()} — ${s.link}`)
      })
    } catch (e) {
      console.error('Reminder job error', e.message)
    }
  }, 60 * 1000)
}

import sales from '../data/sales.json' with { type: 'json' };

const ONE_MIN = 60_000;
const AHEAD_MS = 60 * 60 * 1000; // 1 hora

export function startReminders({ notify = console.log } = {}) {
  setInterval(() => {
    const now = Date.now();
    for (const s of sales) {
      const ts = new Date(s.onSaleAt).getTime();
      if (ts - now <= AHEAD_MS && ts - now > AHEAD_MS - ONE_MIN) {
        notify(`🔔 ${s.match} of ${s.clubId} goes on sale in ~1 hour: ${s.link}`);
      }
    }
  }, ONE_MIN);
}
