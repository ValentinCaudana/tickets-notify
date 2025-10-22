import countries from '../data/countries.json' assert { type: 'json' }

export const listCountries = (_req, res) => {
  // MVP: devolvemos datos estáticos
  res.json(countries)
}
