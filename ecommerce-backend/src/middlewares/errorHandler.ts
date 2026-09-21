import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

// 4 params = Express treats this as the error handler
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Our own known errors → their status + message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Known Postgres errors → friendly status
  if (err.code === "23505") {
    return res.status(409).json({ error: "That value already exists" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist" });
  }

  // Anything unexpected → 500 (and log it)
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
