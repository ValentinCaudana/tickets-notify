import cron from "node-cron";
import { fetchWeeklyFixtures } from "../services/fixtures.service.js";
import { upsertSales } from "../services/sales.service.js";

export function startFixturesSync() {
  // Run every day 6 am (server local time)
  cron.schedule(
    "0 6 * * *",
    async () => {
      try {
        console.log("[job] Sync fixtures (weekly window)…");
        const fixtures = await fetchWeeklyFixtures();
        if (Array.isArray(fixtures) && fixtures.length) {
          upsertSales(fixtures);
          console.log(`[job] Upserted ${fixtures.length} sales`);
        } else {
          console.log("[job] No fixtures returned");
        }
      } catch (e) {
        console.error("[job] Sync fixtures failed:", e);
      }
    },
    { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
  );

  console.log("[job] Fixtures sync scheduled (daily 06:00).");
}
