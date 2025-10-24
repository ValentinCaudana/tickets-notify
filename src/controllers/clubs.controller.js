import clubs from '../data/clubs.json' assert { type: 'json' };

export const getClubGuide = (req, res) => {
  const club = clubs.find(c => c.id === req.params.id);
  if (!club) return res.status(404).json({ error: 'Club not found' });
  res.json({
    id: club.id,
    name: club.name,
    officialStore: club.officialStore,
    requiresMembership: club.requiresMembership,
    boxOffice: club.boxOffice ?? null,
    howToBuy: club.howToBuy ?? []
  });
};



