import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  console.log("🔌 Attempting to connect to database...");
  
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in environment variables");
    throw new Error("DATABASE_URL is required");
  }

  try {
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL,
    });
    
    const client = new PrismaClient({ 
      adapter, 
      log: ["query", "error", "warn", "info"] 
    });

    console.log("✅ Database adapter created successfully");
    
    // Test the connection
    client.$connect()
      .then(() => {
        console.log("✅ Database connected successfully");
      })
      .catch((error) => {
        console.error("❌ Database connection failed:", error.message);
      });

    return client;
  } catch (error) {
    console.error("❌ Failed to create Prisma client:", error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
