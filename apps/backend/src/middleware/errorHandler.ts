import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId = (req as any).correlationId || "unknown";

  if (err instanceof AppError) {
    logger.error("Application Error", {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      correlationId,
      url: req.url,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      correlationId,
    });
    return;
  }

  // Unhandled errors
  logger.error("Unhandled Error", {
    message: err.message,
    stack: err.stack,
    correlationId,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
    correlationId,
  });
};
