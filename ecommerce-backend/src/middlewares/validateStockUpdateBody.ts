import type { Request, Response, NextFunction } from "express";

export function validateStockUpdateBody(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { stock_quantity, version } = req.body ?? {};
  const errors: string[] = [];

  if (!Number.isSafeInteger(stock_quantity) || stock_quantity < 0) {
    errors.push("stock_quantity must be a non-negative integer");
  }
  if (!Number.isSafeInteger(version) || version < 1) {
    errors.push("version must be a positive integer");
  }

  if (errors.length > 0) return res.status(400).json({ errors });
  next();
}
