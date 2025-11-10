import cron from "node-cron";
import { fetchWeeklyFixtures } from "../services/fixtures.service.js";
import { upsertSales } from "../services/sales.service.js";

export async function runFixturesSyncOnce() {
  const fixtures = await fetchWeeklyFixtures();
  if (Array.isArray(fixtures) && fixtures.length) {
    upsertSales(fixtures);
    console.log(`[job] One-shot sync: upserted ${fixtures.length} sales`);
  } else {
    console.log("[job] One-shot sync: no fixtures returned");
  }
}

export function startFixturesSync() {
  // Todos los días a las 06:00 (hora local)
  cron.schedule(
    "0 6 * * *",
    async () => {
      try {
        console.log("[job] Daily sync starting…");
        await runFixturesSyncOnce();
      } catch (e) {
        console.error("[job] Daily sync failed:", e);
      }
    },
    { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
  );

  console.log("[job] Fixtures sync scheduled (daily 06:00).");
}
