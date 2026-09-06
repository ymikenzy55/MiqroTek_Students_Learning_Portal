import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use process.env directly instead of prisma/config's env() helper, which
// throws if a variable is missing. On Vercel, only DATABASE_URL is required
// for `prisma generate` — the unpooled URL is optional.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL is not set — prisma generate may fail.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl ?? "postgresql://placeholder@localhost:5432/placeholder",
  },
});
