import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { findConnectionString } from "./src/db/index";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: findConnectionString() ?? "" },
});
