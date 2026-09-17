import { Request, Response, NextFunction } from "express";

// Must match the CHECK constraint on the orders table
const ALLOWED_STATUSES = ["pending", "paid", "completed", "cancelled"];

export function validateStatusBody(req: Request, res: Response, next: NextFunction) {
  const { status } = req.body ?? {};
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
    });
  }
  next();
}
