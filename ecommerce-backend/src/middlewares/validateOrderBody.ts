import { Request, Response, NextFunction } from "express";

export function validateOrderBody(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { items } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items must be a non-empty array" });
  }
  for (const item of items) {
    if (!Number.isInteger(item?.product_id) || item.product_id <= 0) {
      return res
        .status(400)
        .json({ error: "each item needs a valid product_id" });
    }
    if (!Number.isInteger(item?.quantity) || item.quantity <= 0) {
      return res.status(400).json({ error: "each item needs a quantity >= 1" });
    }
  }
  next();
}
