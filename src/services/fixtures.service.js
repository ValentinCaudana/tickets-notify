export async function fetchWeeklyFixtures() {
  const now = new Date();

  const in2min = new Date(now);
  in2min.setMinutes(in2min.getMinutes() + 2, 0, 0);

  const in3h = new Date(now);
  in3h.setHours(in3h.getHours() + 3, 0, 0, 0);

  return [
    {
      id: "seed-" + in2min.toISOString(),
      clubId: "fcb",
      match: "FC Barcelona vs Real Betis (LaLiga)",
      onSaleAt: in2min.toISOString(),
      requiresMembership: true,
      link: "https://tickets.fcbarcelona.com",
      league: "laliga",
      tournament: null,
      homeClubId: "fcb",
      awayClubId: "betis",
      country: "es",
    },
    {
      id: "seed-" + in3h.toISOString(),
      clubId: "rm",
      match: "Real Madrid vs Sevilla (LaLiga)",
      onSaleAt: in3h.toISOString(),
      requiresMembership: false,
      link: "https://www.realmadrid.com/en/tickets",
      league: "laliga",
      tournament: null,
      homeClubId: "rm",
      awayClubId: "sev",
      country: "es",
    },
  ];
}
