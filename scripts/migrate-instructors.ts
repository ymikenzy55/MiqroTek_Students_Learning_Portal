/**
 * Migration script to convert all INSTRUCTOR roles to SUPER_ADMIN
 * Run this before pushing the schema changes
 */

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Converting all INSTRUCTOR users to SUPER_ADMIN...\n");

  // Use raw SQL since Prisma client doesn't have INSTRUCTOR anymore
  const instructors = await prisma.$queryRaw<Array<{ id: string; name: string; email: string }>>`
    SELECT id, name, email FROM users WHERE role = 'INSTRUCTOR'
  `;

  console.log(`Found ${instructors.length} instructor(s):\n`);
  instructors.forEach((user) => {
    console.log(`  - ${user.name} (${user.email})`);
  });

  if (instructors.length === 0) {
    console.log("\n✅ No instructors to convert!");
    return;
  }

  // Update all instructors to SUPER_ADMIN using raw SQL
  const result = await prisma.$executeRaw`
    UPDATE users SET role = 'SUPER_ADMIN' WHERE role = 'INSTRUCTOR'
  `;

  console.log(`\n✅ Successfully converted ${result} instructor(s) to SUPER_ADMIN!`);
  console.log("\nYou can now run: npx prisma db push");
}

main()
  .catch((e) => {
    console.error("❌ Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
