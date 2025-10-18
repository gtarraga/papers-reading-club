import type { Config } from "drizzle-kit";

/**
 * Drizzle Kit Configuration
 *
 * This configures Drizzle Kit for managing SQLite database schema and migrations.
 * Used by commands: pnpm db:generate, pnpm db:migrate, pnpm db:studio
 */
export default {
  // Path to schema definition files (tables, relations)
  schema: "./src/db/schema/index.ts",

  // Output directory for generated migration SQL files
  out: "./src/db/migrations",

  // Database dialect (SQLite with better-sqlite3 driver)
  dialect: "sqlite",

  // Database connection configuration
  dbCredentials: {
    url: process.env.DATABASE_PATH || "./data/papers.db",
  },
} satisfies Config;
