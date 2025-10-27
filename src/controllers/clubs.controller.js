import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clubsPath = path.join(__dirname, '../data/clubs.json');

export function listClubs(_req, res) {
  const clubs = JSON.parse(fs.readFileSync(clubsPath, 'utf8'));
  res.json(clubs);
}


