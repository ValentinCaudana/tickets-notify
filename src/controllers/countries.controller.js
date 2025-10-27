
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesPath = path.join(__dirname, '../data/countries.json');

export function listCountries(_req, res) {
  const raw = fs.readFileSync(countriesPath, 'utf8');
  const countries = JSON.parse(raw);
  res.json(countries);
}
