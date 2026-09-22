import type { Request, Response, NextFunction } from "express";

// POST /cart/items — needs a valid product_id and a positive quantity.
export function validateAddItemBody(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { product_id, quantity } = req.body ?? {};
  if (!Number.isInteger(product_id) || product_id <= 0) {
    return res
      .status(400)
      .json({ error: "product_id must be a positive integer" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res
      .status(400)
      .json({ error: "quantity must be a positive integer" });
  }
  next();
}

// PATCH /cart/items/:id — needs a positive quantity.
export function validateQuantityBody(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { quantity } = req.body ?? {};
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res
      .status(400)
      .json({ error: "quantity must be a positive integer" });
  }
  next();
}
