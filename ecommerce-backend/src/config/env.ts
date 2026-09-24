import dotenv from "dotenv";
import { z } from "zod";

// Load .env, then validate the important vars ONCE at startup.
// If something's missing/wrong we crash immediately with a clear message —
// far better than a confusing runtime error mid-request later.
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  // Optional so tests/CI don't need it; validated if present.
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
