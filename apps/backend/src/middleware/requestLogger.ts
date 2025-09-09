import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";
import { RequestWithCorrelation } from "./correlation";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const reqWithCorrelation = req as RequestWithCorrelation;

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;

    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      correlationId: reqWithCorrelation.correlationId,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    return originalSend.call(this, body);
  };

  next();
};
