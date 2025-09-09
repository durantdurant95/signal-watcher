import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.BACKEND_PORT || "3001"),
  host: process.env.BACKEND_HOST || "localhost",
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  databaseUrl:
    process.env.DATABASE_URL || "postgresql://localhost:5432/signal_watcher",

  // Redis
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // AI
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4",

  // Security
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
  enableMetrics: process.env.ENABLE_METRICS === "true",
} as const;
