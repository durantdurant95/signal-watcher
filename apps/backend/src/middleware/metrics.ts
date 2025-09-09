import { config } from "@/config/environment";
import { NextFunction, Request, Response } from "express";

// Simple in-memory metrics storage (in production, use proper metrics service)
const metrics = {
  requests: 0,
  errors: 0,
  responseTime: [] as number[],
};

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!config.enableMetrics) {
    return next();
  }

  const start = Date.now();
  metrics.requests++;

  const originalSend = res.send;
  res.send = function (body: any) {
    const duration = Date.now() - start;
    metrics.responseTime.push(duration);

    // Keep only last 1000 response times
    if (metrics.responseTime.length > 1000) {
      metrics.responseTime.shift();
    }

    if (res.statusCode >= 400) {
      metrics.errors++;
    }

    return originalSend.call(this, body);
  };

  next();
};

export const getMetrics = () => {
  const avgResponseTime =
    metrics.responseTime.length > 0
      ? metrics.responseTime.reduce((a, b) => a + b, 0) /
        metrics.responseTime.length
      : 0;

  return {
    requests: metrics.requests,
    errors: metrics.errors,
    avgResponseTime: Math.round(avgResponseTime),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};
