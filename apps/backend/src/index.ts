import { config } from "@/config/environment";
import { setupSwagger } from "@/config/swagger";
import { correlationMiddleware } from "@/middleware/correlation";
import { errorHandler } from "@/middleware/errorHandler";
import { metricsMiddleware } from "@/middleware/metrics";
import { requestLogger } from "@/middleware/requestLogger";
import { router as eventsRouter } from "@/routes/events";
import { router as healthRouter } from "@/routes/health";
import { router as watchlistRouter } from "@/routes/watchlists";
import { logger } from "@/utils/logger";
import compression from "compression";
import cors from "cors";
import express, { Express } from "express";
import "express-async-errors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Basic middleware
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(correlationMiddleware);
app.use(requestLogger);
app.use(metricsMiddleware);

// Swagger documentation
setupSwagger(app);

// Routes
app.use("/api/watchlists", watchlistRouter);
app.use("/api/events", eventsRouter);
app.use("/health", healthRouter);

// Error handling
app.use(errorHandler);

const port = config.port;

app.listen(port, () => {
  logger.info(`🚀 Server running on port ${port}`, {
    port,
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

export default app;
