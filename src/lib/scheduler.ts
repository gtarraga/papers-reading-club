import { processCycleRollover } from "@/actions/cycle.actions";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import cron from "node-cron";

import { join } from "path";

let isInitialized = false;

// Log file path
const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "scheduler.log");

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

function writeLog(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  try {
    ensureLogDir();
    appendFileSync(LOG_FILE, logEntry, "utf8");
    console.log(logEntry.trim());
  } catch (error) {
    console.error("Failed to write to log file:", error);
    console.log(logEntry.trim());
  }
}

export function initScheduler() {
  if (isInitialized) return;

  // Run every minute to check for cycle rollovers
  cron.schedule("* * * * *", async () => {
    try {
      const result = await processCycleRollover();
      writeLog(`[Scheduler] Result: ${JSON.stringify(result)}`);
    } catch (error) {
      writeLog(
        `[Scheduler] Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });

  isInitialized = true;
  writeLog(`[Scheduler] Initialized - running every minute`);
}
