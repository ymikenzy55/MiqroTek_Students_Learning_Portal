import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️ Applying database DDL schema updates...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "image" TEXT;`);
    console.log("✅ Column 'image' ensured on 'courses' table.");
  } catch (err) {
    console.error("Error executing DDL:", err);
  }
}

main().finally(() => prisma.$disconnect());
