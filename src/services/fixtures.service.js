export async function fetchWeeklyFixtures() {
  const now = new Date();
  const in2d = new Date(now);
  in2d.setDate(now.getDate() + 2);

  return [
    {
      id: "stub-" + in2d.toISOString(),
      clubId: "fcb",
      match: "FC Barcelona vs Real Betis (LaLiga)",
      onSaleAt: new Date(in2d.setHours(10, 0, 0, 0)).toISOString(),
      requiresMembership: true,
      link: "https://tickets.fcbarcelona.com",
      league: "laliga",
      tournament: null,
      homeClubId: "fcb",
      awayClubId: "betis",
      country: "es",
    },
  ];
}
