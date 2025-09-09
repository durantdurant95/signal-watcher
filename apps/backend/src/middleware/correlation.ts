import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export interface RequestWithCorrelation extends Request {
  correlationId: string;
}

export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId = (req.headers["x-correlation-id"] as string) || uuidv4();

  (req as RequestWithCorrelation).correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  next();
};
