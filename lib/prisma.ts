import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DATABASE_POOL_MAX) || 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

pool.on("error", (err) => {
  console.error("[DB Pool] idle client error:", err.message);
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const RETRYABLE_ERROR =
  /max clients reached|EMAXCONNSESSION|ECONNRESET|connection (timed out|terminated|reset)|too many (clients|connections)|timeout expired|P1001|P1002|P2024/i;

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      const msg = (err as Error)?.message ?? String(err);
      if (!RETRYABLE_ERROR.test(`${code} ${msg}`) || attempt >= retries) throw err;
      attempt++;
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }
  }
}
