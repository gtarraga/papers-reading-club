import { processCycleRollover } from "@/actions/cycle.actions";
import cron from "node-cron";

let isInitialized = false;

export function initScheduler() {
  if (isInitialized) return;

  // Run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[Scheduler] Running cycle rollover check...");
    const result = await processCycleRollover(process.env.CRON_SECRET);
    console.log("[Scheduler] Result:", result);
  });

  isInitialized = true;
  console.log("[Scheduler] Initialized - running hourly");
}
