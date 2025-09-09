import { getMetrics } from "@/middleware/metrics";
import { Router } from "express";

const router: Router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    metrics: getMetrics(),
  });
});

export { router };
